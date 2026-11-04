import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Paper } from '../types';
import { Sparkles, Compass, ZoomIn, ZoomOut, RotateCcw, ExternalLink, BookOpen, Layers, Info } from 'lucide-react';

interface SeyirHaritasiProps {
  papers: Paper[];
  onOpenDetails: (paper: Paper) => void;
  langDict: Record<string, string>;
}

interface StarNode {
  paper: Paper;
  x: number;
  y: number;
  radius: number;
  color: string;
  glowColor: string;
  field: string;
  sectorName: string;
  magnitude: number;
  coordRA: string;
  coordDec: string;
}

interface ConstellationEdge {
  source: StarNode;
  target: StarNode;
  strength: number; // 1 to 3
  reason: string;
}

// Color palette for academic disciplines in the sky
const FIELD_PALETTES: Record<string, { color: string; glow: string; sector: string }> = {
  'Deniz Bilimleri': { color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.7)', sector: 'Oşinografi Kuşağı' },
  'Su Ürünleri': { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.7)', sector: 'Pelajik Sektör' },
  'Biyoloji': { color: '#10b981', glow: 'rgba(16, 185, 129, 0.7)', sector: 'Biyoçeşitlilik Takımyıldızı' },
  'Ziraat': { color: '#84cc16', glow: 'rgba(132, 204, 22, 0.7)', sector: 'Agronomi Takımyıldızı' },
  'Ekoloji': { color: '#14b8a6', glow: 'rgba(20, 184, 166, 0.7)', sector: 'Ekolojik Denge Kolu' },
  'Kimya': { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.7)', sector: 'Moleküler Bulutsu' },
  'Yer ve Gezegen Bilimleri': { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.7)', sector: 'Jeodezi & Batimetri' },
  'Hukuk': { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.7)', sector: 'Deniz Hukuku Takımyıldızı' },
  'default': { color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.7)', sector: 'Kuzey Bilim Kuşağı' }
};

