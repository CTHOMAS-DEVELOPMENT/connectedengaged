-- Create a new user and grant privileges (if needed)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'interactone') THEN
        CREATE USER interactone WITH ENCRYPTED PASSWORD 'one_password';
    END IF;
END
$$;

GRANT ALL PRIVILEGES ON DATABASE interactwithme2 TO interactone;

-- Create ENUM types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sex_type') THEN
        CREATE TYPE sex_type AS ENUM ('Male', 'Female', 'Other');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'connection_request_status') THEN
        CREATE TYPE connection_request_status AS ENUM ('pending', 'accepted', 'declined');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'floats_my_boaty_type') THEN
        CREATE TYPE floats_my_boaty_type AS ENUM ('Take orders or give them', 'Nourish or be nourished', 'Other (Not Listed)');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'hobby_type') THEN
        CREATE TYPE hobby_type AS ENUM ('Arts', 'Collecting', 'Cooking', 'Crafting', 'Dance', 'Education', 'Fitness', 'Gaming', 'Gardening', 'Meditation', 'Music', 'Other', 'Photography', 'Reading', 'Sports', 'Technology', 'The Unknown', 'Travel', 'Volunteering', 'Writing');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sexual_orientation_type') THEN
        CREATE TYPE sexual_orientation_type AS ENUM ('Heterosexual', 'Homosexual', 'Lesbian', 'Undisclosed');
    END IF;
END
$$;

-- Create users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username CHARACTER VARYING(50) NOT NULL UNIQUE,
            email CHARACTER VARYING(100) NOT NULL UNIQUE,
            password CHARACTER VARYING(255) NOT NULL,
            profile_picture CHARACTER VARYING(255),
            profile_video CHARACTER VARYING(255),
            token CHARACTER VARYING(255),
            sexual_orientation sexual_orientation_type DEFAULT 'Undisclosed',
            hobbies hobby_type DEFAULT 'Other',
            floats_my_boat floats_my_boaty_type DEFAULT 'Other (Not Listed)',
            sex sex_type DEFAULT 'Other',
            about_you text,
            about_my_bot_pal text
        );
    END IF;
END
$$;

-- Create connections table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connections') THEN
        CREATE TABLE connections (
            id SERIAL PRIMARY KEY,
            user_one_id INTEGER NOT NULL REFERENCES users(id),
            user_two_id INTEGER NOT NULL REFERENCES users(id),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT chk_user_order CHECK (user_one_id < user_two_id),
            CONSTRAINT chk_users_not_equal CHECK (user_one_id <> user_two_id)
        );
    END IF;
END
$$;

-- Create user_submissions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_submissions') THEN
        CREATE TABLE user_submissions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id),
            title TEXT NOT NULL,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            lastuser_addition TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END
$$;

-- Create submission_members table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submission_members') THEN
        CREATE TABLE submission_members (
            id SERIAL PRIMARY KEY,
            submission_id INTEGER REFERENCES user_submissions(id),
            participating_user_id INTEGER NOT NULL
        );
    END IF;
END
$$;

-- Create submission_dialog table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'submission_dialog') THEN
        CREATE TABLE submission_dialog (
            id SERIAL PRIMARY KEY,
            submission_id INTEGER REFERENCES user_submissions(id),
            posting_user_id INTEGER NOT NULL,
            text_content TEXT,
            type VARCHAR(50),
            uploaded_path CHARACTER VARYING(500),
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END
$$;

-- Create connection_requests table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'connection_requests') THEN
        CREATE TABLE connection_requests (
            id SERIAL PRIMARY KEY,
            requester_id INTEGER NOT NULL REFERENCES users(id),
            requested_id INTEGER NOT NULL REFERENCES users(id),
            status connection_request_status DEFAULT 'pending',
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT chk_user_not_equal CHECK (requester_id <> requested_id),
            CONSTRAINT unique_requester_requested_combination UNIQUE (requester_id, requested_id)
        );
    END IF;
END
$$;
-- Create scheduled_deletions table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'scheduled_deletions') THEN
        CREATE TABLE scheduled_deletions (
            id SERIAL PRIMARY KEY,
            file_path TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END
$$;
-- Grant all privileges on the new tables to interactone
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO interactone;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO interactone;

-- Insert seed data into users table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'Admin') THEN
        INSERT INTO users (username, email, password, profile_picture) VALUES 
        ('Admin', 'admin@system.com', '113ab75cb112227be7e3056bc1723e67c0110c93', 'backend\imageUploaded\file-admin.JPEG');
    END IF;
END
$$;

