import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { DocumentList } from '@/components/DocumentList';
import { Editor, Document } from '@/components/Editor/Editor';
import { DocumentFormat } from '@/components/Editor/languageMap';
import { toast } from 'sonner';

// Mock data for demonstration
const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Getting Started Guide',
    content: '# Getting Started\n\nWelcome to TextForge! This is a sample Markdown document.\n\n## Features\n\n- Auto-save\n- Cloud persistence\n- Multi-format support',
    format: 'markdown',
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: '2',
    title: 'API Configuration',
    content: '<?xml version="1.0" encoding="UTF-8"?>\n<configuration>\n  <api>\n    <endpoint>https://api.example.com</endpoint>\n    <timeout>30</timeout>\n  </api>\n</configuration>',
    format: 'xml',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    title: 'Quick Notes',
    content: 'Just some quick notes...\n\n- Buy groceries\n- Finish the project\n- Call mom',
    format: 'text',
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleCreateDocument = () => {
    const newDoc: Document = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      content: '',
      format: 'markdown' as DocumentFormat,
      updated_at: new Date().toISOString(),
    };
    setDocuments([newDoc, ...documents]);
    setSelectedDocument(newDoc);
    toast.success('New document created');
  };

  const handleSelectDocument = (doc: Document) => {
    setSelectedDocument(doc);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
    toast.success('Document deleted');
  };

  const handleSaveDocument = async (updates: Partial<Document>) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === updates.id
          ? { ...doc, ...updates, updated_at: new Date().toISOString() }
          : doc
      )
    );

    if (selectedDocument?.id === updates.id) {
      setSelectedDocument((prev) =>
        prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null
      );
    }
  };

  const handleBack = () => {
    setSelectedDocument(null);
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence mode="wait">
        {selectedDocument ? (
          <Editor
            key="editor"
            document={selectedDocument}
            onSave={handleSaveDocument}
            onBack={handleBack}
          />
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Navbar isLoggedIn onLogout={handleLogout} />
            <main className="pt-20 max-w-4xl mx-auto">
              <DocumentList
                documents={documents}
                onSelect={handleSelectDocument}
                onDelete={handleDeleteDocument}
                onCreate={handleCreateDocument}
              />
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
