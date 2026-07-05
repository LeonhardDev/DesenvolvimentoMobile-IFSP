CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('A_FAZER', 'EM_ANDAMENTO', 'CONCLUIDA')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('BAIXA', 'MEDIA', 'ALTA')),
    due_date DATE,
    estimated_hours INTEGER,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    creator_id BIGINT NOT NULL REFERENCES users(id),
    assignee_id BIGINT NOT NULL REFERENCES users(id)
);
