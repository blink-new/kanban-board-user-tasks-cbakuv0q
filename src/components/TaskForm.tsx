import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Task, Priority, TaskStatus } from '../types/task';
import { useTaskContext } from '../context/TaskContext';
import { Button } from './ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { toast } from 'react-hot-toast';

// Dynamically build the task form schema
const createTaskFormSchema = (swimLaneIds: string[]) => {
  return z.object({
    title: z.string().min(2, { message: 'Title is required' }),
    description: z.string().min(1, { message: 'Description is required' }),
    priority: z.coerce.number().min(1).max(3).default(2) as z.ZodType<Priority>,
    label: z.string().optional(),
    status: z.string().default(swimLaneIds.length > 0 ? swimLaneIds[0] : ''),
    assignee: z.string().optional(),
    creator: z.string().optional(),
  });
};

type TaskFormProps = {
  existingTask?: Task;
  onSuccess?: () => void;
};

export function TaskForm({ existingTask, onSuccess }: TaskFormProps) {
  const { addTask, updateTask, swimLanes } = useTaskContext();
  const [desiredDate, setDesiredDate] = useState<Date | null>(
    existingTask?.desiredDate ? new Date(existingTask.desiredDate) : null
  );
  const [actualDeliveryDate, setActualDeliveryDate] = useState<Date | null>(
    existingTask?.actualDeliveryDate ? new Date(existingTask.actualDeliveryDate) : null
  );

  // Get array of available swimlane IDs
  const swimLaneIds = swimLanes.map(lane => lane.id);

  // Create the schema with available swimlanes
  const taskFormSchema = createTaskFormSchema(swimLaneIds);
  type TaskFormValues = z.infer<typeof taskFormSchema> & {
    desiredDate: Date | null;
    actualDeliveryDate: Date | null;
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: existingTask
      ? {
          title: existingTask.title,
          description: existingTask.description,
          priority: existingTask.priority,
          label: existingTask.label,
          status: existingTask.status,
          assignee: existingTask.assignee || '',
          creator: existingTask.creator || '',
        }
      : {
          title: '',
          description: '',
          priority: 2,
          label: '',
          status: swimLaneIds.length > 0 ? swimLaneIds[0] : '',
          assignee: '',
          creator: '',
        },
  });

  const onSubmit = (data: TaskFormValues, action: 'close' | 'addAnother' = 'close') => {
    try {
      if (existingTask) {
        updateTask(existingTask.id, {
          ...data,
          desiredDate: desiredDate === null ? undefined : (desiredDate ? desiredDate.toISOString() : existingTask.desiredDate),
          actualDeliveryDate: actualDeliveryDate === null ? undefined : (actualDeliveryDate ? actualDeliveryDate.toISOString() : existingTask.actualDeliveryDate),
        });
        toast.success('Task updated');
        if (onSuccess) onSuccess();
      } else {
        addTask({
          ...data,
          desiredDate: desiredDate ? desiredDate.toISOString() : new Date().toISOString(),
          actualDeliveryDate: actualDeliveryDate ? actualDeliveryDate.toISOString() : undefined,
        });
        toast.success('Task created');
        if (action === 'close') {
          form.reset({
            title: '',
            description: '',
            priority: 2,
            label: '',
            status: swimLaneIds.length > 0 ? swimLaneIds[0] : '',
            assignee: '',
            creator: '',
          });
          setDesiredDate(null);
          setActualDeliveryDate(null);
          if (onSuccess) onSuccess();
        } else {
          // Add another: reset form, keep dialog open
          form.reset({
            title: '',
            description: '',
            priority: 2,
            label: '',
            status: swimLaneIds.length > 0 ? swimLaneIds[0] : '',
            assignee: '',
            creator: '',
          });
          setDesiredDate(null);
          setActualDeliveryDate(null);
        }
      }
    } catch (error) {
      toast.error('Failed to save task');
      console.error(error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{existingTask ? 'Edit Task' : 'Create New Task'}</CardTitle>
        <CardDescription>
          {existingTask 
            ? 'Edit the details of your existing task'
            : 'Add a new task with detailed information'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={e => {
              e.preventDefault();
              // Default: Create & Close
              form.handleSubmit((data) => onSubmit(data, 'close'))(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Task title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Describe the task..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="assignee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Who (Assigned to)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter assignee name" />
                    </FormControl>
                    <FormDescription>
                      Who will be working on this task
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="creator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Creator</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter creator name" />
                    </FormControl>
                    <FormDescription>
                      Who created this task
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">High Priority (1)</SelectItem>
                      <SelectItem value="2">Medium Priority (2)</SelectItem>
                      <SelectItem value="3">Low Priority (3)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Task importance (1 = highest)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={swimLanes.length === 0}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {swimLanes.map(lane => (
                        <SelectItem key={lane.id} value={lane.id}>
                          {lane.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {swimLanes.length === 0 && (
                    <p className="text-xs text-red-500 mt-2">No swim lanes available. Please add one in Settings.</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., Feature, Bug, Documentation" />
                  </FormControl>
                  <FormDescription>
                    Free text label to categorize the task
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FormLabel>Desired Date</FormLabel>
                <DatePicker 
                  selected={desiredDate} 
                  onChange={setDesiredDate}
                  dateFormat="MMMM d, yyyy"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholderText="Select target date"
                />
              </div>
              <div className="space-y-2">
                <FormLabel>Actual Delivery Date</FormLabel>
                <DatePicker 
                  selected={actualDeliveryDate} 
                  onChange={setActualDeliveryDate}
                  dateFormat="MMMM d, yyyy"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholderText="Select delivery date"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button type="submit" className="w-full sm:w-auto">
                {existingTask ? 'Update Task' : 'Create & Close'}
              </Button>
              {!existingTask && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => form.handleSubmit((data) => onSubmit(data, 'addAnother'))()}
                >
                  Create & Add Another
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}