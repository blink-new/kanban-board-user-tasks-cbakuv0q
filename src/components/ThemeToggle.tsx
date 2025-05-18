import { Moon, Sun } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "rounded-full transition-colors",
        theme === 'dark' 
          ? "bg-slate-800 text-yellow-400 hover:text-yellow-200 hover:bg-slate-700" 
          : "bg-sky-100 text-sky-900 hover:text-sky-700 hover:bg-sky-200",
        className
      )}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun size={18} className="transition-transform" />
      ) : (
        <Moon size={18} className="transition-transform" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}