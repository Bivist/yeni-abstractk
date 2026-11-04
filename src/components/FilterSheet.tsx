import React, { useState, useEffect } from 'react';
import { FilterState, TaxonomyNode } from '../types';
import { TAXONOMY } from '../constants/taxonomy';
import { normalizeString, countSelectedChildren, getEffectiveNodes, resolveEntity, normalizeYears } from '../utils/openalex';
import { X, Search, ChevronDown, Layers } from 'lucide-react';
import { SheetShell } from './SheetShell';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filter: FilterState;
  onApply: (newFilter: FilterState) => void;
  langDict: Record<string, string>;
  onTriggerEasterEgg?: (mode: 'pink-flowers' | 'ocean-fish') => void;
  onTriggerPolarNight?: () => void;
}

const chipBase = 'rounded-full text-sm font-semibold transition-colors min-h-[36px] px-3.5';

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  filter,
  onApply,
  langDict,
  onTriggerEasterEgg,
  onTriggerPolarNight
}) => {
  const [draft, setDraft] = useState<FilterState>(() => ({ ...filter, sel: new Set(filter.sel) }));
  const [searchQuery, setSearchQuery] = useState('');
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set());
  const [authorInput, setAuthorInput] = useState(filter.aName || '');
  const [journalInput, setJournalInput] = useState(filter.jName || '');
  const [statusMessage, setStatusMessage] = useState('');

  // Panel her açıldığında taslağı uygulanmış filtreyle senkronla (örn. dışarıdan sıfırlandıysa)
  useEffect(() => {
    if (isOpen) {
      setDraft({ ...filter, sel: new Set(filter.sel) });
      setAuthorInput(filter.aName || '');
      setJournalInput(filter.jName || '');
      setStatusMessage('');
    }
  }, [isOpen]);

  const checkPolarNightKeyword = (val: string) => {
    const norm = normalizeString(val.trim());
    if (/(antarktika|antarctica|antartika)/i.test(norm)) onTriggerPolarNight?.();
  };

  const handleAuthorChange = (val: string) => {
    setAuthorInput(val);
    const norm = normalizeString(val.trim());
    checkPolarNightKeyword(val);
    if (/(acuci|açuçi|asude|asoude)/i.test(norm)) onTriggerEasterEgg?.('pink-flowers');
    else if (/(binali|binosh|binos|binoş)/i.test(norm)) onTriggerEasterEgg?.('ocean-fish');
  };

  const handleSearchChange = (val: string) => { setSearchQuery(val); checkPolarNightKeyword(val); };
  const handleJournalChange = (val: string) => { setJournalInput(val); checkPolarNightKeyword(val); };

  if (!isOpen) return null;

  const normQ = normalizeString(searchQuery.trim());

  const nodeMatches = (n: TaxonomyNode): boolean => {
    if (!normQ) return true;
    if (normalizeString(n.label).includes(normQ)) return true;
    return n.children.some(nodeMatches);
  };

  const toggleSelect = (node: TaxonomyNode) => {
    setDraft(prev => {
      const nextSel = new Set(prev.sel);
      if (nextSel.has(node.id)) {
        nextSel.delete(node.id);
      } else {
        nextSel.add(node.id);
        const removeDescendants = (m: TaxonomyNode) => {
          m.children.forEach(c => { nextSel.delete(c.id); removeDescendants(c); });
        };
        removeDescendants(node);
      }
      return { ...prev, sel: nextSel };
    });
  };

  const toggleOpen = (id: string) => {
    setOpenNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleYearPreset = (y: number) => {
    const curYear = new Date().getFullYear();
    setDraft(prev => ({ ...prev, from: y === 0 ? '' : String(y > 100 ? y : curYear - y), to: '' }));
  };

  const handleApply = async () => {
    setStatusMessage('Uygulanıyor…');
    try {
      const [authorRes, journalRes] = await Promise.all([
        resolveEntity('authors', authorInput),
        resolveEntity('sources', journalInput)
      ]);
      const years = normalizeYears(draft.from, draft.to);
      const finalFilter: FilterState = {
        ...draft,
        from: years.from,
        to: years.to,
        authorId: authorRes.id,
        aName: authorRes.name || '',
        journalId: journalRes.id,
        jName: journalRes.name || ''
      };
      onApply(finalFilter);
      setStatusMessage('');
      onClose();
    } catch {
      setStatusMessage('Filtreler uygulanamadı.');
    }
  };

  const handleClear = () => {
    setDraft({ sel: new Set(), from: '', to: '', authorId: '', journalId: '', aName: '', jName: '', en: true });
    setAuthorInput('');
    setJournalInput('');
    setSearchQuery('');
  };

  const effectiveNodes = getEffectiveNodes(draft.sel);
  const rootGroups = Array.from(new Set(effectiveNodes.map(n => n.root)));
  const curYear = new Date().getFullYear();

  const presets: [string, number, boolean][] = [
    ['Hepsi', 0, !draft.from && !draft.to],
    ['Son 5 yıl', 5, draft.from === String(curYear - 5) && !draft.to],
    ['Son 10 yıl', 10, draft.from === String(curYear - 10) && !draft.to],
    ['2000 sonrası', 2000, draft.from === '2000' && !draft.to]
  ];

  return (
    <SheetShell
      title={langDict.filters_title || 'Filtreler'}
      onClose={onClose}
      footer={
        <div>
          {statusMessage && <p role="status" className="text-xs text-mute mb-2">{statusMessage}</p>}
          <div className="flex gap-2.5">
            <button type="button" onClick={handleClear} className="btn btn-ghost flex-1">{langDict.clear_btn || 'Temizle'}</button>
            <button type="button" onClick={handleApply} className="btn btn-primary flex-[2]">{langDict.apply_btn || 'Uygula'}</button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Seçilen alanlar */}
        {effectiveNodes.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {effectiveNodes.map(node => (
              <button
                key={node.id}
                type="button"
                onClick={() => toggleSelect(node)}
                aria-label={`${node.label} seçimini kaldır`}
                className={`${chipBase} bg-ink text-paper inline-flex items-center gap-1.5`}
              >
                {node.label}
                <X className="w-3.5 h-3.5 opacity-70" />
              </button>
            ))}
          </div>
        )}

        {rootGroups.length > 1 && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-t1 text-on-tone text-sm leading-relaxed">
            <Layers className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <b>{rootGroups.map(r => r?.label).join(' × ')}</b>: önce bu alanların hepsini birlikte ele alan disiplinlerarası yayınlar gösterilir; bittikçe tek tek devam edilir.
            </span>
          </div>
        )}

        {/* Alanlar */}
        <section>
          <label htmlFor="field-search" className="field-label">{langDict.filter_fields || 'Alanlar'}</label>
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-mute" />
            <input
              id="field-search"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Alan veya alt dal ara"
              className="field !pl-10"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
            {TAXONOMY.filter(nodeMatches).map(rootNode => {
              const isSelected = draft.sel.has(rootNode.id);
              const count = countSelectedChildren(rootNode, draft.sel);
              const expanded = openNodes.has(rootNode.id) || (Boolean(normQ) && nodeMatches(rootNode));

              return (
                <div key={rootNode.id} className={`rounded-2xl bg-card border-[1.5px] ${isSelected || count > 0 ? 'border-accent' : 'border-line'}`}>
                  <div className="flex items-center gap-2 pl-4 pr-2 py-2">
                    <button type="button" className="flex-1 min-w-0 text-left min-h-[44px] flex flex-col justify-center" onClick={() => toggleOpen(rootNode.id)} aria-expanded={expanded}>
                      <b className="text-[15px] text-ink">{rootNode.label}</b>
                      <span className="text-xs text-mute">
                        {isSelected ? 'Tüm alan seçili' : count > 0 ? `${count} alt dal seçili` : `${rootNode.children.length} alt dal`}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSelect(rootNode)}
                      aria-pressed={isSelected}
                      className={`${chipBase} ${isSelected ? 'bg-accent text-accent-ink' : 'bg-soft text-ink'}`}
                    >
                      {isSelected ? '✓ Tümü' : 'Tümü'}
                    </button>
                    <button type="button" onClick={() => toggleOpen(rootNode.id)} aria-label="Alt dalları aç veya kapat" className="w-10 h-10 flex items-center justify-center text-mute">
                      <ChevronDown className={`w-5 h-5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {expanded && rootNode.children.length > 0 && (
                    <div className="px-3 pb-3 pt-1 flex flex-wrap gap-1.5 border-t border-line">
                      {rootNode.children.filter(nodeMatches).map(child => {
                        const childSelected = draft.sel.has(child.id);
                        const hasSubChildren = child.children && child.children.length > 0;
                        const subOpen = openNodes.has(child.id) || (Boolean(normQ) && nodeMatches(child));
                        const subSelectedCount = countSelectedChildren(child, draft.sel);

                        return (
                          <div key={child.id} className="flex flex-col gap-1.5 w-full sm:w-auto">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => toggleSelect(child)}
                                className={`${chipBase} ${
                                  childSelected ? 'bg-ink text-paper'
                                  : isSelected ? 'bg-soft text-mute opacity-60 pointer-events-none'
                                  : subSelectedCount > 0 ? 'bg-soft text-ink border-2 border-accent'
                                  : 'bg-soft text-ink'
                                }`}
                              >
                                {child.label}
                                {hasSubChildren && subSelectedCount > 0 && ` (${subSelectedCount})`}
                              </button>
                              {hasSubChildren && (
                                <button type="button" onClick={() => toggleOpen(child.id)} aria-label="Alt dalları göster" className="w-9 h-9 rounded-full flex items-center justify-center text-mute">
                                  <ChevronDown className={`w-4 h-4 transition-transform ${subOpen ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                            </div>

                            {hasSubChildren && subOpen && (
                              <div className="pl-3 py-1 flex flex-wrap gap-1.5 border-l-2 border-line ml-2">
                                {child.children.filter(nodeMatches).map(grandChild => {
                                  const gcSelected = draft.sel.has(grandChild.id);
                                  const gcParentHas = childSelected || isSelected;
                                  return (
                                    <button
                                      key={grandChild.id}
                                      type="button"
                                      onClick={() => toggleSelect(grandChild)}
                                      className={`rounded-full text-[13px] font-semibold min-h-[34px] px-3 ${
                                        gcSelected ? 'bg-ink text-paper'
                                        : gcParentHas ? 'bg-soft text-mute opacity-60 pointer-events-none'
                                        : 'bg-card border border-line text-ink'
                                      }`}
                                    >
                                      {grandChild.label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Yayın yılı */}
        <section>
          <span className="field-label">{langDict.filter_pub_year || 'Yayın yılı'}</span>
          <div className="grid grid-cols-4 gap-1 p-1 bg-soft rounded-2xl mb-2.5" role="radiogroup" aria-label="Yıl aralığı">
            {presets.map(([label, y, active]) => (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => handleYearPreset(y)}
                className={`min-h-[44px] rounded-xl text-[13px] font-bold ${active ? 'bg-ink text-paper' : 'text-mute'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input type="number" inputMode="numeric" min={1000} max={9999} value={draft.from} onChange={(e) => setDraft(prev => ({ ...prev, from: e.target.value }))} placeholder="Başlangıç (örn. 2018)" aria-label="Başlangıç yılı" className="field" />
            <input type="number" inputMode="numeric" min={1000} max={9999} value={draft.to} onChange={(e) => setDraft(prev => ({ ...prev, to: e.target.value }))} placeholder="Bitiş (örn. 2026)" aria-label="Bitiş yılı" className="field" />
          </div>
        </section>

        {/* Yazar ve dergi */}
        <section className="space-y-4">
          <div>
            <label htmlFor="f-author" className="field-label">{langDict.filter_author || 'Yazar'}</label>
            <input id="f-author" type="text" value={authorInput} onChange={(e) => handleAuthorChange(e.target.value)} placeholder="Örn. Daniel Pauly" className="field" />
          </div>
          <div>
            <label htmlFor="f-journal" className="field-label">{langDict.filter_journal || 'Dergi / Kaynak'}</label>
            <input id="f-journal" type="text" value={journalInput} onChange={(e) => handleJournalChange(e.target.value)} placeholder="Örn. Aquaculture" className="field" />
          </div>
          <p className="text-xs text-mute -mt-1">{langDict.filter_hint}</p>
        </section>

        {/* Yalnızca İngilizce */}
        <label className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-line cursor-pointer min-h-[56px]">
          <span className="text-[15px] font-bold text-ink">{langDict.filter_en_only || 'Yalnızca İngilizce makaleler'}</span>
          <input type="checkbox" checked={draft.en} onChange={(e) => setDraft(prev => ({ ...prev, en: e.target.checked }))} className="w-5 h-5 accent-[var(--accent)]" />
        </label>
      </div>
    </SheetShell>
  );
};
