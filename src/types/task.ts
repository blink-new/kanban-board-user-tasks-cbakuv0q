export type Priority = 1 | 2 | 3;

export type TaskStatus = string;

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  desiredDate: string;
  actualDeliveryDate?: string;
  label: string;
  status: TaskStatus;
  assignee?: string; // Who is assigned to the task
  creator?: string; // Who created the task
  createdAt: string;
  updatedAt: string;
}

export interface SwimLane {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_SWIMLANES: SwimLane[] = [
  { id: 'todo', name: 'To-do', color: 'blue' },
  { id: 'planning', name: 'Planning', color: 'purple' },
  { id: 'in-progress', name: 'In-progress', color: 'amber' },
  { id: 'testing', name: 'Testing', color: 'cyan' },
  { id: 'done', name: 'Done', color: 'green' },
  // Removed 'Release' lane
];

export const DEFAULT_SWIMLANE_IDS = DEFAULT_SWIMLANES.map(lane => lane.id);

// Legacy mapping for backward compatibility with existing data
export const TASK_STATUS_MAP: Record<string, string> = Object.fromEntries(
  DEFAULT_SWIMLANES.map(lane => [lane.id, lane.name])
);

// Add the missing TASK_STATUS_ORDER export
export const TASK_STATUS_ORDER: string[] = DEFAULT_SWIMLANES.map(lane => lane.id);

export interface TaskMap {
  [id: string]: Task;
}

export interface TasksByStatus {
  [status: string]: string[];
}