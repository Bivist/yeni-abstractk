# Abstract: yeni tasarım (mantık aynı)

Bu paket, mevcut projenin **yalnızca görünümünü** değiştirir. Arama kademeleri, OpenAlex istekleri,
kaydırma hareketleri, beğeni/klasör, Supabase senkronu, paylaşım, çıktı alma, tur ve kolay yumurtalar
(easter egg) aynen çalışır; `utils/`, `hooks/`, `lib/`, `api/`, `types.ts`, `constants/` dosyalarına dokunulmadı.

## Kurulum (3 adım)
1. Bu zipin içindekileri projenin kök klasörüne, **mevcut dosyaların üzerine** kopyala.
   (Logo/ikon gibi görsel dosyalarına dokunmaz; onlar projede kalır.)
2. Kök klasörde yama betiğini çalıştır:   `python3 apply_patch.py`
   (App.tsx ve index.html içindeki birkaç sınıf adını/yazı tipi bağlantısını günceller.)
3. `npm run lint` ve `npm run build` ile kontrol et.

Git'te denemek istersen önce yeni bir dal aç: `git switch -c yeni-tasarim`

## Tasarım kararları
- Renk: nane-gri zemin, koyu orman yeşili yazı, ibiskus pembesi vurgu; kartlarda limon / şeftali / leylak / nane / pembe pastel bantlar. Koyu mod var.
- Yazı: başlıklarda Young Serif, metinde Figtree (Google Fonts; CSP'ye zaten uygun).
- Gezinme: yüzen alt dock, ortada büyük Keşfet düğmesi. Sıra: Ana sayfa, Beğenilenler, Keşfet, Seyir, Ayarlar.
- Tek "cesur" öğe kaydırma kartı (renkli başlık bandı, sert gölge); diğer her şey sade.
- Erişilebilirlik: dokunma hedefleri en az 44px, vurgu renkleriyle metin kontrastı AA, odak halkası, Esc ile panel kapatma, azaltılmış hareket desteği.

## Yeni / değişen dosyalar
Yeni: `Logo.tsx`, `SheetShell.tsx` (ortak alt panel), `EmptyDeck.tsx` (boş durum), `utils/tone.ts`
Yeniden yazıldı: `index.css`, `TopBar`, `BottomNav`, `HomeScreen`, `DiscoverClassic`, `DiscoverReels`, `LikesScreen`,
`SettingsScreen`, `FilterSheet`, `DetailSheet`, `FolderSheet`, `AuthSheet`, `OnboardingTour`, `IntroSplash`, `ComingSoonLock`, `SeyirPanosu`
Güncellenir (betikle): `App.tsx`, `index.html`; ayrıca `public/manifest.webmanifest`

Artık kullanılmayanlar (isteğe bağlı silebilirsin): `AppIcon.tsx`, `BioluminescentAnglerfish.tsx`, `SeyirHaritasi.tsx`

## Davranış notları
- Beğenilenler'de klasör görünümündeyken "Çıkar" artık doğru makaleyi siler (eskiden klasör filtresinde yanlış sıradaki makale silinebiliyordu). Sıralama okları yalnızca "Tümü" görünümünde gösterilir.
- Ana sayfadaki halka artık doğrudan "bugünkü okuma / günlük hedef" oranını gösterir.
- Kasalot, aurora ve 3B balık/çiçek sürprizleri değişmedi (yalnızca tema renkleri yeni sisteme uyarlandı).
