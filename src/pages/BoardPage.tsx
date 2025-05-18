import { KanbanBoard } from '../components/KanbanBoard';

export function BoardPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Activity Board</h1>
        <p className="text-slate-500 mt-1">
          Welcome to your activity board. Rearrange tasks based on status
        </p>
      </div>
      <div className="flex-1">
        <KanbanBoard />
      </div>
    </div>
  );
}