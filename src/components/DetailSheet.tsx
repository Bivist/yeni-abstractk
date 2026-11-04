import React from 'react';
import { Paper } from '../types';
import { OA_STATUS } from '../constants/taxonomy';
import { toneFor } from '../utils/tone';
import { ExternalLink, Share2, Heart } from 'lucide-react';
import { SheetShell } from './SheetShell';

interface DetailSheetProps {
  paper: Paper | null;
  onClose: () => void;
  isTranslating: boolean;
  langDict: Record<string, string>;
  onShare?: (paper: Paper) => void;
  isLiked?: boolean;
  onToggleLike?: (paper: Paper) => void;
  /** Paylaşılan bir bağlantıdan açıldıysa bilgi bandı gösterilir */
  isSharedView?: boolean;
}

export const DetailSheet: React.FC<DetailSheetProps> = ({
  paper,
  onClose,
  isTranslating,
  langDict,
  onShare,
  isLiked = false,
  onToggleLike,
  isSharedView = false
}) => {
  if (!paper) return null;

  const displayTitle = isTranslating && paper.trTitle ? paper.trTitle : paper.title;
  const displayAbs = isTranslating && paper.trAbs ? paper.trAbs : paper.abs;
  const oaLabel = paper.oa ? (OA_STATUS[paper.oa] || paper.oa) + (paper.oa === 'closed' ? '' : ' açık erişim') : '-';

  const stats: [string, React.ReactNode][] = [
    ['Yayın tarihi', paper.date || paper.year],
    ['Erişim', oaLabel],
    ['Atıf sayısı', <span key="c" className="text-accent-fg tabular-nums">{paper.cites.toLocaleString('tr-TR')}</span>],
    ['Kaynakça', <span key="r" className="tabular-nums">{paper.refs} kaynak</span>]
  ];

  return (
    <SheetShell
      title={langDict.details_title || 'Makale ayrıntıları'}
      onClose={onClose}
      headerRight={onShare && (
        <button type="button" onClick={() => onShare(paper)} aria-label={langDict.share_btn || 'Paylaş'} className="btn btn-ghost !px-4">
          <Share2 className="w-4 h-4" />
          {langDict.share_btn || 'Paylaş'}
        </button>
      )}
      footer={
        <div className="flex items-stretch gap-2.5">
          {onToggleLike && (
            <button
              type="button"
              onClick={() => onToggleLike(paper)}
              aria-pressed={isLiked}
              className={`btn !min-h-[52px] shrink-0 border-[1.5px] border-edge ${isLiked ? 'bg-accent text-accent-ink' : 'bg-card text-ink'}`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? (langDict.like_remove || 'Beğenildi') : (langDict.like_add || 'Beğen')}
            </button>
          )}
          {paper.link && (
            <a
              href={paper.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn !min-h-[52px] flex-1 bg-ink text-paper"
            >
              Kaynağında aç
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        {isSharedView && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-t4 text-on-tone text-sm leading-relaxed">
            <Share2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{langDict.shared_banner || 'Bu makale seninle paylaşıldı.'}</span>
          </div>
        )}

        <div className={`${toneFor(paper.sub || paper.field)} text-on-tone rounded-[22px] p-5`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="chip bg-white/60">{paper.sub || paper.field}</span>
            {paper.cross && <span className="chip bg-on-tone !text-white">Ortak alan: {paper.cross}</span>}
            {isTranslating && <span className="chip bg-white/60 ml-auto">🐟 blup</span>}
          </div>
          <h3 className="font-serif text-[24px] leading-[1.18] mt-3">{displayTitle}</h3>
          <p className="text-sm mt-3 font-semibold">{paper.journal}</p>
          {paper.pub && <p className="text-sm">{paper.pub}</p>}
        </div>

        <dl className="grid grid-cols-2 gap-2.5">
          {stats.map(([label, value]) => (
            <div key={label} className="p-3.5 rounded-2xl bg-soft">
              <dt className="text-xs font-semibold text-mute">{label}</dt>
              <dd className="mt-0.5 text-[15px] font-bold text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <section>
          <h4 className="field-label">Özet</h4>
          <p className="text-[15px] leading-[1.7] text-ink">{displayAbs}</p>
        </section>

        <section>
          <h4 className="field-label">Yazarlar ve kurumlar</h4>
          <ul className="space-y-2.5">
            {paper.au && paper.au.length > 0 ? (
              paper.au.map((author, i) => (
                <li key={i} className="text-sm">
                  <b className="text-ink">{author.n}</b>
                  {author.i && <span className="block text-xs text-mute mt-0.5">{author.i}</span>}
                </li>
              ))
            ) : (
              <li className="text-sm text-mute">{paper.authors}</li>
            )}
          </ul>
        </section>

        {paper.kw && paper.kw.length > 0 && (
          <section>
            <h4 className="field-label">Anahtar kelimeler</h4>
            <div className="flex flex-wrap gap-1.5">
              {paper.kw.map(k => <span key={k} className="chip !text-ink bg-soft !font-semibold">{k}</span>)}
            </div>
          </section>
        )}
      </div>
    </SheetShell>
  );
};
