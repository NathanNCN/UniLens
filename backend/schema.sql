-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    Uni VARCHAR(255) NOT NULL,
    Program VARCHAR(255) NOT NULL,
    GPA DECIMAL(4,2) NOT NULL,
    Extra TEXT,
    Awards TEXT,
    Location VARCHAR(255),
    Tips TEXT,
    Other TEXT,
    Year INTEGER NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_uni ON applications(uni);
CREATE INDEX IF NOT EXISTS idx_applications_program ON applications(program);
CREATE INDEX IF NOT EXISTS idx_applications_year ON applications(year);

-- Add some sample data from mock.csv
INSERT INTO applications (uni, program, gpa, extra, awards, location, other, year)
VALUES 
    ('University of Waterloo', 'Mathamatics CO-OP', 95.00, 'Wrestling, Chess club and anime club', 'Outstanding Waterloo Student Award, MVP of wrestling and President''s Scholarship of Distinction', 'Kitchener, ON', 'Was the team captain of my wrestling team for two years straight. Was undefeated and only lost during OFSSA my final year.', 2024),
    ('Western University', 'Computer Science', 90.00, 'Varsity soccer team, chess club, Varsity basketball team', 'None', 'Kicthener, ON', 'Did the ESQ at UW and did French immersion', 2024); 

CREATE TABLE IF NOT EXISTS users (
    UUID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    Name TEXT NOT NULL,
    Email TEXT UNIQUE NOT NULL
);