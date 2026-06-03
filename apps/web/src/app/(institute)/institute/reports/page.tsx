'use client'

import { useEffect, useState } from 'react'
import { getInstituteReports } from '@/lib/services/instituteService'
import { BarChart3, TrendingUp, Users } from 'lucide-react'

type Reports = Awaited<ReturnType<typeof getInstituteReports>>

export default function InstituteReportsPage() {
  const [reports, setReports] = useState<Reports | null>(null)

  useEffect(() => {
    getInstituteReports().then(setReports)
  }, [])

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Performance Analytics</h1>
        <p>Aggregate band movement, pass rates, and skill performance across the institute.</p>
      </div>

      {!reports ? (
        <div className="grid md:grid-cols-3 gap-4">{[1, 2, 3].map((i) => <div key={i} className="stat-card animate-pulse h-32" />)}</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Stat icon={<BarChart3 className="h-4 w-4" />} label="Pass rate" value={`${reports.passRate}%`} />
            <Stat icon={<Users className="h-4 w-4" />} label="Improved students" value={reports.studentsImproved} />
            <Stat icon={<TrendingUp className="h-4 w-4" />} label="Submissions" value={reports.totalSubmissions.toLocaleString()} />
            <Stat icon={<BarChart3 className="h-4 w-4" />} label="Current avg" value={reports.avgBandByMonth.at(-1)?.band ?? '-'} />
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-5">Average Band Trend</h2>
              <div className="flex items-end gap-3 h-48">
                {reports.avgBandByMonth.map((point) => <div key={point.month} className="flex-1 flex flex-col items-center gap-2"><div className="w-full rounded-t bg-foreground/50" style={{ height: `${point.band * 18}px` }} /><span className="text-xs text-muted-foreground">{point.month}</span></div>)}
              </div>
            </div>
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-5">Skill Breakdown</h2>
              <div className="space-y-4">
                {reports.skillAverages.map((skill) => <div key={skill.skill}><div className="flex justify-between text-sm mb-1.5"><span className="capitalize text-muted-foreground">{skill.skill}</span><span>{skill.avg} <span className="text-emerald-400 text-xs">+{skill.trend}</span></span></div><div className="h-1.5 bg-border rounded-full overflow-hidden"><div className="h-full bg-foreground/60" style={{ width: `${(skill.avg / 9) * 100}%` }} /></div></div>)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return <div className="stat-card"><div className="text-muted-foreground mb-3">{icon}</div><div className="text-2xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{value}</div><div className="text-xs text-muted-foreground">{label}</div></div>
}
