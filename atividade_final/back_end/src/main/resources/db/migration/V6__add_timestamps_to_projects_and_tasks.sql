-- Timestamps de auditoria para alimentar o dashboard/feed de atividades do app.
-- Linhas existentes recebem now() como valor inicial; o Hibernate passa a gerenciar
-- created_at/updated_at via @CreationTimestamp/@UpdateTimestamp nas novas escritas.

ALTER TABLE projects
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

ALTER TABLE tasks
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
