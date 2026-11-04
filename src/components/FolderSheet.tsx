import React, { useState } from 'react';
import { Folder, Plus } from 'lucide-react';
import { SheetShell } from './SheetShell';

interface FolderSheetProps {
  isOpen: boolean;
  onClose: () => void;
  folderNames: string[];
  onSelectFolder: (name: string) => void;
  onCreateFolder: (name: string) => void;
  langDict: Record<string, string>;
  isAssigning: boolean;
}

export const FolderSheet: React.FC<FolderSheetProps> = ({
  isOpen,
  onClose,
  folderNames,
  onSelectFolder,
  onCreateFolder,
  langDict,
  isAssigning
}) => {
  const [newFolderName, setNewFolderName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) return;
    onCreateFolder(trimmed);
    setNewFolderName('');
    onClose();
  };

  return (
    <SheetShell title={isAssigning ? 'Makaleyi klasöre taşı' : (langDict.folder_select_title || 'Klasör seç')} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label htmlFor="new-folder" className="field-label">Yeni klasör</label>
          <div className="flex gap-2">
            <input
              id="new-folder"
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Klasör adı"
              className="field flex-1 min-w-0"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <button type="button" onClick={handleCreate} disabled={!newFolderName.trim()} className="btn btn-primary shrink-0">
              <Plus className="w-4 h-4" />
              {langDict.create_btn || 'Oluştur'}
            </button>
          </div>
        </div>

        <div>
          <span className="field-label">Mevcut klasörler</span>
          {!folderNames.length ? (
            <p className="text-sm text-mute py-4 leading-relaxed">Henüz klasör yok. Yukarıdan ilk klasörünü oluşturabilirsin.</p>
          ) : (
            <ul className="space-y-2">
              {folderNames.map(fName => (
                <li key={fName}>
                  <button
                    type="button"
                    onClick={() => { onSelectFolder(fName); onClose(); }}
                    className="w-full min-h-[52px] px-4 rounded-2xl bg-card border border-line flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
                  >
                    <Folder className="w-5 h-5 text-accent-fg" />
                    <span className="text-[15px] font-bold text-ink">{fName}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SheetShell>
  );
};
