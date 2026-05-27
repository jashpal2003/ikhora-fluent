import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Assignments' }

export default function Page() {
  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Assignments</h1>
        <p>Create and manage assignments for your classes.</p>
      </div>
      <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
        <span className="text-4xl mb-4">??</span>
        <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Coming Soon</h3>
        <p className="text-muted-foreground text-sm max-w-sm">This section is under active development. Check back soon.</p>
      </div>
    </div>
  )
}
