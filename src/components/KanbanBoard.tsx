import { useState } from 'react';
import { 
  DndContext, 
  DragOverlay,
  KeyboardSensor, 
  PointerSensor, 
  rectIntersection, // Using rectIntersection as a base
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent, // Keep DragOverEvent for visual feedback if needed
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import confetti from 'canvas-confetti';
import { TaskCard } from './TaskCard';
import { KanbanColumn } from './KanbanColumn'; // KanbanColumn now uses useDroppable
import { useTaskContext } from '../context/TaskContext';

export function KanbanBoard() {
  const { tasks, tasksByStatus, swimLanes, moveTask, reorderTasks } = useTaskContext();
  const [activeId, setActiveId] = useState<string | null>(null); // ID of the task being dragged
  // targetLane is now primarily for visual feedback in KanbanColumn via its own useDroppable
  // We might not need a separate targetLane state here anymore if isOver from useDroppable in column is sufficient.
  // For now, let's remove it from KanbanBoard state to simplify, as KanbanColumn handles its own isOver.

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require pointer to move a bit before starting drag
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
  };

  // handleDragOver can be simplified or even removed if visual feedback is solely handled by KanbanColumn's useDroppable.isOver
  // For now, let's keep a simplified version if we want to log or do other things during hover.
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !active.id || !tasks[active.id as string]) {
      return;
    }
    // console.log(`Dragging task ${active.id} over ${over.id}`);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null); // Reset active task

    if (!over || !active.id) {
      return;
    }

    const activeId = active.id as string;
    const activeTask = tasks[activeId];

    if (!activeTask) {
      return;
    }

    const currentStatus = activeTask.status;
    // `over.id` should now reliably be the ID of the droppable KanbanColumn (laneId)
    // or the ID of another task if dropped on a task for reordering.
    const overId = over.id as string;

    // If dropped on self (no actual move or reorder)
    if (overId === activeId) {
      return;
    }

    const isOverAColumn = swimLanes.some(lane => lane.id === overId);
    const isOverATask = tasks[overId] !== undefined;

    let finalTargetLaneId: string | null = null;

    if (isOverAColumn) {
      finalTargetLaneId = overId;
    } else if (isOverATask) {
      finalTargetLaneId = tasks[overId].status; // Target the lane of the task we dropped onto
    }

    if (!finalTargetLaneId) {
      console.warn('Could not determine target lane from over object.');
      return;
    }

    // Scenario 1: Moving task to a DIFFERENT lane
    if (finalTargetLaneId !== currentStatus) {
      console.log(`Moving task ${activeId} from ${currentStatus} to ${finalTargetLaneId}`);
      moveTask(activeId, finalTargetLaneId);
      
      const doneOrReleaseLaneIds = swimLanes
        .filter(lane => 
          lane.name.toLowerCase().includes('done') || 
          lane.name.toLowerCase().includes('complete') || 
          lane.name.toLowerCase().includes('release'))
        .map(lane => lane.id);
      if (!doneOrReleaseLaneIds.includes(currentStatus) && doneOrReleaseLaneIds.includes(finalTargetLaneId)) {
        triggerConfetti();
      }
    } 
    // Scenario 2: Reordering task WITHIN the same lane
    // This implies finalTargetLaneId === currentStatus, and we dropped on another task in this lane.
    else if (isOverATask && tasks[overId].status === currentStatus && overId !== activeId) {
      const taskList = tasksByStatus[currentStatus];
      if (!taskList) return;

      const activeIndex = taskList.indexOf(activeId);
      const overTaskIndex = taskList.indexOf(overId);

      if (activeIndex !== -1 && overTaskIndex !== -1) {
        const newOrder = arrayMove(taskList, activeIndex, overTaskIndex);
        reorderTasks(currentStatus, newOrder);
      }
    }
  };

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 1000,
    };
    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }
    fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.2, y: 0.7 } });
    fire(0.25, { spread: 26, startVelocity: 55, origin: { x: 0.8, y: 0.7 } });
    fire(0.2, { spread: 60, origin: { x: 0.5, y: 0.7 } });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.3, y: 0.7 } });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, origin: { x: 0.7, y: 0.7 } });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-x-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={rectIntersection} // Simplified collision detection
          onDragStart={handleDragStart}
          onDragOver={handleDragOver} // Kept for potential logging/future use
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-h-[calc(100vh-180px)] pb-6 px-2">
            {swimLanes.map((swimLane) => (
              <KanbanColumn
                key={swimLane.id}
                laneId={swimLane.id}
                taskIds={tasksByStatus[swimLane.id] || []}
                // isOver prop is removed as KanbanColumn now handles its own isOver via useDroppable
              />
            ))}
          </div>
          <DragOverlay>
            {activeId && tasks[activeId] ? (
              <TaskCard task={tasks[activeId]} />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}