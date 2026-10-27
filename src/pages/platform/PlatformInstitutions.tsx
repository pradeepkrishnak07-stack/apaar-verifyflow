import React, { useState, useMemo } from 'react'
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Award,
  AlertCircle,
  X,
  Download,
} from 'lucide-react'
import { usePlatformContext } from '@/context/PlatformContext'
import type { PlatformInstitution } from '@/types'

export const PlatformInstitutions: React.FC = () => {
  const { institutions, updateInstitutionStatus } = usePlatformContext()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended' | 'under_review'>('all')
  const [stateFilter, setStateFilter] = useState<string>('all')

  // Selected institution for details modal
  const [selectedInst, setSelectedInst] = useState<PlatformInstitution | null>(null)

  // Suspension Dialog State
  const [suspendTarget, setSuspendTarget] = useState<PlatformInstitution | null>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [suspendError, setSuspendError] = useState('')

  // Unique states for filtering
  const uniqueStates = useMemo<string[]>(() => {
    return Array.from(new Set(institutions.map((i: PlatformInstitution) => i.state))).sort()
  }, [institutions])

  // Filtered institutions
  const filteredInstitutions = useMemo<PlatformInstitution[]>(() => {
    return institutions.filter((inst: PlatformInstitution) => {
      const matchesSearch =
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.aicteCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.state.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === 'all' || inst.status === statusFilter
      const matchesState = stateFilter === 'all' || inst.state === stateFilter

      return matchesSearch && matchesStatus && matchesState
    })
  }, [institutions, searchTerm, statusFilter, stateFilter])

  const handleExportCsv = () => {
    const headers = [
      'Institution Name',
      'AICTE Code',
      'City',
      'State',
      'Type',
      'NAAC Grade',
      'Total Enrolled',
      'Verified Count',
      'Status',
    ]
    const rows = filteredInstitutions.map((i) =>
      [
        `"${i.name}"`,
        i.aicteCode,
        `"${i.city}"`,
        `"${i.state}"`,
        i.type,
        `"${i.naacAccreditation || 'N/A'}"`,
        i.totalEnrolled,
        i.verifiedCount,
        i.status,
      ].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `AICTE_Institutions_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Handle suspension submit
  const handleConfirmSuspension = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suspendTarget) return
    if (!suspendReason.trim() || suspendReason.trim().length < 10) {
      setSuspendError('Please provide a specific compliance reason (minimum 10 characters).')
      return
    }

    updateInstitutionStatus(suspendTarget.id, 'suspended', suspendReason.trim())
    setSuspendTarget(null)
    setSuspendReason('')
    setSuspendError('')
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            AICTE Institution Directory & Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervise accredited higher educational institutions, monitor verification throughput, and enforce compliance holds.
          </p>
        </div>

        {/* Total counts badge */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs font-bold text-purple-900">
            {filteredInstitutions.length} of {institutions.length} Institutions
          </div>
        </div>
      </div>

      {/* Regulatory Disclaimers Notice */}
      <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-4 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Regulatory Notice:</span> Institutional listings and accreditation metrics displayed below are demonstration simulation records. Under AICTE guidelines, official approval status must be confirmed via the authoritative National Institutional Portal before legal administrative actions.
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by institution name, AICTE code, city or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50/50"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Filter size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="under_review">Under Review</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* State Filter */}
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <span className="font-semibold text-slate-500">State:</span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[140px]"
            >
              <option value="all">All States</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors shrink-0"
            title="Download CSV report of institutions"
          >
            <Download size={13} className="text-purple-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Institutions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Institution Name & AICTE Code</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Type & NAAC</th>
                <th className="py-3 px-4">Enrolled Students</th>
                <th className="py-3 px-4">Verified %</th>
                <th className="py-3 px-4">Operational Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInstitutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-semibold">No institutions match your search criteria</p>
                    <p className="text-[11px] mt-0.5">Try resetting search keywords or state filters</p>
                  </td>
                </tr>
              ) : (
                filteredInstitutions.map((inst) => {
                  const verifiedRate = Math.round((inst.verifiedCount / (inst.totalEnrolled || 1)) * 100)
                  return (
                    <tr key={inst.id} className="hover:bg-purple-50/30 transition-colors">
                      {/* Name & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            {inst.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{inst.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              AICTE Code: <span className="font-semibold text-slate-700">{inst.aicteCode}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        <p className="font-semibold text-slate-800">{inst.city}</p>
                        <p className="text-[11px] text-slate-400">{inst.state}</p>
                      </td>

                      {/* Type & NAAC */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {inst.type}
                        </span>
                        <p className="text-[10px] font-semibold text-purple-700 mt-1 flex items-center gap-1">
                          <Award size={11} /> NAAC: {inst.naacAccreditation}
                        </p>
                      </td>

                      {/* Students */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {inst.totalEnrolled.toLocaleString()}
                      </td>

                      {/* Verified Rate */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-14 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${verifiedRate}%` }}
                              className={`h-full rounded-full ${
                                verifiedRate >= 75
                                  ? 'bg-emerald-500'
                                  : verifiedRate >= 50
                                  ? 'bg-blue-500'
                                  : 'bg-amber-500'
                              }`}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-700">{verifiedRate}%</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {inst.verifiedCount.toLocaleString()} verified
                        </span>
                      </td>

                      {/* Operational Status */}
                      <td className="py-3.5 px-4">
                        {inst.status === 'active' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={11} /> Active Standing
                          </span>
                        )}
                        {inst.status === 'suspended' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle size={11} /> Suspended
                          </span>
                        )}
                        {inst.status === 'under_review' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle size={11} /> Under Review
                          </span>
                        )}
                        {inst.suspensionReason && (
                          <p className="text-[9px] text-rose-600 mt-1 max-w-[120px] truncate" title={inst.suspensionReason}>
                            Reason: {inst.suspensionReason}
                          </p>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <button
                            onClick={() => setSelectedInst(inst)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                            title="View Institution Profile"
                          >
                            <Eye size={15} />
                          </button>

                          {/* Action Options */}
                          {inst.status !== 'active' && (
                            <button
                              onClick={() => updateInstitutionStatus(inst.id, 'active')}
                              className="px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              title="Activate Institution"
                            >
                              Activate
                            </button>
                          )}

                          {inst.status === 'active' && (
                            <button
                              onClick={() => {
                                setSuspendTarget(inst)
                                setSuspendReason('')
                                setSuspendError('')
                              }}
                              className="px-2 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                              title="Suspend Institution"
                            >
                              Suspend
                            </button>
                          )}

                          {inst.status !== 'under_review' && (
                            <button
                              onClick={() => updateInstitutionStatus(inst.id, 'under_review')}
                              className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                              title="Flag for Compliance Review"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institution Details Modal */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-700 text-white flex items-center justify-center font-bold text-sm">
                  {selectedInst.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedInst.name}</h3>
                  <p className="text-xs text-purple-700 font-mono font-bold">
                    AICTE Approval Code: {selectedInst.aicteCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInst(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Verification & Record Stats */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled</p>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {selectedInst.totalEnrolled.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-[10px] font-bold uppercase text-emerald-700">Verified APAARs</p>
                  <p className="text-lg font-extrabold text-emerald-900 mt-0.5">
                    {selectedInst.verifiedCount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
                  <p className="text-[10px] font-bold uppercase text-purple-700">NAAC Grade</p>
                  <p className="text-lg font-extrabold text-purple-900 mt-0.5">
                    {selectedInst.naacAccreditation}
                  </p>
                </div>
              </div>

              {/* Core Information Grid */}
              <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-500 w-28">Institution Type:</span>
                  <span className="font-bold text-slate-900">{selectedInst.type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-500 w-28">Campus Address:</span>
                  <span className="font-medium text-slate-800">
                    {selectedInst.city}, {selectedInst.district}, {selectedInst.state}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-500 w-28">Nodal Contact:</span>
                  <span className="font-medium text-slate-800 font-mono">
                    {selectedInst.registrarEmail} ({selectedInst.registrarName})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-500 w-28">Helpline:</span>
                  <span className="font-medium text-slate-800">{selectedInst.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-slate-400" />
                  <span className="font-semibold text-slate-500 w-28">Standing Status:</span>
                  <span className="font-bold capitalize">{selectedInst.status.replace('_', ' ')}</span>
                </div>
                {selectedInst.suspensionReason && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs mt-2">
                    <span className="font-bold">Suspension Notice:</span> {selectedInst.suspensionReason}
                  </div>
                )}
              </div>

              {/* Administrative Action Shortcuts */}
              <div className="pt-2 flex items-center justify-end gap-2">
                {selectedInst.status !== 'active' && (
                  <button
                    onClick={() => {
                      updateInstitutionStatus(selectedInst.id, 'active')
                      setSelectedInst(null)
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  >
                    Restore to Active Standing
                  </button>
                )}
                {selectedInst.status === 'active' && (
                  <button
                    onClick={() => {
                      setSuspendTarget(selectedInst)
                      setSelectedInst(null)
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                  >
                    Suspend Institution
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Suspension Confirmation Modal */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-rose-200 overflow-hidden">
            <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert size={18} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-rose-950">Confirm Institution Suspension</h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Action will temporarily revoke API access and pause APAAR card issuances.
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmSuspension} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-700">
                  Target Institution: <strong>{suspendTarget.name}</strong> ({suspendTarget.aicteCode})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Mandatory Compliance Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={suspendReason}
                  onChange={(e) => {
                    setSuspendReason(e.target.value)
                    setSuspendError('')
                  }}
                  placeholder="e.g., Non-compliance with AICTE 2026 APAAR schema standards or pending NAAC accreditation audit."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
                {suspendError && <p className="text-[11px] text-rose-600 font-semibold mt-1">{suspendError}</p>}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuspendTarget(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                >
                  Confirm Suspension
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlatformInstitutions
