package br.edu.ifsp.taskflow.dto.request;

import br.edu.ifsp.taskflow.model.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(@NotNull(message = "Status é obrigatório") TaskStatus status) {
}
