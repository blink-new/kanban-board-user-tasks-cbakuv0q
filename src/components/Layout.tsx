import { Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Settings as SettingsIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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
      "flex min-h-screen bg-gradient-to-b from-slate-50 to-slate-200 text-slate-800"
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
          "bg-indigo-900 text-white shadow-xl",
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
        <div className="h-16 px-4 flex items-center border-b border-indigo-800">
          <Link 
            to="/" 
            className={cn(
              "text-xl font-bold transition-opacity duration-200",
              (!sidebarOpen && !isMobile) && "opacity-0"
            )}
          >
            StroFlo
          </Link>
        </div>
        {/* Sidebar Navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={cn(
                  "flex items-center px-3 py-3 rounded-lg transition-all",
                  "hover:bg-indigo-800 group",
                  location.pathname === "/"
                    ? "bg-indigo-800 text-white"
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
                  "hover:bg-indigo-800 group",
                  location.pathname === "/tasks"
                    ? "bg-indigo-800 text-white"
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
                  "hover:bg-indigo-800 group",
                  location.pathname === "/settings"
                    ? "bg-indigo-800 text-white"
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
        <div className="px-3 py-4 border-t border-indigo-800">
          <div className={cn(
            "flex items-center px-2 transition-opacity duration-200",
            (!sidebarOpen && !isMobile) && "opacity-0"
          )}>
            <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center mr-3">
              <span className="text-xs font-medium">SF</span>
            </div>
            <div>
              <p className="text-sm font-medium">StroFlo</p>
              <p className="text-xs text-indigo-300">Activity Board</p>
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
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-10 h-16 bg-white shadow-sm flex items-center px-4">
            <Link to="/" className="text-xl font-bold">
              StroFlo
            </Link>
          </header>
        )}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}