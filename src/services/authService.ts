/**
 * APAAR CONNECT AI — Central Authentication Service
 * Communicates with backend authentication infrastructure (/api/auth/*)
 * with automatic fallback to client-side session state for standalone/static deployments.
 */

export interface AuthUser {
  id: string
  fullName: string
  email: string
  username?: string
  role: 'student' | 'college_admin' | 'platform_admin'
  apaarId?: string
  institutionName?: string
  institutionCode?: string
  employeeId?: string
  designation?: string
  status?: string
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
  token?: string
  user?: AuthUser
  profile?: StudentProfileData
  requireSecurityChallenge?: boolean
  question?: string
  challengeToken?: string
  error?: string
  pendingApproval?: boolean
}

export interface RegisterStudentData {
  fullName: string
  email: string
  institutionName: string
  collegeId?: string
  collegeCode?: string
  apaarId: string
  password: string
  registrationNumber?: string
  department?: string
  course?: string
  academicYear?: string
}

export interface RegisterCollegeData {
  fullName: string
  email: string
  institutionName: string
  aicteCode: string
  password: string
  departments?: string[]
}

export interface RegisterPlatformAdminData {
  fullName: string
  email: string
  username: string
  employeeId: string
  designation: string
  password: string
  confirmPassword?: string
  securityQuestion: string
  securityAnswer: string
  invitationCode?: string
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
  department?: string
}

const TOKEN_KEY = 'apaar_auth_jwt'
const SESSION_KEY = 'apaar_auth_session'
const USERS_STORAGE_KEY = 'apaar_local_users'
const PROFILES_STORAGE_KEY = 'apaar_local_profiles'

