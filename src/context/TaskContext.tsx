import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, TaskMap, TasksByStatus, TaskStatus, SwimLane, DEFAULT_SWIMLANES, DEFAULT_SWIMLANE_IDS } from '../types/task';
import { v4 as uuidv4 } from 'uuid';

interface TaskContextType {
  tasks: TaskMap;
  tasksByStatus: TasksByStatus;
  swimLanes: SwimLane[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus) => void;
  reorderTasks: (status: TaskStatus, newOrder: string[]) => void;
  addSwimLane: (name: string) => void;
  updateSwimLane: (id: string, updates: Partial<SwimLane>) => void;
  deleteSwimLane: (id: string) => void;
  reorderSwimLanes: (newOrder: string[]) => void;
}

// Local storage keys
const TASKS_STORAGE_KEY = 'kanban-tasks';
const SWIMLANES_STORAGE_KEY = 'kanban-swimlanes';

// Create the context
const TaskContext = createContext<TaskContextType | undefined>(undefined);

// Provider component
export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<TaskMap>({});
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>({});
  const [swimLanes, setSwimLanes] = useState<SwimLane[]>(DEFAULT_SWIMLANES);

  // Initialize tasksByStatus with all swimlane IDs
  useEffect(() => {
    setTasksByStatus(prev => {
      const newTasksByStatus = { ...prev };
      
      // Ensure all swimlanes have an entry, defaulting to empty array
      swimLanes.forEach(lane => {
        if (!newTasksByStatus[lane.id]) {
          newTasksByStatus[lane.id] = [];
        }
      });
      
      return newTasksByStatus;
    });
  }, [swimLanes]);

  // Load tasks from localStorage on initial render
  useEffect(() => {
    // Load swimlanes
    const storedSwimLanes = localStorage.getItem(SWIMLANES_STORAGE_KEY);
    if (storedSwimLanes) {
      try {
        const savedSwimLanes = JSON.parse(storedSwimLanes);
        setSwimLanes(savedSwimLanes);
      } catch (error) {
        console.error('Failed to parse swimlanes from localStorage', error);
      }
    }

    // Load tasks
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (storedTasks) {
      try {
        const { tasks: savedTasks, tasksByStatus: savedTasksByStatus } = JSON.parse(storedTasks);
        setTasks(savedTasks);
        setTasksByStatus(savedTasksByStatus);
      } catch (error) {
        console.error('Failed to parse tasks from localStorage', error);
      }
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(tasks).length > 0 || Object.keys(tasksByStatus).length > 0) {
      localStorage.setItem(
        TASKS_STORAGE_KEY,
        JSON.stringify({
          tasks,
          tasksByStatus,
        })
      );
    }
  }, [tasks, tasksByStatus]);

  // Save swimlanes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(SWIMLANES_STORAGE_KEY, JSON.stringify(swimLanes));
  }, [swimLanes]);

  // Add a task
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    const newTask: Task = {
      id,
      ...taskData,
      createdAt: now,
      updatedAt: now,
    };

    // Update tasks map
    setTasks((prev) => ({
      ...prev,
      [id]: newTask,
    }));

    // Update tasks by status
    setTasksByStatus((prev) => {
      const statusTasks = prev[newTask.status] || [];
      return {
        ...prev,
        [newTask.status]: [...statusTasks, id],
      };
    });

    return newTask;
  };

  // Update a task
  const updateTask = (id: string, taskData: Partial<Task>) => {
    setTasks((prevTasks) => {
      const task = prevTasks[id];
      if (!task) return prevTasks;

      const updatedTask = {
        ...task,
        ...taskData,
        updatedAt: new Date().toISOString(),
      };

      // If status is changing, let moveTask handle tasksByStatus updates
      if (taskData.status && task.status !== taskData.status) {
        // We only update the task object here.
        // moveTask will be called separately to handle tasksByStatus
        return {
          ...prevTasks,
          [id]: updatedTask,
        };
      }

      // If status is not changing, or no status in taskData, update tasksByStatus here
      // This part is actually not needed if moveTask is always called for status changes.
      // For simplicity and to avoid potential conflicts, updateTask will ONLY update the task object.
      // tasksByStatus updates due to status change will be handled by moveTask.
      return {
        ...prevTasks,
        [id]: updatedTask,
      };
    });

    // IMPORTANT: If taskData includes a status change,
    // the caller is responsible for calling moveTask AFTER updateTask
    // to correctly update tasksByStatus.
    // For non-status updates (e.g., title change), tasksByStatus doesn't need to change.
  };

  // Delete a task
  const deleteTask = (id: string) => {
    const status = tasks[id]?.status;
    if (!status) return;

    // Remove from tasks map
    setTasks((prev) => {
      const newTasks = { ...prev };
      delete newTasks[id];
      return newTasks;
    });

    // Remove from tasksByStatus
    setTasksByStatus((prev) => {
      const statusTasks = prev[status] || [];
      return {
        ...prev,
        [status]: statusTasks.filter((taskId) => taskId !== id),
      };
    });
  };

  // Move a task to a different status
  const moveTask = (taskId: string, newStatus: TaskStatus) => {
    setTasks(prevTasks => {
      const task = prevTasks[taskId];
      if (!task || task.status === newStatus) {
        // If task doesn't exist or status is already the new status, do nothing with tasks map
        // but still ensure tasksByStatus is correct.
        return prevTasks; 
      }

      const oldStatus = task.status;

      // Update the task's status in the main tasks map
      const updatedTasks = {
        ...prevTasks,
        [taskId]: {
          ...task,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        },
      };

      // Now, update tasksByStatus based on this change
      setTasksByStatus((prevTasksByStatus) => {
        const oldStatusTasks = prevTasksByStatus[oldStatus]?.filter((id) => id !== taskId) || [];
        const newStatusTasks = [...(prevTasksByStatus[newStatus] || []), taskId];

        // Ensure no duplicates in newStatusTasks
        const uniqueNewStatusTasks = Array.from(new Set(newStatusTasks));

        return {
          ...prevTasksByStatus,
          [oldStatus]: oldStatusTasks,
          [newStatus]: uniqueNewStatusTasks,
        };
      });
      
      return updatedTasks; // Return the updated tasks map
    });
  };

  // Reorder tasks within a status
  const reorderTasks = (status: TaskStatus, newOrder: string[]) => {
    setTasksByStatus((prev) => ({
      ...prev,
      [status]: newOrder,
    }));
  };

  // SwimLane functions
  const addSwimLane = (name: string) => {
    const id = uuidv4();
    const colors = ['blue', 'purple', 'amber', 'cyan', 'green', 'indigo', 'pink', 'rose', 'orange', 'teal'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newLane: SwimLane = {
      id,
      name,
      color: randomColor,
    };
    
    setSwimLanes(prev => [...prev, newLane]);
    
    // Initialize empty task list for this lane
    setTasksByStatus(prev => ({
      ...prev,
      [id]: [],
    }));
  };
  
  const updateSwimLane = (id: string, updates: Partial<SwimLane>) => {
    setSwimLanes(prev => 
      prev.map(lane => 
        lane.id === id ? { ...lane, ...updates } : lane
      )
    );
  };
  
  const deleteSwimLane = (id: string) => {
    // Get tasks in this swimlane
    const tasksInLane = tasksByStatus[id] || [];
    
    if (tasksInLane.length > 0) {
      // Move tasks to the first available lane or delete them
      const otherLanes = swimLanes.filter(lane => lane.id !== id);
      
      if (otherLanes.length > 0) {
        const targetLaneId = otherLanes[0].id;
        
        // Update all tasks to the new lane
        tasksInLane.forEach(taskId => {
          updateTask(taskId, { status: targetLaneId });
        });
        
        // Update tasksByStatus
        setTasksByStatus(prev => {
          const newTasksByStatus = { ...prev };
          // Remove the deleted lane
          delete newTasksByStatus[id];
          // Add the tasks to the target lane
          newTasksByStatus[targetLaneId] = [
            ...(newTasksByStatus[targetLaneId] || []),
            ...tasksInLane
          ];
          return newTasksByStatus;
        });
      } else {
        // Delete all tasks in the lane if no other lanes exist
        tasksInLane.forEach(taskId => {
          setTasks(prev => {
            const newTasks = { ...prev };
            delete newTasks[taskId];
            return newTasks;
          });
        });
        
        // Remove the lane from tasksByStatus
        setTasksByStatus(prev => {
          const newTasksByStatus = { ...prev };
          delete newTasksByStatus[id];
          return newTasksByStatus;
        });
      }
    } else {
      // Just remove the lane from tasksByStatus if no tasks
      setTasksByStatus(prev => {
        const newTasksByStatus = { ...prev };
        delete newTasksByStatus[id];
        return newTasksByStatus;
      });
    }
    
    // Remove the lane from swimLanes
    setSwimLanes(prev => prev.filter(lane => lane.id !== id));
  };
  
  const reorderSwimLanes = (newOrder: string[]) => {
    setSwimLanes(prev => {
      const laneMap = prev.reduce((acc, lane) => {
        acc[lane.id] = lane;
        return acc;
      }, {} as Record<string, SwimLane>);
      
      return newOrder.map(id => laneMap[id]).filter(Boolean);
    });
  };

  const value = {
    tasks,
    tasksByStatus,
    swimLanes,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
    addSwimLane,
    updateSwimLane,
    deleteSwimLane,
    reorderSwimLanes,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// Custom hook to use the task context
export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};