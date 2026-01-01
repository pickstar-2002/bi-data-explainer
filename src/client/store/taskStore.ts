import { create } from 'zustand';
import { Task, TaskCreateInput, TaskUpdateInput, TaskStatus, TaskPriority } from '../../shared/types';

interface TaskState {
  tasks: Task[];
  filterStatus: TaskStatus | 'all';
  filterPriority: TaskPriority | 'all';

  // 操作
  addTask: (input: TaskCreateInput) => void;
  updateTask: (id: string, input: TaskUpdateInput) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  setFilterStatus: (status: TaskStatus | 'all') => void;
  setFilterPriority: (priority: TaskPriority | 'all') => void;

  // 查询
  getTasks: () => Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksByPriority: (priority: TaskPriority) => Task[];
  getTaskById: (id: string) => Task | undefined;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  filterStatus: 'all',
  filterPriority: 'all',

  addTask: (input) => {
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: input.title,
      description: input.description,
      category: input.category,
      priority: input.priority,
      status: 'pending',
      assignee: input.assignee,
      relatedMetric: input.relatedMetric,
      dueDate: input.dueDate,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    set((state) => ({ tasks: [...state.tasks, newTask] }));
  },

  updateTask: (id, input) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...input, updatedAt: Date.now() }
          : task
      )
    }));
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }));
  },

  setTaskStatus: (id, status) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status,
              updatedAt: Date.now(),
              completedAt: status === 'completed' ? Date.now() : undefined
            }
          : task
      )
    }));
  },

  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),

  getTasks: () => {
    const state = get();
    let filtered = [...state.tasks];

    if (state.filterStatus !== 'all') {
      filtered = filtered.filter((t) => t.status === state.filterStatus);
    }
    if (state.filterPriority !== 'all') {
      filtered = filtered.filter((t) => t.priority === state.filterPriority);
    }

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },

  getTasksByStatus: (status) => {
    return get().tasks.filter((t) => t.status === status);
  },

  getTasksByPriority: (priority) => {
    return get().tasks.filter((t) => t.priority === priority);
  },

  getTaskById: (id) => {
    return get().tasks.find((t) => t.id === id);
  }
}));
