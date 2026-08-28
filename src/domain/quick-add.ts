import { parseNaturalLanguageDate } from '@/domain/natural-language-date';

export type QuickAddToken = { text: string; kind: 'date' | 'time' | 'project' | 'assignee' };
export type QuickAddTaskProposal = {
  title: string;
  dueDate: string | null;
  dueTime: string | null;
  projectId: string | null;
  assigneeId: string | null;
};

type QuickAddOptions = {
  now?: Date;
  projects: { id: string; name: string }[];
  members: { id: string; displayName: string }[];
};

function findTag(text: string, prefix: '#' | '@', values: { id: string; name: string }[]) {
  const matches = [...text.matchAll(new RegExp(`${prefix}([\\p{L}\\p{N}][\\p{L}\\p{N} _-]*)`, 'gu'))];
  for (const match of matches) {
    const raw = match[1].trim();
    const value = values.find((item) => raw.toLocaleLowerCase().startsWith(item.name.toLocaleLowerCase()));
    if (value) return { value, text: `${prefix}${value.name}` };
  }
  return null;
}

function parseOne(sourceText: string, options: QuickAddOptions) {
  const scheduled = parseNaturalLanguageDate(sourceText.trim(), options.now);
  const project = findTag(scheduled.title, '#', options.projects);
  const member = findTag(scheduled.title, '@', options.members.map((item) => ({ id: item.id, name: item.displayName })));
  let title = scheduled.title;
  if (project) title = title.replace(project.text, '');
  if (member) title = title.replace(member.text, '');
  const tokens: QuickAddToken[] = scheduled.tokens.map((token) => ({ ...token }));
  if (project) tokens.push({ text: project.text, kind: 'project' });
  if (member) tokens.push({ text: member.text, kind: 'assignee' });
  return {
    task: {
      title: title.replace(/\s+/g, ' ').trim(),
      dueDate: scheduled.dueDate,
      dueTime: scheduled.dueTime,
      projectId: project?.value.id ?? null,
      assigneeId: member?.value.id ?? null,
    } satisfies QuickAddTaskProposal,
    tokens,
  };
}

export function parseQuickAdd(sourceText: string, options: QuickAddOptions) {
  const parsed = sourceText.split(/[;\n]+/).map((part) => parseOne(part, options)).filter((item) => item.task.title);
  return { sourceText, tasks: parsed.map((item) => item.task), tokens: parsed.flatMap((item) => item.tokens) };
}
