"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { fetchWithAuth } from '@/lib/api';
import { 
  BookOpen, 
  Search, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Tag,
  ChevronRight,
  FolderOpen
} from 'lucide-react';

interface KnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
}

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeBase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'Engineering',
    tagsString: '',
  });

  // Selected article view
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeBase | null>(null);

  const fetchEntries = async (query = '') => {
    try {
      setLoading(true);
      const url = query ? `/knowledge/search?q=${encodeURIComponent(query)}` : '/knowledge/search?q=';
      const data = await fetchWithAuth(url);
      setEntries(data);
      if (data.length > 0 && !selectedArticle) {
        setSelectedArticle(data[0]);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      // Fallback
      const fallback = [
        { id: '1', title: 'HIG AI Codebase Architecture & Abstractions', content: 'Our ERP platform follows a modular monolith structure. The frontend Next.js application leverages client-side cached API requests to communicate with the NestJS REST servers on port 3001. State is managed locally while Prisma acts as our ORM interface for PostgreSQL.', category: 'Engineering', tags: ['architecture', 'nestjs', 'nextjs'] },
        { id: '2', title: 'HRMS Automated Document Generation SOP', content: 'When onboarding new employees, the HRMS controller triggers the Handlebars compiler via the DocumentService module. Avoid manually hardcoding templates; always register new documents inside the DocumentTemplate database table.', category: 'Operations', tags: ['hrms', 'handlebars', 'sop'] },
      ];
      setEntries(fallback);
      if (!selectedArticle) setSelectedArticle(fallback[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEntries(searchQuery);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);

      const tags = form.tagsString.split(',').map((t) => t.trim()).filter((t) => t !== '');
      
      const payload = {
        title: form.title,
        content: form.content,
        category: form.category,
        tags,
      };

      const result = await fetchWithAuth('/knowledge/entries', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setForm({
        title: '',
        content: '',
        category: 'Engineering',
        tagsString: '',
      });

      setSelectedArticle(result);
      await fetchEntries();
      setSuccess('Knowledge article published successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to publish knowledge article. Verify backend service is running.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Enterprise Knowledge Base</h1>
          <p className="text-muted-foreground mt-1 font-inter">Centralized Wiki, technical specifications, operational SOPs, and internal manuals.</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center border border-rose-500/20 animate-in fade-in">
            <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center border border-emerald-500/20 animate-in fade-in">
            <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-semibold">{success}</p>
          </div>
        )}

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center bg-card border border-border rounded-2xl p-2 shadow-sm max-w-2xl">
          <Search className="h-5 w-5 text-muted-foreground ml-3" />
          <input
            type="text"
            placeholder="Search keywords, categories, or tags in the Wiki..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 text-foreground placeholder-muted-foreground/60"
          />
          <button type="submit" className="px-6 py-2 bg-primary text-background text-xs font-bold rounded-xl hover:scale-105 transition-transform">
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Article Feed / List */}
          <div className="xl:col-span-1 space-y-4 bg-card rounded-3xl p-6 border border-border shadow-sm max-h-[600px] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-2">
              <h2 className="text-base font-bold text-primary flex items-center">
                <FolderOpen className="h-4.5 w-4.5 mr-2 text-primary" />
                Articles ({entries.length})
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent" />
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between border ${
                      selectedArticle?.id === article.id 
                        ? 'bg-secondary border-primary/10 text-primary shadow-sm' 
                        : 'border-transparent text-foreground/80 hover:bg-secondary/50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold truncate">{article.title}</p>
                      <span className="text-[10px] text-muted-foreground font-semibold">{article.category}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Selected Article View */}
          <div className="xl:col-span-2 bg-card rounded-3xl p-8 border border-border shadow-sm min-h-[500px] flex flex-col justify-between">
            {selectedArticle ? (
              <div>
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase border border-primary/20">
                      {selectedArticle.category}
                    </span>
                    <h2 className="text-2xl font-bold text-primary mt-2">{selectedArticle.title}</h2>
                  </div>
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed font-inter whitespace-pre-wrap">
                  {selectedArticle.content}
                </p>

                <div className="flex items-center flex-wrap gap-2 mt-8">
                  {selectedArticle.tags?.map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center text-[10px] bg-secondary font-bold text-muted-foreground px-2.5 py-1 rounded-md border border-border">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground opacity-30 mb-4 animate-pulse" />
                <p className="text-sm text-muted-foreground">Select an article to view details or publish a new SOP.</p>
              </div>
            )}
          </div>

          {/* Write / Publish Article Form */}
          <div className="xl:col-span-1 bg-card rounded-3xl p-6 border border-border shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-primary">Write SOP / Article</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">TITLE</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Code Review Practices"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-xs text-foreground placeholder-muted-foreground/60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">CATEGORY</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-xs text-foreground cursor-pointer"
                >
                  <option className="bg-card text-foreground">Engineering</option>
                  <option className="bg-card text-foreground">Operations</option>
                  <option className="bg-card text-foreground">HR & Hiring</option>
                  <option className="bg-card text-foreground">Legal & Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">CONTENT (MARKDOWN SUPPORTED)</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Type article content..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-xs text-foreground placeholder-muted-foreground/60 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider font-inter">TAGS (COMMA SEPARATED)</label>
                <input
                  type="text"
                  placeholder="e.g., node, design, patterns"
                  value={form.tagsString}
                  onChange={(e) => setForm({ ...form, tagsString: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-xl focus:outline-none focus:border-accent text-xs text-foreground placeholder-muted-foreground/60"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-primary text-background font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-transform text-xs"
              >
                {submitting ? (
                  <Loader2 className="animate-spin h-4 w-4" />
                ) : 'Publish Wiki Article'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
