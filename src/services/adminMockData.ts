/**
 * APAAR CONNECT AI — Synthetic Demonstration Data
 * College Administrator Dashboard — National Institute of Engineering & Technology
 * AICTE Code: AICTE-1-4928172
 *
 * ALL DATA IS SYNTHETIC AND FOR DEMONSTRATION PURPOSES ONLY.
 * Backend integration is required for live use.
 */

import type {
  AdminStudentRecord,
  AdminAcademicRecord,
  AdminDocumentReviewItem,
  AdminVerificationRequestItem,
  DataQualityIssueItem,
  AuditLogItem,
} from '@/types'

export const mockAdminProfile = {
  name: 'Dr. S. K. Kulkarni',
  role: 'Registrar',
  institutionName: 'National Institute of Engineering & Technology',
  institutionCode: 'AICTE-1-4928172',
  email: 'registrar@niet.edu.in',
  city: 'Bengaluru Urban',
  state: 'Karnataka',
  type: 'Autonomous' as const,
}


export const mockAdminStudents: AdminStudentRecord[] = []

export const mockAdminAcademicRecords: AdminAcademicRecord[] = []

export const mockAdminDocuments: AdminDocumentReviewItem[] = [
  {
    id: 'DOC-ADM-007',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    registrationNumber: '2021/CS/0841',
    department: 'Computer Science & Engineering',
    documentType: 'Community Certificate',
    fileName: 'community_certificate.pdf',
    fileSize: '1.1 MB',
    uploadDate: '2021-08-18',
    reviewStatus: 'requires_correction',
    correctionNotes: 'The uploaded document is blurry and some information is unreadable.',
    checksum: 'sha256:d8c9b26e0f7a4d2c1e8b5f3a9d7c4e1b8f2a5d3c0e7b4f1a8d5c2e9b6a3f4e1',
  },
  {
    id: 'DOC-ADM-008',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    registrationNumber: '2021/CS/0841',
    department: 'Computer Science & Engineering',
    documentType: 'Semester Marksheet',
    fileName: 'sem4_marksheet_2023.pdf',
    fileSize: '2.2 MB',
    uploadDate: '2023-07-18',
    reviewStatus: 'requires_correction',
    correctionNotes: 'Discrepancy detected in internal evaluation component marks and institutional seal.',
    checksum: 'sha256:e4b7d2c9a1f3e5b8d0c2a4f6b9e1d3c5a7f9b2e4d6c8a0f2b5e7d9c1a3f5b8e0',
  },
  {
    id: 'DOC-ADM-003',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    registrationNumber: '2021/CS/0841',
    department: 'Computer Science & Engineering',
    documentType: 'Transfer Certificate',
    fileName: 'transfer_certificate.pdf',
    fileSize: '0.8 MB',
    uploadDate: '2024-10-10',
    reviewStatus: 'under_review',
    checksum: 'sha256:b7c3a2e1d0f8b4c6e9a1d5f2c8b0e4a7d3f1c5a9b2e6d0f4c1a8e5b9d2f6c0a4',
  },
  {
    id: 'DOC-ADM-010',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    registrationNumber: '2021/CS/0841',
    department: 'Computer Science & Engineering',
    documentType: 'Migration Certificate',
    fileName: 'Not Available (Physical Copy Required)',
    fileSize: '—',
    uploadDate: '2024-10-25',
    reviewStatus: 'pending_review',
    correctionNotes: 'Document missing from institutional record. Please submit physical copy to college registrar office.',
    checksum: 'pending-upload-counter-receipt',
  },
  {
    id: 'DOC-ADM-001',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    registrationNumber: '2021/CS/0841',
    department: 'Computer Science & Engineering',
    documentType: '10th Marksheet',
    fileName: '10th_marksheet_cbse.pdf',
    fileSize: '1.2 MB',
    uploadDate: '2021-08-15',
    reviewStatus: 'accepted_for_verification',
    reviewer: 'Dr. S. K. Kulkarni (Registrar)',
    checksum: 'sha256:a3f4e1d8c9b26e0f7a4d2c1e8b5f3a9d7c4e1b8f2a5d3c0e7b4f1a8d5c2e9b6',
  },
  {
    id: 'DOC-ADM-004',
    studentId: 'STU-001',
    studentName: 'Aarav Sharma',
    registrationNumber: '2021/CS/0841',
    department: 'Computer Science & Engineering',
    documentType: 'Semester 1 Marksheet',
    fileName: 'sem1_marksheet_2021.pdf',
    fileSize: '2.1 MB',
    uploadDate: '2022-01-20',
    reviewStatus: 'accepted_for_verification',
    reviewer: 'Dr. S. K. Kulkarni (Registrar)',
    checksum: 'sha256:c9d4f2b1a7e5c3d0f8b6a4e2c0d7f5b3a1e9c7d5f3b1a9e7c5d3f1b9a7e5c3d1',
  },
  {
    id: 'DOC-ADM-011',
    studentId: 'STU-002',
    studentName: 'Priya Nair',
    registrationNumber: '2021/EC/0412',
    department: 'Electronics & Communication',
    documentType: 'Community Certificate',
    fileName: 'priya_community_cert.pdf',
    fileSize: '1.3 MB',
    uploadDate: '2022-03-10',
    reviewStatus: 'accepted_for_verification',
    reviewer: 'Dr. S. K. Kulkarni (Registrar)',
    checksum: 'sha256:7f4a2b1c9e8d3f5a0b6c4e2d1f8a3b5c7e9d0f2a4b6c8e0d2f4a6b8c0e2d4f6a',
  },
  {
    id: 'DOC-ADM-012',
    studentId: 'STU-003',
    studentName: 'Rohan Verma',
    registrationNumber: '2022/ME/0199',
    department: 'Mechanical Engineering',
    documentType: '12th Marksheet',
    fileName: 'rohan_12th_marksheet.pdf',
    fileSize: '1.5 MB',
    uploadDate: '2022-09-01',
    reviewStatus: 'under_review',
    checksum: 'sha256:8a1d5f2c8b0e4a7d3f1c5a9b2e6d0f4c1a8e5b9d2f6c0a4b7c3a2e1d0f8b4c6e',
  },
]

export const mockAdminVerificationRequests: AdminVerificationRequestItem[] = []

export const mockDataQualityIssues: DataQualityIssueItem[] = []

export const mockAuditLog: AuditLogItem[] = []

export const mockAdminNotifications: { id: string; title: string; message: string; date: string; type: 'verification' | 'update' | 'security' | 'reminder'; read: boolean }[] = []

export const mockDashboardStats = {
  totalStudents: 0,
  totalAcademicRecords: 0,
  pendingVerifications: 0,
  completedVerifications: 0,
  recordsRequiringAttention: 0,
  verifiedStudents: 0,
  pendingStudents: 0,
  flaggedStudents: 0,
  rejectedStudents: 0,
  incompleteStudents: 0,
  openDataQualityIssues: 0,
}
