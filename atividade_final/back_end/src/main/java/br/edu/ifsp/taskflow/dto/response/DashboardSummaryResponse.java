package br.edu.ifsp.taskflow.dto.response;

/**
 * Contadores da tela inicial (Home), sempre no escopo do usuário autenticado.
 * tasksDueToday: tarefas atribuídas a ele com prazo hoje e ainda não concluídas.
 * overdueTasks: tarefas atribuídas a ele com prazo vencido e ainda não concluídas.
 */
public record DashboardSummaryResponse(long tasksDueToday, long overdueTasks) {
}
