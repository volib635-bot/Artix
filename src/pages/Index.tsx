import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { useNavigate } from 'react-router-dom';
import { 
  Code2, 
  Network, 
  Bot,
  Wifi,
  Sparkles,
  FileEdit,
  FileText,
  FileCode,
  ChevronRight,
  Zap,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import artixLogo from '@/assets/artix-logo.png';

const features = [
  {
    icon: Code2,
    title: 'Document Forge',
    description: 'Write technical specs, PRDs, and documentation in Markdown, XML, or plain text with Monaco editor, live preview, and auto-save.',
  },
  {
    icon: Network,
    title: 'System Architect',
    description: 'Design system architectures, microservices, and flow diagrams visually with node templates, curved links, and freehand drawing.',
  },
  {
    icon: Bot,
    title: 'AI Intelligence Suite',
    description: 'Accelerate creation with AI PRD generators, Vibe Coding prompts, Agentic Workflows, and auto-generated system architectures.',
  },
  {
    icon: Wifi,
    title: 'PWA & Offline First',
    description: 'Install as a native desktop/mobile web app. Auto-saves locally with multi-tab sync so your drafts are safe offline.',
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main id="main-content">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
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
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Software Architecture & Documentation Workspace
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              The Developer's
              <span className="block gradient-text">Command Center</span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Document, design, and architect — all in one unified workspace. Write docs, visual diagram systems, and leverage AI generators with <span className="text-primary font-semibold">Artix</span>.
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
                onClick={() => navigate('/pricing')}
                className="text-base h-12 px-8 border-border/80 hover:border-primary/50"
              >
                <CreditCard className="mr-2 h-4 w-4 text-primary" />
                View Plans
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Editor & Canvas Preview */}
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
              <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-slate-300 ml-2 font-mono">architecture_spec.md</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <Zap className="h-3 w-3" /> Auto-Saved & Synced
                </div>
              </div>
              
              <div className="p-6 font-mono text-sm leading-relaxed">
                <div className="flex">
                  <span className="text-slate-500/60 w-8 text-right mr-4">1</span>
                  <span className="text-blue-400"># System Architecture Spec</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500/60 w-8 text-right mr-4">2</span>
                  <span className="text-slate-400"></span>
                </div>
                <div className="flex">
                  <span className="text-slate-500/60 w-8 text-right mr-4">3</span>
                  <span className="text-slate-200">Unified developer command center for specs, node diagrams, and AI workflows.</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500/60 w-8 text-right mr-4">4</span>
                  <span className="text-slate-400"></span>
                </div>
                <div className="flex">
                  <span className="text-slate-500/60 w-8 text-right mr-4">5</span>
                  <span className="text-blue-400">## Core Modules</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500/60 w-8 text-right mr-4">6</span>
                  <span className="text-slate-400"></span>
                </div>
                <div className="flex">
                  <span className="text-slate-500/60 w-8 text-right mr-4">7</span>
                  <span className="text-slate-200">- <span className="text-primary font-bold">**Document Forge**</span> — Monaco split-pane markdown & specs</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500/60 w-8 text-right mr-4">8</span>
                  <span className="text-slate-200">- <span className="text-primary font-bold">**System Architect**</span> — Interactive node canvas & freehand tools</span>
                </div>
                <div className="flex">
                  <span className="text-slate-500/60 w-8 text-right mr-4">9</span>
                  <span className="text-slate-200">- <span className="text-primary font-bold">**AI Intelligence**</span> — PRD, Vibe Prompts & Architecture generation</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-500/60 w-8 text-right mr-4">10</span>
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
              Everything You Need to Architect & Ship
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Document, design, auto-generate specs, and work offline — all from one unified developer environment.
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
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all group hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{feature.description}</p>
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
                Ready to Upgrade Your Developer Workflow?
              </h2>
              <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                Start building with Artix — free tier included. Create documents, map architectures, and supercharge your speed.
              </p>
              <Button 
                size="lg" 
                onClick={() => navigate('/auth?mode=signup')}
                className="text-base h-12 px-8 glow-amber"
              >
                Get Started Free
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={artixLogo} alt="Artix" className="w-6 h-6" />
            <span className="font-semibold text-foreground">Artix</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Artix. Built for modern developers.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
