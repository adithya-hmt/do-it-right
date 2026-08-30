import { getDayKey } from '@/domain/workspace';

export type NaturalLanguageDateToken = { text: string; kind: 'date' | 'time' };
export type NaturalLanguageDateResult = { sourceText: string; title: string; tokens: NaturalLanguageDateToken[]; dueDate: string | null; dueTime: string | null };

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function addDays(date: Date, days: number) {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function parseTime(raw: string) {
  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (!match) return null;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? 0);
  if (hour < 1 || hour > 12 || minute > 59) return null;
  if (match[3].toLowerCase() === 'pm' && hour !== 12) hour += 12;
  if (match[3].toLowerCase() === 'am' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function parseNaturalLanguageDate(sourceText: string, now = new Date()): NaturalLanguageDateResult {
  const dateMatch = sourceText.match(/\b(today|tomorrow|next\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/i);
  if (!dateMatch) return { sourceText, title: sourceText, tokens: [], dueDate: null, dueTime: null };
  let date = now;
  const phrase = dateMatch[0];
  if (/^tomorrow$/i.test(phrase)) date = addDays(now, 1);
  else if (/^next\s/i.test(phrase)) {
    const target = DAYS.indexOf(phrase.split(/\s+/)[1].toLowerCase());
    const delta = ((target - now.getDay() + 7) % 7) || 7;
    date = addDays(now, delta);
  }
  const withoutDate = sourceText.slice(0, dateMatch.index) + sourceText.slice((dateMatch.index ?? 0) + phrase.length);
  const timeMatch = withoutDate.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm))\b/i);
  const dueTime = timeMatch ? parseTime(timeMatch[1]) : null;
  if (timeMatch && !dueTime) return { sourceText, title: sourceText, tokens: [], dueDate: null, dueTime: null };
  const titleText = timeMatch ? withoutDate.slice(0, timeMatch.index) + withoutDate.slice((timeMatch.index ?? 0) + timeMatch[0].length) : withoutDate;
  const tokens: NaturalLanguageDateToken[] = [{ text: phrase, kind: 'date' }];
  if (timeMatch) tokens.push({ text: timeMatch[0], kind: 'time' });
  return { sourceText, title: titleText.replace(/\s+/g, ' ').trim(), tokens, dueDate: getDayKey(date), dueTime };
}
