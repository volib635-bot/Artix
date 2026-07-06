import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Loader2, LogOut, Settings as SettingsIcon, Clock, FileText, Layers, ArrowUpRight } from 'lucide-react';
import { DashboardSidebar, DashboardView } from '@/components/DashboardSidebar';
import { ProjectGrid } from '@/components/ProjectGrid';
import { ExecutiveDashboard } from '@/components/ExecutiveDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, Project } from '@/hooks/useProjects';
import { useRecentActivity } from '@/hooks/useRecentActivity';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import fenixLogo from '@/assets/fenix-logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    projects,
    isLoading: projectsLoading,
    createProject,
    updateProject,
    deleteProject,
    isCreating,
  } = useProjects();

  const [view, setView] = useState<DashboardView>('dashboard');
  const [createNonce, setCreateNonce] = useState(0);
  const { data: recents = [], isLoading: recentsLoading } = useRecentActivity(20);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  const handleCreateProject = async (name: string) => {
    try {
      const newProject = await createProject(name);
      toast.success('Project created');
      navigate(`/projects/${newProject.id}`);
    } catch {
      toast.error('Failed to create project');
    }
  };

  const handleSelectProject = (project: Project) => navigate(`/projects/${project.id}`);

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleRenameProject = async (id: string, name: string) => {
    try {
      await updateProject({ id, name });
      toast.success('Project renamed');
    } catch {
      toast.error('Failed to rename project');
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const triggerNewProject = () => {
    setView('projects');
    setCreateNonce((n) => n + 1);
  };

  return (
    <div className="flex flex-row min-h-screen w-full bg-background">
      <DashboardSidebar
        view={view}
        onViewChange={setView}
        isAuthenticated={!!user}
        onLogout={handleLogout}
        onUpgrade={() => toast.info('Upgrade plans coming soon.')}
      />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 h-14 flex items-center justify-between px-4 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <img src={fenixLogo} alt="Fenix" className="w-7 h-7" />
            <span className="font-semibold">Fenix</span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <div className="flex flex-col h-full">
                <div className="h-16 flex items-center gap-2 px-5 border-b border-border/50">
                  <img src={fenixLogo} alt="Fenix" className="w-8 h-8" />
                  <span className="font-semibold text-lg">Fenix</span>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                  {(['dashboard', 'projects', 'recents'] as DashboardView[]).map((v) => (
                    <Button
                      key={v}
                      variant={view === v ? 'secondary' : 'ghost'}
                      className="w-full justify-start capitalize"
                      onClick={() => setView(v)}
                    >
                      {v === 'projects' ? 'All Projects' : v}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => navigate('/settings')}
                  >
                    <SettingsIcon className="h-4 w-4" /> Settings
                  </Button>
                </nav>
                <div className="p-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-3 text-destructive"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </header>

        {projectsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.main
              key={view}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="flex-1 w-full"
            >
              {view === 'dashboard' && (
                <ExecutiveDashboard
                  onNewProject={triggerNewProject}
                  onGoToProjects={() => setView('projects')}
                />
              )}

              {view === 'projects' && (
                <ProjectGrid
                  projects={projects}
                  onSelect={handleSelectProject}
                  onCreate={handleCreateProject}
                  onDelete={handleDeleteProject}
                  onRename={handleRenameProject}
                  isCreating={isCreating}
                  openCreateNonce={createNonce}
                />
              )}

              {view === 'recents' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                      <Clock className="h-6 w-6 text-primary" /> Recents
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Recently modified documents and canvases.
                    </p>
                  </div>

                  <Card className="p-4 bg-card/40 border-border/50">
                    {recentsLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="h-12 rounded-lg bg-muted/20 animate-pulse" />
                        ))}
                      </div>
                    ) : recents.length === 0 ? (
                      <div className="py-10 text-center text-sm text-muted-foreground">
                        Nothing here yet. Open a project to create files.
                      </div>
                    ) : (
                      <ul className="divide-y divide-border/40">
                        {recents.map((item) => {
                          const Icon = item.kind === 'document' ? FileText : Layers;
                          return (
                            <li key={`${item.kind}-${item.id}`}>
                              <button
                                onClick={() =>
                                  item.project_id
                                    ? navigate(`/projects/${item.project_id}`)
                                    : setView('projects')
                                }
                                className="w-full flex items-center gap-3 py-3 px-2 hover:bg-accent/30 rounded-lg transition-colors text-left"
                              >
                                <div className="w-9 h-9 rounded-lg bg-muted/40 border border-border/50 flex items-center justify-center text-primary/80">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-foreground truncate">
                                    {item.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {item.kind === 'document' ? 'Document' : 'Canvas'} ·{' '}
                                    {new Date(item.updated_at).toLocaleString()}
                                  </div>
                                </div>
                                <ArrowUpRight className="h-4 w-4 text-muted-foreground/50" />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </Card>
                </div>
              )}
            </motion.main>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
