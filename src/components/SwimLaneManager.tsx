import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTaskContext } from '../context/TaskContext';
import { SwimLane } from '../types/task';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ChevronRight, Edit2, GripHorizontal, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

interface SortableSwimLaneProps {
  lane: SwimLane;
  onEdit: (lane: SwimLane) => void;
  onDelete: (lane: SwimLane) => void;
}

function SortableSwimLane({ lane, onEdit, onDelete }: SortableSwimLaneProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lane.id,
  });
  const { swimLanes } = useTaskContext();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const isLastLane = swimLanes.length === 1;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  const getColorClass = (color: string) => {
    if (isDark) {
      switch (color) {
        case 'blue': return 'bg-blue-900/40 border-blue-800 text-blue-100';
        case 'purple': return 'bg-purple-900/40 border-purple-800 text-purple-100';
        case 'amber': return 'bg-amber-900/40 border-amber-800 text-amber-100';
        case 'cyan': return 'bg-cyan-900/40 border-cyan-800 text-cyan-100';
        case 'green': return 'bg-green-900/40 border-green-800 text-green-100';
        case 'indigo': return 'bg-indigo-900/40 border-indigo-800 text-indigo-100';
        case 'pink': return 'bg-pink-900/40 border-pink-800 text-pink-100';
        case 'rose': return 'bg-rose-900/40 border-rose-800 text-rose-100';
        case 'orange': return 'bg-orange-900/40 border-orange-800 text-orange-100';
        case 'teal': return 'bg-teal-900/40 border-teal-800 text-teal-100';
        default: return 'bg-slate-800/40 border-slate-700 text-slate-100';
      }
    } else {
      switch (color) {
        case 'blue': return 'bg-blue-100 border-blue-300 text-blue-800';
        case 'purple': return 'bg-purple-100 border-purple-300 text-purple-800';
        case 'amber': return 'bg-amber-100 border-amber-300 text-amber-800';
        case 'cyan': return 'bg-cyan-100 border-cyan-300 text-cyan-800';
        case 'green': return 'bg-green-100 border-green-300 text-green-800';
        case 'indigo': return 'bg-indigo-100 border-indigo-300 text-indigo-800';
        case 'pink': return 'bg-pink-100 border-pink-300 text-pink-800';
        case 'rose': return 'bg-rose-100 border-rose-300 text-rose-800';
        case 'orange': return 'bg-orange-100 border-orange-300 text-orange-800';
        case 'teal': return 'bg-teal-100 border-teal-300 text-teal-800';
        default: return 'bg-gray-100 border-gray-300 text-gray-800';
      }
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "flex items-center space-x-2 px-3 py-2 border rounded-md shadow-sm",
        getColorClass(lane.color),
        isDragging ? "ring-2 ring-primary" : ""
      )}
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripHorizontal size={16} />
      </div>
      <div className="flex-1 font-medium">{lane.name}</div>
      <div className="flex space-x-1">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0" 
          onClick={() => onEdit(lane)}
        >
          <Edit2 size={14} />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
          disabled={isLastLane}
          title={isLastLane ? 'At least one swim lane is required' : 'Delete lane'}
          onClick={() => onDelete(lane)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}

export function SwimLaneManager() {
  const { swimLanes, addSwimLane, updateSwimLane, deleteSwimLane, reorderSwimLanes, tasksByStatus } = useTaskContext();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newLaneName, setNewLaneName] = useState('');
  const [editingLane, setEditingLane] = useState<SwimLane | null>(null);
  const [deletingLane, setDeletingLane] = useState<SwimLane | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = swimLanes.findIndex(lane => lane.id === active.id);
      const newIndex = swimLanes.findIndex(lane => lane.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(
          swimLanes.map(lane => lane.id),
          oldIndex,
          newIndex
        );
        
        reorderSwimLanes(newOrder);
      }
    }
  };

  const handleAddLane = () => {
    if (newLaneName.trim()) {
      addSwimLane(newLaneName.trim());
      setNewLaneName('');
      setIsAddDialogOpen(false);
    }
  };

  const handleEditLane = () => {
    if (editingLane && newLaneName.trim()) {
      updateSwimLane(editingLane.id, { name: newLaneName.trim() });
      setNewLaneName('');
      setEditingLane(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteLane = () => {
    if (deletingLane) {
      deleteSwimLane(deletingLane.id);
      setDeletingLane(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const openEditDialog = (lane: SwimLane) => {
    setEditingLane(lane);
    setNewLaneName(lane.name);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (lane: SwimLane) => {
    setDeletingLane(lane);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Manage Swim Lanes</h2>
          <p className="text-sm text-muted-foreground">
            Drag and drop to reorder, or edit lane names
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-1 h-4 w-4" />
              Add Lane
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Swim Lane</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lane Name</label>
                <Input
                  value={newLaneName}
                  onChange={e => setNewLaneName(e.target.value)}
                  placeholder="Enter lane name"
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddLane}>Add Lane</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className={cn(
        "border rounded-md p-4",
        isDark ? "bg-slate-900 border-slate-800" : "bg-background"
      )}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <p className="mb-2 text-sm font-medium text-muted-foreground">Drag lanes to rearrange order:</p>
          <SortableContext 
            items={swimLanes.map(lane => lane.id)} 
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {swimLanes.map(lane => (
                <SortableSwimLane 
                  key={lane.id}
                  lane={lane} 
                  onEdit={openEditDialog} 
                  onDelete={openDeleteDialog} 
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {swimLanes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No swim lanes created yet.</p>
            <Button className="mt-2" variant="outline" onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Add Your First Lane
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Swim Lane</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lane Name</label>
              <Input
                value={newLaneName}
                onChange={e => setNewLaneName(e.target.value)}
                placeholder="Enter lane name"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleEditLane();
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditLane}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingLane && tasksByStatus[deletingLane.id]?.length > 0 
                ? `This lane contains ${tasksByStatus[deletingLane.id].length} tasks. They will be moved to another lane.`
                : "This lane will be permanently deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLane} className="bg-red-500 hover:bg-red-600">
              Delete Lane
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}