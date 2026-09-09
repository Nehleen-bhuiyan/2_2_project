
CREATE TABLE audio_files (
    id UUID PRIMARY KEY,

    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    storage_key TEXT NOT NULL,

    original_name VARCHAR(255),

    file_type VARCHAR(30) NOT NULL,
    -- RAW | PREVIEW | FINAL

    project_version INTEGER,

    duration DOUBLE PRECISION,
    sample_rate INTEGER,
    channels INTEGER,
    format VARCHAR(20),

    is_final BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(150),
    created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE projects (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,

    state JSONB NOT NULL DEFAULT '{}',

    version INTEGER NOT NULL DEFAULT 1,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);