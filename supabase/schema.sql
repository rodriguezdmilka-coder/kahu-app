-- ============================================
-- Kahu - Esquema de Base de Datos
-- Ejecutar este SQL en Supabase SQL Editor
-- ============================================

-- Tabla de perfiles de usuario
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text not null,
  phone text,
  city text not null,
  role text not null check (role in ('rescatista', 'adoptante')),
  created_at timestamptz default now() not null
);

-- Tabla de mascotas
create table public.pets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  species text not null check (species in ('perro', 'gato')),
  breed text,
  age_months integer not null,
  sex text not null check (sex in ('macho', 'hembra')),
  size text not null check (size in ('pequeno', 'mediano', 'grande')),
  description text not null,
  photos text[] default '{}',
  status text not null default 'disponible' check (status in ('disponible', 'en_proceso', 'adoptado')),
  city text not null,
  rescuer_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Tabla de solicitudes de adopcion
create table public.adoption_requests (
  id uuid default gen_random_uuid() primary key,
  adopter_id uuid references public.profiles(id) on delete cascade not null,
  pet_id uuid references public.pets(id) on delete cascade not null,
  message text not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'aceptada', 'rechazada')),
  created_at timestamptz default now() not null,
  unique(adopter_id, pet_id)
);

-- Tabla de conversaciones (se crea al aceptar solicitud)
create table public.conversations (
  id uuid default gen_random_uuid() primary key,
  request_id uuid references public.adoption_requests(id) on delete cascade not null unique,
  rescuer_id uuid references public.profiles(id) on delete cascade not null,
  adopter_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null
);

-- Tabla de mensajes del chat
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.adoption_requests enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Profiles: cualquiera puede ver, solo el dueno puede editar
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Pets: cualquiera puede ver disponibles, rescatistas manejan los suyos
create policy "Available pets are viewable by everyone"
  on public.pets for select using (true);

create policy "Rescuers can insert own pets"
  on public.pets for insert with check (auth.uid() = rescuer_id);

create policy "Rescuers can update own pets"
  on public.pets for update using (auth.uid() = rescuer_id);

create policy "Rescuers can delete own pets"
  on public.pets for delete using (auth.uid() = rescuer_id);

-- Adoption requests: adoptante puede crear/ver suyas, rescatista ve las de sus mascotas
create policy "Adopters can create requests"
  on public.adoption_requests for insert
  with check (auth.uid() = adopter_id);

create policy "Adopters can view own requests"
  on public.adoption_requests for select
  using (auth.uid() = adopter_id);

create policy "Rescuers can view requests for their pets"
  on public.adoption_requests for select
  using (
    exists (
      select 1 from public.pets
      where pets.id = adoption_requests.pet_id
      and pets.rescuer_id = auth.uid()
    )
  );

create policy "Rescuers can update requests for their pets"
  on public.adoption_requests for update
  using (
    exists (
      select 1 from public.pets
      where pets.id = adoption_requests.pet_id
      and pets.rescuer_id = auth.uid()
    )
  );

-- Conversations: participantes pueden ver
create policy "Participants can view conversations"
  on public.conversations for select
  using (auth.uid() = rescuer_id or auth.uid() = adopter_id);

create policy "System can create conversations"
  on public.conversations for insert
  with check (auth.uid() = rescuer_id or auth.uid() = adopter_id);

-- Messages: participantes de la conversacion pueden ver/enviar
create policy "Participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.rescuer_id = auth.uid() or conversations.adopter_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and (conversations.rescuer_id = auth.uid() or conversations.adopter_id = auth.uid())
    )
  );

-- ============================================
-- Indices para performance
-- ============================================
create index idx_pets_status_city on public.pets(status, city);
create index idx_pets_rescuer on public.pets(rescuer_id);
create index idx_requests_pet on public.adoption_requests(pet_id);
create index idx_requests_adopter on public.adoption_requests(adopter_id);
create index idx_messages_conversation on public.messages(conversation_id);

-- ============================================
-- Habilitar Realtime para mensajes
-- ============================================
alter publication supabase_realtime add table public.messages;
