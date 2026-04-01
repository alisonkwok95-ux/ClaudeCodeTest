create table recipes (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  cuisine_tag  text,
  servings     integer,
  prep_time    text,
  cook_time    text,
  ingredients  jsonb default '[]'::jsonb,
  steps        jsonb default '[]'::jsonb,
  tips         text,
  is_favourite boolean default false,
  created_at   timestamptz default now()
);

create table recipe_images (
  id            uuid primary key default gen_random_uuid(),
  recipe_id     uuid references recipes(id) on delete cascade,
  storage_path  text not null,
  image_type    text not null check (image_type in ('source', 'my_version')),
  created_at    timestamptz default now()
);

-- Single-user app: disable RLS for simplicity
alter table recipes disable row level security;
alter table recipe_images disable row level security;
