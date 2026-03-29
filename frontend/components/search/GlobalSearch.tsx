'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Users, Folder, FileText, ClipboardList,
  Calendar, Receipt, Clock, Plus, ArrowRight, X,
} from 'lucide-react';
import { useSearch } from '@/lib/hooks/useSearch';
import { cn } from '@/lib/utils';
import type { SearchResult } from '@/lib/api/search';

// ── Category config ──────────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'all',         label: 'Alle' },
  { key: 'customer',    label: 'Kunden',       icon: Users },
  { key: 'project',     label: 'Projekte',      icon: Folder },
  { key: 'invoice',     label: 'Rechnungen',    icon: FileText },
  { key: 'quote',       label: 'Angebote',      icon: ClipboardList },
  { key: 'appointment', label: 'Kalender',      icon: Calendar },
  { key: 'expense',     label: 'Ausgaben',      icon: Receipt },
  { key: 'time_entry',  label: 'Zeit',          icon: Clock },
] as const;

type CategoryKey = typeof CATEGORIES[number]['key'];

const TYPE_ICON: Record<string, React.ElementType> = {
  customer:    Users,
  project:     Folder,
  invoice:     FileText,
  quote:       ClipboardList,
  appointment: Calendar,
  expense:     Receipt,
  time_entry:  Clock,
};

const TYPE_COLOR: Record<string, string> = {
  customer:    'bg-blue-50 text-blue-600',
  project:     'bg-violet-50 text-violet-600',
  invoice:     'bg-[#800040]/10 text-[#800040]',
  quote:       'bg-amber-50 text-amber-600',
  appointment: 'bg-teal-50 text-teal-600',
  expense:     'bg-red-50 text-red-500',
  time_entry:  'bg-zinc-100 text-zinc-500',
};

const QUICK_LINKS = [
  { label: 'Neue Rechnung', href: '/invoices?new=1',  icon: FileText },
  { label: 'Neuer Kunde',   href: '/customers?new=1', icon: Users },
  { label: 'Neues Angebot', href: '/quotes?new=1',    icon: ClipboardList },
  { label: 'Neues Projekt', href: '/projects?new=1',  icon: Folder },
];

// ── Result Item ───────────────────────────────────────────────────────────────
function ResultItem({ result, onNavigate }: { result: SearchResult; onNavigate: (href: string) => void }) {
  const Icon = TYPE_ICON[result.type] ?? FileText;
  const color = TYPE_COLOR[result.type] ?? 'bg-zinc-100 text-zinc-500';

  return (
    <button
      onClick={() => onNavigate(result.href)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors group text-left"
    >
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-900 truncate">{result.title}</p>
        {result.subtitle && (
          <p className="text-xs text-zinc-400 truncate">{result.subtitle}</p>
        )}
      </div>
      {result.meta && (
        <span className="shrink-0 text-[11px] text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
          {result.meta}
        </span>
      )}
      <ArrowRight className="w-3.5 h-3.5 text-zinc-300 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery]         = useState('');
  const [debouncedQ, setDebounced] = useState('');
  const [isOpen, setIsOpen]       = useState(false);
  const [activeTab, setActiveTab] = useState<CategoryKey>('all');

  const inputRef    = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 300 ms debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useSearch(debouncedQ);

  // Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Click outside → close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNavigate = useCallback((href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  }, [router]);

  // Build visible results based on active tab
  const allResults = data?.results ?? {};
  const filteredResults: Record<string, SearchResult[]> =
    activeTab === 'all'
      ? allResults
      : allResults[activeTab]
        ? { [activeTab]: allResults[activeTab] }
        : {};

  const totalVisible = Object.values(filteredResults).reduce((s, a) => s + a.length, 0);
  const hasQuery = query.trim().length >= 2;
  const showOverlay = isOpen;

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* ── Search Input ── */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setActiveTab('all'); }}
          onFocus={() => setIsOpen(true)}
          placeholder="Suchen..."
          className={cn(
            'w-full h-9 pl-9 pr-16 text-sm rounded-lg outline-none transition-all duration-200',
            'bg-zinc-100 hover:bg-zinc-200/80 placeholder:text-zinc-400 text-zinc-900',
            'border border-transparent focus:border-zinc-300 focus:bg-white focus:shadow-sm'
          )}
        />
        {/* Clear button */}
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-8 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {/* Kbd hint */}
        {!query && (
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 bg-zinc-200 px-1.5 py-0.5 rounded hidden lg:block pointer-events-none font-sans">
            ⌘K
          </kbd>
        )}
      </div>

      {/* ── Overlay ── */}
      {showOverlay && (
        <div className="absolute top-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-max min-w-[480px] max-w-[calc(100vw-2rem)] max-h-[480px] overflow-hidden flex flex-col bg-white border border-zinc-200 rounded-2xl shadow-2xl shadow-zinc-900/15 z-50">

          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-3 pt-3 pb-2 border-b border-zinc-100 shrink-0">
            {CATEGORIES.map((cat) => {
              const count = cat.key === 'all'
                ? data?.total
                : (allResults[cat.key]?.length ?? 0);
              const active = activeTab === cat.key;
              if (cat.key !== 'all' && hasQuery && !allResults[cat.key]?.length) return null;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveTab(cat.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    active
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
                  )}
                >
                  {cat.label}
                  {hasQuery && count != null && count > 0 && (
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                      active ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-500'
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Results area */}
          <div className="flex-1 overflow-y-auto p-2">

            {/* Loading skeleton */}
            {isFetching && hasQuery && (
              <div className="space-y-1 p-1 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-zinc-100 rounded w-2/3" />
                      <div className="h-2.5 bg-zinc-50 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Results grouped by type */}
            {!isFetching && hasQuery && totalVisible > 0 && (
              <div className="space-y-1">
                {Object.entries(filteredResults).map(([type, items]) => {
                  if (!items.length) return null;
                  const catLabel = CATEGORIES.find((c) => c.key === type)?.label ?? type;
                  return (
                    <div key={type}>
                      {activeTab === 'all' && (
                        <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          {catLabel}
                        </p>
                      )}
                      {items.map((r) => (
                        <ResultItem key={r.id} result={r} onNavigate={handleNavigate} />
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Empty: query but no results */}
            {!isFetching && hasQuery && totalVisible === 0 && (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                  <Search className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-sm font-medium text-zinc-700">Nichts gefunden</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Keine Ergebnisse für „{query}"
                </p>
              </div>
            )}

            {/* Empty: no query → Schnellzugriff */}
            {!hasQuery && (
              <div className="p-2">
                <p className="px-1 pb-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Schnellzugriff
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <button
                        key={link.href}
                        onClick={() => handleNavigate(link.href)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors text-left group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
                          <Plus className="w-3.5 h-3.5 text-zinc-500" />
                        </div>
                        <span className="text-sm text-zinc-600 font-medium">{link.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-zinc-100 flex items-center gap-4 shrink-0">
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <kbd className="bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] font-sans">↵</kbd> öffnen
            </span>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <kbd className="bg-zinc-100 px-1.5 py-0.5 rounded text-[10px] font-sans">Esc</kbd> schließen
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
