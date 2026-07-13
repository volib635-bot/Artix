import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, GitBranch, Plus, Loader2, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useProjects } from '@/hooks/useProjects';
import { useDocuments } from '@/hooks/useDocuments';
import { useSystemDesigns } from '@/hooks/useSystemDesigns';
import { Editor, Document } from '@/components/Editor/Editor';
import { SystemArchitect } from '@/components/SystemArchitect/SystemArchitect';
import { RenameDialog } from '@/components/RenameDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ProjectWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { projects, isLoading: projectsLoading } = useProjects();
  const {
    documents,
    isLoading: docsLoading,
    createDocument,
    updateDocument,
    deleteDocument,
    isCreating: isCreatingDoc,
  } = useDocuments(id);
  const {
    designs,
    isLoading: designsLoading,
    createDesign,
    updateDesign,
    deleteDesign,
    isCreating: isCreatingDesign,
  } = useSystemDesigns(id);

  const [activeTab, setActiveTab] = useState<'documents' | 'architect'>('documents');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [renameDoc, setRenameDoc] = useState<{ id: string; title: string } | null>(null);
  const [renameDesign, setRenameDesign] = useState<{ id: string; name: string } | null>(null);

  const project = projects.find((p) => p.id === id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!projectsLoading && !project && user) {
      navigate('/dashboard', { replace: true });
      toast.error('Project not found');
    }
  }, [project, projectsLoading, user, navigate]);

  // Handle action parameter on workspace mount
  useEffect(() => {
    if (projectsLoading || docsLoading || designsLoading || !id) return;

    const action = searchParams.get('action');
    if (!action) return;

    // Clear search param to prevent repeating action on refresh
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('action');
    setSearchParams(newParams, { replace: true });

    if (action === 'new-document') {
      setActiveTab('documents');
      handleCreateDocument();
    } else if (action === 'new-design') {
      setActiveTab('architect');
      handleCreateDesign();
    } else if (action === 'new-vibe') {
      setActiveTab('documents');
      createDocument(id).then((newDoc) => {
        setSelectedDocument(newDoc);
        toast.success('Vibe Scratchpad created');
        // Set query param ?vibe=true to open Vibe coding dialog
        setSearchParams({ vibe: 'true' }, { replace: true });
      }).catch(() => {
        toast.error('Failed to start vibe coding');
      });
    }
  }, [projectsLoading, docsLoading, designsLoading, id, searchParams]);

  // Don't render until auth is resolved
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user after auth loading, return null (redirect will happen)
  if (!user) {
    return null;
  }

  const handleCreateDocument = async () => {
    if (!id) return null;
    try {
      const newDoc = await createDocument(id);
      setSelectedDocument(newDoc);
      toast.success('New document created');
      return newDoc;
    } catch (error) {
      toast.error('Failed to create document');
      return null;
    }
  };

  const handleCreateDesign = async () => {
    if (!id) return;
    try {
      const newDesign = await createDesign({ name: 'New System Design', projectId: id });
      setSelectedDesign(newDesign.id);
      toast.success('New system design created');
    } catch (error) {
      toast.error('Failed to create system design');
    }
  };

  const handleSaveDocument = async (updates: Partial<Document>) => {
    if (!updates.id) return;
    try {
      await updateDocument(updates as Partial<Document> & { id: string });
      if (selectedDocument?.id === updates.id) {
        setSelectedDocument((prev) =>
          prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null
        );
      }
    } catch (error) {
      toast.error('Failed to save document');
      throw error;
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId);
      if (selectedDocument?.id === docId) {
        setSelectedDocument(null);
      }
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    try {
      await deleteDesign(designId);
      if (selectedDesign === designId) {
        setSelectedDesign(null);
      }
      toast.success('System design deleted');
    } catch (error) {
      toast.error('Failed to delete system design');
    }
  };

  const currentDesign = designs.find((d) => d.id === selectedDesign);

  const handleRenameDocument = async (newTitle: string) => {
    if (!renameDoc) return;
    await updateDocument({ id: renameDoc.id, title: newTitle });
    toast.success('Document renamed');
  };

  const handleRenameDesign = async (newName: string) => {
    if (!renameDesign) return;
    await updateDesign({ id: renameDesign.id, name: newName });
    toast.success('Design renamed');
  };
  if (projectsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If editing a document, show full-screen editor
  if (selectedDocument) {
    return (
      <Editor
        document={selectedDocument}
        onSave={handleSaveDocument}
        onBack={() => setSelectedDocument(null)}
        projectId={id}
      />
    );
  }

  // If editing a design, show full-screen architect
  if (selectedDesign && currentDesign) {
    return (
      <SystemArchitect
        design={currentDesign}
        onSave={(boardState) => updateDesign({ id: currentDesign.id, board_state: boardState })}
        onUpdateName={(name) => updateDesign({ id: currentDesign.id, name })}
        onBack={() => setSelectedDesign(null)}
        documents={documents.map((d) => ({ id: d.id, title: d.title, content: d.content || '' }))}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center h-14 px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-foreground truncate">{project?.name}</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto py-6 px-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-auto grid-cols-2">
              <TabsTrigger value="documents" className="gap-2">
                <FileText className="h-4 w-4" />
                Document Forge
              </TabsTrigger>
              <TabsTrigger value="architect" className="gap-2">
                <GitBranch className="h-4 w-4" />
                System Architect
              </TabsTrigger>
            </TabsList>

            {activeTab === 'documents' ? (
              <Button onClick={handleCreateDocument} disabled={isCreatingDoc} className="gap-2">
                {isCreatingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                New Document
              </Button>
            ) : (
              <Button onClick={handleCreateDesign} disabled={isCreatingDesign} className="gap-2">
                {isCreatingDesign ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                New Design
              </Button>
            )}
          </div>

          <TabsContent value="documents">
            {docsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No documents yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-4">
                  Start writing technical specs, PRDs, or documentation. Your work auto-saves as you type.
                </p>
                <Button onClick={handleCreateDocument} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Document
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-3">
                {documents.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group flex items-center gap-4 p-4 rounded-lg cursor-pointer",
                      "bg-card border border-border hover:border-primary/30",
                      "transition-all duration-200"
                    )}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameDoc({ id: doc.id, title: doc.title });
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="architect">
            {designsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : designs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <GitBranch className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No system designs yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mb-4">
                  Visually map your system architecture with drag-and-drop nodes, connections, and annotations.
                </p>
                <Button onClick={handleCreateDesign} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create System Design
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-3">
                {designs.map((design, index) => (
                  <motion.div
                    key={design.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group flex items-center gap-4 p-4 rounded-lg cursor-pointer",
                      "bg-card border border-border hover:border-primary/30",
                      "transition-all duration-200"
                    )}
                    onClick={() => setSelectedDesign(design.id)}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <GitBranch className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{design.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {design.board_state.nodes.length} nodes • Updated{' '}
                        {formatDistanceToNow(new Date(design.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setRenameDesign({ id: design.id, name: design.name });
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDesign(design.id);
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Rename Dialogs */}
        <RenameDialog
          open={!!renameDoc}
          onOpenChange={(open) => !open && setRenameDoc(null)}
          currentName={renameDoc?.title || ''}
          onSave={handleRenameDocument}
          title="Rename Document"
        />
        <RenameDialog
          open={!!renameDesign}
          onOpenChange={(open) => !open && setRenameDesign(null)}
          currentName={renameDesign?.name || ''}
          onSave={handleRenameDesign}
          title="Rename System Design"
        />
      </main>
    </div>
  );
};

export default ProjectWorkspace;
