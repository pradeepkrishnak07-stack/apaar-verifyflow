import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSearch,
  TrendingUp,
  Building2,
  ArrowRight,
  XCircle,
  FileText,
  ShieldCheck,
} from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'

const StatCard: React.FC<{
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
  subtext?: string
  badge?: string
}> = ({ label, value, icon, color, subtext, badge }) => (
  <div className={`rounded-2xl border p-5 bg-white shadow-xs flex items-start justify-between gap-4 transition-all hover:shadow-md ${color}`}>
    <div className="flex items-start gap-3.5">
      <div className="p-2.5 rounded-xl bg-slate-50 shrink-0">{icon}</div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
        <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
        {subtext && <p className="text-[11px] text-slate-400 mt-1">{subtext}</p>}
      </div>
    </div>
    {badge && (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
        {badge}
      </span>
    )}
  </div>
)

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    submitted: 'bg-blue-50 text-blue-700 border border-blue-200',
    under_review: 'bg-amber-50 text-amber-700 border border-amber-200',
    accepted_for_verification: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    verified: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    flagged: 'bg-rose-50 text-rose-700 border border-rose-200',
    rejected: 'bg-red-50 text-red-700 border border-red-200',
    incomplete: 'bg-orange-50 text-orange-700 border border-orange-200',
  }
  const label: Record<string, string> = {
    submitted: 'Submitted',
    under_review: 'Under Review',
    accepted_for_verification: 'Accepted',
    verified: 'Verified',
    flagged: 'Flagged',
    rejected: 'Rejected',
    incomplete: 'Incomplete',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${map[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {label[status] ?? status}
    </span>
  )
}

export const AdminOverview: React.FC = () => {
  const { stats, verificationRequests, auditLog, adminProfile } = useAdmin()

  const coveragePercent = stats.totalStudents > 0 ? Math.round((stats.verifiedStudents / stats.totalStudents) * 100) : 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Synthetic Data Banner */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-xs text-amber-800 flex items-center gap-2">
        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
        <span>
          <strong>Synthetic Demonstration Data</strong> — All records shown are fabricated for demonstration purposes. Backend integration is required for live institutional operations.
        </span>
      </div>

      {/* Institution Header */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-lg shadow-blue-500/20">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-extrabold tracking-tight">{adminProfile.institutionName}</h2>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-[11px] font-semibold text-white">AICTE Approved</span>
              </div>
              <p className="text-blue-100 text-sm mt-0.5">
                AICTE Code: <span className="font-mono">{adminProfile.institutionCode}</span> • Autonomous • {adminProfile.city}, {adminProfile.state}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-white">{adminProfile.name}</p>
            <p className="text-blue-200 text-xs">{adminProfile.role} • {adminProfile.email}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-xs font-semibold text-emerald-200">
              <ShieldCheck size={13} className="text-emerald-300" /> APAAR Registry Online
            </div>
          </div>
        </div>
      </div>

      {/* Primary Summary Metrics: Total, Verified, Pending, Rejected/Incomplete */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institution Student Metrics</h3>
          <span className="text-xs text-slate-500 font-medium">
            Verification Coverage: <strong className="text-slate-800">{coveragePercent}%</strong>
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Students */}
          <StatCard
            label="Total Students"
            value={stats.totalStudents}
            icon={<Users size={20} className="text-blue-600" />}
            color="border-blue-100 hover:border-blue-300"
            subtext="Enrolled across all engineering branches"
            badge="Enrolled"
          />

          {/* 2. Verified Student Records */}
          <StatCard
            label="Verified Student Records"
            value={stats.verifiedStudents}
            icon={<CheckCircle2 size={20} className="text-emerald-600" />}
            color="border-emerald-100 hover:border-emerald-300"
            subtext={`${coveragePercent}% coverage • Synced with APAAR/DigiLocker`}
            badge="Verified"
          />

          {/* 3. Pending Verification Requests */}
          <StatCard
            label="Pending Verification Requests"
            value={stats.pendingVerifications}
            icon={<Clock size={20} className="text-amber-600" />}
            color="border-amber-100 hover:border-amber-300"
            subtext={`${stats.completedVerifications} request(s) verified`}
            badge="Awaiting Review"
          />

          {/* 4. Rejected or Incomplete Records */}
          <StatCard
            label="Rejected or Incomplete Records"
            value={stats.rejectedOrIncomplete}
            icon={<XCircle size={20} className="text-rose-600" />}
            color="border-rose-100 hover:border-rose-300"
            subtext={`${stats.rejectedStudents} rejected • ${stats.incompleteStudents} incomplete profiles`}
            badge="Action Required"
          />
        </div>
      </div>

      {/* Secondary Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><GraduationCap size={18} /></div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Academic Records</p>
              <p className="text-base font-bold text-slate-900">{stats.totalAcademicRecords} Marksheets</p>
            </div>
          </div>
          <Link to="/admin/academic-records" className="text-xs text-indigo-600 font-semibold hover:underline">View</Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600"><AlertTriangle size={18} /></div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Data Quality Alerts</p>
              <p className="text-base font-bold text-slate-900">{stats.openDataQualityIssues} Open Issues</p>
            </div>
          </div>
          <Link to="/admin/data-quality" className="text-xs text-rose-600 font-semibold hover:underline">Review</Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600"><FileText size={18} /></div>
            <div>
              <p className="text-xs text-slate-500 font-semibold">Audit Events Logged</p>
              <p className="text-base font-bold text-slate-900">{auditLog.length} Recorded</p>
            </div>
          </div>
          <Link to="/admin/audit" className="text-xs text-purple-600 font-semibold hover:underline">Inspect</Link>
        </div>
      </div>

      {/* Two-column: Recent Requests + Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Verification Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardCheck size={16} className="text-blue-600" /> Recent Verification Requests
            </h3>
            <Link to="/admin/verifications" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold">
              View queue <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {verificationRequests.slice(0, 5).map((req) => (
              <div key={req.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{req.studentName}</p>
                    <span className="font-mono text-[10px] text-slate-400">({req.registrationNumber})</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{req.referenceNo} • {req.academicRecordType}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {statusBadge(req.status)}
                  <Link
                    to="/admin/verifications"
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Review request"
                  >
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Activity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-purple-600" /> Recent Administrator Activities
            </h3>
            <Link to="/admin/audit" className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold">
              View audit log <ArrowRight size={11} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {auditLog.slice(0, 5).map((log) => (
              <div key={log.id} className="px-5 py-3 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">{log.action}</p>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">{log.affectedRecord}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                  <span>{log.adminAccount}</span>
                  {log.reason && <span>• &ldquo;{log.reason}&rdquo;</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileSearch size={16} className="text-indigo-600" /> Administrator Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Student Directory', to: '/admin/students', icon: <Users size={18} className="text-blue-600" />, bg: 'bg-blue-50', desc: 'Inspect & filter records' },
            { label: 'Verification Queue', to: '/admin/verifications', icon: <CheckCircle2 size={18} className="text-emerald-600" />, bg: 'bg-emerald-50', desc: 'Approve & reject requests' },
            { label: 'Data Quality & Duplicates', to: '/admin/data-quality', icon: <AlertTriangle size={18} className="text-amber-600" />, bg: 'bg-amber-50', desc: 'Resolve missing fields & dupes' },
            { label: 'Review Documents', to: '/admin/documents', icon: <FileSearch size={18} className="text-indigo-600" />, bg: 'bg-indigo-50', desc: 'Certificates & marksheets' },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex flex-col items-center gap-2 rounded-xl p-4 hover:shadow-md transition-all border border-slate-100 hover:border-blue-200 group text-center"
            >
              <div className={`p-2.5 rounded-xl ${action.bg} group-hover:scale-110 transition-transform`}>{action.icon}</div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">{action.label}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{action.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

