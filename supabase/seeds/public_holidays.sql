-- Seed data for Malaysian public holidays 2025
-- Includes national holidays and Kuala Lumpur-specific holidays only

INSERT INTO public_holidays (date, name) VALUES
-- National/Federal Holidays (celebrated across Malaysia)
('2025-01-01', 'New Year''s Day'),
('2025-01-29', 'Chinese New Year'),
('2025-01-30', 'Chinese New Year Day 2'),
('2025-03-31', 'Hari Raya Aidilfitri'),
('2025-04-01', 'Hari Raya Aidilfitri Day 2'),
('2025-05-01', 'Labour Day'),
('2025-05-12', 'Wesak Day'),
('2025-06-02', 'Yang di-Pertuan Agong''s Birthday'),
('2025-06-07', 'Hari Raya Haji'),
('2025-06-27', 'Muharram (Islamic New Year)'),
('2025-08-31', 'Merdeka Day (National Day)'),
('2025-09-05', 'Prophet Muhammad''s Birthday'),
('2025-09-16', 'Malaysia Day'),
('2025-10-20', 'Deepavali'),
('2025-12-25', 'Christmas Day'),

-- Kuala Lumpur-specific holidays
('2025-02-01', 'Federal Territory Day'),
('2025-02-11', 'Thaipusam'),
('2025-03-18', 'Nuzul Al-Quran');