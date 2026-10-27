import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import {
  mockPlatformInstitutions,
  mockPlatformStats,
  mockMonitoringServices,
  mockPlatformLogs,
} from '@/services/platformMockData'
import type {
  PlatformInstitution,
  PlatformMonitoringService,
  PlatformLogEvent,
  PlatformMetricStats,
} from '@/types'

export interface PlatformToast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface PlatformContextType {
  institutions: PlatformInstitution[]
  stats: PlatformMetricStats
  monitoringServices: PlatformMonitoringService[]
  platformLogs: PlatformLogEvent[]
  toast: PlatformToast | null
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  dismissToast: () => void
  updateInstitutionStatus: (
    institutionId: string,
    newStatus: PlatformInstitution['status'],
    reason?: string
  ) => void
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [institutions, setInstitutions] = useState<PlatformInstitution[]>(mockPlatformInstitutions)
  const [monitoringServices] = useState<PlatformMonitoringService[]>(mockMonitoringServices)
  const [platformLogs, setPlatformLogs] = useState<PlatformLogEvent[]>(mockPlatformLogs)
  const [toast, setToast] = useState<PlatformToast | null>(null)

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now()
    setToast({ id, message, type })
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr))
    }, 4500)
  }, [])

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  const updateInstitutionStatus = useCallback(
    (institutionId: string, newStatus: PlatformInstitution['status'], reason?: string) => {
      const targetInst = institutions.find((i) => i.id === institutionId)
      if (!targetInst) return

      const prevStatus = targetInst.status

      setInstitutions((prev) =>
        prev.map((inst) => {
          if (inst.id !== institutionId) return inst
          return {
            ...inst,
            status: newStatus,
            suspensionReason: newStatus === 'suspended' ? reason : undefined,
          }
        })
      )

      // Add to platform audit log
      const newLog: PlatformLogEvent = {
        id: `PLOG-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'platform.admin@aicte.gov.in',
        action: `Institution Status: ${prevStatus.toUpperCase()} → ${newStatus.toUpperCase()}`,
        target: `${targetInst.name} (${targetInst.aicteCode})`,
        severity: newStatus === 'suspended' ? 'critical' : newStatus === 'active' ? 'info' : 'warning',
        details: reason ? `Reason provided: ${reason}` : `Status modified by Platform Administrator.`,
      }
      setPlatformLogs((prev) => [newLog, ...prev])

      showToast(
        `Institution ${targetInst.name} status updated to ${newStatus.replace('_', ' ').toUpperCase()}.`,
        newStatus === 'suspended' ? 'error' : 'success'
      )
    },
    [institutions, showToast]
  )

  const stats = useMemo<PlatformMetricStats>(() => {
    const totalEnrolledSum = institutions.reduce((acc, curr) => acc + curr.totalEnrolled, 0)
    const verifiedSum = institutions.reduce((acc, curr) => acc + curr.verifiedCount, 0)
    const activeCount = institutions.filter((i) => i.status === 'active').length
    const suspendedCount = institutions.filter((i) => i.status === 'suspended').length

    return {
      totalStudents: totalEnrolledSum,
      totalInstitutions: institutions.length,
      totalVerificationRequests: mockPlatformStats.totalVerificationRequests,
      verifiedRecords: verifiedSum,
      pendingRecords: mockPlatformStats.pendingRecords,
      rejectedRecords: mockPlatformStats.rejectedRecords,
      incompleteRecords: mockPlatformStats.incompleteRecords,
      activeInstitutions: activeCount,
      suspendedInstitutions: suspendedCount,
    }
  }, [institutions])

  return (
    <PlatformContext.Provider
      value={{
        institutions,
        stats,
        monitoringServices,
        platformLogs,
        toast,
        showToast,
        dismissToast,
        updateInstitutionStatus,
      }}
    >
      {children}
    </PlatformContext.Provider>
  )
}

export const usePlatform = () => {
  const context = useContext(PlatformContext)
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider')
  }
  return context
}

export const usePlatformContext = usePlatform

