import React from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Building2,
  FileCheck2,
  ArrowUpRight,
  ShieldCheck,
  TrendingUp,
  Server,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { usePlatformContext } from '@/context/PlatformContext'

export const PlatformOverview: React.FC = () => {
  const { institutions, stats, monitoringServices, platformLogs } = usePlatformContext()

  // Calculate percentages
  const verifiedPercentage = Math.round((stats.verifiedRecords / (stats.totalStudents || 1)) * 100)
  const pendingPercentage = Math.round((stats.pendingRecords / (stats.totalStudents || 1)) * 100)
  const rejectedPercentage = Math.round((stats.rejectedRecords / (stats.totalStudents || 1)) * 100)
  const incompletePercentage = Math.max(0, 100 - (verifiedPercentage + pendingPercentage + rejectedPercentage))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              <ShieldCheck size={13} className="text-purple-600" />
              Apex Governance Level
            </span>
            <span className="text-[11px] text-slate-500 font-medium">SIH26263 AICTE Central Sandbox</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Platform Administrator Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Nationwide telemetry, institution compliance enforcement, and real-time APAAR verification monitoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/platform/quality"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all shadow-xs"
          >
            <Sparkles size={15} />
            AI Quality & Anomalies
          </Link>
          <Link
            to="/platform/institutions"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xs"
          >
            <Building2 size={15} />
            Manage Institutions
          </Link>
        </div>
      </div>

      {/* Top 4 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled Students</span>
            <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <Users size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalStudents.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp size={13} className="mr-0.5" /> +8.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Aggregated across all registered colleges</p>
        </div>

        {/* Participating Institutions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Participating Institutions</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalInstitutions}
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {stats.activeInstitutions} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {stats.suspendedInstitutions > 0 ? `${stats.suspendedInstitutions} under compliance hold` : '100% active standing'}
          </p>
        </div>

        {/* Verification Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Verification Inquiries</span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700">
              <FileCheck2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {stats.totalVerificationRequests.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-indigo-600 flex items-center">
              Across 28 States
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Authorized employer & university requests</p>
        </div>

        {/* Platform Verification Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification Rate</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {verifiedPercentage}%
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">
              {stats.verifiedRecords.toLocaleString()} Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Linked to Academic Bank of Credits</p>
        </div>
      </div>

      {/* Record Status Breakdown & National Verification Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Status Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Record Status Distribution</h3>
              <p className="text-[11px] text-slate-500">Live breakdown of student records</p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              National Sandbox
            </span>
          </div>

          {/* Stacked Progress Bar */}
          <div className="mt-4">
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
              <div
                style={{ width: `${verifiedPercentage}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Verified: ${verifiedPercentage}%`}
              />
              <div
                style={{ width: `${pendingPercentage}%` }}
                className="bg-amber-400 transition-all duration-500"
                title={`Pending: ${pendingPercentage}%`}
              />
              <div
                style={{ width: `${rejectedPercentage}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`Rejected: ${rejectedPercentage}%`}
              />
              <div
                style={{ width: `${incompletePercentage}%` }}
                className="bg-slate-300 transition-all duration-500"
                title={`Incomplete: ${incompletePercentage}%`}
              />
            </div>
          </div>

          {/* Status Breakdown Legend Items */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Verified & Enrolled
              </span>
              <div className="text-right">
                <span className="font-bold text-slate-900">{stats.verifiedRecords.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 ml-1">({verifiedPercentage}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                Pending Institutional Review
              </span>
              <div className="text-right">
                <span className="font-bold text-slate-900">{stats.pendingRecords.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 ml-1">({pendingPercentage}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Rejected / Discrepancy Found
              </span>
              <div className="text-right">
                <span className="font-bold text-slate-900">{stats.rejectedRecords.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 ml-1">({rejectedPercentage}%)</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                Incomplete Registration
              </span>
              <div className="text-right">
                <span className="font-bold text-slate-900">{stats.incompleteRecords.toLocaleString()}</span>
                <span className="text-[10px] text-slate-400 ml-1">({incompletePercentage}%)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-medium">Compliance Target: 95%</span>
            <Link
              to="/platform/quality"
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              Run Quality Audit <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>

        {/* Verification Trends & Institution Onboarding Health */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Monthly Verification Inquiries & Issuances</h3>
                <p className="text-[11px] text-slate-500">Trailing 6-month AICTE system volume</p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-purple-700 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-purple-600" /> Verified Requests
                </span>
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <span className="h-2 w-2 rounded-full bg-slate-300" /> Pending Inquiries
                </span>
              </div>
            </div>

            {/* Simulated Chart Bars */}
            <div className="mt-6 grid grid-cols-6 gap-3 items-end h-40 pt-4">
              {[
                { month: 'May', verified: 320, pending: 80, heightVerified: '52%', heightPending: '20%' },
                { month: 'Jun', verified: 480, pending: 110, heightVerified: '68%', heightPending: '25%' },
                { month: 'Jul', verified: 610, pending: 150, heightVerified: '80%', heightPending: '30%' },
                { month: 'Aug', verified: 720, pending: 180, heightVerified: '90%', heightPending: '35%' },
                { month: 'Sep', verified: 650, pending: 130, heightVerified: '84%', heightPending: '26%' },
                { month: 'Oct', verified: 810, pending: 195, heightVerified: '96%', heightPending: '38%' },
              ].map((item) => (
                <div key={item.month} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1.5 h-32">
                    <div
                      style={{ height: item.heightVerified }}
                      className="w-1/2 max-w-[24px] bg-gradient-to-t from-purple-700 to-indigo-600 rounded-t-md group-hover:opacity-90 transition-all cursor-pointer relative"
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 hidden group-hover:flex bg-slate-900 text-white text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap z-10">
                        {item.verified} verif.
                      </span>
                    </div>
                    <div
                      style={{ height: item.heightPending }}
                      className="w-1/2 max-w-[24px] bg-slate-200 group-hover:bg-slate-300 rounded-t-md transition-all cursor-pointer"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Microservice Quick Status Banner */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl">
            <div className="flex items-center gap-2">
              <Server size={15} className="text-slate-500" />
              <span className="text-xs font-semibold text-slate-700">Platform Core Gateways:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {monitoringServices.slice(0, 3).map((srv) => (
                <div key={srv.id} className="flex items-center gap-1.5 text-[11px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-slate-800">{srv.serviceName}:</span>
                  <span className="font-bold text-emerald-700">{srv.uptimePercent}%</span>
                </div>
              ))}
            </div>
            <Link
              to="/platform/monitoring"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
            >
              All Services <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Participating Institutions Snapshot & Recent Platform Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Institutions Directory Quick View */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Participating AICTE Institutions</h3>
              <p className="text-[11px] text-slate-500">Live operational status and verification metrics</p>
            </div>
            <Link
              to="/platform/institutions"
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
            >
              View All ({institutions.length}) <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase text-slate-400">
                  <th className="py-2.5 font-bold">Institution & Code</th>
                  <th className="py-2.5 font-bold">State</th>
                  <th className="py-2.5 font-bold">Students</th>
                  <th className="py-2.5 font-bold">Verified %</th>
                  <th className="py-2.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {institutions.slice(0, 5).map((inst) => {
                  const rate = Math.round((inst.verifiedCount / (inst.totalEnrolled || 1)) * 100)
                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3">
                        <p className="font-bold text-slate-900">{inst.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{inst.aicteCode} • {inst.type}</p>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">{inst.state}</td>
                      <td className="py-3 font-semibold text-slate-900">{inst.totalEnrolled.toLocaleString()}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${rate}%` }}
                              className="bg-purple-600 h-full rounded-full"
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">{rate}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        {inst.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        )}
                        {inst.status === 'suspended' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            Suspended
                          </span>
                        )}
                        {inst.status === 'under_review' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Under Review
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Apex Activity Feed */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Platform Activity Feed</h3>
                <p className="text-[11px] text-slate-500">Immutable governance audit log</p>
              </div>
              <Link
                to="/platform/audit"
                className="text-xs font-bold text-purple-700 hover:text-purple-900"
              >
                Full Trail
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {platformLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        log.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : log.severity === 'warning'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {log.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 mt-1">{log.action}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{log.target}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Actor: AICTE Apex Security Module</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Synced
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformOverview
