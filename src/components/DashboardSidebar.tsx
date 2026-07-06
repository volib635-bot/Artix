import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Clock,
  Settings as SettingsIcon,
  LogOut,
  LogIn,
  Sparkles,
} from 'lucide-react';
import fenixLogo from '@/assets/fenix-logo.png';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type DashboardView = 'dashboard' | 'projects' | 'recents';

interface DashboardSidebarProps {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
  onUpgrade?: () => void;
}

const primaryNav: { label: string; view: DashboardView; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { label: 'All Projects', view: 'projects', icon: FolderKanban },
  { label: 'Recents', view: 'recents', icon: Clock },
];

export function DashboardSidebar({
  view,
  onViewChange,
  isAuthenticated,
  onLogout,
  onUpgrade,
}: DashboardSidebarProps) {
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
        <img src={fenixLogo} alt="Fenix" className="w-8 h-8" />
        <span className="font-semibold text-foreground text-lg">Fenix</span>
      </div>

      {/* Zone 1: Core navigation */}
      <nav className="p-3 space-y-1">
        <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wider text-muted-foreground/70">
          Workspace
        </p>
        {primaryNav.map((item) => {
          const active = view === item.view;
          return (
            <button
              key={item.label}
              onClick={() => onViewChange(item.view)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-all',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              )}
            >
              <item.icon className={cn('h-4 w-4', active && 'text-primary')} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Zone 2: Upgrade CTA */}
      <div className="px-3 mt-4">
        <button
          onClick={onUpgrade}
          className="w-full group relative flex items-center gap-2 justify-center px-3 py-2.5 rounded-full text-sm font-medium text-amber-100 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border border-amber-400/30 hover:from-amber-500/30 hover:to-amber-500/30 hover:border-amber-300/50 transition-all shadow-[0_0_20px_-8px_rgba(245,158,11,0.6)]"
        >
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>Upgrade</span>
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Zone 3: Utilities & Auth */}
      <div className="px-3 pb-2 pt-4 border-t border-slate-800/50 space-y-1">
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm transition-all',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )}
        >
          <SettingsIcon className="h-4 w-4" />
          <span>Settings</span>
        </button>
        {isAuthenticated ? (
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => navigate('/auth')}
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
