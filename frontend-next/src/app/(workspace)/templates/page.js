'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Layers, Sparkles, Code2 } from 'lucide-react';
import { Breadcrumb } from '@/components/Breadcrumb';
import { TemplateCard } from '@/components/TemplateCard';
import { TEMPLATES } from '@/lib/templates';
import { cn } from '@/lib/utils';

export default function TemplatesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedLang, setSelectedLang] = useState('all');

  const languages = ['all', ...Object.keys(TEMPLATES)];

  // Flatten all templates with language metadata
  const allTemplates = Object.entries(TEMPLATES).flatMap(([langKey, langData]) =>
    langData.templates.map(t => ({
      ...t,
      language: langKey,
      langName: langData.name
    }))
  );

  const filtered = allTemplates.filter(t => {
    const matchesLang = selectedLang === 'all' || t.language === selectedLang;
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.code.toLowerCase().includes(search.toLowerCase());
    return matchesLang && matchesSearch;
  });

  const handleUseTemplate = (template, language) => {
    router.push(`/editor?code=${encodeURIComponent(template.code)}&language=${language}&title=${encodeURIComponent(template.title)}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1">
        <Breadcrumb items={[{ label: 'Templates' }]} />
        <h1 className="text-2xl font-bold text-primary font-display flex items-center gap-2">
          <Layers className="w-6 h-6 text-accent-violet" />
          <span>Architecture Template Gallery</span>
        </h1>
        <p className="text-xs text-secondary">Pre-scaffolded, production-ready design patterns and algorithms across 12 languages.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-3 bg-elevated p-4 rounded-xl border border-light shadow-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-tertiary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates by pattern name or code syntax..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-secondary border border-light rounded-lg text-primary placeholder-secondary focus:outline-none focus:border-focus"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {languages.map(lang => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider transition-all",
                selectedLang === lang
                  ? "brand-gradient text-white shadow-xs"
                  : "bg-secondary text-secondary hover:bg-tertiary hover:text-primary"
              )}
            >
              {lang === 'all' ? 'All Languages' : TEMPLATES[lang]?.name || lang}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {filtered.length === 0 ? (
        <div className="surface-card p-12 text-center rounded-2xl border border-light space-y-2">
          <Code2 className="w-10 h-10 text-tertiary mx-auto opacity-40" />
          <h3 className="text-base font-bold text-primary">No templates found</h3>
          <p className="text-xs text-secondary">Try selecting a different programming language or adjusting your keyword search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(template => (
            <TemplateCard
              key={template.id}
              template={template}
              language={template.language}
              onUse={(t, l) => handleUseTemplate(t, l)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
