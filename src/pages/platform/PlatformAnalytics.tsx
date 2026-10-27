import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3,
  Users,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  ShieldCheck,
  FileCheck2,
  ExternalLink,
} from 'lucide-react'
import { usePlatformContext } from '@/context/PlatformContext'
import { analyticsService } from '@/services/appDataService'

// ─────────────────────────────────────────────────────────────────────────────
// Tiny bar chart component (pure CSS / SVG — no charting library needed)
// ─────────────────────────────────────────────────────────────────────────────

const MiniBar: React.FC<{ value: number; max: number; color: string; label: string }> = ({
  value,
  max,
  color,
  label,
}) => {
  const pct = Math.round((value / (max || 1)) * 100)
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-slate-400 text-right font-mono shrink-0">{value}</span>
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-8 text-slate-500 font-semibold text-[10px] text-right">{pct}%</span>
      <span className="hidden">{label}</span>
    </div>
  )
}

const TrendChart: React.FC<{
  data: { month: string; verified: number; submitted: number }[]
}> = ({ data }) => {
  const maxVal = Math.max(...data.flatMap((d) => [d.verified, d.submitted])) || 1
  const svgH = 80
  const svgW = 300
  const padL = 10
  const padR = 10
  const padT = 8
  const padB = 20
  const innerW = svgW - padL - padR
  const innerH = svgH - padT - padB
  const step = innerW / (data.length - 1)

  const pts = (key: 'verified' | 'submitted') =>
    data
      .map((d, i) => {
        const x = padL + i * step
        const y = padT + innerH - (d[key] / maxVal) * innerH
        return `${x},${y}`
      })
      .join(' ')

  return (
    <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full">
      {/* grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f) => {
        const y = padT + innerH * (1 - f)
        return (
          <line
            key={f}
            x1={padL}
            x2={svgW - padR}
            y1={y}
            y2={y}
            stroke="#e2e8f0"
            strokeWidth={0.5}
          />
        )
      })}
      {/* submitted line */}
      <polyline
        points={pts('submitted')}
        fill="none"
        stroke="#c7d2fe"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      {/* verified line */}
      <polyline
        points={pts('verified')}
        fill="none"
        stroke="#6366f1"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* dots */}
      {data.map((d, i) => {
        const x = padL + i * step
        const yV = padT + innerH - (d.verified / maxVal) * innerH
        const yS = padT + innerH - (d.submitted / maxVal) * innerH
        return (
          <g key={i}>
            <circle cx={x} cy={yS} r={2.5} fill="#c7d2fe" />
            <circle cx={x} cy={yV} r={3} fill="#6366f1" />
          </g>
        )
      })}
      {/* month labels */}
      {data.map((d, i) => (
        <text
          key={i}
          x={padL + i * step}
          y={svgH - 4}
          textAnchor="middle"
          fontSize={7}
          fill="#94a3b8"
        >
          {d.month}
        </text>
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM ANALYTICS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export const PlatformAnalytics: React.FC = () => {
  const { institutions, stats } = usePlatformContext()

  const adminAnalytics = useMemo(() => analyticsService.getAdminAnalytics(), [])

  const platformSummary = useMemo(() => {
    const activeInstitutions = institutions.filter((i) => i.status === 'active')
    const avgCompliance =
      activeInstitutions.length > 0
        ? Math.round(
            activeInstitutions.reduce((acc, i) => acc + i.complianceScore, 0) /
              activeInstitutions.length
          )
        : 0
    const highRisk = institutions.filter((i) => i.complianceScore < 70)
    const totalEnrolled = institutions.reduce((acc, i) => acc + i.totalEnrolled, 0)
    const totalVerified = institutions.reduce((acc, i) => acc + i.verifiedCount, 0)
    const nationalRate = Math.round((totalVerified / (totalEnrolled || 1)) * 100)

    return {
      avgCompliance,
      highRisk: highRisk.length,
      totalEnrolled,
      totalVerified,
      nationalRate,
    }
  }, [institutions])

  const statusColors: Record<string, string> = {
    active: '#10b981',
    pending_approval: '#f59e0b',
    under_review: '#6366f1',
    suspended: '#ef4444',
  }

  const statusLabels: Record<string, string> = {
    active: 'Active',
    pending_approval: 'Pending Approval',
    under_review: 'Under Review',
    suspended: 'Suspended',
  }

  const instStatusMap = new Map<string, number>()
  institutions.forEach((i) =>
    instStatusMap.set(i.status, (instStatusMap.get(i.status) ?? 0) + 1)
  )
  const instStatusDist = Array.from(instStatusMap.entries()).map(([s, count]) => ({
    status: s,
    count,
    color: statusColors[s] ?? '#94a3b8',
    label: statusLabels[s] ?? s,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              <BarChart3 size={11} /> Platform Analytics
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              ⚠ Demonstration Data — Not live AICTE metrics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            National APAAR Platform Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Aggregated across {institutions.length} AICTE-approved institutions. Data is synthetic
            and for demonstration.
          </p>
        </div>
      </div>

      {/* National KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'National Verification Rate',
            value: `${platformSummary.nationalRate}%`,
            sub: `${platformSummary.totalVerified.toLocaleString()} / ${platformSummary.totalEnrolled.toLocaleString()} students`,
            icon: <CheckCircle2 size={18} className="text-emerald-600" />,
            bg: 'bg-emerald-50 border-emerald-200',
          },
          {
            label: 'Total Enrolled (All Institutions)',
            value: stats.totalStudents.toLocaleString(),
            sub: `${stats.activeInstitutions} active institutions`,
            icon: <Users size={18} className="text-blue-600" />,
            bg: 'bg-blue-50 border-blue-200',
          },
          {
            label: 'Avg Compliance Score',
            value: `${platformSummary.avgCompliance}%`,
            sub: 'Active institutions only',
            icon: <ShieldCheck size={18} className="text-purple-600" />,
            bg: 'bg-purple-50 border-purple-200',
          },
          {
            label: 'High-Risk Institutions',
            value: platformSummary.highRisk,
            sub: 'Compliance score below 70%',
            icon: <AlertTriangle size={18} className="text-rose-600" />,
            bg: 'bg-rose-50 border-rose-200',
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-2xl border p-4 flex flex-col gap-2 ${kpi.bg}`}
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center shadow-xs">
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{kpi.value}</p>
            <p className="text-[11px] font-semibold text-slate-700">{kpi.label}</p>
            <p className="text-[10px] text-slate-500">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Verification Requests Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Trend */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Verification Activity Trend</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">6-month submitted vs. verified comparison</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <span className="h-2 w-4 rounded bg-indigo-500 inline-block" /> Verified
              <span className="h-2 w-4 rounded bg-indigo-200 inline-block ml-1" /> Submitted
            </span>
          </div>
          <TrendChart data={adminAnalytics.verificationTrend} />
        </div>

        {/* Institution Status Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-1">Institution Status Distribution</h3>
          <p className="text-[11px] text-slate-500 mb-4">
            Breakdown of {institutions.length} institutions by operational status
          </p>
          <div className="space-y-3">
            {instStatusDist.map((s) => (
              <div key={s.status} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{s.label}</span>
                  <span className="font-bold text-slate-900">{s.count}</span>
                </div>
                <MiniBar
                  value={s.count}
                  max={institutions.length}
                  color={s.color}
                  label={s.label}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Institution Compliance Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Institution Compliance Leaderboard</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ranked by APAAR verification compliance score
            </p>
          </div>
          <Link
            to="/platform/institutions"
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
          >
            Manage <ExternalLink size={11} />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {[...institutions]
            .sort((a, b) => b.complianceScore - a.complianceScore)
            .slice(0, 6)
            .map((inst, idx) => {
              const verRate = Math.round((inst.verifiedCount / (inst.totalEnrolled || 1)) * 100)
              return (
                <div key={inst.id} className="px-5 py-3.5 flex items-center gap-4">
                  <span
                    className={`text-lg font-extrabold w-6 text-right ${
                      idx === 0
                        ? 'text-amber-500'
                        : idx === 1
                        ? 'text-slate-400'
                        : idx === 2
                        ? 'text-amber-700'
                        : 'text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{inst.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{inst.aicteCode} · {inst.state}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-extrabold text-slate-900">{inst.complianceScore}%</p>
                    <p className="text-[10px] text-slate-400">Compliance</p>
                  </div>
                  <div className="w-24 hidden sm:block">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <span className="text-slate-400">Verification</span>
                      <span className="font-bold text-slate-700">{verRate}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${verRate}%`,
                          backgroundColor: verRate >= 90 ? '#10b981' : verRate >= 75 ? '#f59e0b' : '#ef4444',
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      inst.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : inst.status === 'suspended'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {inst.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              )
            })}
        </div>
      </div>

      {/* Verification Request Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
              <FileCheck2 size={17} className="text-indigo-600" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">{stats.totalVerificationRequests.toLocaleString()}</p>
              <p className="text-[11px] text-slate-500">Total Verification Requests</p>
            </div>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Verified Records</span>
              <span className="font-bold text-emerald-700">{stats.verifiedRecords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pending Review</span>
              <span className="font-bold text-amber-700">{stats.pendingRecords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Rejected</span>
              <span className="font-bold text-rose-700">{stats.rejectedRecords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Incomplete</span>
              <span className="font-bold text-orange-700">{stats.incompleteRecords.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={17} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">{platformSummary.nationalRate}%</p>
              <p className="text-[11px] text-slate-500">National Verification Rate</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                style={{ width: `${platformSummary.nationalRate}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2">
              {platformSummary.totalVerified.toLocaleString()} of {platformSummary.totalEnrolled.toLocaleString()} student records verified
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <Building2 size={17} className="text-rose-600" />
            </div>
            <div>
              <p className="text-lg font-extrabold text-slate-900">{stats.suspendedInstitutions}</p>
              <p className="text-[11px] text-slate-500">Suspended Institutions</p>
            </div>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Active</span>
              <span className="font-bold text-emerald-700">{stats.activeInstitutions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pending Approval</span>
              <span className="font-bold text-amber-700">
                {institutions.filter((i) => i.status === 'pending_approval').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Under Review</span>
              <span className="font-bold text-indigo-700">
                {institutions.filter((i) => i.status === 'under_review').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demonstration disclaimer */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Demonstration Analytics:</strong> All charts, percentages, and statistics shown
          above are generated from synthetic demonstration data. In a production deployment, this
          dashboard would draw from a live PostgreSQL/Firebase database via authenticated API calls.
          No real student personal data or AICTE institutional metrics are used.
        </div>
      </div>
    </div>
  )
}

export default PlatformAnalytics
