import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FolderKanban, Settings as SettingsIcon, LogOut } from 'lucide-react';
import fenixLogo from '@/assets/fenix-logo.png';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DashboardSidebarProps {
  onLogout?: () => void;
}

const primaryNav = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/dashboard', icon: FolderKanban },
];

export function DashboardSidebar({ onLogout }: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="hidden md:flex flex-col h-screen sticky top-0 w-56 shrink-0 z-40 backdrop-blur-md bg-gradient-to-b from-sidebar/90 via-sidebar/80 to-sidebar/70"
    >
      {/* Brand */}
      <div className="h-16 flex items-center gap-2 px-5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
          <img src={fenixLogo} alt="Fenix" className="w-8 h-8" />
        </div>
        <span className="font-semibold text-foreground text-lg">Fenix</span>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wider text-muted-foreground/70">
          Workspace
        </p>
        {primaryNav.map((item) => {
          const active = pathname === item.to;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={cn(
                'group flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-all',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <item.icon className={cn('h-4 w-4', active && 'text-primary')} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Utility bottom */}
      <div className="p-3 border-t border-border/50 space-y-1">
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <SettingsIcon className="h-4 w-4" />
          <span>User Settings</span>
        </button>
        <Button
          variant="ghost"
          onClick={onLogout}
          className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </motion.aside>
  );
}
