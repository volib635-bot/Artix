import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { 
  FileEdit, 
  Code2, 
  Cloud, 
  Zap, 
  Shield, 
  Sparkles,
  FileText,
  FileCode,
  ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: Code2,
    title: 'Document Forge',
    description: 'Write in Markdown, XML, or plain text with syntax highlighting and intelligent formatting.',
  },
  {
    icon: Cloud,
    title: 'System Architect',
    description: 'Design your system architecture with a visual canvas. Connect databases, servers, and services.',
  },
  {
    icon: Zap,
    title: 'Project Management',
    description: 'Organize all your work in projects. Keep documents and designs together in one place.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your projects are encrypted and only accessible by you. Full ownership of your data.',
  },
];

const formats = [
  { 
    icon: FileEdit, 
    name: 'Markdown', 
    ext: '.md',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  { 
    icon: FileCode, 
    name: 'XML', 
    ext: '.xml',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
  { 
    icon: FileText, 
    name: 'Plain Text', 
    ext: '.txt',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: 'var(--gradient-glow)' }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              100% Free • No Credit Card Required
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              The Developer's
              <span className="block gradient-text">Command Center</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Architect your systems, forge your documents, and manage your projects in one unified workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/auth?mode=signup')}
                className="group text-base h-12 px-8 glow-amber"
              >
                Start Building Free
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/auth')}
                className="text-base h-12 px-8"
              >
                Sign In
              </Button>
            </div>
          </motion.div>

          {/* Format Badges */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex justify-center gap-4 mt-12"
          >
            {formats.map((format, index) => (
              <motion.div
                key={format.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${format.bgColor} ${format.borderColor}`}
              >
                <format.icon className={`h-4 w-4 ${format.color}`} />
                <span className={`font-medium text-sm ${format.color}`}>{format.name}</span>
                <span className="text-xs text-muted-foreground font-mono">{format.ext}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Editor Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 blur-3xl opacity-30 -z-10" />
            
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-black/20">
              {/* Mock Editor Header */}
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">README.md</span>
              </div>
              
              {/* Mock Editor Content */}
              <div className="p-6 font-mono text-sm leading-relaxed">
                <div className="flex">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">1</span>
                  <span className="text-blue-400"># Welcome to TextForge</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">2</span>
                  <span className="text-muted-foreground"></span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">3</span>
                  <span className="text-foreground">A modern, cloud-based text editor built for developers.</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">4</span>
                  <span className="text-muted-foreground"></span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">5</span>
                  <span className="text-blue-400">## Features</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">6</span>
                  <span className="text-muted-foreground"></span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">7</span>
                  <span className="text-foreground">- <span className="text-primary">**Markdown**</span> with live preview</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">8</span>
                  <span className="text-foreground">- <span className="text-primary">**XML**</span> syntax highlighting</span>
                </div>
                <div className="flex">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">9</span>
                  <span className="text-foreground">- <span className="text-primary">**Auto-save**</span> to the cloud</span>
                </div>
                <div className="flex items-center">
                  <span className="text-muted-foreground/50 w-8 text-right mr-4">10</span>
                  <span className="w-2 h-5 bg-primary animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Power Tools for Developers
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to document, design, and manage your projects.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative rounded-2xl border border-border bg-card overflow-hidden p-12 text-center"
          >
            <div 
              className="absolute inset-0 opacity-30"
              style={{ background: 'var(--gradient-glow)' }}
            />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to Take Command?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join developers who use TextForge to architect systems, write documentation, and manage their projects.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth?mode=signup')}
                className="text-base h-12 px-8 glow-amber"
              >
                Get Started — It's Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <FileEdit className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">TextForge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TextForge. Built with ❤️ for developers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
