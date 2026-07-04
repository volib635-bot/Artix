import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { ProjectGrid } from '@/components/ProjectGrid';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, Project } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { Loader2, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="flex flex-row min-h-screen w-full bg-background">
      <DashboardSidebar onLogout={handleLogout} />

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
                <div className="flex-1 p-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={() => navigate('/settings')}
                  >
                    <SettingsIcon className="h-4 w-4" /> User Settings
                  </Button>
                </div>
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
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 w-full"
          >
            <ProjectGrid
              projects={projects}
              onSelect={handleSelectProject}
              onCreate={handleCreateProject}
              onDelete={handleDeleteProject}
              onRename={handleRenameProject}
              isCreating={isCreating}
            />
          </motion.main>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