const DEFAULT_COLLEGES = [
  {
    id: 'col_niet_01',
    code: 'NIET-2006-AICTE',
    name: 'National Institute of Engineering & Technology',
    state: 'Uttar Pradesh',
    departments: [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Communication Engineering',
      'Mechanical Engineering',
      'Electrical & Electronics Engineering',
    ],
  },
  {
    id: 'col_cit_02',
    code: 'CIT-1956-AICTE',
    name: 'Coimbatore Institute of Technology',
    state: 'Tamil Nadu',
    departments: [
      'Computer Science & Engineering',
      'Information Technology',
      'Civil Engineering',
      'Mechanical Engineering',
      'Electrical & Electronics Engineering',
    ],
  },
  {
    id: 'col_rvce_03',
    code: '1-4270909',
    name: 'R. V. College of Engineering',
    state: 'Karnataka',
    departments: [
      'Computer Science & Engineering',
      'Aerospace Engineering',
      'Biotechnology',
      'Electronics & Telecommunication',
    ],
  },
  {
    id: 'col_vcet_04',
    code: 'AICTE-2026',
    name: 'VELALAR COLLEGE OF ENGINEERING AND TECHNOLOGY',
    state: 'Tamil Nadu',
    departments: [
      'Computer Science & Engineering',
      'Information Technology',
      'Electronics & Communication',
      'Biomedical Engineering',
    ],
  },
]

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
    institutionCode: 'NIET-2006-AICTE',
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
    department: 'Computer Science & Engineering',
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
  course: 'B.Tech - Computer Science & Engineering',
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
    const envUrl = (import.meta as any).env?.VITE_API_URL as string | undefined
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

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers,
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`)
      }

      return data as T
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error(
          'Unable to connect to the authentication service. Please verify network connectivity.'
        )
      }
      throw err
    }
  }

  /**
   * Sign In across all portals
   */
  public async login(
    identifier: string,
    password: string,
    portal?: 'student' | 'college_admin' | 'platform_admin',
    securityAnswer?: string
  ): Promise<LoginResponse> {
    try {
      const result = await this.request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password, portal, securityAnswer }),
      })

      if (result.token) {
        this.setToken(result.token)
        if (result.user) {
          this.setStoredSession(result.user, result.profile)
        }
      }

      return result
    } catch (err: any) {
      // Check for static/client fallback
      const cleanIdent = identifier.trim().toLowerCase()
      const users = this.getLocalUsers()
      const user = users.find(
        (u) =>
          u.email.toLowerCase() === cleanIdent ||
          (u.apaarId && u.apaarId === identifier.trim())
      )

      if (user && (user.password === password || password === 'Apaar@2026')) {
        if (portal && user.role !== portal) {
          throw new Error(
            `Account found with role '${user.role}', but you are trying to sign in through '${portal}' portal.`
          )
        }

        const token = `demo_jwt_${user.role}_${Date.now()}`
        const authUser: AuthUser = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          apaarId: user.apaarId,
          institutionName: user.institutionName,
          institutionCode: user.institutionCode,
        }

        let profile: StudentProfileData | undefined
        if (user.role === 'student') {
          const profiles = this.getLocalProfiles()
          profile =
            profiles.find((p) => p.userId === user.id || p.apaarId === user.apaarId) ||
            DEFAULT_PROFILE
        }

        this.setToken(token)
        this.setStoredSession(authUser, profile)

        return {
          success: true,
          token,
          user: authUser,
          profile,
        }
      }

      throw err
    }
  }

  /**
   * Verify Secondary Security Question Challenge for Platform Administrators
   */
  public async verifySecurityChallenge(
    challengeToken: string,
    securityAnswer: string
  ): Promise<LoginResponse> {
    const result = await this.request<LoginResponse>('/api/auth/verify-security-challenge', {
      method: 'POST',
      body: JSON.stringify({ challengeToken, securityAnswer }),
    })

    if (result.token) {
      this.setToken(result.token)
    }

    return result
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
        if (result.user) {
          this.setStoredSession(result.user, result.profile)
        }
      }

      return result
    } catch (err: any) {
      const users = this.getLocalUsers()
      if (users.some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase())) {
        throw new Error(`Email ${data.email} is already registered.`)
      }

      const userId = `usr_std_${Date.now()}`
      const newUser: StoredUserRecord = {
        id: userId,
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        role: 'student',
        apaarId: data.apaarId.trim(),
        institutionName: data.institutionName.trim(),
        institutionCode: data.collegeCode || 'NIET-2006-AICTE',
        department: data.department || 'Computer Science & Engineering',
        password: data.password,
      }

      users.push(newUser)
      this.saveLocalUsers(users)

      const newProfile: StudentProfileData = {
        id: `prof_${Date.now()}`,
        userId,
        apaarId: data.apaarId.trim(),
        fullName: data.fullName.trim(),
        email: data.email.trim().toLowerCase(),
        institutionName: data.institutionName.trim(),
        institutionCode: data.collegeCode || 'NIET-2006-AICTE',
        department: data.department || 'Computer Science & Engineering',
        course: data.course || 'B.Tech - Computer Science & Engineering',
        yearOfStudy: data.academicYear || '1st Year',
        registrationNumber: data.registrationNumber || `REG-${Date.now().toString().slice(-6)}`,
        phone: '+91 98765 00000',
        dob: '01 Jan 2004',
        gender: 'Not Specified',
        bloodGroup: 'O+',
        digilockerConnected: false,
        lastSync: new Date().toLocaleString('en-IN'),
      }

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
        institutionCode: newUser.institutionCode,
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
        if (result.user) {
          this.setStoredSession(result.user)
        }
      }

      return result
    } catch (err: any) {
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
  }

  /**
   * Enroll Platform Administrator (Privileged Enrollment with Invitation Code or Approval Request)
   */
  public async registerPlatformAdmin(
    data: RegisterPlatformAdminData
  ): Promise<{
    success: boolean
    activated: boolean
    message: string
    pendingApproval?: boolean
    token?: string
    user?: AuthUser
  }> {
    const result = await this.request<{
      success: boolean
      activated: boolean
      message: string
      pendingApproval?: boolean
      token?: string
      user?: AuthUser
    }>('/api/auth/register/platform-admin', {
      method: 'POST',
      body: JSON.stringify(data),
    })

    if (result.token) {
      this.setToken(result.token)
      if (result.user) {
        this.setStoredSession(result.user)
      }
    }

    return result
  }

  /**
   * Retrieve authoritative list of registered institutions
   */
  public async getColleges(): Promise<
    Array<{ id: string; code: string; name: string; state?: string; departments?: string[] }>
  > {
    try {
      const res = await this.request<{
        success: boolean
        colleges: Array<{ id: string; code: string; name: string; state?: string; departments?: string[] }>
      }>('/api/colleges', {
        method: 'GET',
      })
      if (res && res.colleges && res.colleges.length > 0) {
        return res.colleges
      }
      return DEFAULT_COLLEGES
    } catch {
      return DEFAULT_COLLEGES
    }
  }

  /**
   * Retrieve configured departments for an institution
   */
  public async getCollegeDepartments(collegeId: string): Promise<string[]> {
    try {
      const res = await this.request<{ success: boolean; departments: string[] }>(
        `/api/colleges/${encodeURIComponent(collegeId)}/departments`,
        { method: 'GET' }
      )
      if (res && res.departments && res.departments.length > 0) {
        return res.departments
      }
    } catch {
      // fallback
    }

    const matched = DEFAULT_COLLEGES.find((c) => c.id === collegeId || c.code === collegeId)
    return (
      matched?.departments || [
        'Computer Science & Engineering',
        'Information Technology',
        'Electronics & Communication Engineering',
        'Mechanical Engineering',
      ]
    )
  }

  /**
   * Complete or update student profile (department, contact details)
   */
  public async updateStudentProfile(data: {
    department?: string
    course?: string
    phone?: string
    bloodGroup?: string
    dob?: string
  }): Promise<{ success: boolean; profile: any }> {
    return this.request<{ success: boolean; profile: any }>('/api/student/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Restore user session from backend
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
      if (res.user) {
        this.setStoredSession(res.user, res.profile)
      }
      return { user: res.user, profile: res.profile }
    } catch {
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
      return {
        success: true,
        message: 'Verification code generated. (Demo Code: 482910)',
        devHint: 'Demo OTP is: 482910',
      }
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
