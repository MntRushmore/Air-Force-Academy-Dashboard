-- Create fitness_records table
create table if not exists public.fitness_records (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    name text not null,
    current_value numeric(10,2),
    target_value numeric(10,2),
    unit text not null,
    date date default now() not null,
    notes text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create fitness goals table
create table if not exists public.fitness_goals (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    target_date date not null,
    pushups_goal integer,
    situps_goal integer,
    pullups_goal integer,
    mile_run_goal interval,
    weight_goal_kg numeric(5,2),
    body_fat_goal_percentage numeric(4,1),
    notes text,
    completed boolean default false,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Create workout_logs table
create table if not exists public.workout_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    date timestamp with time zone not null,
    workout_type text not null,
    duration_minutes integer,
    intensity text check (intensity in ('low', 'medium', 'high')),
    exercises jsonb,
    notes text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.fitness_records enable row level security;
alter table public.fitness_goals enable row level security;
alter table public.workout_logs enable row level security;

-- Create RLS policies
create policy "Users can view their own fitness records"
    on public.fitness_records for select
    using (auth.uid() = user_id);

create policy "Users can insert their own fitness records"
    on public.fitness_records for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own fitness records"
    on public.fitness_records for update
    using (auth.uid() = user_id);

create policy "Users can delete their own fitness records"
    on public.fitness_records for delete
    using (auth.uid() = user_id);

-- Fitness goals policies
create policy "Users can view their own fitness goals"
    on public.fitness_goals for select
    using (auth.uid() = user_id);

create policy "Users can insert their own fitness goals"
    on public.fitness_goals for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own fitness goals"
    on public.fitness_goals for update
    using (auth.uid() = user_id);

create policy "Users can delete their own fitness goals"
    on public.fitness_goals for delete
    using (auth.uid() = user_id);

-- Workout logs policies
create policy "Users can view their own workout logs"
    on public.workout_logs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own workout logs"
    on public.workout_logs for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own workout logs"
    on public.workout_logs for update
    using (auth.uid() = user_id);

create policy "Users can delete their own workout logs"
    on public.workout_logs for delete
    using (auth.uid() = user_id);

-- Create indexes
create index idx_fitness_records_user_id_date on public.fitness_records(user_id, date);
create index idx_fitness_goals_user_id on public.fitness_goals(user_id);
create index idx_workout_logs_user_id_date on public.workout_logs(user_id, date);

-- Add updated_at triggers
create trigger handle_fitness_records_updated_at
    before update on public.fitness_records
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_fitness_goals_updated_at
    before update on public.fitness_goals
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_workout_logs_updated_at
    before update on public.workout_logs
    for each row
    execute procedure public.handle_updated_at(); 