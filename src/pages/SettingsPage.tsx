import { SwimLaneManager } from '../components/SwimLaneManager';

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight text-slate-800 mb-4">Settings</h1>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Swim Lane Management</h2>
        <p className="text-slate-500 mb-4">Add, edit, remove, or rearrange your swim lanes for the activity board.</p>
        <SwimLaneManager />
      </div>
    </div>
  );
}
