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
  Code2,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import artixLogo from '@/assets/artix-logo.png';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/useTheme';

export type DashboardView = 'dashboard' | 'projects' | 'recents' | 'api-usage';

interface DashboardSidebarProps {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
  onUpgrade?: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const primaryNav: { label: string; view: DashboardView; icon: typeof LayoutDashboard }[] = [
  { label: 'Dashboard', view: 'dashboard', icon: LayoutDashboard },
  { label: 'All Projects', view: 'projects', icon: FolderKanban },
  { label: 'Recents', view: 'recents', icon: Clock },
  { label: 'API Usage', view: 'api-usage', icon: Code2 },
];

export function DashboardSidebar({
  view,
  onViewChange,
  isAuthenticated,
  onLogout,
  onUpgrade,
  collapsed,
  onToggleCollapsed,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();

  const handleUpgrade = onUpgrade ?? (() => navigate('/pricing'));

  const NavBtn = ({
    label,
    icon: Icon,
    active,
    onClick,
  }: {
    label: string;
    icon: typeof LayoutDashboard;
    active: boolean;
    onClick: () => void;
  }) => {
    const btn = (
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-3 rounded-r-full text-sm transition-all duration-200 border-l-2',
          collapsed ? 'justify-center px-0 py-2.5' : 'pl-3 pr-4 py-2',
          active
            ? 'bg-primary/10 text-primary border-primary font-medium'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/70 hover:scale-[1.02] border-transparent'
        )}
      >
        <Icon className={cn('h-4 w-4 shrink-0', active && 'text-primary')} />
        {!collapsed && <span>{label}</span>}
      </button>
    );
    if (!collapsed) return btn;
    return (
      <Tooltip>
        <TooltipTrigger asChild>{btn}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 224 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="hidden md:flex flex-col h-screen sticky top-0 shrink-0 z-40 backdrop-blur-md bg-gradient-to-b from-sidebar/90 via-sidebar/80 to-sidebar/70 border-r border-border/40"
      >
        {/* Brand + collapse trigger */}
        <div
          className={cn(
            'h-16 flex items-center gap-2 border-b border-border/30',
            collapsed ? 'justify-center px-2' : 'px-5'
          )}
        >
          <img src={artixLogo} alt="Artix" className="w-8 h-8 shrink-0" />
          {!collapsed && (
            <>
              <span className="font-semibold text-foreground text-lg flex-1">Artix</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={onToggleCollapsed}
                aria-label="Collapse sidebar"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {collapsed && (
          <div className="px-2 pt-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleCollapsed}
                  className="w-full h-8 text-muted-foreground hover:text-foreground"
                  aria-label="Expand sidebar"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Zone 1: Core navigation */}
        <nav className={cn('p-3 space-y-1', collapsed && 'px-2')}>
          {!collapsed && (
            <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wider text-muted-foreground/70">
              Workspace
            </p>
          )}
          {primaryNav.map((item) => (
            <NavBtn
              key={item.label}
              label={item.label}
              icon={item.icon}
              active={view === item.view}
              onClick={() => onViewChange(item.view)}
            />
          ))}
        </nav>

        {/* Zone 2: Upgrade CTA */}
        <div className={cn('mt-4', collapsed ? 'px-2' : 'px-3')}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={handleUpgrade}
                  className="w-full flex justify-center items-center h-10 rounded-full text-amber-300 bg-amber-500/15 border border-amber-400/30 hover:bg-amber-500/25 transition-all"
                  aria-label="Upgrade"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Upgrade</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={handleUpgrade}
              className="w-full group flex items-center gap-2 justify-center px-3 py-2.5 rounded-full text-sm font-medium text-amber-100 bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/20 border border-amber-400/30 hover:from-amber-500/30 hover:to-amber-500/30 hover:border-amber-300/50 transition-all shadow-[0_0_20px_-8px_rgba(245,158,11,0.6)]"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Upgrade</span>
            </button>
          )}
        </div>

        <div className="flex-1" />

        {/* Zone 3: Utilities */}
        <div
          className={cn(
            'pb-2 pt-4 border-t border-slate-800/50 space-y-1',
            collapsed ? 'px-2' : 'px-3'
          )}
        >


          <NavBtn
            label="Settings"
            icon={SettingsIcon}
            active={pathname === '/settings'}
            onClick={() => navigate('/settings')}
          />

          {isAuthenticated ? (
            collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onLogout}
                    className="w-full flex justify-center py-2.5 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            ) : (
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            )
          ) : collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full flex justify-center py-2.5 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10"
                  aria-label="Sign in"
                >
                  <LogIn className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign In</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => navigate('/auth')}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
