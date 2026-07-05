package br.edu.ifsp.taskflow.dto.request;

import br.edu.ifsp.taskflow.model.Priority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public record TaskRequest(
        @NotBlank(message = "Título é obrigatório") String title,
        String description,
        @NotNull(message = "Prioridade é obrigatória") Priority priority,
        LocalDate dueDate,
        Integer estimatedHours,
        @NotNull(message = "Responsável é obrigatório") Long assigneeId,
        List<Long> collaboratorIds) {
}
