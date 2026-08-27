export type PlanningPriority = 'high' | 'medium' | 'low';

export type PlanningTask = {
  id: string;
  title: string;
  priority: PlanningPriority;
  completed: boolean;
  plannedDate: string;
  createdAt: number;
};

export type EveningAction = 'reschedule' | 'inbox' | 'drop';

const PRIORITY_WEIGHT: Record<PlanningPriority, number> = { high: 0, medium: 1, low: 2 };

export function chooseDailyThree(tasks: PlanningTask[], date: string, limit = 3): string[] {
  return tasks
    .filter((task) => !task.completed && task.plannedDate === date)
    .sort((left, right) => PRIORITY_WEIGHT[left.priority] - PRIORITY_WEIGHT[right.priority] || left.createdAt - right.createdAt)
    .slice(0, limit)
    .map((task) => task.id);
}

export function getEveningDecision(action: EveningAction) {
  const labels: Record<EveningAction, string> = {
    reschedule: 'Move to another day',
    inbox: 'Return to inbox',
    drop: 'Let it go',
  };
  return { action, label: labels[action] };
}
