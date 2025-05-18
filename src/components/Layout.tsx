import { Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    checkMobile();
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Handle mouse enter/leave for desktop
  const handleMouseEnter = () => {
    if (!isMobile) setSidebarOpen(true);
  };
  const handleMouseLeave = () => {
    if (!isMobile) setSidebarOpen(false);
  };

  return (
    <div className={cn(
      "flex min-h-screen",
      theme === 'dark' 
        ? "bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100" 
        : "bg-gradient-to-b from-slate-50 to-slate-200 text-slate-800"
    )}>
      {/* Sidebar Backdrop (mobile only) */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div 
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 z-40 h-full transition-all duration-300 ease-in-out",
          theme === 'dark' 
            ? "bg-indigo-950 text-white" 
            : "bg-indigo-900 text-white",
          "shadow-xl",
          isMobile
            ? sidebarOpen 
              ? "translate-x-0 w-64" 
              : "-translate-x-full w-64"
            : sidebarOpen
              ? "w-64" 
              : "w-20",
          "flex flex-col"
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sidebar Header (no icons) */}
        <div className={cn(
          "h-16 px-4 flex items-center justify-between border-b",
          theme === 'dark' ? "border-indigo-900" : "border-indigo-800"
        )}>
          <Link 
            to="/" 
            className={cn(
              "text-xl font-bold transition-opacity duration-200",
              (!sidebarOpen && !isMobile) && "opacity-0"
            )}
          >
            StorFlo
          </Link>
          {/* Theme toggle is now in the top bar instead of here */}
        </div>
        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg transition-all",
                  theme === 'dark' 
                    ? "hover:bg-indigo-900" 
                    : "hover:bg-indigo-800",
                  "group",
                  location.pathname === "/"
                    ? theme === 'dark' ? "bg-indigo-900 text-white" : "bg-indigo-800 text-white"
                    : "text-indigo-100"
                )}
              >
                <LayoutDashboard className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className={cn(
                  "whitespace-nowrap transition-opacity duration-200",
                  (!sidebarOpen && !isMobile) && "opacity-0 w-0"
                )}>
                  Activity Board
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/tasks"
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg transition-all",
                  theme === 'dark' 
                    ? "hover:bg-indigo-900" 
                    : "hover:bg-indigo-800",
                  "group",
                  location.pathname === "/tasks"
                    ? theme === 'dark' ? "bg-indigo-900 text-white" : "bg-indigo-800 text-white"
                    : "text-indigo-100"
                )}
              >
                <ListTodo className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className={cn(
                  "whitespace-nowrap transition-opacity duration-200",
                  (!sidebarOpen && !isMobile) && "opacity-0 w-0"
                )}>
                  User Tasks
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg transition-all",
                  theme === 'dark' 
                    ? "hover:bg-indigo-900" 
                    : "hover:bg-indigo-800",
                  "group",
                  location.pathname === "/settings"
                    ? theme === 'dark' ? "bg-indigo-900 text-white" : "bg-indigo-800 text-white"
                    : "text-indigo-100"
                )}
              >
                <SettingsIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className={cn(
                  "whitespace-nowrap transition-opacity duration-200",
                  (!sidebarOpen && !isMobile) && "opacity-0 w-0"
                )}>
                  Settings
                </span>
              </Link>
            </li>
          </ul>
        </nav>
        {/* Sidebar Footer */}
        <div className={cn(
          "px-3 py-4 border-t",
          theme === 'dark' ? "border-indigo-900" : "border-indigo-800"
        )}>
          <div className={cn(
            "flex items-center px-2 transition-opacity duration-200",
            (!sidebarOpen && !isMobile) && "opacity-0"
          )}>
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center mr-3">
              <span className="text-xs font-medium">SF</span>
            </div>
            <div>
              <p className={cn(
                "text-sm font-medium",
                theme === 'dark' ? "text-slate-100" : ""
              )}>StorFlo</p>
              <p className={cn(
                "text-xs",
                theme === 'dark' ? "text-indigo-200" : "text-indigo-300"
              )}>Activity Board</p>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        isMobile
          ? "ml-0" 
          : sidebarOpen
            ? "ml-64" 
            : "ml-20"
      )}>
        {/* Top header with theme toggle (desktop) */}
        {!isMobile && (
          <header className={cn(
            "sticky top-0 z-10 h-16 shadow-sm flex items-center justify-between px-6",
            theme === 'dark' ? "bg-slate-800/70 backdrop-blur-sm" : "bg-white/70 backdrop-blur-sm"
          )}>
            <span className={cn(
              "text-2xl font-bold tracking-tight",
              theme === 'dark' ? "text-slate-100" : "text-slate-900"
            )}>
              Activity Board
            </span>
            <ThemeToggle />
          </header>
        )}
        
        {/* Mobile Header */}
        {isMobile && (
          <header className={cn(
            "sticky top-0 z-10 h-16 shadow-sm flex items-center justify-between px-4",
            theme === 'dark' ? "bg-slate-800" : "bg-white"
          )}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="mr-2 p-2 rounded-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/" className="text-xl font-bold">
              StorFlo
            </Link>
            <ThemeToggle />
          </header>
        )}
        <main className={cn(
          "flex-1 p-4 md:p-6",
          theme === 'dark' 
            ? "text-slate-100" 
            : "text-slate-800"
        )}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}