export const SeyirHaritasi: React.FC<SeyirHaritasiProps> = ({
  papers,
  onOpenDetails,
  langDict
}) => {
  // Chart visual style: 'night' (Gece Gökyüzü Takımyıldızı) vs 'portolan' (Eski Portolan Deniz Haritası)
  const [chartTheme, setChartTheme] = useState<'night' | 'portolan'>('night');
  const [selectedStar, setSelectedStar] = useState<StarNode | null>(null);
  const [filterField, setFilterField] = useState<string>('all');

  // Canvas Viewport Pan & Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Fallback demo papers if user has not saved papers yet
  const displayPapers = useMemo(() => {
    if (papers && papers.length > 0) return papers;
    return [
      {
        id: 'star-demo-1',
        title: 'Deep-Sea Bioluminescent Organisms and Bathypelagic Ecology',
        abs: 'Investigation of luminous adaptations among deep benthic and pelagic marine fauna.',
        year: 2024,
        journal: 'Oceanography Letters',
        authors: 'A. Thorne, B. Celik',
        au: [],
        field: 'Deniz Bilimleri',
        kw: ['Biyo-lüminesans', 'Batipelajik', 'Derin Deniz', 'Oşinografi'],
        tp: ['Marine Biology', 'Oceanography'],
        cites: 142,
        refs: 38,
        link: 'https://doi.org/10.1016/j.dsr.2024.104231'
      },
      {
        id: 'star-demo-2',
        title: 'Thermohaline Circulation Patterns in Mediterranean Basins',
        abs: 'Hydrodynamic simulation of deep convective mixing and salinity layers.',
        year: 2023,
        journal: 'Journal of Marine Research',
        authors: 'D. Kaya, M. Valeri',
        au: [],
        field: 'Deniz Bilimleri',
        kw: ['Termohalin', 'Oşinografi', 'Akıntılar', 'Tuzluluk'],
        tp: ['Physical Oceanography'],
        cites: 98,
        refs: 45,
        link: 'https://doi.org/10.1029/2023JC019882'
      },
      {
        id: 'star-demo-3',
        title: 'Microbial Biodiversity in Hydrothermal Vent Sediments',
        abs: 'Metagenomic analysis of barophilic and thermophilic microbial consortia.',
        year: 2025,
        journal: 'Marine Biotechnology',
        authors: 'S. Alkan, E. Novak',
        au: [],
        field: 'Biyoloji',
        kw: ['Derin Deniz', 'Mikrobiyoloji', 'Biyo-lüminesans', 'Genomik'],
        tp: ['Microbiology'],
        cites: 64,
        refs: 29,
        link: 'https://doi.org/10.1007/s10126-025-10214-z'
      },
      {
        id: 'star-demo-4',
        title: 'Sustainable Aquaculture and Marine Protein Synthesis',
        abs: 'Nutrient cycling and microalgae feed optimization in recirculating systems.',
        year: 2024,
        journal: 'Aquacultural Engineering',
        authors: 'B. Demir, K. Jensen',
        au: [],
        field: 'Su Ürünleri',
        kw: ['Su Ürünleri', 'Yetiştiricilik', 'Mikroalg', 'Ekoloji'],
        tp: ['Aquaculture'],
        cites: 76,
        refs: 33,
        link: 'https://doi.org/10.1016/j.aquaeng.2024.102319'
      },
      {
        id: 'star-demo-5',
        title: 'Coastal Marine Spatial Planning and Conservation Corridors',
        abs: 'Evaluating benthic habitat connectivity under varying climate scenarios.',
        year: 2023,
        journal: 'Ecological Indicators',
        authors: 'L. Ross, F. Binali',
        au: [],
        field: 'Ekoloji',
        kw: ['Ekoloji', 'Benthos', 'Resifler', 'Koruma'],
        tp: ['Ecology', 'Conservation'],
        cites: 115,
        refs: 52,
        link: 'https://doi.org/10.1016/j.ecolind.2023.109845'
      },
      {
        id: 'star-demo-6',
        title: 'Maritime Law and Sovereign Rights in Continental Shelf Exploration',
        abs: 'Jurisprudential framework of the United Nations Convention on the Law of the Sea.',
        year: 2022,
        journal: 'Ocean Development & International Law',
        authors: 'C. Arslan, J. Meyer',
        au: [],
        field: 'Hukuk',
        kw: ['Deniz Hukuku', 'Kıta Sahanlığı', 'Münhasır Ekonomik Bölge'],
        tp: ['Maritime Law'],
        cites: 53,
        refs: 22,
        link: 'https://doi.org/10.1080/00908320.2022.2084920'
      }
    ];
  }, [papers]);

  // Unique fields for filter tabs
  const fields = useMemo(() => {
    const set = new Set<string>();
    displayPapers.forEach(p => {
      if (p.field) set.add(p.field);
    });
    return Array.from(set);
  }, [displayPapers]);

  // Generate constellation Star Nodes on a 700x540 virtual coordinate space
  const starNodes: StarNode[] = useMemo(() => {
    const width = 720;
    const height = 540;
    const centerX = width / 2;
    const centerY = height / 2;

    return displayPapers.map((paper, index) => {
      // Deterministic angle & distance based on hash / index and field
      const fieldConfig = FIELD_PALETTES[paper.field] || FIELD_PALETTES['default'];
      const angle = (index / Math.max(1, displayPapers.length)) * Math.PI * 2 + (index % 3) * 0.4;
      const radiusDist = 120 + ((index * 47) % 130);
      
      const x = Math.round(centerX + Math.cos(angle) * radiusDist);
      const y = Math.round(centerY + Math.sin(angle) * (radiusDist * 0.85));

      // Star size based on citations
      const cites = paper.cites || 10;
      const radius = Math.min(13, Math.max(6, 6 + Math.log10(cites + 1) * 2.8));

      // RA / DEC coordinates format (astronomical navigation coordinates)
      const raHours = (12 + (index * 2) % 12).toString().padStart(2, '0');
      const raMins = ((index * 17) % 60).toString().padStart(2, '0');
      const decDeg = ((index % 2 === 0 ? '+' : '-') + ((index * 13) % 75)).padStart(3, '0');

      return {
        paper,
        x,
        y,
        radius,
        color: fieldConfig.color,
        glowColor: fieldConfig.glow,
        field: paper.field || 'Genel Bilim',
        sectorName: fieldConfig.sector,
        magnitude: Math.max(1, (6 - Math.log10(cites + 1)).toFixed(1) as any),
        coordRA: `${raHours}h ${raMins}m`,
        coordDec: `${decDeg}° ${((index * 9) % 60)}'`
      };
    });
  }, [displayPapers]);

  // Generate constellation edges (lines) connecting related stars
  const edges: ConstellationEdge[] = useMemo(() => {
    const list: ConstellationEdge[] = [];

    for (let i = 0; i < starNodes.length; i++) {
      for (let j = i + 1; j < starNodes.length; j++) {
        const a = starNodes[i];
        const b = starNodes[j];

        // Same field connection
        const sameField = a.field === b.field;

        // Shared keywords check
        const kwA = a.paper.kw || [];
        const kwB = b.paper.kw || [];
        const sharedKw = kwA.filter(k => kwB.includes(k));

        if (sameField || sharedKw.length > 0) {
          list.push({
            source: a,
            target: b,
            strength: sharedKw.length > 0 ? 2 : 1,
            reason: sharedKw.length > 0 ? `Ortak Konu: ${sharedKw[0]}` : `Aynı Disiplin (${a.field})`
          });
        }
      }
    }
    return list;
  }, [starNodes]);

  // Touch and Mouse Pan Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const resetViewport = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedStar(null);
  };

  // Filtered stars
  const filteredStars = useMemo(() => {
    if (filterField === 'all') return starNodes;
    return starNodes.filter(s => s.field === filterField);
  }, [starNodes, filterField]);

  const activeStarIds = useMemo(() => {
    return new Set(filteredStars.map(s => s.paper.id));
  }, [filteredStars]);

  // Connected stars to currently selected
  const connectedStarIds = useMemo(() => {
    if (!selectedStar) return null;
    const set = new Set<string>();
    set.add(selectedStar.paper.id);
    edges.forEach(e => {
      if (e.source.paper.id === selectedStar.paper.id) set.add(e.target.paper.id);
      if (e.target.paper.id === selectedStar.paper.id) set.add(e.source.paper.id);
    });
    return set;
  }, [selectedStar, edges]);

  return (
    <div className="flex flex-col h-full w-full select-none relative overflow-hidden bg-[#030d18] text-white">
      {/* Top Header Bar & Controls */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-2 p-3 bg-[#030d18]/90 backdrop-blur-md border-b border-sky-900/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="font-serif text-sm sm:text-base font-bold text-sky-100 flex items-center gap-1.5">
              <span>Seyir Haritası</span>
              <span className="text-[11px] font-sans font-normal text-sky-400/80">· Bilgi Ağı</span>
            </h3>
          </div>
          <p className="text-[10px] text-sky-300/70">
            {displayPapers.length} Yıldız Düğümü · {edges.length} Takımyıldız Hattı
          </p>
        </div>

        {/* Style Switcher & Zoom Controls */}
        <div className="flex items-center gap-1.5">
          {/* Theme mode toggle: Constellation Night vs Portolan Chart */}
          <div className="inline-flex bg-sky-950/80 p-0.5 rounded-lg border border-sky-800/60 text-xs">
            <button
              type="button"
              onClick={() => setChartTheme('night')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                chartTheme === 'night'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-sky-300 hover:text-white'
              }`}
              title="Gece Gökyüzü Takımyıldızı"
            >
              <Sparkles className="w-3 h-3 text-cyan-200" />
              <span>Gökyüzü</span>
            </button>
            <button
              type="button"
              onClick={() => setChartTheme('portolan')}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all flex items-center gap-1 ${
                chartTheme === 'portolan'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-sky-300 hover:text-white'
              }`}
              title="Eski Portolan Deniz Haritası"
            >
              <Compass className="w-3 h-3 text-amber-200" />
              <span>Portolan</span>
            </button>
          </div>

          {/* Zoom In/Out/Reset */}
          <div className="inline-flex bg-sky-950/80 p-0.5 rounded-lg border border-sky-800/60 text-xs">
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(1.8, z + 0.15))}
              className="p-1 hover:text-cyan-300 transition-colors"
              title="Yakınlaştır"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.65, z - 0.15))}
              className="p-1 hover:text-cyan-300 transition-colors"
              title="Uzaklaştır"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={resetViewport}
              className="p-1 hover:text-cyan-300 transition-colors"
              title="Konumu Sıfırla"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Discipline Filter Bar */}
      <div className="relative z-20 px-3 py-1.5 bg-[#041220]/80 backdrop-blur-xs border-b border-sky-950 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
        <button
          type="button"
          onClick={() => setFilterField('all')}
          className={`px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
            filterField === 'all'
              ? 'bg-cyan-500 text-white'
              : 'text-sky-300 hover:text-white bg-sky-950/50'
          }`}
        >
          Tüm Takımyıldız ({starNodes.length})
        </button>
        {fields.map(f => (
          <button
            key={f}
            type="button"
            onClick={() => setFilterField(f)}
            className={`px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              filterField === f
                ? 'bg-cyan-500 text-white'
                : 'text-sky-300 hover:text-white bg-sky-950/50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Main Interactive Map Canvas Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={`flex-1 relative cursor-grab active:cursor-grabbing overflow-hidden ${
          chartTheme === 'night'
            ? 'bg-radial-[at_50%_40%] from-[#081e36] via-[#030e1c] to-[#02070e]'
            : 'bg-[#18130c]'
        }`}
      >
        {/* Background Atmosphere: Twinkling celestial stars or Portolan parchment lines */}
        {chartTheme === 'night' ? (
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Soft decorative astronomical coordinate grid rings */}
            <svg className="w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="celestialGrid" width="80" height="80" patternUnits="userSpaceOnUse">
                  <circle cx="40" cy="40" r="0.75" fill="#38bdf8" />
                  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#0284c7" strokeWidth="0.4" strokeDasharray="3 5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#celestialGrid)" />
            </svg>
          </div>
        ) : (
          /* Portolan Chart Antique Atmosphere */
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="portolanGrid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 100 M 0 0 L 100 100" fill="none" stroke="#d97706" strokeWidth="0.3" strokeDasharray="2 4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#portolanGrid)" />
            </svg>
          </div>
        )}

        {/* Scalable & Pannable Constellation SVG Stage */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-75 origin-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          <svg
            viewBox="0 0 720 540"
            className="w-[720px] h-[540px] shrink-0"
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* Luminous filter for active/selected star */}
              <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="superNovaGlow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Central Compass Rose (Rüzgar Gülü) watermark in center */}
            <g transform="translate(360, 270)" opacity={chartTheme === 'night' ? '0.12' : '0.22'}>
              <circle r="180" fill="none" stroke={chartTheme === 'night' ? '#38bdf8' : '#d97706'} strokeWidth="0.75" strokeDasharray="4 6" />
              <circle r="110" fill="none" stroke={chartTheme === 'night' ? '#38bdf8' : '#d97706'} strokeWidth="0.75" />
              {/* Radiating 16 Rhumb Lines (Kerte Hatları) */}
              {[0, 22.5, 45, 67.5, 90, 112.5, 135, 157.5, 180, 202.5, 225, 247.5, 270, 292.5, 315, 337.5].map(deg => (
                <line
                  key={deg}
                  x1="0"
                  y1="0"
                  x2={Math.cos((deg * Math.PI) / 180) * 260}
                  y2={Math.sin((deg * Math.PI) / 180) * 260}
                  stroke={chartTheme === 'night' ? '#38bdf8' : '#d97706'}
                  strokeWidth="0.5"
                  strokeDasharray="2 4"
                />
              ))}
            </g>

            {/* Constellation Edge Lines */}
            {edges.map((edge, idx) => {
              const isSourceActive = activeStarIds.has(edge.source.paper.id);
              const isTargetActive = activeStarIds.has(edge.target.paper.id);
              if (!isSourceActive || !isTargetActive) return null;

              const isHighlighted =
                selectedStar &&
                (edge.source.paper.id === selectedStar.paper.id ||
                  edge.target.paper.id === selectedStar.paper.id);

              const strokeColor =
                chartTheme === 'night'
                  ? isHighlighted
                    ? '#38bdf8'
                    : 'rgba(56, 189, 248, 0.28)'
                  : isHighlighted
                  ? '#d97706'
                  : 'rgba(217, 119, 6, 0.22)';

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={edge.source.x}
                    y1={edge.source.y}
                    x2={edge.target.x}
                    y2={edge.target.y}
                    stroke={strokeColor}
                    strokeWidth={isHighlighted ? 2 : 1}
                    strokeDasharray={isHighlighted ? 'none' : '4 3'}
                  />
                  {/* Subtle navigation pulse node on highlighted lines */}
                  {isHighlighted && (
                    <circle
                      cx={(edge.source.x + edge.target.x) / 2}
                      cy={(edge.source.y + edge.target.y) / 2}
                      r="2"
                      fill="#ffffff"
                      opacity="0.8"
                    />
                  )}
                </g>
              );
            })}

            {/* Constellation Star Nodes */}
            {starNodes.map(star => {
              const isVisible = activeStarIds.has(star.paper.id);
              const isSelected = selectedStar?.paper.id === star.paper.id;
              const isConnected = connectedStarIds ? connectedStarIds.has(star.paper.id) : true;
              const opacity = !isVisible ? 0.15 : isConnected ? 1 : 0.25;

              return (
                <g
                  key={star.paper.id}
                  transform={`translate(${star.x}, ${star.y})`}
                  opacity={opacity}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStar(star);
                  }}
                  className="cursor-pointer transition-opacity duration-300"
                >
                  {/* Star Atmospheric Glow Aura */}
                  <circle
                    r={isSelected ? star.radius * 2.8 : star.radius * 1.8}
                    fill={star.glowColor}
                    opacity={isSelected ? 0.9 : 0.3}
                    filter="url(#starGlow)"
                    className={isSelected ? "animate-pulse" : ""}
                  />

                  {/* Star Outer Ring / Coordinate Marker */}
                  <circle
                    r={star.radius + (isSelected ? 3 : 1)}
                    fill="none"
                    stroke={isSelected ? "#ffffff" : star.color}
                    strokeWidth={isSelected ? 1.8 : 0.8}
                  />

                  {/* Core Star Body */}
                  <circle
                    r={star.radius}
                    fill={isSelected ? "#ffffff" : star.color}
                    filter={isSelected ? "url(#superNovaGlow)" : undefined}
                  />

                  {/* Label (Star Title or Field) */}
                  <text
                    y={star.radius + 12}
                    textAnchor="middle"
                    fill={chartTheme === 'night' ? '#e0f2fe' : '#fde68a'}
                    fontSize={isSelected ? "11px" : "9px"}
                    fontWeight={isSelected ? "bold" : "normal"}
                    className="pointer-events-none select-none drop-shadow-md"
                  >
                    {star.paper.title.slice(0, 18)}…
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Empty state hint if user has few papers */}
        {papers.length === 0 && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-72 bg-sky-950/85 backdrop-blur-md border border-cyan-500/40 rounded-xl p-2.5 text-xs text-sky-200 pointer-events-none shadow-lg">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-0.5">
              <Info className="w-3.5 h-3.5" />
              <span>Örnek Keşif Haritası</span>
            </div>
            <span>Makaleleri beğendikçe kişisel takım-yıldız bilgi ağınız burada otomatik olarak dallanıp parlayacak.</span>
          </div>
        )}
      </div>

      {/* Selected Star Details Card (Nautical Constellation Preview Sheet) */}
      {selectedStar && (
        <div className="relative z-30 p-3 sm:p-4 bg-[#041424]/95 backdrop-blur-lg border-t border-sky-800/60 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedStar.color }}
                />
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  {selectedStar.sectorName}
                </span>
                <span className="text-[10px] text-sky-400/70 font-mono">
                  [{selectedStar.coordRA} · {selectedStar.coordDec}]
                </span>
              </div>

              <h4 className="font-serif text-sm sm:text-base font-bold text-white line-clamp-2 leading-snug">
                {selectedStar.paper.title}
              </h4>

              <div className="flex items-center gap-2 text-xs text-sky-300/80 mt-1">
                <span className="truncate">{selectedStar.paper.authors}</span>
                <span>·</span>
                <span>{selectedStar.paper.year}</span>
                <span>·</span>
                <span className="font-semibold text-cyan-300">
                  {selectedStar.paper.cites} Atıf
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedStar(null)}
              className="p-1 rounded-lg text-sky-400 hover:text-white hover:bg-sky-900/40 text-xs"
              title="Kapat"
            >
              ✕
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-sky-900/50">
            <button
              type="button"
              onClick={() => onOpenDetails(selectedStar.paper)}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40 active:scale-95 transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ayrıntılı Makale Bilgisi</span>
            </button>

            {selectedStar.paper.link && (
              <a
                href={selectedStar.paper.link}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 rounded-xl bg-sky-950 border border-sky-800 text-sky-200 hover:text-white text-xs font-semibold flex items-center gap-1"
                title="Kaynağa Git"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Kaynak</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
