import { Readable } from 'node:stream'
import { handleAuthRequest } from '../../server/authBackend.ts'
import {
  getDatabase,
  setCachedDatabase,
  isDatabaseDirty,
  markDatabaseClean,
} from '../../server/portalDb.ts'
import { connectLambda, getStore } from '@netlify/blobs'

const BLOB_STORE_NAME = 'apaar-verifyflow-db'
const BLOB_DB_KEY = 'auth_database.json'

async function syncFromBlobStore(event: any): Promise<void> {
  if (event?.blobs) {
    try {
      connectLambda(event)
    } catch (e: any) {
      console.warn('connectLambda note:', e?.message)
    }
  }

  try {
    const store = getStore(BLOB_STORE_NAME)
    const remoteDb = await store.get(BLOB_DB_KEY, { type: 'json' })
    if (remoteDb && (remoteDb as any).colleges && (remoteDb as any).students) {
      setCachedDatabase(remoteDb as any)
      markDatabaseClean()
    } else {
      // First run: seed remote store with current bundled database
      const currentDb = getDatabase()
      await store.setJSON(BLOB_DB_KEY, currentDb)
      markDatabaseClean()
    }
  } catch {
    // If running in environment without Blobs context, continue with local storage
  }
}

async function persistToBlobStore(): Promise<void> {
  if (!isDatabaseDirty()) return
  try {
    const store = getStore(BLOB_STORE_NAME)
    const currentDb = getDatabase()
    await store.setJSON(BLOB_DB_KEY, currentDb)
    markDatabaseClean()
  } catch (err: any) {
    console.warn('persistToBlobStore warning:', err?.message)
  }
}

export const handler = async (event: any, _context: any) => {
  // Handle CORS Preflight immediately
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: '',
    }
  }

  // Determine requested URL path
  let requestPath = event.path || '/'
  if (requestPath.includes('/.netlify/functions/api')) {
    requestPath = requestPath.replace('/.netlify/functions/api', '/api')
  }
  if (!requestPath.startsWith('/api')) {
    requestPath = `/api${requestPath.startsWith('/') ? requestPath : '/' + requestPath}`
  }

  // Reconstruct query string
  const queryString = event.rawQuery || ''
  const fullUrl = queryString ? `${requestPath}?${queryString}` : requestPath

  // Create stream from body buffer
  const bodyBuffer = event.body
    ? Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf-8')
    : Buffer.alloc(0)

  const req: any = new Readable({
    read() {
      this.push(bodyBuffer)
      this.push(null)
    },
  })

  req.url = fullUrl
  req.method = event.httpMethod
  req.headers = {}
  for (const [k, v] of Object.entries(event.headers || {})) {
    req.headers[k.toLowerCase()] = v
  }

  // Prepare response accumulator
  const responseHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
  let statusCode = 200
  let responseBody = ''

  const res: any = {
    statusCode: 200,
    setHeader(name: string, value: string) {
      responseHeaders[name] = value
    },
    getHeader(name: string) {
      return responseHeaders[name]
    },
    end(chunk?: any) {
      if (chunk) {
        responseBody += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf-8')
      }
    },
  }

  try {
    // 1. Sync database state from persistent remote store if available
    await syncFromBlobStore(event)

    // 2. Handle API request
    const handled = await handleAuthRequest(req, res)

    // 3. Persist modifications back to remote store if dirty
    await persistToBlobStore()

    if (!handled) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ error: `API route not found: ${fullUrl}` }),
      }
    }

    return {
      statusCode: res.statusCode || statusCode,
      headers: responseHeaders,
      body: responseBody,
    }
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: error?.message || 'Internal server error in API function' }),
    }
  }
}
