/**
 * Question Bank Service
 * Provides access to all content items from the question bank.
 * Currently uses seed data. Replace fetch() calls with real API when backend is ready.
 * API: GET /api/question-bank?skill=&status=&cefrLevel=
 */

import type { WritingTask, SpeakingPrompt, ReadingPassage, ListeningSection, TaskType, SpeakingPart, CEFRLevel, ContentStatus } from '../types'
import { WRITING_TASKS } from '../data/writingTasks'
import { SPEAKING_PROMPTS } from '../data/speakingPrompts'
import { READING_PASSAGES } from '../data/readingPassages'
import { LISTENING_SECTIONS } from '../data/listeningSections'

// ── WRITING TASKS ─────────────────────────────────────────

export function getWritingTasks(filters?: {
  taskType?: TaskType
  cefrLevel?: CEFRLevel
  status?: ContentStatus
}): WritingTask[] {
  let tasks = WRITING_TASKS
  if (filters?.taskType) tasks = tasks.filter((t) => t.taskType === filters.taskType)
  if (filters?.cefrLevel) tasks = tasks.filter((t) => t.cefrLevel === filters.cefrLevel)
  if (filters?.status) tasks = tasks.filter((t) => t.status === filters.status)
  return tasks
}

export function getWritingTaskById(id: string): WritingTask | undefined {
  return WRITING_TASKS.find((t) => t.id === id)
}

export function getRandomWritingTask(taskType?: TaskType): WritingTask | undefined {
  const filtered = taskType ? WRITING_TASKS.filter((t) => t.taskType === taskType) : WRITING_TASKS
  if (filtered.length === 0) return undefined
  return filtered[Math.floor(Math.random() * filtered.length)]
}

// ── SPEAKING PROMPTS ──────────────────────────────────────

export function getSpeakingPrompts(filters?: {
  part?: SpeakingPart
  cefrLevel?: CEFRLevel
  status?: ContentStatus
}): SpeakingPrompt[] {
  let prompts = SPEAKING_PROMPTS
  if (filters?.part) prompts = prompts.filter((p) => p.part === filters.part)
  if (filters?.cefrLevel) prompts = prompts.filter((p) => p.cefrLevel === filters.cefrLevel)
  if (filters?.status) prompts = prompts.filter((p) => p.status === filters.status)
  return prompts
}

export function getSpeakingPromptById(id: string): SpeakingPrompt | undefined {
  return SPEAKING_PROMPTS.find((p) => p.id === id)
}

export function getSpeakingPromptsByPart(part: SpeakingPart): SpeakingPrompt[] {
  return SPEAKING_PROMPTS.filter((p) => p.part === part)
}

// ── READING PASSAGES ──────────────────────────────────────

export function getReadingPassages(filters?: {
  cefrLevel?: CEFRLevel
  status?: ContentStatus
}): ReadingPassage[] {
  let passages = READING_PASSAGES
  if (filters?.cefrLevel) passages = passages.filter((p) => p.cefrLevel === filters.cefrLevel)
  if (filters?.status) passages = passages.filter((p) => p.status === filters.status)
  return passages
}

export function getReadingPassageById(id: string): ReadingPassage | undefined {
  return READING_PASSAGES.find((p) => p.id === id)
}

// ── LISTENING SECTIONS ────────────────────────────────────

export function getListeningSections(filters?: {
  cefrLevel?: CEFRLevel
  status?: ContentStatus
  audioStatus?: 'available' | 'pending' | 'unavailable'
}): ListeningSection[] {
  let sections = LISTENING_SECTIONS
  if (filters?.cefrLevel) sections = sections.filter((s) => s.cefrLevel === filters.cefrLevel)
  if (filters?.status) sections = sections.filter((s) => s.status === filters.status)
  if (filters?.audioStatus) sections = sections.filter((s) => s.audioStatus === filters.audioStatus)
  return sections
}

export function getListeningSectionById(id: string): ListeningSection | undefined {
  return LISTENING_SECTIONS.find((s) => s.id === id)
}

export function getListeningSectionByNumber(num: 1 | 2 | 3 | 4): ListeningSection | undefined {
  return LISTENING_SECTIONS.find((s) => s.sectionNumber === num)
}
