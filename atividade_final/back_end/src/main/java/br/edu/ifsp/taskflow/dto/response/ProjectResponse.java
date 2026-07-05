package br.edu.ifsp.taskflow.dto.response;

import br.edu.ifsp.taskflow.model.ProjectStatus;
import java.util.List;

public record ProjectResponse(
        Long id,
        String name,
        String category,
        ProjectStatus status,
        UserSummaryResponse owner,
        List<UserSummaryResponse> members,
        long totalTasks,
        long completedTasks,
        long progressPercentage) {
}
