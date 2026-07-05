package br.edu.ifsp.taskflow.dto.response;

import br.edu.ifsp.taskflow.model.Priority;
import br.edu.ifsp.taskflow.model.TaskStatus;
import java.time.LocalDate;
import java.util.List;

public record TaskResponse(
        Long id,
        String title,
        String description,
        TaskStatus status,
        Priority priority,
        LocalDate dueDate,
        Integer estimatedHours,
        Long projectId,
        UserSummaryResponse creator,
        UserSummaryResponse assignee,
        List<UserSummaryResponse> collaborators) {
}
