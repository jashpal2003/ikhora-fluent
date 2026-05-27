<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
# Ikhora Fluent – Agent Instructions

## Product Context

Ikhora Fluent is a global AI-powered English learning and assessment platform by Ikhora.

The platform supports:
- IELTS Writing
- IELTS Speaking
- IELTS Reading
- IELTS Listening
- CEFR Language Hub
- AI Study Plan
- Progress & Reports
- Teacher Dashboard
- Institute / B2B Portal
- Admin / Super Admin Panel
- Curated content management
- AI scoring and feedback using Azure OpenAI GPT-5 mini

This is not a generic AI prompt platform. The product value comes from curated content, structured practice, reliable scoring, teacher/institute workflows, and progress analytics.

## Confirmed Product Decisions

- Global product, not India-only.
- Web-first, mobile responsive.
- No mobile app in MVP.
- IELTS + CEFR first.
- IELTS Academic first, General later.
- Student + teacher + institute + admin platform.
- B2B is important.
- Azure OpenAI GPT-5 mini will be used for answer analysis, scoring, CEFR analysis, feedback, study plans, and controlled contextual generation.
- AI-generated content must go through review before becoming global content.
- Teacher/institute uploads are private by default.
- Admin can approve selected content into global library.
- AI score can be overridden by teachers.
- Teacher override must preserve AI score, teacher score, reason, timestamp, and audit log.
- Public API comes later, but internal API structure should be clean.
- Certificates with QR verification come later.
- AI tutor must use platform content and must not become a fully open generic chatbot.

## Engineering Principles

1. Do not hardcode product data inside page components.
2. Use shared types and service layers.
3. Use reusable components.
4. Preserve current routes unless there is a strong reason.
5. Keep UI premium, clean, and B2B-ready.
6. Do not remove working functionality.
7. Avoid duplicate components.
8. Add loading, empty, error, and success states.
9. Keep code type-safe and maintainable.
10. Keep frontend ready for real backend/API replacement.
11. Never expose API keys in frontend code.
12. Write code that can scale to real database-backed content.

## Preferred Architecture

Suggested monorepo structure:

```txt
apps/
  web/
    src/
      app/
      components/
        ui/
        app/
        domain/
      lib/
        types/
        data/
        services/
        utils/
  api/
packages/
  database/
  shared/

  Design System Direction

Ikhora Fluent should look like a premium SaaS product.

Visual style:

black / white / grayscale dominant
restrained violet accent
premium dark surfaces
subtle borders
clear typography
elegant spacing
minimal but refined interactions
no childish UI
no random emojis in serious product areas
no excessive gradients
no generic template feel

Use reusable components for:

AppShell
Sidebar
Topbar
PageHeader
Card
MetricCard
SectionCard
Button
Input
Textarea
Select
Tabs
Badge
StatusPill
ProgressBar
DataTable
EmptyState
LoadingState
ErrorState
QuestionCard
ContentCard
SubmissionRow
ScoreReport
AIProcessingState
Core Data Types

Use or create shared types for:

User
Role
Organization
Class
StudentProfile
TeacherProfile
ContentItem
QuestionBankItem
WritingTask
SpeakingPrompt
ReadingPassage
ReadingQuestion
ListeningSection
ListeningQuestion
Submission
Attempt
ScoreReport
CriterionScore
TeacherOverride
StudyPlan
StudyPlanTask
Assignment
AIJob
SubscriptionPlan
AuditLog
Roles

Supported roles:

student
teacher
institute_admin
admin
super_admin
Content Visibility

Supported content visibility:

global
organization_private
class_private
Content Status

Supported content lifecycle:

draft
ai_quality_checked
pending_review
approved
rejected
published
archived
Submission Status

Supported submission lifecycle:

draft
submitted
queued
processing
scored
teacher_reviewed
failed
AI Job Status

Supported AI job lifecycle:

queued
processing
completed
failed
requires_review
Content Strategy

Content should be added through:

admin manual creation
CSV/Excel import
PDF/Word import later
teacher uploads
institute private libraries
AI-assisted drafting only where useful

AI-generated content must not directly become global content. It must go through review.

AI Usage Strategy

Azure OpenAI GPT-5 mini should be abstracted behind server-side services.

AI services:

scoreWriting()
scoreSpeaking()
analyzeCEFR()
adaptTextLevel()
generateQuestions()
generateStudyPlan()
reviewContentQuality()

Do not call Azure OpenAI directly from React components.

Page Requirements
Landing Page

Must communicate:

IELTS Writing
Speaking Coach
Reading and Listening
CEFR tools
Teacher dashboard
Institute/B2B portal
AI study plan
Progress analytics
Student Dashboard

Must be data-driven and show:

IELTS band estimate
CEFR level
streak
hours practiced
skill breakdown
study plan
recent submissions
practice recommendations
focus areas
Writing Coach

Must support:

Academic Task 1
Academic Task 2
General Task 1
General Task 2
prompt selection
answer editor
word count
save draft
submit for AI scoring
score report
criterion feedback
Speaking Practice

Must support:

IELTS Speaking Part 1, 2, 3
prompt bank
follow-up questions
recording UI
transcript/analysis placeholder
speaking score report
Reading Practice

Must support:

passages
question types
answer selection
validation
score calculation
explanations
Listening Practice

Must support:

sections 1–4
audio URL or placeholder
question list
answer submission
explanations
admin-managed audio later
CEFR Hub

Must support:

CEFR checker
Level adaptor
Readability checker
Question generator
result panels
processing states
Study Plan

Must support:

7-day plan
target band
weak areas
weekly hours
task completion
regeneration placeholder
Reports

Must support:

submissions table
filters
band trends
skill trends
grammar/vocabulary issue analysis
teacher-reviewed status
Admin

Must support:

content management
question bank
import flow
review queue
organizations
users
AI jobs
settings
Teacher

Must support:

classes
students
assignments
content library
submission review
teacher override
Institute

Must support:

branded portal settings
users
teachers
students
private content library
reports
Production Readiness Checklist

Before finishing any task:

Run lint if available.
Run build if available.
Fix TypeScript errors.
Remove unused imports.
Check responsive layout.
Check keyboard accessibility.
Check no broken routes.
Check no page-level hardcoded data unless temporary seed data is centralized.
Document assumptions and remaining TODOs.
Output Format for Agent Responses

Every agent response should include:

What was audited
Key gaps found
What was changed
Files changed
How to test
Remaining next steps