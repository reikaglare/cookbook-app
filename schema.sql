-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CATEGORIES TABLE
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  color text not null,
  icon text not null,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure display_order column exists if table was already created
alter table categories add column if not exists display_order integer default 0;

-- Update categories with "natural" order
update categories set display_order = 1 where name = 'Antipasti';
update categories set display_order = 2 where name = 'Primi piatti';
update categories set display_order = 3 where name = 'Secondi';
update categories set display_order = 4 where name = 'Contorni';
update categories set display_order = 5 where name = 'Dolci';
update categories set display_order = 6 where name = 'Bevande';

-- RECIPES TABLE
create table if not exists recipes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category_id uuid references categories(id),
  prep_time integer, -- minutes
  cook_time integer, -- minutes
  servings integer,
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard', 'Expert')),
  image_url text,
  ingredients jsonb, -- array of objects { item, quantity, unit }
  instructions jsonb, -- array of strings or objects
  tags text[],
  is_favorite boolean default false,
  is_public boolean default false, -- NEW: allows public sharing
  share_token text unique, -- NEW: unique token for public access
  nutrition jsonb, -- NEW: stored nutritional information
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure nutrition column exists if table was already created
alter table recipes add column if not exists nutrition jsonb;

-- ROW LEVEL SECURITY

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table recipes enable row level security;

-- PROFILES POLICIES
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- CATEGORIES POLICIES
drop policy if exists "Categories are viewable by everyone." on categories;
create policy "Categories are viewable by everyone."
  on categories for select
  using ( true );

-- RECIPES POLICIES
drop policy if exists "Users can view own recipes." on recipes;
create policy "Users can view own recipes."
  on recipes for select
  using ( auth.uid() = user_id );

drop policy if exists "Public recipes are viewable by everyone via share token." on recipes;
create policy "Public recipes are viewable by everyone via share token."
  on recipes for select
  using ( is_public = true );

drop policy if exists "Users can insert own recipes." on recipes;
create policy "Users can insert own recipes."
  on recipes for insert
  with check ( auth.uid() = user_id );

drop policy if exists "Users can update own recipes." on recipes;
create policy "Users can update own recipes."
  on recipes for update
  using ( auth.uid() = user_id );

drop policy if exists "Users can delete own recipes." on recipes;
create policy "Users can delete own recipes."
  on recipes for delete
  using ( auth.uid() = user_id );

-- Handle new user creation (auto-create profile)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $body$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$body$;

-- Safely create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SHOPPING LIST TABLE
create table if not exists shopping_list (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  item text not null,
  quantity text,
  unit text,
  is_bought boolean default false,
  recipe_id uuid references recipes(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table shopping_list enable row level security;

-- SHOPPING LIST POLICIES
create policy "Users can view own shopping list."
  on shopping_list for select
  using ( auth.uid() = user_id );

create policy "Users can insert own shopping list."
  on shopping_list for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own shopping list."
  on shopping_list for update
  using ( auth.uid() = user_id );

create policy "Users can delete own shopping list."
  on shopping_list for delete
  using ( auth.uid() = user_id );
