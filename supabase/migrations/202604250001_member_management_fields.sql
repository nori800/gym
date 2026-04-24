alter table public.profiles
  add column if not exists phone_number text,
  add column if not exists address text,
  add column if not exists joined_on date,
  add column if not exists trainer_memo text;

create index if not exists idx_profiles_trainer_display_name
  on public.profiles (trainer_id, display_name);

create index if not exists idx_profiles_display_name
  on public.profiles (display_name);
