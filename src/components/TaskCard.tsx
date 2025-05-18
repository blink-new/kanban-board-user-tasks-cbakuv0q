import { Paperclip, CalendarIcon, Clock, Tag, CalendarCheck, Info } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils';
import { Task, Priority } from '../types/task';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useTheme } from '../context/ThemeContext';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Add local formatDate function
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    cursor: 'grab',
    touchAction: 'none',
  };

  const priorityColors: Record<Priority, string> = isDark ? {
    1: 'text-red-400 bg-red-950/50 border-red-800',
    2: 'text-amber-400 bg-amber-950/50 border-amber-800',
    3: 'text-blue-400 bg-blue-950/50 border-blue-800',
  } : {
    1: 'text-red-600 bg-red-50 border-red-200',
    2: 'text-amber-600 bg-amber-50 border-amber-200',
    3: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  const priorityLabels: Record<Priority, string> = {
    1: 'High',
    2: 'Medium',
    3: 'Low',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'rounded-md shadow-sm border p-3 hover:shadow-md transition-shadow space-y-2',
        isDark 
          ? 'bg-slate-800 border-slate-700 text-slate-100' 
          : 'bg-white border-slate-200 text-slate-900',
        isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''
      )}
      data-task-id={task.id}
      data-droppable-id={task.status}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className={cn(
          "font-medium text-sm line-clamp-2",
          isDark ? "text-slate-100" : "text-gray-900"
        )}>
          {task.title}
        </h3>
      </div>

      {task.description && (
        <p className={cn(
          "text-xs line-clamp-2",
          isDark ? "text-slate-400" : "text-gray-500"
        )}>
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        <Badge variant="outline" className={cn('text-xs', priorityColors[task.priority])}>
          <Info size={12} className="mr-1" /> {priorityLabels[task.priority]}
        </Badge>

        {task.label && (
          <Badge variant="outline" className={cn(
            "text-xs",
            isDark 
              ? "bg-violet-950/50 text-violet-400 border-violet-800" 
              : "bg-violet-50 text-violet-600 border-violet-200"
          )}>
            <Tag size={12} className="mr-1" /> {task.label}
          </Badge>
        )}

        {task.desiredDate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  isDark 
                    ? "bg-cyan-950/50 text-cyan-400 border-cyan-800" 
                    : "bg-cyan-50 text-cyan-600 border-cyan-200"
                )}>
                  <CalendarIcon size={12} className="mr-1" /> {formatDate(task.desiredDate)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Desired date</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {task.actualDeliveryDate && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  isDark 
                    ? "bg-green-950/50 text-green-400 border-green-800" 
                    : "bg-green-50 text-green-600 border-green-200"
                )}>
                  <CalendarCheck size={12} className="mr-1" /> {formatDate(task.actualDeliveryDate)}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delivery date</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
