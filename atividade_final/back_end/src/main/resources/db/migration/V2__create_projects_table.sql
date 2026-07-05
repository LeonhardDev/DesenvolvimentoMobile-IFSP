CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ATIVO', 'CONCLUIDO')),
    owner_id BIGINT NOT NULL REFERENCES users(id)
);
