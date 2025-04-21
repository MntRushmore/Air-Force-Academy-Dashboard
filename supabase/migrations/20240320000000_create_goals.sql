-- Create goals table
create table if not exists public.goals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    title text not null,
    description text,
    category text not null,
    status text not null default 'in_progress',
    priority text not null default 'medium',
    due_date timestamptz,
    progress integer default 0,
    created_at timestamptz default now() not null,
    updated_at timestamptz default now() not null
);

-- Add RLS policies
alter table public.goals enable row level security;

create policy "Users can view their own goals"
    on public.goals for select
    using (auth.uid() = user_id);

create policy "Users can insert their own goals"
    on public.goals for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own goals"
    on public.goals for update
    using (auth.uid() = user_id);

create policy "Users can delete their own goals"
    on public.goals for delete
    using (auth.uid() = user_id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger handle_goals_updated_at
    before update on public.goals
    for each row
    execute function public.handle_updated_at(); 