import { Readable } from 'node:stream'
import { handleAuthRequest } from '../../server/authBackend.ts'

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
    const handled = await handleAuthRequest(req, res)
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
