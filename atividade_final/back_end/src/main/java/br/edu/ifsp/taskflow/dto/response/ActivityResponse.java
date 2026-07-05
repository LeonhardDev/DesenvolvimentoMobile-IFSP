package br.edu.ifsp.taskflow.dto.response;

import java.time.Instant;

/**
 * Item do feed "Atividades Recentes" da Home. Derivado das entidades (não há tabela
 * de auditoria): tarefas concluídas e projetos criados nos projetos do usuário.
 * type: identificador para o app escolher o ícone (ex.: TASK_COMPLETED, PROJECT_CREATED).
 */
public record ActivityResponse(String type, String message, Instant timestamp) {
}
