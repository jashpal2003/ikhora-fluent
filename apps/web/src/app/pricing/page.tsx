'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Check, X, ArrowRight, BookOpen, Sparkles, ChevronDown,
  PenTool, Mic2, BookOpen as Reading, Headphones, Target,
  Users, Building2, BarChart3, Award, Shield, Zap, Clock,
} from 'lucide-react'

// ── BILLING TOGGLE ─────────────────────────────────────────

function BillingToggle({ annual, onToggle }: { annual: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={`text-sm font-medium transition-colors ${!annual ? 'text-foreground' : 'text-muted-foreground'}`}>
        Monthly
      </span>
      <button
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full transition-colors ${annual ? 'bg-foreground' : 'bg-border'}`}
        aria-label="Toggle annual billing"
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full transition-all duration-300 ${
            annual ? 'translate-x-7 bg-background' : 'translate-x-0 bg-foreground'
          }`}
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${annual ? 'text-foreground' : 'text-muted-foreground'}`}>
        Annual
      </span>
      {annual && (
        <span className="text-xs font-semibold px-2 py-1 rounded-sm bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
          Save 20%
        </span>
      )}
    </div>
  )
}

// ── PLAN CARD ──────────────────────────────────────────────

function PlanCard({ plan, annual, index }: { plan: Plan; annual: boolean; index: number }) {
  const price = annual ? plan.annualPrice : plan.monthlyPrice
  const period = annual ? '/year' : '/month'
  const displayPrice = price === 0 ? '$0' : `$${price}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative flex flex-col p-8 rounded-lg bg-background border transition-colors ${
        plan.featured ? 'border-foreground shadow-lg shadow-foreground/5' : 'border-border hover:border-muted-foreground/30'
      }`}
    >
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-wider bg-foreground text-background">
          Most Popular
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {plan.name}
        </h3>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {displayPrice}
          </span>
          <span className="text-sm text-muted-foreground">{period}</span>
        </div>
        {annual && plan.monthlyPrice > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            ${Math.round(price / 12)}/month billed annually
          </p>
        )}
      </div>

      <Link
        href={plan.ctaHref}
        className={`block text-center py-3 rounded-md font-medium text-sm transition-all duration-200 mb-8 ${
          plan.featured
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'bg-secondary text-foreground hover:bg-secondary/80 border border-border'
        }`}
      >
        {plan.cta}
      </Link>

      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          What's included
        </p>
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
              <Check className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

// ── FEATURE COMPARISON TABLE ───────────────────────────────

function ComparisonTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="overflow-x-auto"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 pr-4 font-semibold text-muted-foreground w-64">Feature</th>
            {PLANS.map((plan) => (
              <th key={plan.name} className="text-center py-4 px-4 font-semibold text-foreground min-w-[120px]">
                {plan.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row, i) => (
            <tr key={row.feature} className={`border-b border-border/50 ${i % 2 === 0 ? '' : 'bg-secondary/30'}`}>
              <td className="py-3.5 pr-4 text-muted-foreground">{row.feature}</td>
              {row.values.map((val, j) => (
                <td key={j} className="py-3.5 px-4 text-center">
                  {val === true ? (
                    <Check className="w-4 h-4 text-foreground mx-auto" />
                  ) : val === false ? (
                    <X className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                  ) : (
                    <span className="text-foreground">{val}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  )
}

// ── FAQ ITEM ───────────────────────────────────────────────

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-foreground group-hover:text-foreground transition-colors pr-4">
          {question}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-sm text-muted-foreground leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── MAIN PAGE ──────────────────────────────────────────────

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 20), { passive: true })
  }

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
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="px-5 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative pt-36 pb-16 px-6 overflow-hidden">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
              <Sparkles className="h-3.5 w-3.5" />
              Simple, transparent pricing
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl font-semibold leading-[1.08] tracking-tight mb-6"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Plans for every
            <br />
            <span className="text-muted-foreground font-medium">learner and educator</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed"
          >
            Start free with core features. Upgrade when you need more checks, advanced AI feedback,
            or team management tools for your classroom.
          </motion.p>
        </div>
      </section>

      {/* ── BILLING TOGGLE + PLAN CARDS ── */}
      <section className="pb-24 px-6">
        <div className="mx-auto max-w-6xl">
          <BillingToggle annual={annual} onToggle={() => setAnnual(!annual)} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLANS.map((plan, i) => (
              <PlanCard key={plan.name} plan={plan} annual={annual} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURE COMPARISON ── */}
      <section className="py-24 px-6 bg-card border-y border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-semibold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Compare <span className="text-muted-foreground">all features</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              See exactly what's included in each plan
            </p>
          </div>
          <ComparisonTable />
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-semibold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Frequently asked <span className="text-muted-foreground">questions</span>
            </h2>
          </div>
          <div>
            {FAQS.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 px-6 bg-card border-t border-border">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-semibold mb-6 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Ready to reach your target band?
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of learners and institutes using Ikhora Fluent to practice, measure, and improve English proficiency.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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
          </div>
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
            <p className="text-sm text-muted-foreground">&copy; 2026 Ikhora. All rights reserved.</p>
            <p className="text-xs text-muted-foreground text-center md:text-right">Estimated IELTS bands are not official IELTS scores.<br/>This platform is not affiliated with IDP or British Council.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── TYPES ──────────────────────────────────────────────────

interface Plan {
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  featured: boolean
  cta: string
  ctaHref: string
  features: string[]
}

interface ComparisonRow {
  feature: string
  values: (string | boolean)[]
}

// ── STATIC DATA ────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    name: 'Free',
    description: 'Try the platform with core features',
    monthlyPrice: 0,
    annualPrice: 0,
    featured: false,
    cta: 'Get Started Free',
    ctaHref: '/register',
    features: [
      '3 writing checks/month',
      '10 speaking minutes/month',
      'Sample reading & listening',
      'CEFR placement test',
      'Basic progress tracking',
      'Community support',
    ],
  },
  {
    name: 'Student Pro',
    description: 'Full access for serious IELTS prep',
    monthlyPrice: 19,
    annualPrice: 182,
    featured: true,
    cta: 'Start Free Trial',
    ctaHref: '/register',
    features: [
      '100 writing checks/month',
      '300 speaking minutes/month',
      'Full question bank access',
      'AI-generated study plan',
      'Advanced progress analytics',
      'CEFR certificate',
      'Sentence-level feedback',
      'Priority AI processing',
    ],
  },
  {
    name: 'Teacher',
    description: 'For independent tutors and educators',
    monthlyPrice: 49,
    annualPrice: 470,
    featured: false,
    cta: 'Start Free Trial',
    ctaHref: '/register',
    features: [
      'Everything in Student Pro',
      'Up to 5 classes',
      'Teacher review dashboard',
      'Override AI scores',
      'Private content library',
      'Student progress reports',
      'Assignment scheduler',
      'Email support',
    ],
  },
  {
    name: 'Institute',
    description: 'For schools and training centers',
    monthlyPrice: 99,
    annualPrice: 950,
    featured: false,
    cta: 'Contact Sales',
    ctaHref: '/register',
    features: [
      'Everything in Teacher',
      'Up to 50 student seats',
      'Branded workspace',
      'Bulk user import',
      'Class analytics & reports',
      'API access',
      'Dedicated account manager',
      'SSO & custom integrations',
    ],
  },
]

const COMPARISON_ROWS: ComparisonRow[] = [
  { feature: 'Writing checks/month', values: ['3', '100', '100 + teacher', 'Unlimited'] },
  { feature: 'Speaking minutes/month', values: ['10', '300', '300', 'Unlimited'] },
  { feature: 'Reading & Listening', values: ['Sample', 'Full', 'Full', 'Full + private'] },
  { feature: 'CEFR placement test', values: [true, true, true, true] },
  { feature: 'AI band scoring', values: [true, true, true, true] },
  { feature: 'Sentence-level feedback', values: [false, true, true, true] },
  { feature: 'AI study plan', values: [false, true, true, true] },
  { feature: 'Progress analytics', values: ['Basic', 'Advanced', 'Advanced', 'Advanced + org'] },
  { feature: 'CEFR certificate', values: [false, true, true, true] },
  { feature: 'Teacher dashboard', values: [false, false, true, true] },
  { feature: 'Override AI scores', values: [false, false, true, true] },
  { feature: 'Private content library', values: [false, false, true, true] },
  { feature: 'Classes', values: [false, false, 'Up to 5', 'Up to 20'] },
  { feature: 'Student seats', values: ['1', '1', '25', '50'] },
  { feature: 'Branded workspace', values: [false, false, false, true] },
  { feature: 'Bulk user import', values: [false, false, false, true] },
  { feature: 'API access', values: [false, false, false, true] },
  { feature: 'SSO integration', values: [false, false, false, true] },
  { feature: 'Support', values: ['Community', 'Email', 'Priority', 'Dedicated'] },
]

const FAQS = [
  {
    question: 'Can I try the platform before paying?',
    answer: 'Yes! The Free plan gives you access to core features including 3 writing checks and 10 speaking minutes per month. No credit card required. You can upgrade to a paid plan anytime when you need more capacity.',
  },
  {
    question: 'How does the AI scoring work?',
    answer: 'Our AI uses advanced language models (Azure OpenAI) trained on official IELTS assessment criteria. It evaluates your writing and speaking responses across all official band descriptors — Task Achievement, Coherence & Cohesion, Lexical Resource, and Grammatical Range — and provides an estimated band score with sentence-level feedback.',
  },
  {
    question: 'Can teachers override AI scores?',
    answer: 'Absolutely. Teachers on the Teacher and Institute plans can review AI-generated scores and override them with their own assessment. All overrides are tracked with an audit trail so you can compare AI vs. teacher evaluations over time.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express) through Stripe. For Institute plans, we also support invoicing and bank transfers for annual subscriptions. All payments are processed securely.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period. We don\'t charge cancellation fees, and you can re-subscribe whenever you need.',
  },
  {
    question: 'Do you offer discounts for students or institutions?',
    answer: 'Yes! Annual billing saves you 20% compared to monthly pricing. For institutions with more than 50 seats, we offer custom enterprise pricing with volume discounts. Contact our sales team for a personalized quote.',
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
