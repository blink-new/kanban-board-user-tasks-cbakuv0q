import { useState } from 'react';
import { TaskForm } from '../components/TaskForm';
import { useTaskContext } from '../context/TaskContext';
import { Task, Priority } from '../types/task';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { format, isValid } from 'date-fns';
import { Calendar, Edit, Filter, Plus, Search, Trash2, X } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { cn } from '../lib/utils';
import { Calendar as CalendarComponent } from '../components/ui/calendar';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

export function TasksPage() {
  const { tasks, tasksByStatus, swimLanes, deleteTask } = useTaskContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Filters
  const [titleFilter, setTitleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [labelFilter, setLabelFilter] = useState('');
  const [desiredDateFilter, setDesiredDateFilter] = useState<Date | null>(null);
  const [deliveredDateFilter, setDeliveredDateFilter] = useState<Date | null>(null);

  const allTasks = Object.values(tasks);

  // Apply filters
  const filteredTasks = allTasks.filter(task => {
    // Title filter (case insensitive)
    if (titleFilter && !task.title.toLowerCase().includes(titleFilter.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter && statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    
    // Priority filter
    if (priorityFilter && priorityFilter !== 'all' && task.priority !== parseInt(priorityFilter)) {
      return false;
    }
    
    // Label filter (case insensitive)
    if (labelFilter && !task.label.toLowerCase().includes(labelFilter.toLowerCase())) {
      return false;
    }
    
    // Desired date filter
    if (desiredDateFilter && task.desiredDate) {
      const taskDate = new Date(task.desiredDate);
      if (taskDate.toDateString() !== desiredDateFilter.toDateString()) {
        return false;
      }
    }
    
    // Delivered date filter
    if (deliveredDateFilter && task.actualDeliveryDate) {
      const taskDate = new Date(task.actualDeliveryDate);
      if (taskDate.toDateString() !== deliveredDateFilter.toDateString()) {
        return false;
      }
    }
    
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTask = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const clearFilters = () => {
    setTitleFilter('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setLabelFilter('');
    setDesiredDateFilter(null);
    setDeliveredDateFilter(null);
  };

  // Count tasks by priority
  const priorityCount = {
    high: allTasks.filter(task => task.priority === 1).length,
    medium: allTasks.filter(task => task.priority === 2).length,
    low: allTasks.filter(task => task.priority === 3).length
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return <Badge className="bg-red-500 hover:bg-red-600">High</Badge>;
      case 2:
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>;
      case 3:
        return <Badge className="bg-green-500 hover:bg-green-600">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">To-do</Badge>;
      case 'planning':
        return <Badge variant="outline" className="border-purple-500 text-purple-600 bg-purple-50">Planning</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">In-progress</Badge>;
      case 'testing':
        return <Badge variant="outline" className="border-cyan-500 text-cyan-600 bg-cyan-50">Testing</Badge>;
      case 'done':
        return <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">Done</Badge>;
      case 'release':
        return <Badge variant="outline" className="border-indigo-500 text-indigo-600 bg-indigo-50">Release</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900 dark:text-slate-100">User Tasks</h1>
          <p className="text-slate-500 dark:text-slate-300 mt-1">
            Create and manage your tasks
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Dialog
            open={isEditDialogOpen}
            onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (!open) setSelectedTask(null); // Reset selectedTask when dialog closes
            }}
          >
            <DialogTrigger asChild>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  setSelectedTask(null); // Explicitly set to null for new task
                  setIsEditDialogOpen(true);
                  setIsDeleteDialogOpen(false); // Ensure delete dialog is closed
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              {/* Conditionally render TaskForm based on selectedTask */}
              {isEditDialogOpen && ( // Ensure form is only rendered when dialog is open
                <TaskForm
                  key={selectedTask ? selectedTask.id : 'new-task-form'} // Add key to force re-render
                  existingTask={selectedTask} // Pass null if creating new
                  onSuccess={() => {
                    setIsEditDialogOpen(false);
                    setSelectedTask(null); // Reset selectedTask on success
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Priority Counters */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-lg shadow p-4 border border-red-100 dark:border-red-900 bg-white dark:bg-slate-900">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-slate-700 dark:text-red-200">High Priority</h3>
            <Badge className="bg-red-500">{priorityCount.high}</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Priority 1 tasks</p>
        </div>
        <div className="rounded-lg shadow p-4 border border-yellow-100 dark:border-yellow-900 bg-white dark:bg-slate-900">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-slate-700 dark:text-yellow-200">Medium Priority</h3>
            <Badge className="bg-yellow-500">{priorityCount.medium}</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Priority 2 tasks</p>
        </div>
        <div className="rounded-lg shadow p-4 border border-green-100 dark:border-green-900 bg-white dark:bg-slate-900">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-slate-700 dark:text-green-200">Low Priority</h3>
            <Badge className="bg-green-500">{priorityCount.low}</Badge>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Priority 3 tasks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-slate-700 dark:text-slate-200 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Filter Tasks
          </h3>
          {(titleFilter || statusFilter || priorityFilter || labelFilter || desiredDateFilter || deliveredDateFilter) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500 dark:text-slate-300">
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Filter by title"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {swimLanes.map(lane => (
                  <SelectItem key={lane.id} value={lane.id}>{lane.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Priority</label>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All priorities</SelectItem>
                <SelectItem value="1">High (1)</SelectItem>
                <SelectItem value="2">Medium (2)</SelectItem>
                <SelectItem value="3">Low (3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Label</label>
            <Input
              placeholder="Filter by label"
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Desired Date</label>
            <DatePicker 
              selected={desiredDateFilter} 
              onChange={setDesiredDateFilter}
              dateFormat="MMM d, yyyy"
              isClearable
              placeholderText="Filter by desired date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Delivery Date</label>
            <DatePicker 
              selected={deliveredDateFilter} 
              onChange={setDeliveredDateFilter}
              dateFormat="MMM d, yyyy"
              isClearable
              placeholderText="Filter by delivery date"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow">
        {allTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800">
                  <TableHead className="font-medium text-slate-700 dark:text-slate-200">Title</TableHead>
                  <TableHead className="font-medium text-slate-700 dark:text-slate-200">Status</TableHead>
                  <TableHead className="font-medium text-slate-700 dark:text-slate-200">Priority</TableHead>
                  <TableHead className="font-medium text-slate-700 dark:text-slate-200">Desired Date</TableHead>
                  <TableHead className="font-medium text-slate-700 dark:text-slate-200">Delivered</TableHead>
                  <TableHead className="font-medium text-slate-700 dark:text-slate-200">Label</TableHead>
                  <TableHead className="text-right font-medium text-slate-700 dark:text-slate-200">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{getStatusLabel(task.status)}</TableCell>
                      <TableCell>{getPriorityLabel(task.priority)}</TableCell>
                      <TableCell>
                        {task.desiredDate && format(new Date(task.desiredDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        {task.actualDeliveryDate && format(new Date(task.actualDeliveryDate), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>{task.label}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                            onClick={() => handleEditTask(task)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteTask(task)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                      No tasks match your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">No tasks created yet</p>
          </div>
        )}
      </div>

      {/* Edit Task Dialog - This section seems redundant now, the above dialog handles both create and edit */}
      {/* Let's remove this to avoid confusion and potential state conflicts */}
      {/* 
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedTask && ( // This was for editing only
            <TaskForm
              existingTask={selectedTask}
              onSuccess={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog> 
      */}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              "{selectedTask?.title}" and remove it from the board.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}