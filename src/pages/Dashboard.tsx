import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { ProjectGrid } from '@/components/ProjectGrid';
import { useAuth } from '@/hooks/useAuth';
import { useProjects, Project } from '@/hooks/useProjects';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { 
    projects, 
    isLoading: projectsLoading, 
    createProject, 
    updateProject, 
    deleteProject,
    isCreating 
  } = useProjects();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleCreateProject = async (name: string) => {
    try {
      const newProject = await createProject(name);
      toast.success('Project created');
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleSelectProject = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      toast.success('Project deleted');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleRenameProject = async (id: string, name: string) => {
    try {
      await updateProject({ id, name });
      toast.success('Project renamed');
    } catch (error) {
      toast.error('Failed to rename project');
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  if (authLoading || projectsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Navbar isLoggedIn onLogout={handleLogout} />
        <main className="pt-20 max-w-6xl mx-auto">
          <ProjectGrid
            projects={projects}
            onSelect={handleSelectProject}
            onCreate={handleCreateProject}
            onDelete={handleDeleteProject}
            onRename={handleRenameProject}
            isCreating={isCreating}
          />
        </main>
      </motion.div>
    </div>
  );
};

export default Dashboard;
