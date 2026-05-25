-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── profiles ─────────────────────────────────────────────────
create table profiles (
  id               uuid primary key references auth.users on delete cascade,
  First_name        text,
  Last_name         text,
  email            text not null,
  phone            text,
  delivery_address text,
  tinipoints       int  not null default 0,
  created_at       timestamptz default now()
);

alter table profiles enable row level security;
create policy "read own profile"   on profiles for select using (auth.uid() = id);
create policy "update own profile" on profiles for update using (auth.uid() = id);

-- ── categories ───────────────────────────────────────────────
create table categories (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text not null unique,
  description     text,
  cover_image_url text
);

alter table categories enable row level security;
create policy "public read categories" on categories for select using (true);

-- ── products ─────────────────────────────────────────────────
create table products (
  id             uuid    primary key default uuid_generate_v4(),
  category_id    uuid    references categories on delete set null,
  name           text    not null,
  description    text,
  price          numeric not null,
  stock_count    int     not null default 0,
  image_urls     text[]  not null default '{}',
  tags           text[]  not null default '{}',
  color_variants text[]  not null default '{}',
  is_active      boolean not null default true,
  is_hot_deal    boolean not null default false,
  is_new_arrival boolean not null default false,
  created_at     timestamptz default now()
);

alter table products enable row level security;
create policy "public read active products" on products for select using (is_active = true);

-- ── product_images ────────────────────────────────────────────
create table product_images (
  id           uuid primary key default uuid_generate_v4(),
  product_id   uuid references products on delete cascade,
  storage_path text    not null,
  public_url   text    not null,
  is_primary   boolean not null default false
);

alter table product_images enable row level security;
create policy "public read product images" on product_images for select using (true);

-- ── orders ────────────────────────────────────────────────────
create table orders (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users on delete set null,
  status           text not null default 'cart'
                   check (status in ('cart','in_transit','to_be_shipped','completed')),
  total_amount     numeric not null,
  delivery_address text    not null,
  mpesa_ref        text,
  payment_status   text not null default 'pending'
                   check (payment_status in ('pending','paid','failed')),
  created_at       timestamptz default now()
);
alter table orders enable row level security;
create policy "users read own orders"   on orders for select using (auth.uid() = user_id);
create policy "users insert own orders" on orders for insert with check (auth.uid() = user_id);

-- ── order_items ───────────────────────────────────────────────
create table order_items (
  id             uuid    primary key default uuid_generate_v4(),
  order_id       uuid    references orders   on delete cascade,
  product_id     uuid    references products on delete set null,
  quantity       int     not null,
  unit_price     numeric not null,
  color_selected text
);
alter table order_items enable row level security;
create policy "users read own order items" on order_items for select
  using (auth.uid() = (select user_id from orders where id = order_id));

-- ── cart_items ────────────────────────────────────────────────
create table cart (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references auth.users on delete cascade,
  product_id     uuid references products   on delete cascade,
  quantity       int  not null default 1,
  color_selected text,
  added_at       timestamptz default now(),
  unique (user_id, product_id)
);

alter table cart enable row level security;
create policy "users manage own cart" on cart
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── favorites ─────────────────────────────────────────────────
create table favorites (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid references auth.users on delete cascade,
  product_id uuid references products   on delete cascade,
  saved_at   timestamptz default now(),
  unique (user_id, product_id)
);
alter table favorites enable row level security;
create policy "users manage own favorites" on favorites
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── seed categories ───────────────────────────────────────────
insert into categories (name, slug) values
  ('New Arrivals', 'new-arrivals'),
  ('Hot Products', 'hot-products'),
  ('Fans',         'fans'),
  ('Toys',         'toys'),
  ('Lamps',        'lamps'),
  ('Lighters',     'lighters'),
  ('Jewellery',    'jewellery');
