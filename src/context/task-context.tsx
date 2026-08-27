import React from 'react';

export type TaskCategory = 'Work' | 'Personal';
export type TaskPriority = 'high' | 'medium' | 'low';

export type Task = {
  id: string;
  title: string;
  project: string;
  category: TaskCategory;
  due: string;
  priority: TaskPriority;
  completed: boolean;
};

export type Project = {
  id: string;
  name: string;
  eyebrow: string;
  summary: string;
  progress: number;
  tasksDone: number;
  tasksTotal: number;
  color: string;
  softColor: string;
};

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Ship onboarding flow',
    project: 'Northstar',
    category: 'Work',
    due: '10:00 AM',
    priority: 'high',
    completed: false,
  },
  {
    id: 'task-2',
    title: 'Review analytics events',
    project: 'Northstar',
    category: 'Work',
    due: '12:30 PM',
    priority: 'medium',
    completed: false,
  },
  {
    id: 'task-3',
    title: '20 minute walk outside',
    project: 'Personal',
    category: 'Personal',
    due: '2:00 PM',
    priority: 'low',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Write launch note',
    project: 'Launch kit',
    category: 'Work',
    due: '4:00 PM',
    priority: 'medium',
    completed: true,
  },
  {
    id: 'task-5',
    title: 'Clear the small inbox',
    project: 'Personal',
    category: 'Personal',
    due: '5:30 PM',
    priority: 'low',
    completed: false,
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'northstar',
    name: 'Northstar',
    eyebrow: 'PRODUCT / Q3',
    summary: 'Make the first mile feel effortless.',
    progress: 0.72,
    tasksDone: 18,
    tasksTotal: 25,
    color: '#1976D2',
    softColor: '#E6F1FC',
  },
  {
    id: 'launch-kit',
    name: 'Launch kit',
    eyebrow: 'STUDIO / SOON',
    summary: 'A sharper story for the next release.',
    progress: 0.48,
    tasksDone: 9,
    tasksTotal: 19,
    color: '#F06A5F',
    softColor: '#FDEAE7',
  },
  {
    id: 'field-notes',
    name: 'Field notes',
    eyebrow: 'PERSONAL / ONGOING',
    summary: 'Collect the ideas worth carrying forward.',
    progress: 0.84,
    tasksDone: 21,
    tasksTotal: 25,
    color: '#554C9E',
    softColor: '#EAE8FF',
  },
  {
    id: 'rituals',
    name: 'Rituals',
    eyebrow: 'WELLBEING / DAILY',
    summary: 'Small inputs that keep the system human.',
    progress: 0.61,
    tasksDone: 11,
    tasksTotal: 18,
    color: '#2F8060',
    softColor: '#DDF4EA',
  },
];

type TaskContextValue = {
  tasks: Task[];
  projects: Project[];
  toggleTask: (id: string) => void;
  addTask: (task: Pick<Task, 'title' | 'category' | 'project'>) => void;
};

const TaskContext = React.createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: React.PropsWithChildren) {
  const [tasks, setTasks] = React.useState(INITIAL_TASKS);

  const toggleTask = React.useCallback((id: string) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
    );
  }, []);

  const addTask = React.useCallback(
    ({ title, category, project }: Pick<Task, 'title' | 'category' | 'project'>) => {
      setTasks((current) => [
        ...current,
        {
          id: `task-${Date.now()}`,
          title,
          category,
          project,
          due: 'Anytime',
          priority: 'medium',
          completed: false,
        },
      ]);
    },
    [],
  );

  const value = React.useMemo(
    () => ({ tasks, projects: PROJECTS, toggleTask, addTask }),
    [addTask, tasks, toggleTask],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const value = React.use(TaskContext);
  if (!value) {
    throw new Error('useTasks must be used inside TaskProvider');
  }
  return value;
}
