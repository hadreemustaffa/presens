alter table attendance_summaries
add column leave_days INTEGER default 0,
add column leave_rate NUMERIC(5, 2) default 0,
add column leave_dates JSONB default '[]',
add column avg_lunch_minutes INTEGER default 0,
add column home_days INTEGER NOT NULL DEFAULT 0,         
add column office_days INTEGER NOT NULL DEFAULT 0,
drop column generated_at,
add column created_at timestamp with time zone default timezone('utc'::text, now()) not null,
add column updated_at timestamp with time zone default timezone('utc'::text, null);

create trigger handle_updated_at before
update on public.attendance_summaries for each row
execute procedure moddatetime (updated_at);


         