-- Add foreign key constraints and indexes
DO $$
BEGIN
    IF NOT EXISTS (SELECT conname FROM pg_constraint WHERE conname = 'connection_requests_requester_id_fkey') THEN
        ALTER TABLE connection_requests ADD CONSTRAINT connection_requests_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT conname FROM pg_constraint WHERE conname = 'connection_requests_requested_id_fkey') THEN
        ALTER TABLE connection_requests ADD CONSTRAINT connection_requests_requested_id_fkey FOREIGN KEY (requested_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT conname FROM pg_constraint WHERE conname = 'connections_user_one_id_fkey') THEN
        ALTER TABLE connections ADD CONSTRAINT connections_user_one_id_fkey FOREIGN KEY (user_one_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT conname FROM pg_constraint WHERE conname = 'connections_user_two_id_fkey') THEN
        ALTER TABLE connections ADD CONSTRAINT connections_user_two_id_fkey FOREIGN KEY (user_two_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT conname FROM pg_constraint WHERE conname = 'submission_members_submission_id_fkey') THEN
        ALTER TABLE submission_members ADD CONSTRAINT submission_members_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES user_submissions(id);
    END IF;

    IF NOT EXISTS (SELECT conname FROM pg_constraint WHERE conname = 'fk_user') THEN
        ALTER TABLE user_submissions ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT conname FROM pg_constraint WHERE conname = 'submission_dialog_submission_id_fkey') THEN
        ALTER TABLE submission_dialog ADD CONSTRAINT submission_dialog_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES user_submissions(id);
    END IF;

    IF NOT EXISTS (SELECT conname FROM pg_constraint WHERE conname = 'connection_requests_requested_id_fkey') THEN
        ALTER TABLE connection_requests ADD CONSTRAINT connection_requests_requested_id_fkey FOREIGN KEY (requested_id) REFERENCES users(id);
    END IF;

    IF NOT EXISTS (SELECT indexname FROM pg_indexes WHERE indexname = 'idx_users_email') THEN
        CREATE INDEX idx_users_email ON users(email);
    END IF;

    IF NOT EXISTS (SELECT indexname FROM pg_indexes WHERE indexname = 'idx_connection_requests_status') THEN
        CREATE INDEX idx_connection_requests_status ON connection_requests(status);
    END IF;
END
$$;
ALTER TYPE floats_my_boaty_type ADD VALUE 'Exchange of power';ALTER TYPE floats_my_boaty_type ADD VALUE 'Pets';
ALTER TYPE floats_my_boaty_type ADD VALUE 'Domestic Bottom';ALTER TYPE floats_my_boaty_type ADD VALUE 'Financial Sub';ALTER TYPE floats_my_boaty_type ADD VALUE 'Rope Bunny';

ALTER TABLE users ADD COLUMN admin_face CHARACTER VARYING(255);
CREATE EXTENSION postgis;

ALTER TABLE users ADD COLUMN worldX DECIMAL(4, 2), ADD COLUMN worldY DECIMAL(4, 2);

CREATE TYPE sex_type_new AS ENUM ('Male', 'Female', 'Masculine', 'Feminine');
ALTER TABLE users ALTER COLUMN sex DROP DEFAULT;ALTER TABLE users ALTER COLUMN sex TYPE sex_type_new USING sex::text::sex_type_new;
ALTER TABLE users ALTER COLUMN sex SET DEFAULT 'Male';  -- Change 'Male' to whatever the new default should be
DROP TYPE sex_type;
ALTER TYPE sex_type_new RENAME TO sex_type;

ALTER TABLE users ADD COLUMN language_code VARCHAR(2) DEFAULT 'en';
ALTER TABLE users ADD COLUMN country_name character varying(100),ADD COLUMN registered_ip_address character varying(45);

-- Create backup of the users table
CREATE TABLE users_bk (LIKE users INCLUDING ALL);

-- Create backup of the user_submissions table
CREATE TABLE user_submissions_bk (LIKE user_submissions INCLUDING ALL);

-- Create backup of the submission_dialog table
CREATE TABLE submission_dialog_bk (LIKE submission_dialog INCLUDING ALL);

-- Create backup of the submission_members table
CREATE TABLE submission_members_bk (LIKE submission_members INCLUDING ALL);

-- Create backup of the connection_requests table
CREATE TABLE connection_requests_bk (LIKE connection_requests INCLUDING ALL);

-- Create backup of the connections table
CREATE TABLE connections_bk (LIKE connections INCLUDING ALL);

-- Create backup of the scheduled_deletions table
CREATE TABLE scheduled_deletions_bk (LIKE scheduled_deletions INCLUDING ALL);
//Use postgres on remote database
/*
GRANT ALL PRIVILEGES ON TABLE submission_dialog_bk TO postgres;
GRANT ALL PRIVILEGES ON TABLE submission_members_bk TO postgres;
GRANT ALL PRIVILEGES ON TABLE connection_requests_bk TO postgres;
GRANT ALL PRIVILEGES ON TABLE connections_bk TO postgres;
GRANT ALL PRIVILEGES ON TABLE user_submissions_bk TO postgres;
GRANT ALL PRIVILEGES ON TABLE users_bk TO postgres;
*/
GRANT ALL PRIVILEGES ON TABLE submission_dialog_bk TO interactone;
GRANT ALL PRIVILEGES ON TABLE submission_members_bk TO interactone;
GRANT ALL PRIVILEGES ON TABLE connection_requests_bk TO interactone;
GRANT ALL PRIVILEGES ON TABLE connections_bk TO interactone;
GRANT ALL PRIVILEGES ON TABLE user_submissions_bk TO interactone;
GRANT ALL PRIVILEGES ON TABLE users_bk TO interactone;
