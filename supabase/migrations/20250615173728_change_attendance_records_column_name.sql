alter table attendance_records
rename column check_in to clock_in;

alter table attendance_records
rename column check_out to clock_out;