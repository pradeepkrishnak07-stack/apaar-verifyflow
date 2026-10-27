/**
 * APAAR CONNECT AI — Central Authentication Service
 * Communicates with backend authentication infrastructure (/api/auth/*)
 * with automatic fallback to client-side session state for standalone/static deployments.
 */

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: 'student' | 'college_admin' | 'platform_admin'
  apaarId?: string
  institutionName?: string
  institutionCode?: string
}

export interface StudentProfileData {
  id: string
  userId: string
  apaarId: string
  fullName: string
  email: string
  institutionName: string
  institutionCode: string
  department: string
  course: string
  yearOfStudy: string
  registrationNumber: string
  phone: string
  dob: string
  gender: string
  bloodGroup: string
  digilockerConnected: boolean
  lastSync: string
}

export interface LoginResponse {
  success: boolean
  token: string
  user: AuthUser
  profile?: StudentProfileData
  error?: string
}

export interface RegisterStudentData {
  fullName: string
  email: string
  institutionName: string
  apaarId: string
  password: string
}

export interface RegisterCollegeData {
  fullName: string
  email: string
  institutionName: string
  aicteCode: string
  password: string
}

interface StoredUserRecord {
  id: string
  fullName: string
  email: string
  role: 'student' | 'college_admin' | 'platform_admin'
  password: string
  apaarId?: string
  institutionName?: string
  institutionCode?: string
}

const TOKEN_KEY = 'apaar_auth_jwt'
const SESSION_KEY = 'apaar_auth_session'
const USERS_STORAGE_KEY = 'apaar_local_users'
const PROFILES_STORAGE_KEY = 'apaar_local_profiles'

const DEFAULT_USERS: StoredUserRecord[] = [
  {
    id: 'usr_platform_admin_01',
    fullName: 'Dr. Anil Sahasrabudhe (Central Administration)',
    email: 'admin@aicte.gov.in',
    role: 'platform_admin',
    password: 'Apaar@2026',
  },
  {
    id: 'usr_college_admin_01',
    fullName: 'Dr. S. K. Kulkarni',
    email: 'registrar@niet.edu.in',
    role: 'college_admin',
    institutionName: 'National Institute of Engineering & Technology',
    institutionCode: 'AICTE-1-4928172',
    password: 'Apaar@2026',
  },
  {
    id: 'usr_student_01',
    fullName: 'Aarav Sharma',
    email: 'aarav.sharma@student.niet.edu.in',
    apaarId: '210420241234',
    role: 'student',
    institutionName: 'National Institute of Engineering & Technology',
    institutionCode: 'NIET-2006-AICTE',
    password: 'Apaar@2026',
  },
]

const DEFAULT_PROFILE: StudentProfileData = {
  id: 'prof_student_01',
  userId: 'usr_student_01',
  apaarId: '210420241234',
  fullName: 'Aarav Sharma',
  email: 'aarav.sharma@student.niet.edu.in',
  institutionName: 'National Institute of Engineering & Technology',
  institutionCode: 'NIET-2006-AICTE',
  department: 'Computer Science & Engineering',
  course: 'B.Tech — Computer Science & Engineering',
  yearOfStudy: '4th Year (Final Year)',
  registrationNumber: '2021NIET0841',
  phone: '+91 98765 43210',
  dob: '15 Aug 2003',
  gender: 'Male',
  bloodGroup: 'B+',
  digilockerConnected: true,
  lastSync: new Date().toLocaleString('en-IN'),
}

class AuthService {
  private token: string | null = null
  private apiBaseUrl: string

  constructor() {
    this.token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
    const envUrl = import.meta.env.VITE_API_URL as string | undefined
    this.apiBaseUrl = envUrl ? envUrl.replace(/\/$/, '') : ''
  }

