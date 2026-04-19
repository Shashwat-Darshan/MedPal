
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useNotifications } from '@/hooks/useNotifications';
import { LogOut, Menu, Bell, Settings, Moon, Sun, Stethoscope } from 'lucide-react';
import NotificationDropdown from '@/components/NotificationDropdown';
import { useIsMobile } from '@/hooks/use-mobile';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useDarkMode();
  const { unreadCount } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/diagnosis', label: 'AI Diagnosis' },
    { path: '/chat', label: 'Health Chat' },
    { path: '/monitor', label: 'Monitor' },
    { path: '/transcript', label: 'Live Transcript' },
    { path: '/history', label: 'History' }
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="mr-4 flex cursor-pointer items-center gap-3 lg:mr-8" onClick={() => navigate('/dashboard')}>
              {isMobile ? (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <span className="brand-heading text-lg text-slate-900 dark:text-slate-100">MedPal</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-600 to-emerald-500 text-white flex items-center justify-center shadow-sm">
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="brand-heading text-xl leading-none text-slate-900 dark:text-slate-100">MedPal</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Clinical AI Companion</div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(item => (
                <Button 
                  key={item.path} 
                  variant={location.pathname === item.path ? "default" : "ghost"} 
                  size="sm" 
                  onClick={() => navigate(item.path)} 
                  className={`text-sm transition-all duration-200 ${
                    location.pathname === item.path 
                      ? 'bg-slate-900 text-white shadow-sm dark:bg-cyan-600 dark:text-white' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setNotificationOpen(!notificationOpen)} className="relative text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </div>
                )}
              </Button>
              <NotificationDropdown isOpen={notificationOpen} onClose={() => setNotificationOpen(false)} />
            </div>

            {!isMobile && (
              <div className="flex items-center space-x-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-1 dark:border-slate-700 dark:bg-slate-900/70">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-sm">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Signed in</p>
                </div>
              </div>
            )}

            {!isMobile && (
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {isMobile && (
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}

            {!isMobile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:text-red-700 dark:focus:text-red-300">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {isMobile && (
              <Button variant="outline" size="sm" onClick={handleLogout} className="border-slate-300 hover:bg-red-50 hover:border-red-300 hover:text-red-700 dark:border-slate-700 dark:hover:bg-red-900/20 dark:hover:border-red-700 dark:hover:text-red-300">
                <LogOut className="h-4 w-4" />
              </Button>
            )}

            <Button variant="ghost" size="sm" className="md:hidden text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-2">
              {navItems.map(item => (
                <Button 
                  key={item.path} 
                  variant={location.pathname === item.path ? "default" : "ghost"} 
                  className="w-full justify-start text-slate-700 dark:text-slate-200" 
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </Button>
              ))}
              <Button 
                variant={location.pathname === '/settings' ? "default" : "ghost"} 
                className="w-full justify-start text-slate-700 dark:text-slate-200" 
                onClick={() => {
                  navigate('/settings');
                  setMobileMenuOpen(false);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>

              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-3 px-2 py-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-600 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{user?.name || 'User'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Signed in</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start mt-2 text-slate-700 dark:text-slate-200"
                  onClick={() => {
                    navigate('/settings');
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
