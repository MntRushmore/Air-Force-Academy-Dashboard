-- Create study_sessions table
create table if not exists public.study_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    subject varchar(255) not null,
    topic varchar(255) not null,
    duration_minutes integer not null,
    start_time timestamp with time zone not null,
    end_time timestamp with time zone not null,
    productivity_rating integer check (productivity_rating between 1 and 5),
    notes text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create RLS policies
alter table public.study_sessions enable row level security;

create policy "Users can view their own study sessions"
    on public.study_sessions
    for select
    using (auth.uid() = user_id);

create policy "Users can insert their own study sessions"
    on public.study_sessions
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own study sessions"
    on public.study_sessions
    for update
    using (auth.uid() = user_id);

create policy "Users can delete their own study sessions"
    on public.study_sessions
    for delete
    using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_study_sessions_updated_at
    before update on public.study_sessions
    for each row
    execute procedure public.handle_updated_at();

-- Create study subjects enum type
create type study_subject as enum (
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Computer Science',
    'Foreign Language',
    'Other'
);

-- Add indexes for better query performance
create index idx_study_sessions_user_id on public.study_sessions(user_id);
create index idx_study_sessions_subject on public.study_sessions(subject);
create index idx_study_sessions_start_time on public.study_sessions(start_time); 