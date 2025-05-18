import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '../lib/utils';
import { Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { TaskCard } from './TaskCard';
import { useTaskContext } from '../context/TaskContext';

interface KanbanColumnProps {
  laneId: string;
  taskIds: string[];
  // isOver prop will now be determined by useDroppable
}

export function KanbanColumn({ laneId, taskIds }: KanbanColumnProps) {
  const { tasks, swimLanes, updateSwimLane } = useTaskContext();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');

  const { setNodeRef, isOver } = useDroppable({
    id: laneId, // This ID must match what dnd-kit expects for the droppable
  });
  
  const swimLane = swimLanes.find(lane => lane.id === laneId);
  if (!swimLane) return null;

  const getColumnBackground = (color: string, isColumnOver: boolean) => {
    const baseBackgrounds: Record<string, string> = {
      'blue': 'bg-blue-50 border-blue-300',
      'purple': 'bg-purple-50 border-purple-300',
      'amber': 'bg-amber-50 border-amber-300',
      'cyan': 'bg-cyan-50 border-cyan-300',
      'green': 'bg-green-50 border-green-300',
      'indigo': 'bg-indigo-50 border-indigo-300',
      'pink': 'bg-pink-50 border-pink-300',
      'rose': 'bg-rose-50 border-rose-300',
      'orange': 'bg-orange-50 border-orange-300',
      'teal': 'bg-teal-50 border-teal-300',
      'default': 'bg-gray-50 border-gray-300',
    };
    const overBackgrounds: Record<string, string> = {
      'blue': 'bg-blue-100 border-blue-400 ring-2 ring-blue-300',
      'purple': 'bg-purple-100 border-purple-400 ring-2 ring-purple-300',
      'amber': 'bg-amber-100 border-amber-400 ring-2 ring-amber-300',
      'cyan': 'bg-cyan-100 border-cyan-400 ring-2 ring-cyan-300',
      'green': 'bg-green-100 border-green-400 ring-2 ring-green-300',
      'indigo': 'bg-indigo-100 border-indigo-400 ring-2 ring-indigo-300',
      'pink': 'bg-pink-100 border-pink-400 ring-2 ring-pink-300',
      'rose': 'bg-rose-100 border-rose-400 ring-2 ring-rose-300',
      'orange': 'bg-orange-100 border-orange-400 ring-2 ring-orange-300',
      'teal': 'bg-teal-100 border-teal-400 ring-2 ring-teal-300',
      'default': 'bg-gray-100 border-gray-400 ring-2 ring-gray-300',
    };
    return isColumnOver 
      ? overBackgrounds[color] || overBackgrounds['default'] 
      : baseBackgrounds[color] || baseBackgrounds['default'];
  };

  const getHeaderBackground = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-600 text-white border-blue-700';
      case 'purple': return 'bg-purple-600 text-white border-purple-700';
      case 'amber': return 'bg-amber-600 text-white border-amber-700';
      case 'cyan': return 'bg-cyan-600 text-white border-cyan-700';
      case 'green': return 'bg-green-600 text-white border-green-700';
      case 'indigo': return 'bg-indigo-600 text-white border-indigo-700';
      case 'pink': return 'bg-pink-600 text-white border-pink-700';
      case 'rose': return 'bg-rose-600 text-white border-rose-700';
      case 'orange': return 'bg-orange-600 text-white border-orange-700';
      case 'teal': return 'bg-teal-600 text-white border-teal-700';
      default: return 'bg-gray-600 text-white border-gray-700';
    }
  };

  const handleEditTitle = () => {
    setTitleValue(swimLane.name);
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    if (titleValue.trim()) {
      updateSwimLane(laneId, { name: titleValue.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    }
  };

  return (
    <div 
      // Attach setNodeRef to the main column div to make the whole column droppable
      // id prop here is for general HTML, useDroppable id is for dnd-kit
      className={cn(
        "h-full flex flex-col min-w-[250px] md:min-w-[300px] shadow-md rounded-lg overflow-hidden",
        isOver && "shadow-lg ring-2 ring-offset-2 ring-indigo-500" // Enhanced visual feedback from useDroppable
      )}
    >
      <div 
        className={cn(
          "p-3 flex justify-between items-center", 
          getHeaderBackground(swimLane.color)
        )}
      >
        <div className="flex flex-col">
          {isEditingTitle ? (
            <Input
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyPress={handleTitleKeyPress}
              className="h-7 text-base font-medium bg-white text-gray-800"
              autoFocus
            />
          ) : (
            <>
              <div className="flex items-center space-x-1">
                <h3 className="font-medium text-base">{swimLane.name}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/10" 
                  onClick={handleEditTitle}
                >
                  <Edit2 size={12} />
                </Button>
              </div>
              <p className="text-xs text-white/70">
                {taskIds.length} {taskIds.length === 1 ? 'task' : 'tasks'}
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* This inner div will be the primary droppable area, especially for empty columns */}
      <div 
        ref={setNodeRef} // This makes this div the droppable target for dnd-kit
        className={cn(
          "border-x border-b p-3 flex-1 transition-all duration-200 min-h-[100px]", // Ensure min-height for empty columns
          getColumnBackground(swimLane.color, isOver)
        )}
      >
        {taskIds.length === 0 ? (
          <div 
            className={cn(
              "h-full flex items-center justify-center text-sm",
              isOver 
                ? "text-gray-800 font-medium" 
                : "text-muted-foreground"
            )}
          >
            <div 
              className={cn(
                "p-4 rounded-md transition-all duration-200",
                isOver && "bg-white/50 border border-dashed border-gray-400"
              )}
            >
              {isOver ? "Drop task here" : "No tasks yet"}
            </div>
          </div>
        ) : (
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            <div 
              className="h-full overflow-y-auto pr-1 space-y-3" 
            >
              {taskIds.map((taskId) => (
                <TaskCard key={taskId} task={tasks[taskId]} />
              ))}
            </div>
          </SortableContext>
        )}
      </div>
    </div>
  );
}