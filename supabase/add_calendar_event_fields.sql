alter table public.calendar_events
  add column if not exists start_time text not null default '09:00',
  add column if not exists end_time text not null default '10:00',
  add column if not exists type text not null default 'important',
  add column if not exists completed boolean not null default false;

update public.calendar_events
set
  start_time = coalesce(start_time, '09:00'),
  end_time = coalesce(end_time, '10:00'),
  type = case
    when type in ('important', 'meeting', 'deadline', 'reminder') then type
    else 'important'
  end,
  completed = coalesce(completed, false);

alter table public.calendar_events
  alter column start_time set default '09:00',
  alter column end_time set default '10:00',
  alter column type set default 'important',
  alter column completed set default false;
