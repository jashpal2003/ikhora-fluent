'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PenTool, Mic2, BookOpen, Target, Users, Building2, BarChart3, Sparkles, Award, ArrowRight } from 'lucide-react'

const NAV_LINKS = [
  { label: 'IELTS Writing', href: '/ielts' },
  { label: 'Speaking Coach', href: '/speaking-coach' },
  { label: 'CEFR Tools', href: '/cefr-tools' },
  { label: 'For Teachers', href: '/for-teachers' },
  { label: 'Pricing', href: '/pricing' },
]

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      {/* ── NAVBAR ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border py-3' : 'py-5 bg-transparent'
        }`}
      >
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ikhora <span className="text-muted-foreground font-medium">Fluent</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              IELTS + CEFR Platform · AI-Powered · Globally Trusted
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl font-semibold leading-[1.08] tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Master English
            <br />
            <span className="text-muted-foreground font-medium">with Intelligent</span>
            <br />
            Feedback & Scoring
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-10"
          >
            Practice IELTS Writing, Speaking, Reading and Listening with AI-estimated band scores,
            sentence-level feedback, CEFR analysis, and expert teacher review — for students,
            teachers, and institutes worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              Start Learning Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/for-teachers"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-base font-medium text-foreground bg-secondary hover:bg-secondary/80 transition-all border border-border"
            >
              For Institutes
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 pt-10 border-t border-border flex items-center justify-center gap-12 text-sm text-muted-foreground flex-wrap"
          >
            {[
              { value: '50K+', label: 'Learners' },
              { value: '2,000+', label: 'Institutes' },
              { value: '4.9/5', label: 'Rating' },
              { value: '98%', label: 'Score improvement' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{stat.value}</div>
                <div className="text-xs mt-1 uppercase tracking-wider text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Everything you need to <span className="text-muted-foreground">succeed</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From IELTS writing coach to CEFR placement — a complete platform for every stage of your English journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {FEATURES.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-8 rounded-lg bg-background border border-border hover:border-muted-foreground/30 transition-colors group"
              >
                <div className="h-10 w-10 rounded-md bg-secondary border border-border flex items-center justify-center mb-6 text-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold mb-3 group-hover:text-primary transition-colors" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                {feature.badge && (
                  <span className="mt-5 inline-block text-xs font-semibold px-2 py-1 rounded-sm bg-secondary text-foreground border border-border">
                    {feature.badge}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              How Ikhora Fluent <span className="text-muted-foreground">works</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-6 h-12 w-12 rounded-full border-2 border-border bg-card flex items-center justify-center font-bold text-lg text-foreground">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-3 text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-[1px] bg-border" style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }} />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING TEASER ── */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Simple, transparent <span className="text-muted-foreground">pricing</span>
            </h2>
            <p className="text-muted-foreground text-lg">Start free, upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`p-8 rounded-lg bg-background border ${plan.featured ? 'border-muted-foreground shadow-sm' : 'border-border'} relative`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-foreground text-background">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{plan.name}</h3>
                <div className="text-4xl font-bold mb-4 mt-4 tracking-tight">{plan.price}<span className="text-base font-normal text-muted-foreground">{plan.period}</span></div>
                <p className="text-sm text-muted-foreground mb-8 min-h-[40px]">{plan.description}</p>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-foreground">
                      <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-md font-medium text-sm transition-all duration-200 ${
                    plan.featured
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to reach your target band?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of learners and institutes using Ikhora Fluent to practice, measure, and improve English proficiency.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-md text-base font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
          >
            Get Started — It's Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border py-16 px-6 bg-card">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="var(--primary-foreground)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span className="font-semibold text-lg text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Ikhora Fluent</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                Global AI-assisted English, IELTS and CEFR learning platform for students, teachers and institutes.
              </p>
            </div>
            {FOOTER_LINKS.map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-6 text-foreground tracking-wide uppercase">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Ikhora. All rights reserved.</p>
            <p className="text-xs text-muted-foreground text-center md:text-right">Estimated IELTS bands are not official IELTS scores.<br/>This platform is not affiliated with IDP or British Council.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const FEATURES = [
  { icon: PenTool, title: 'IELTS Writing Coach', description: 'Academic Task 1 & 2, General Training. AI band scores, sentence-level feedback, model answers and improvement plans.', badge: 'Academic & General' },
  { icon: Mic2, title: 'Speaking Practice', description: 'Record Part 1, 2 & 3. Get fluency, pronunciation, vocabulary and grammar feedback with estimated band score.', badge: 'Word-level pronunciation' },
  { icon: BookOpen, title: 'Reading & Listening', description: 'Practice all question types with curated passages. Timed test mode, answer explanations and vocabulary extraction.' },
  { icon: Target, title: 'CEFR Language Hub', description: 'CEFR checker, level adaptor, readability analysis, question generator and placement assessment A1–C2.' },
  { icon: Users, title: 'Teacher Dashboard', description: 'Create classes, assign work, review AI scores, override with audit trail. Bulk import and private content library.' },
  { icon: Building2, title: 'Institute Portal', description: 'Branded workspace, seat management, private content library, class analytics and cohort progress reports.' },
  { icon: BarChart3, title: 'Progress Analytics', description: 'Skill trend charts, band movement, grammar/vocabulary weakness tracking and comparison across attempts.' },
  { icon: Sparkles, title: 'AI Study Plan', description: 'Personalized daily/weekly study plans based on your weakness profile, target band and available time.' },
  { icon: Award, title: 'CEFR Certificates', description: 'QR-verifiable CEFR certificates. Institution-branded certificates with secure verification URL.' },
]

const STEPS = [
  { title: 'Practice', description: 'Submit writing, record speaking, or attempt reading/listening tests from the curated question bank.' },
  { title: 'AI Scores', description: 'Azure GPT-5 mini evaluates your answer using official IELTS rubrics and returns estimated band + feedback.' },
  { title: 'Review', description: 'See sentence-level corrections, pronunciation issues, model answers and your skill weakness profile.' },
  { title: 'Improve', description: 'Follow AI-generated study plans with targeted practice for your weakest areas.' },
]

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Try the platform with limited checks',
    featured: false,
    cta: 'Get Started Free',
    features: ['3 writing checks/month', '10 speaking minutes/month', 'Sample reading/listening', 'CEFR placement test', 'Basic progress tracking'],
  },
  {
    name: 'Student Pro',
    price: '$19',
    period: '/month',
    description: 'Full access for serious IELTS prep',
    featured: true,
    cta: 'Start Free Trial',
    features: ['100 writing checks/month', '300 speaking minutes/month', 'Full question bank access', 'AI study plan', 'Progress analytics', 'CEFR certificate'],
  },
  {
    name: 'Institute',
    price: '$99',
    period: '/month',
    description: 'For schools and training centers',
    featured: false,
    cta: 'Contact Sales',
    features: ['Up to 50 seats', 'Teacher dashboard', 'Private content library', 'Branded reports', 'Bulk user import', 'Class analytics'],
  },
]

const FOOTER_LINKS = [
  {
    title: 'Product',
    links: [
      { label: 'IELTS Writing', href: '/ielts' },
      { label: 'Speaking Coach', href: '/speaking-coach' },
      { label: 'CEFR Tools', href: '/cefr-tools' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'For Teams',
    links: [
      { label: 'Teachers', href: '/for-teachers' },
      { label: 'Institutes', href: '/for-institutes' },
      { label: 'Enterprise', href: '/enterprise' },
      { label: 'API Access', href: '/api-access' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]
