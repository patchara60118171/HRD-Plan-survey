alter table public.hrd_ch1_responses
add column if not exists google_sync_status text,
add column if not exists google_sync_attempts integer not null default 0,
add column if not exists google_sync_error text,
add column if not exists google_sync_requested_at timestamptz,
add column if not exists google_synced_at timestamptz,
add column if not exists google_sheet_row_number integer,
add column if not exists google_drive_sync_status text,
add column if not exists google_drive_synced_at timestamptz,
add column if not exists google_drive_error text,
add column if not exists google_drive_files jsonb not null default '[]'::jsonb;

update public.hrd_ch1_responses
set
    google_sync_requested_at = coalesce(google_sync_requested_at, now()),
    google_sync_status = coalesce(
        google_sync_status,
        case
            when created_at is null then 'draft'
            else 'pending'
        end
    ),
    google_drive_sync_status = coalesce(
        google_drive_sync_status,
        case
            when created_at is null then 'draft'
            when coalesce(strategy_file_url, '') <> ''
              or coalesce(org_structure_file_url, '') <> ''
              or coalesce(hrd_plan_file_url, '') <> '' then 'pending'
            else 'completed'
        end
    );

create or replace function public.set_ch1_google_sync_defaults()
returns trigger
language plpgsql
as $$
begin
    new.google_sync_requested_at := now();
    new.google_sync_attempts := 0;
    new.google_sync_error := null;
    new.google_synced_at := null;
    new.google_sheet_row_number := null;
    new.google_sync_status := case
        when new.created_at is null then 'draft'
        else 'pending'
    end;

    new.google_drive_synced_at := null;
    new.google_drive_error := null;
    new.google_drive_files := '[]'::jsonb;
    new.google_drive_sync_status := case
        when new.created_at is null then 'draft'
        when coalesce(new.strategy_file_url, '') <> ''
          or coalesce(new.org_structure_file_url, '') <> ''
          or coalesce(new.hrd_plan_file_url, '') <> '' then 'pending'
        else 'not_applicable'
    end;

    return new;
end;
$$;

drop trigger if exists trg_set_ch1_google_sync_defaults on public.hrd_ch1_responses;

create trigger trg_set_ch1_google_sync_defaults
before insert on public.hrd_ch1_responses
for each row
execute function public.set_ch1_google_sync_defaults();

create index if not exists idx_ch1_google_sync_status
on public.hrd_ch1_responses (google_sync_status, google_drive_sync_status, created_at desc);

create or replace view public.ch1_google_sync_queue as
select *
from public.hrd_ch1_responses
where created_at is not null
  and (
    google_sync_status in ('pending', 'failed')
    or google_drive_sync_status in ('pending', 'failed')
  );
