package br.edu.ifsp.taskflow.mapper;

import br.edu.ifsp.taskflow.dto.response.TaskResponse;
import br.edu.ifsp.taskflow.model.Task;

public class TaskMapper {

    private TaskMapper() {
    }

    public static TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getEstimatedHours(),
                task.getProject().getId(),
                UserMapper.toSummary(task.getCreator()),
                UserMapper.toSummary(task.getAssignee()),
                task.getCollaborators().stream().map(UserMapper::toSummary).toList());
    }
}
