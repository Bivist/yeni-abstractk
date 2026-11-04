-- Abstract: bulut senkronu tablosu.
-- Supabase paneli > SQL Editor'e yapıştırıp bir kez çalıştır.

create table if not exists public.user_data (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  liked      jsonb not null default '[]'::jsonb,
  folders    jsonb not null default '{}'::jsonb,
  history    jsonb not null default '[]'::jsonb,
  streak     jsonb not null default '{}'::jsonb,
  settings   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

-- Her kullanıcı yalnızca kendi satırını görebilir / yazabilir.
drop policy if exists "user_data_select_own" on public.user_data;
create policy "user_data_select_own" on public.user_data
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "user_data_insert_own" on public.user_data;
create policy "user_data_insert_own" on public.user_data
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "user_data_update_own" on public.user_data;
create policy "user_data_update_own" on public.user_data
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_data_delete_own" on public.user_data;
create policy "user_data_delete_own" on public.user_data
  for delete to authenticated using (auth.uid() = user_id);


-- Profil fotoğrafları: herkese açık okuma, yalnızca kullanıcı kendi klasörüne yazabilir.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "avatar_public_read" on storage.objects;
create policy "avatar_public_read" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "avatar_insert_own_folder" on storage.objects;
create policy "avatar_insert_own_folder" on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatar_update_own_folder" on storage.objects;
create policy "avatar_update_own_folder" on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avatar_delete_own_folder" on storage.objects;
create policy "avatar_delete_own_folder" on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
