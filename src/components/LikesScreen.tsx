import React from 'react';
import { Paper } from '../types';
import { toneFor, stripSymbol } from '../utils/tone';
import { FolderPlus, Download, Check, Trash2, ArrowUp, ArrowDown, Network, Share2, Heart, X } from 'lucide-react';

interface LikesScreenProps {
  likedPapers: Paper[];
  folders: Record<string, string[]>;
  currentFolder: string;
  onSelectFolder: (folder: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onClearSelection: () => void;
  onOpenNewFolder: () => void;
  onOpenMoveFolder: () => void;
  onExport: (items: Paper[]) => void;
  onOpenMap?: () => void;
  onOpenDetails: (paper: Paper) => void;
  onSharePaper?: (paper: Paper) => void;
  onRemoveLike: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  langDict: Record<string, string>;
}

const smallBtn = 'btn btn-ghost !min-h-[40px] !px-3 !text-[13px]';

export const LikesScreen: React.FC<LikesScreenProps> = ({
  likedPapers,
  folders,
  currentFolder,
  onSelectFolder,
  selectedIds,
  onToggleSelect,
  onClearSelection,
  onOpenNewFolder,
  onOpenMoveFolder,
  onExport,
  onOpenMap,
  onOpenDetails,
  onSharePaper,
  onRemoveLike,
  onMoveUp,
  onMoveDown,
  langDict
}) => {
  const allFolderNames = Array.from(new Set(Object.values(folders).flat()));
  const inAll = currentFolder === '__all__';
  const displayedPapers = inAll
    ? likedPapers
    : likedPapers.filter(p => (folders[p.id] || []).includes(currentFolder));

  const selectedCount = selectedIds.size;
  const selectedPapers = likedPapers.filter(p => selectedIds.has(p.id));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden px-5 max-w-lg min-[900px]:max-w-5xl mx-auto w-full select-none">
      {/* Başlık */}
      <div className="pb-3 space-y-3">
        <div>
          <h1 className="font-serif text-[32px] leading-none text-ink">{langDict.likes_title || 'Beğenilenler'}</h1>
          <p className="text-sm text-mute mt-1.5">{likedPapers.length} {langDict.items_saved || 'makale kaydedildi'}</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenMap && (
            <button type="button" onClick={onOpenMap} className={smallBtn} aria-label="Bilgi haritası">
              <Network className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={onOpenNewFolder} className={smallBtn}>
            <FolderPlus className="w-4 h-4" />
            {stripSymbol(langDict.new_folder_btn || 'Klasör')}
          </button>
          <button type="button" onClick={() => onExport(displayedPapers)} disabled={!displayedPapers.length} className={smallBtn}>
            <Download className="w-4 h-4" />
            {stripSymbol(langDict.export_btn || 'Çıktı al')}
          </button>
        </div>
      </div>

      {/* Klasör sekmeleri */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 shrink-0" role="tablist" aria-label="Klasörler">
        {[{ key: '__all__', label: langDict.all_folder || 'Tümü', count: likedPapers.length }].concat(
          allFolderNames.map(f => ({ key: f, label: f, count: likedPapers.filter(p => (folders[p.id] || []).includes(f)).length }))
        ).map(({ key, label, count }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={currentFolder === key}
            onClick={() => onSelectFolder(key)}
            className={`btn !min-h-[40px] !px-4 whitespace-nowrap ${currentFolder === key ? 'bg-ink text-paper' : 'bg-soft text-ink'}`}
          >
            {label}
            <span className={currentFolder === key ? 'opacity-70' : 'text-mute'}>{count}</span>
          </button>
        ))}
      </div>

      {/* Toplu işlem çubuğu */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-2 p-2 pl-4 mb-3 rounded-2xl bg-ink text-paper text-sm font-bold shrink-0">
          <span className="flex-1">{selectedCount} seçildi</span>
          <button type="button" onClick={onOpenMoveFolder} className="btn !min-h-[40px] !px-3 !text-[13px] bg-paper/15 text-paper">
            {langDict.move_folder_btn || 'Klasöre taşı'}
          </button>
          <button type="button" onClick={() => onExport(selectedPapers)} className="btn !min-h-[40px] !px-3 !text-[13px] bg-paper/15 text-paper">
            {stripSymbol(langDict.export_btn || 'Çıktı al')}
          </button>
          <button type="button" onClick={onClearSelection} aria-label="Seçimi temizle" className="w-10 h-10 rounded-full bg-paper/15 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Liste */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-6">
        {!displayedPapers.length ? (
          <div className="flex flex-col items-center justify-center text-center gap-3 py-16 text-mute">
            <span className="w-16 h-16 rounded-full bg-t5 text-on-tone flex items-center justify-center">
              <Heart className="w-7 h-7" />
            </span>
            <p className="font-serif text-xl text-ink">Burası henüz boş</p>
            <p className="text-sm max-w-[28ch] leading-relaxed">Keşfet’te bir makaleyi sağa kaydırarak ya da kalbe dokunarak kaydedebilirsin.</p>
          </div>
        ) : (
          displayedPapers.map((paper, idx) => {
            const realIdx = likedPapers.indexOf(paper);
            const isSelected = selectedIds.has(paper.id);
            const paperFolders = folders[paper.id] || [];

            return (
              <article
                key={paper.id}
                className={`relative overflow-hidden rounded-[22px] bg-card border pl-5 pr-3 py-4 transition-shadow ${
                  isSelected ? 'border-accent ring-2 ring-accent' : 'border-line'
                }`}
              >
                <span className={`absolute left-0 top-0 bottom-0 w-2 ${toneFor(paper.sub || paper.field)}`} aria-hidden="true" />

                <button
                  type="button"
                  onClick={() => onToggleSelect(paper.id)}
                  aria-label={isSelected ? 'Seçimi kaldır' : 'Seç'}
                  aria-pressed={isSelected}
                  className="absolute top-1 right-1 w-11 h-11 flex items-center justify-center"
                >
                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-accent border-accent text-accent-ink' : 'border-mute/60'}`}>
                    {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={3.5} />}
                  </span>
                </button>

                <h3
                  onClick={() => onOpenDetails(paper)}
                  className="font-serif text-[17px] leading-snug text-ink pr-9 cursor-pointer line-clamp-3"
                >
                  {paper.title}
                </h3>
                <p className="text-sm text-mute mt-1.5 line-clamp-1">{paper.authors}</p>
                <p className="text-xs text-mute line-clamp-1">{paper.journal}, {paper.year}</p>

                {paperFolders.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2.5">
                    {paperFolders.map(fn => <span key={fn} className="chip bg-t4">{fn}</span>)}
                  </div>
                )}

                <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-3 border-t border-line">
                  <button type="button" onClick={() => onOpenDetails(paper)} className="btn btn-ghost !min-h-[40px] !px-3.5 !text-[13px]">Ayrıntı</button>
                  {inAll && (
                    <>
                      <button type="button" onClick={() => onMoveUp(realIdx)} disabled={idx === 0} aria-label="Yukarı taşı" className="w-10 h-10 rounded-full bg-soft text-ink flex items-center justify-center disabled:opacity-30">
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => onMoveDown(realIdx)} disabled={idx === displayedPapers.length - 1} aria-label="Aşağı taşı" className="w-10 h-10 rounded-full bg-soft text-ink flex items-center justify-center disabled:opacity-30">
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {onSharePaper && (
                    <button type="button" onClick={() => onSharePaper(paper)} className="btn btn-ghost !min-h-[40px] !px-3.5 !text-[13px]">
                      <Share2 className="w-3.5 h-3.5" /> {langDict.share_btn || 'Paylaş'}
                    </button>
                  )}
                  <button type="button" onClick={() => onRemoveLike(realIdx)} className="btn !min-h-[40px] !px-3.5 !text-[13px] ml-auto bg-t5 text-on-tone">
                    <Trash2 className="w-3.5 h-3.5" /> Çıkar
                  </button>
                </div>
              </article>
            );
          })
        )}

        <p className="pt-3 text-center text-xs text-mute">© 2026 Binali. Her hakkı saklıdır.</p>
      </div>
    </div>
  );
};
