#!/usr/bin/env python3
"""
Yeni tasarım için gereken küçük metin değişikliklerini mevcut dosyalara uygular.
Proje kök klasöründe çalıştır:   python3 apply_patch.py
Her değişiklik tam eşleşme arar; eşleşmezse dosyaya dokunmaz ve seni uyarır.
Birden fazla kez çalıştırmak güvenlidir (zaten uygulanmışsa atlar).
"""
import sys
from pathlib import Path

PATCHES = {
    "src/App.tsx": [
        (
            'className={`flex flex-col h-[100dvh] w-full max-w-[520px] mx-auto bg-[#eef7fb] dark:bg-[#020f1a] text-[#0a2540] dark:text-[#e0f4ff] relative overflow-hidden transition-colors duration-300 ocean-ambient-bg ${eggClass} ${polarClass}`}',
            'className={`app-shell flex flex-col h-[100dvh] w-full max-w-[520px] mx-auto bg-paper text-ink relative overflow-hidden transition-colors duration-300 ${eggClass} ${polarClass}`}',
        ),
        (
            'className="absolute left-3 right-3 bottom-[84px] z-40 flex items-start gap-2 rounded-2xl border border-sky-300/70 dark:border-sky-700/60 bg-white/95 dark:bg-[#0c2d44]/95 text-[#0a2540] dark:text-[#e0f4ff] shadow-lg shadow-sky-900/20 backdrop-blur px-3.5 py-2.5 text-xs leading-relaxed"',
            'className="absolute left-3 right-3 bottom-[104px] z-40 flex items-start gap-2 rounded-2xl border-[1.5px] border-edge bg-card text-ink hard-sm px-3.5 py-3 text-sm leading-relaxed"',
        ),
        (
            'className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[#4a7a96] hover:bg-sky-100 dark:hover:bg-sky-900"',
            'className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-mute hover:bg-soft"',
        ),
        (
            'className="fixed left-1/2 -translate-x-1/2 bottom-24 z-[70] max-w-[88vw] rounded-full bg-[#0a2540] dark:bg-[#e0f4ff] text-white dark:text-[#0a2540] px-4 py-2 text-xs font-semibold shadow-lg"',
            'className="fixed left-1/2 -translate-x-1/2 bottom-28 z-[70] max-w-[88vw] rounded-full bg-ink text-paper px-4 py-2.5 text-sm font-semibold shadow-lg"',
        ),
    ],
    "index.html": [
        (
            '<meta name="theme-color" content="#0369a1" />',
            '<meta name="theme-color" content="#d81b6a" />',
        ),
        (
            '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />',
            '<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&family=Young+Serif&display=swap" rel="stylesheet" />',
        ),
        (
            '<body class="bg-[#eef7fb] dark:bg-[#020f1a] text-[#0a2540] dark:text-[#e0f4ff] antialiased select-none overflow-hidden h-[100dvh]">',
            '<body class="bg-soft text-ink antialiased select-none overflow-hidden h-[100dvh]">',
        ),
    ],
}

ok = True
for rel, items in PATCHES.items():
    p = Path(rel)
    if not p.exists():
        print(f"[HATA] {rel} bulunamadı. Betiği proje kök klasöründe çalıştır.")
        ok = False
        continue
    text = p.read_text(encoding="utf-8")
    changed = False
    for old, new in items:
        if new in text:
            continue  # zaten uygulanmış
        if text.count(old) != 1:
            print(f"[HATA] {rel}: değiştirilecek metin bulunamadı veya birden fazla:\n   {old[:90]}…")
            ok = False
            continue
        text = text.replace(old, new)
        changed = True
    if changed:
        p.write_text(text, encoding="utf-8")
        print(f"[TAMAM] {rel} güncellendi")
    else:
        print(f"[BİLGİ] {rel}: değişiklik gerekmedi")

sys.exit(0 if ok else 1)
