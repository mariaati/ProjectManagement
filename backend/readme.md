-- Create projectDB

-- USERS table (for both Admins and Students)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL, -- For login
    password VARCHAR(255) NOT NULL,       -- Hashed password
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'student')), -- Role-based access
    program VARCHAR(100),                 -- Only applicable for students
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TECHNOLOGIES table
CREATE TABLE technologies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,  -- Technology name (e.g., React, Node.js)
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FACULTIES table
CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PROJECTS table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    main_topic VARCHAR(100),
    description TEXT,
    submission_year INT,
    study_track VARCHAR(100),
    faculty_id INT REFERENCES faculties(id) ON DELETE CASCADE,
    github_link VARCHAR(255),
    live_link VARCHAR(255),
    youtube_link VARCHAR(255),
    document_link VARCHAR(255),
    media JSONB,  -- Store multiple images/videos in JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_ratings (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES projects(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (project_id, user_id)  -- ensures one rating per user per project
);


-- JUNCTION TABLE for many-to-many relationship
CREATE TABLE project_technologies (
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    technology_id INT REFERENCES technologies(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, technology_id)
);


-- PROJECT_USERS table (Many-to-Many: Projects ↔ Users)
CREATE TABLE project_users (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users with bcrypt-hashed passwords(test123)
INSERT INTO users (name, username, password, role, program)
VALUES
-- Admins
('Alice Johnson', 'admin', '$2b$10$hB7VpHSjIHLPdGxN3fY5S.t9YV/FFrBk3ar/EiI5T2v79FG5K0cLG', 'admin', NULL),
('Bob Smith', 'admin2', '$2b$10$hB7VpHSjIHLPdGxN3fY5S.t9YV/FFrBk3ar/EiI5T2v79FG5K0cLG', 'admin', NULL),

-- Students
('Charlie Brown', 'student1', '$2b$10$hB7VpHSjIHLPdGxN3fY5S.t9YV/FFrBk3ar/EiI5T2v79FG5K0cLG', 'student', 'Computer Science'),
('Diana Prince', 'student2', '$2b$10$hB7VpHSjIHLPdGxN3fY5S.t9YV/FFrBk3ar/EiI5T2v79FG5K0cLG', 'student', 'Electronics and Communication'),
('Ethan Hunt', 'student3', '$2b$10$hB7VpHSjIHLPdGxN3fY5S.t9YV/FFrBk3ar/EiI5T2v79FG5K0cLG', 'student', 'Information Systems');



-- Insert sample faculties
INSERT INTO faculties (name, description)
VALUES
('Computer Science', 'Faculty of Computer Science offering programs in AI, Software Engineering, and Data Science'),
('Electronics and Communication', 'Faculty focusing on embedded systems, IoT, and communication technologies'),
('Information Systems', 'Faculty specializing in information systems, business analytics, and enterprise solutions');


-- Insert sample projects
INSERT INTO projects (
    title, main_topic, description, submission_year, study_track, faculty_id,
    github_link, live_link, youtube_link, document_link, media
) VALUES 
(
    'AI-powered Chatbot for Student Support',
    'Artificial Intelligence',
    'A chatbot system designed to assist students with FAQs, schedules, and academic support using NLP.',
    2024,
    'Computer Science',
    1,
    'https://github.com/example/ai-chatbot',
    'https://student-support.example.com',
    'https://youtube.com/watch?v=abcd1234',
    'https://example.com/docs/ai-chatbot.pdf',
    '{
        "images": [],
        "videos": []
    }'::jsonb
),
(
    'Smart Agriculture Monitoring System',
    'IoT',
    'An IoT-based system for monitoring soil moisture, temperature, and humidity to improve crop yield.',
    2023,
    'Electronics and Communication',
    2,
    'https://github.com/example/smart-agriculture',
    'https://smartfarm.example.com',
    'https://youtube.com/watch?v=wxyz5678',
    'https://example.com/docs/smart-agriculture.pdf',
    '{
        "images": [],
        "videos": []
    }'::jsonb
),
(
    'Online Course Recommendation Platform',
    'Machine Learning',
    'A recommendation engine that suggests personalized courses to students based on their program and past performance.',
    2025,
    'Information Systems',
    3,
    'https://github.com/example/course-recommender',
    'https://courses.example.com',
    'https://youtube.com/watch?v=qwer7890',
    'https://example.com/docs/course-recommender.pdf',
    '{
        "images": [],
        "videos": []
    }'::jsonb
);
