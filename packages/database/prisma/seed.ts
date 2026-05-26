import { PrismaClient, Exam, Skill, ContentType, OwnerType, ContentVisibility, ReviewStatus, SourceType, IELTSModule, CEFRLevel, QuestionType, PlanTier } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding Ikhora Fluent database...')

  // ── PLANS ──
  const freePlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Free',
      tier: PlanTier.FREE,
      monthlyPriceCents: 0,
      writingChecksMonthly: 3,
      speakingMinutesMonthly: 10,
      aiCreditsMonthly: 50,
      seatLimit: 1,
      storageGb: 1,
    },
  })

  const proPlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Student Pro',
      tier: PlanTier.STUDENT_PRO,
      monthlyPriceCents: 1900,
      writingChecksMonthly: 100,
      speakingMinutesMonthly: 300,
      aiCreditsMonthly: 1000,
      seatLimit: 1,
      storageGb: 5,
    },
  })

  const institutePlan = await prisma.plan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Institute Pro',
      tier: PlanTier.INSTITUTE_PRO,
      monthlyPriceCents: 9900,
      writingChecksMonthly: 5000,
      speakingMinutesMonthly: 10000,
      aiCreditsMonthly: 50000,
      seatLimit: 500,
      storageGb: 100,
      canPrivateContent: true,
      canBrandedReports: true,
      canBulkImport: true,
      canTeacherOverride: true,
    },
  })

  console.log('✅ Plans created')

  // ── DEMO USERS ──
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ikhorafluent.com' },
    update: {},
    create: {
      email: 'admin@ikhorafluent.com',
      name: 'Super Admin',
      hashedPassword: adminPassword,
      globalRole: 'SUPER_ADMIN',
      emailVerified: true,
    },
  })

  const teacherPassword = await bcrypt.hash('Teacher123!', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@demo.com' },
    update: {},
    create: {
      email: 'teacher@demo.com',
      name: 'Sarah Thompson',
      hashedPassword: teacherPassword,
      globalRole: 'USER',
      emailVerified: true,
      targetExam: 'IELTS',
    },
  })

  const studentPassword = await bcrypt.hash('Student123!', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@demo.com' },
    update: {},
    create: {
      email: 'student@demo.com',
      name: 'Aisha Rahman',
      hashedPassword: studentPassword,
      globalRole: 'USER',
      emailVerified: true,
      targetExam: 'IELTS',
      targetBand: 7.0,
      nativeLanguage: 'Arabic',
    },
  })

  // Create student skill profile
  await prisma.studentSkillProfile.upsert({
    where: { userId: student.id },
    update: {},
    create: {
      userId: student.id,
      estimatedCefr: CEFRLevel.B2,
      estimatedBand: 6.5,
      writingBand: 6.5,
      speakingBand: 6.0,
      readingBand: 7.0,
      listeningBand: 7.5,
      streakDays: 12,
      totalSubmissions: 34,
    },
  })

  console.log('✅ Demo users created')

  // ── DEMO ORGANIZATION ──
  const org = await prisma.organization.upsert({
    where: { slug: 'cambridge-demo' },
    update: {},
    create: {
      name: 'Cambridge Language School',
      slug: 'cambridge-demo',
      planId: institutePlan.id,
    },
  })

  // Add members
  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: teacher.id } },
    update: {},
    create: { organizationId: org.id, userId: teacher.id, role: 'TEACHER', status: 'ACTIVE', joinedAt: new Date() },
  })

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: student.id } },
    update: {},
    create: { organizationId: org.id, userId: student.id, role: 'STUDENT', status: 'ACTIVE', joinedAt: new Date() },
  })

  console.log('✅ Demo organization created')

  // ── SAMPLE CONTENT ──
  const writingTask1 = await prisma.contentItem.create({
    data: {
      ownerType: OwnerType.GLOBAL,
      createdById: admin.id,
      approvedById: admin.id,
      contentType: ContentType.WRITING_TASK,
      exam: Exam.IELTS,
      skill: Skill.WRITING,
      module: IELTSModule.ACADEMIC_TASK_2,
      title: 'Public Health — Sports Facilities Essay',
      body: 'Some people believe that the best way to improve public health is to increase the number of sports facilities. Others, however, believe that this would have little effect on public health and other measures are required. Discuss both views and give your own opinion.',
      cefrLevel: CEFRLevel.B2,
      difficulty: 0.6,
      topicTags: ['health', 'society', 'sport'],
      sourceType: SourceType.EXPERT,
      visibility: ContentVisibility.GLOBAL,
      reviewStatus: ReviewStatus.PUBLISHED,
      currentVersion: 1,
      estimatedMinutes: 40,
      wordCount: 52,
    },
  })

  const writingTask2 = await prisma.contentItem.create({
    data: {
      ownerType: OwnerType.GLOBAL,
      createdById: admin.id,
      approvedById: admin.id,
      contentType: ContentType.WRITING_TASK,
      exam: Exam.IELTS,
      skill: Skill.WRITING,
      module: IELTSModule.ACADEMIC_TASK_1,
      title: 'Accommodation Ownership Bar Chart',
      body: 'The graph below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
      cefrLevel: CEFRLevel.B2,
      difficulty: 0.55,
      topicTags: ['housing', 'society', 'statistics'],
      sourceType: SourceType.EXPERT,
      visibility: ContentVisibility.GLOBAL,
      reviewStatus: ReviewStatus.PUBLISHED,
      currentVersion: 1,
      estimatedMinutes: 20,
    },
  })

  // Speaking prompts
  const speakingPart2 = await prisma.contentItem.create({
    data: {
      ownerType: OwnerType.GLOBAL,
      createdById: admin.id,
      approvedById: admin.id,
      contentType: ContentType.SPEAKING_PROMPT,
      exam: Exam.IELTS,
      skill: Skill.SPEAKING,
      module: IELTSModule.SPEAKING_PART_2,
      title: 'Memorable Journey Cue Card',
      body: 'Describe a memorable journey you have taken.\n\nYou should say:\n• where you went\n• how you travelled there\n• what you did during the journey\nand explain why it was memorable.',
      cefrLevel: CEFRLevel.B2,
      difficulty: 0.5,
      topicTags: ['travel', 'personal_experience'],
      sourceType: SourceType.EXPERT,
      visibility: ContentVisibility.GLOBAL,
      reviewStatus: ReviewStatus.PUBLISHED,
      currentVersion: 1,
      estimatedMinutes: 2,
    },
  })

  // Reading passage questions
  const mcq1 = await prisma.contentItem.create({
    data: {
      ownerType: OwnerType.GLOBAL,
      createdById: admin.id,
      approvedById: admin.id,
      contentType: ContentType.QUESTION,
      exam: Exam.IELTS,
      skill: Skill.READING,
      module: IELTSModule.READING_PASSAGE,
      questionType: QuestionType.MCQ,
      title: 'Urban Migration — Agglomeration Effects',
      body: 'What does the term "agglomeration effects" refer to in the context of the passage?',
      options: JSON.stringify({
        A: 'The negative impact of overcrowding in cities',
        B: 'Productivity gains from concentrating people and businesses in cities',
        C: 'The spread of informal settlements around urban areas',
        D: 'The migration of young people away from rural communities',
      }),
      answerKey: JSON.stringify({ correct: 'B' }),
      explanation: 'The passage connects agglomeration effects to the 15% productivity increase from doubling city size.',
      cefrLevel: CEFRLevel.B2,
      difficulty: 0.55,
      topicTags: ['urban_rural', 'economics', 'society'],
      sourceType: SourceType.EXPERT,
      visibility: ContentVisibility.GLOBAL,
      reviewStatus: ReviewStatus.PUBLISHED,
      currentVersion: 1,
    },
  })

  console.log('✅ Sample content created:', { writingTask1: writingTask1.id, speakingPart2: speakingPart2.id, mcq1: mcq1.id })

  // ── CLASS ──
  const demoClass = await prisma.class.create({
    data: {
      organizationId: org.id,
      name: 'IELTS Prep A — Academic',
      description: 'Advanced Academic IELTS preparation targeting Band 7+',
      targetExam: Exam.IELTS,
      targetLevel: CEFRLevel.C1,
    },
  })

  await prisma.classMember.createMany({
    data: [
      { classId: demoClass.id, userId: teacher.id, role: 'TEACHER' },
      { classId: demoClass.id, userId: student.id, role: 'STUDENT' },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Demo class created')

  console.log('')
  console.log('🎉 Seed complete!')
  console.log('')
  console.log('Demo accounts:')
  console.log('  👤 Student:  student@demo.com   / Student123!')
  console.log('  👩‍🏫 Teacher:  teacher@demo.com   / Teacher123!')
  console.log('  🔑 Admin:    admin@ikhorafluent.com / Admin123!')
}

main()
  .catch((e) => { console.error('Seed error:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
