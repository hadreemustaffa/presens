alter table attendance_records
alter column employee_id set not null;

alter table attendance_records
alter column work_date set not null;

alter table attendance_records
alter column clock_in set not null;

alter table attendance_records
alter column work_mode set not null;