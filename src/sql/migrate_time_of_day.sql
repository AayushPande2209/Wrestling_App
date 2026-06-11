-- Migrate time_of_day values: before_practice/after_practice → afternoon
-- Drop the old constraint first so the UPDATE isn't blocked by it.

-- Step 1: drop old constraint
alter table public.weight_logs
  drop constraint weight_logs_time_of_day_check;

-- Step 2: migrate existing rows
update public.weight_logs
set time_of_day = 'afternoon'
where time_of_day in ('before_practice', 'after_practice');

-- Step 3: add new constraint
alter table public.weight_logs
  add constraint weight_logs_time_of_day_check
  check (time_of_day in ('morning', 'afternoon', 'night'));