  public getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem(TOKEN_KEY)
    }
    return this.token
  }

  public setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
    }
  }

  public clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(SESSION_KEY)
    }
  }

  private getStoredSession(): { user: AuthUser; profile?: StudentProfileData } | null {
    if (typeof window === 'undefined') return null
    try {
      const data = localStorage.getItem(SESSION_KEY)
      return data ? JSON.parse(data) : null
    } catch {
      return null
    }
  }

  private setStoredSession(user: AuthUser, profile?: StudentProfileData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user, profile }))
    }
  }

  private getLocalUsers(): StoredUserRecord[] {
    if (typeof window === 'undefined') return DEFAULT_USERS
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore
    }
    return [...DEFAULT_USERS]
  }

  private saveLocalUsers(users: StoredUserRecord[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
    }
  }

  private getLocalProfiles(): StudentProfileData[] {
    if (typeof window === 'undefined') return [DEFAULT_PROFILE]
    try {
      const stored = localStorage.getItem(PROFILES_STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch {
      // ignore
    }
    return [{ ...DEFAULT_PROFILE }]
  }

  private saveLocalProfiles(profiles: StudentProfileData[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles))
    }
  }

  /**
   * Helper to perform authenticated HTTP requests
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = this.apiBaseUrl ? `${this.apiBaseUrl}${endpoint}` : endpoint
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    })

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      throw new Error(`Non-JSON response (status: ${response.status})`)
    }

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`)
    }

    return data as T
  }

  /**
   * Client-side fallback authentication for static deployments (Netlify)
   */
  private fallbackLogin(
    identifier: string,
    password: string,
    portal?: 'student' | 'college_admin' | 'platform_admin'
  ): LoginResponse {
    const users = this.getLocalUsers()
    const cleanInput = identifier.trim()
    const cleanDigits = cleanInput.replace(/\D/g, '')

    let matchedUser: StoredUserRecord | undefined

    if (portal === 'student' || (cleanDigits.length === 12 && !cleanInput.includes('@'))) {
      matchedUser = users.find(
        (u) =>
          u.role === 'student' &&
          u.apaarId &&
          u.apaarId.replace(/\D/g, '') === cleanDigits
      )
    } else {
      matchedUser = users.find(
        (u) => u.email.toLowerCase() === cleanInput.toLowerCase()
      )
    }

    if (!matchedUser) {
      throw new Error(
        portal === 'student'
          ? 'No student account found for this APAAR ID. Please register first.'
          : 'Invalid credentials. Please verify your email and password.'
      )
    }

    if (matchedUser.password !== password) {
      throw new Error('Incorrect password. Please try again or use password reset.')
    }

    if (portal && matchedUser.role !== portal) {
      throw new Error(
        `This account cannot sign in through the ${
          portal === 'student'
            ? 'Student'
            : portal === 'college_admin'
            ? 'College'
            : 'Platform'
        } Portal.`
      )
    }

    const authUser: AuthUser = {
      id: matchedUser.id,
      fullName: matchedUser.fullName,
      email: matchedUser.email,
      role: matchedUser.role,
      apaarId: matchedUser.apaarId,
      institutionName: matchedUser.institutionName,
      institutionCode: matchedUser.institutionCode,
    }

    let profile: StudentProfileData | undefined
    if (authUser.role === 'student') {
      const profiles = this.getLocalProfiles()
      profile = profiles.find(
        (p) => p.apaarId.replace(/\D/g, '') === (authUser.apaarId || '').replace(/\D/g, '')
      ) || DEFAULT_PROFILE
    }

    const simulatedToken = `demo_jwt_${authUser.role}_${Date.now()}`
    this.setToken(simulatedToken)
    this.setStoredSession(authUser, profile)

    return {
      success: true,
      token: simulatedToken,
      user: authUser,
      profile,
    }
  }

  /**
   * Sign In across all portals
   */
  public async login(
    identifier: string,
    password: string,
    portal?: 'student' | 'college_admin' | 'platform_admin'
  ): Promise<LoginResponse> {
    try {
      const result = await this.request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password, portal }),
      })

      if (result.token) {
        this.setToken(result.token)
        this.setStoredSession(result.user, result.profile)
      }

      return result
    } catch (err: any) {
      // If backend is unreachable or returns static SPA fallback (404/HTML), use client fallback
      if (
        !this.apiBaseUrl ||
        err.message?.includes('fetch') ||
        err.message?.includes('Non-JSON') ||
        err.message?.includes('status 404')
      ) {
        return this.fallbackLogin(identifier, password, portal)
      }
      throw err
    }
  }

  /**
   * Register Student
   */
  public async registerStudent(data: RegisterStudentData): Promise<LoginResponse> {
    try {
      const result = await this.request<LoginResponse>('/api/auth/register/student', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (result.token) {
        this.setToken(result.token)
        this.setStoredSession(result.user, result.profile)
      }

      return result
    } catch (err: any) {
      if (
        !this.apiBaseUrl ||
        err.message?.includes('fetch') ||
        err.message?.includes('Non-JSON') ||
        err.message?.includes('status 404')
      ) {
        const cleanApaarId = data.apaarId.replace(/\D/g, '')
        const users = this.getLocalUsers()

        if (users.some((u) => u.apaarId?.replace(/\D/g, '') === cleanApaarId)) {
          throw new Error(`APAAR ID ${data.apaarId} is already registered.`)
        }
        if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
          throw new Error(`Email ${data.email} is already associated with an account.`)
        }

        const userId = `usr_stu_${Date.now()}`
        const newUser: StoredUserRecord = {
          id: userId,
          fullName: data.fullName.trim(),
          email: data.email.trim().toLowerCase(),
          apaarId: cleanApaarId,
          role: 'student',
          institutionName: data.institutionName.trim(),
          password: data.password,
        }

        const newProfile: StudentProfileData = {
          id: `prof_${cleanApaarId}`,
          userId,
          apaarId: cleanApaarId,
          fullName: data.fullName.trim(),
          email: data.email.trim().toLowerCase(),
          institutionName: data.institutionName.trim(),
          institutionCode: 'AICTE-REG-' + cleanApaarId.slice(-4),
          department: 'Engineering / Applied Sciences',
          course: 'Undergraduate Program',
          yearOfStudy: '1st Year',
          registrationNumber: 'REG' + cleanApaarId.slice(-6),
          phone: '',
          dob: '01 Jan 2004',
          gender: 'Other',
          bloodGroup: 'Unknown',
          digilockerConnected: false,
          lastSync: new Date().toLocaleString('en-IN'),
        }

        users.push(newUser)
        this.saveLocalUsers(users)

        const profiles = this.getLocalProfiles()
        profiles.push(newProfile)
        this.saveLocalProfiles(profiles)

        const token = `demo_jwt_student_${Date.now()}`
        const authUser: AuthUser = {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          apaarId: newUser.apaarId,
          institutionName: newUser.institutionName,
        }

        this.setToken(token)
        this.setStoredSession(authUser, newProfile)

        return {
          success: true,
          token,
          user: authUser,
          profile: newProfile,
        }
      }
      throw err
    }
  }

  /**
   * Register College / Institutional Administrator
   */
  public async registerCollege(data: RegisterCollegeData): Promise<LoginResponse> {
    try {
      const result = await this.request<LoginResponse>('/api/auth/register/college', {
        method: 'POST',
        body: JSON.stringify(data),
      })

      if (result.token) {
        this.setToken(result.token)
        this.setStoredSession(result.user)
      }

      return result
    } catch (err: any) {
      if (
        !this.apiBaseUrl ||
        err.message?.includes('fetch') ||
        err.message?.includes('Non-JSON') ||
        err.message?.includes('status 404')
      ) {
        const users = this.getLocalUsers()
        if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
          throw new Error(`Institutional email ${data.email} is already registered.`)
        }

        const userId = `usr_col_${Date.now()}`
        const newUser: StoredUserRecord = {
          id: userId,
          fullName: data.fullName.trim(),
          email: data.email.trim().toLowerCase(),
          role: 'college_admin',
          institutionName: data.institutionName.trim(),
          institutionCode: data.aicteCode.trim(),
          password: data.password,
        }

        users.push(newUser)
        this.saveLocalUsers(users)

        const token = `demo_jwt_college_${Date.now()}`
        const authUser: AuthUser = {
          id: newUser.id,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          institutionName: newUser.institutionName,
          institutionCode: newUser.institutionCode,
        }

        this.setToken(token)
        this.setStoredSession(authUser)

        return {
          success: true,
          token,
          user: authUser,
        }
      }
      throw err
    }
  }

  /**
   * Restore user session from backend or local storage
   */
  public async getCurrentUser(): Promise<{ user: AuthUser; profile?: StudentProfileData } | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const res = await this.request<{
        success: boolean
        user: AuthUser
        profile?: StudentProfileData
      }>('/api/auth/me', {
        method: 'GET',
      })
      this.setStoredSession(res.user, res.profile)
      return { user: res.user, profile: res.profile }
    } catch {
      // If backend is unavailable, restore from stored session
      const stored = this.getStoredSession()
      if (stored) {
        return stored
      }
      this.clearToken()
      return null
    }
  }

  /**
   * Request Password Reset OTP
   */
  public async requestPasswordReset(
    email: string
  ): Promise<{ success: boolean; message: string; devHint?: string }> {
    try {
      return await this.request<{ success: boolean; message: string; devHint?: string }>(
        '/api/auth/forgot-password',
        {
          method: 'POST',
          body: JSON.stringify({ email }),
        }
      )
    } catch (err: any) {
      if (
        !this.apiBaseUrl ||
        err.message?.includes('fetch') ||
        err.message?.includes('Non-JSON') ||
        err.message?.includes('status 404')
      ) {
        return {
          success: true,
          message: `Verification code generated. (Demo Code: 482910)`,
          devHint: 'Demo OTP is: 482910',
        }
      }
      throw err
    }
  }

  /**
   * Verify OTP and Reset Password
   */
  public async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      return await this.request<{ success: boolean; message: string }>(
        '/api/auth/reset-password',
        {
          method: 'POST',
          body: JSON.stringify({ email, otp, newPassword }),
        }
      )
    } catch (err: any) {
      if (
        !this.apiBaseUrl ||
        err.message?.includes('fetch') ||
        err.message?.includes('Non-JSON') ||
        err.message?.includes('status 404')
      ) {
        const users = this.getLocalUsers()
        const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
        if (user) {
          user.password = newPassword
          this.saveLocalUsers(users)
        }
        return {
          success: true,
          message: 'Password has been reset successfully. Please sign in with your new password.',
        }
      }
      throw err
    }
  }

  /**
   * Sign Out
   */
  public async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearToken()
    }
  }
}

export const authService = new AuthService()
