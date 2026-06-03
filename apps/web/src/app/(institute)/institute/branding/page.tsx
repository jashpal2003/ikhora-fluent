'use client'

import { useEffect, useState } from 'react'
import { getInstituteBranding } from '@/lib/services/instituteService'
import { ImagePlus, Palette, Save } from 'lucide-react'

type Branding = Awaited<ReturnType<typeof getInstituteBranding>>

export default function InstituteBrandingPage() {
  const [branding, setBranding] = useState<Branding | null>(null)

  useEffect(() => {
    getInstituteBranding().then(setBranding)
  }, [])

  return (
    <div className="animate-fade-up">
      <div className="page-header">
        <h1>Branding</h1>
        <p>Customize the institute identity students and teachers see inside the workspace.</p>
      </div>

      {!branding ? <div className="glass-card p-8 h-72 animate-pulse" /> : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-card p-6 space-y-5">
            <label className="block"><span className="text-sm font-medium">Brand name</span><input value={branding.brandName} onChange={(e) => setBranding({ ...branding, brandName: e.target.value })} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
            <label className="block"><span className="text-sm font-medium">Logo URL</span><div className="mt-2 flex gap-2"><input value={branding.logoUrl} onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })} className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /><button className="px-3 rounded-md border border-border hover:bg-secondary"><ImagePlus className="h-4 w-4" /></button></div></label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block"><span className="text-sm font-medium">Primary color</span><input value={branding.primaryColor} onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
              <label className="block"><span className="text-sm font-medium">Accent color</span><input value={branding.accentColor} onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })} className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" /></label>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"><Save className="h-4 w-4" />Save changes</button>
          </div>
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2"><Palette className="h-4 w-4 text-muted-foreground" />Preview</h2>
            <div className="rounded-md border border-border overflow-hidden">
              <div className="h-20" style={{ background: `linear-gradient(135deg, ${branding.primaryColor}, ${branding.accentColor})` }} />
              <div className="p-4 bg-secondary/30"><div className="font-semibold">{branding.brandName}</div><div className="text-xs text-muted-foreground mt-1">{branding.contactEmail}</div><div className="mt-4 h-8 rounded-md flex items-center justify-center text-xs font-medium text-white" style={{ backgroundColor: branding.primaryColor }}>Student portal</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
