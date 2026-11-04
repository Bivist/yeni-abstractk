# Abstract

Akademik yayınları OpenAlex üzerinden keşfetmek, filtrelemek, kaydetmek, klasörlemek ve paylaşmak için React + Vite uygulaması.

## Geliştirme

```bash
npm ci
npm run dev
```

Kontroller:

```bash
npm run lint
npm run build
```

## Supabase (isteğe bağlı hesap ve bulut eşitleme)

1. Supabase projesi oluştur veya eski Abstract projesiyle aynı Supabase projesini kullan.
2. `supabase/schema.sql` dosyasını Supabase SQL Editor'da çalıştır.
3. `.env.example` dosyasını `.env.local` olarak kopyala ve Supabase URL ile Publishable/anon anahtarını ekle.
4. Vercel'e dağıtıyorsan aynı değişkenleri Vercel > Project Settings > Environment Variables bölümüne ekle ve yeniden dağıt.

Supabase değişkenleri yoksa uygulama misafir/yerel modda çalışır; hesapla eşitleme ve profil fotoğrafı özellikleri devre dışı kalır.

## Özellikler

- OpenAlex üzerinden akademik yayın keşfi
- Alan, yıl, yazar ve dergi filtreleri; çoklu alanlarda ortak yayın önceliği ve alan bazlı devam
- Kısmi yazar adı araması (ör. yalnızca ad veya soyad)
- Klasik kart ve akış modları
- Beğeniler, klasörler, dışa aktarma ve makale paylaşımı
- Makale ayrıntıları, çeviri ve ses efektleri
- Supabase ile hesap, bulut eşitleme ve profil fotoğrafı
- Otomatik / mobil / masaüstü düzeni
- Gizli sürprizler ve uygulama turu

## Dağıtım

Vercel projesini bu deponun `main` dalına bağla. `vercel.json`, makale paylaşım önizlemeleri için `/paper/:id` ve sitemap için `/sitemap.xml` yönlendirmelerini içerir.
