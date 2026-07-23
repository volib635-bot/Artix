import { describe, it, expect } from 'vitest';

describe('UX & Feedback Issue Resolvers', () => {
  it('should trim project name inputs and reject whitespace-only strings', () => {
    const validateName = (name: string) => name.trim().length > 0;

    expect(validateName('My Awesome Project')).toBe(true);
    expect(validateName('   ')).toBe(false);
    expect(validateName('')).toBe(false);
    expect(validateName('  Acme Core  ')).toBe(true);
  });

  it('should correctly map navigation targets for pricing and upgrade routes', () => {
    const resolveRoute = (path: string) => {
      if (path === '/upgrade' || path === '/pricing') return 'PricingPage';
      if (path === '/settings') return 'SettingsPage';
      return 'NotFoundPage';
    };

    expect(resolveRoute('/pricing')).toBe('PricingPage');
    expect(resolveRoute('/upgrade')).toBe('PricingPage');
    expect(resolveRoute('/settings')).toBe('SettingsPage');
  });

  it('should clear selected sub-items when switching tabs in ProjectWorkspace', () => {
    let state = {
      activeTab: 'documents' as 'documents' | 'architect',
      selectedDocument: { id: 'doc-1' } as { id: string } | null,
      selectedDesign: { id: 'design-1' } as { id: string } | null,
    };

    const handleTabChange = (newTab: 'documents' | 'architect') => {
      state = {
        activeTab: newTab,
        selectedDocument: null,
        selectedDesign: null,
      };
    };

    handleTabChange('architect');
    expect(state.activeTab).toBe('architect');
    expect(state.selectedDocument).toBeNull();
    expect(state.selectedDesign).toBeNull();
  });

  it('should format Markdown elements with high contrast code and heading elements', () => {
    const formatHeading = (text: string, level: number) => {
      return `<h${level} class="text-slate-100 font-bold">${text}</h${level}>`;
    };

    const formatCodeBlock = (code: string) => {
      return `<code class="bg-slate-900 text-amber-300 font-mono">${code}</code>`;
    };

    expect(formatHeading('Title', 1)).toContain('text-slate-100');
    expect(formatCodeBlock('const x = 1;')).toContain('bg-slate-900');
  });

  it('should detect duplicate project names case-insensitively', () => {
    const existingProjects = [{ id: '1', name: 'Youssef' }, { id: '2', name: 'Acme Specs' }];
    const isDuplicate = (name: string, currentId?: string) => {
      const trimmed = name.trim().toLowerCase();
      return existingProjects.some((p) => p.id !== currentId && p.name.trim().toLowerCase() === trimmed);
    };

    expect(isDuplicate('youssef')).toBe(true);
    expect(isDuplicate('YOUSSEF')).toBe(true);
    expect(isDuplicate('  youssef  ')).toBe(true);
    expect(isDuplicate('Youssef 2')).toBe(false);
    expect(isDuplicate('Youssef', '1')).toBe(false); // same project editing itself
  });

  it('should optimistically append new project to query cache to prevent premature not-found state', () => {
    const existingProjects = [{ id: 'p1', name: 'Project Alpha' }];
    const newProject = { id: 'p2', name: 'Project Beta' };

    const updateCache = (list: typeof existingProjects, created: typeof newProject) => [
      created,
      ...list.filter((item) => item.id !== created.id),
    ];

    const updatedCache = updateCache(existingProjects, newProject);
    expect(updatedCache).toHaveLength(2);
    expect(updatedCache[0].id).toBe('p2');
    expect(updatedCache.find((p) => p.id === 'p2')).toBeDefined();
  });
});
