package br.edu.ifsp.taskflow.mapper;

import br.edu.ifsp.taskflow.dto.response.ProjectResponse;
import br.edu.ifsp.taskflow.model.Project;

public class ProjectMapper {

    private ProjectMapper() {
    }

    public static ProjectResponse toResponse(Project project, long totalTasks, long completedTasks) {
        long progress = totalTasks == 0 ? 0 : Math.round(completedTasks * 100.0 / totalTasks);
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getCategory(),
                project.getStatus(),
                UserMapper.toSummary(project.getOwner()),
                project.getMembers().stream().map(UserMapper::toSummary).toList(),
                totalTasks,
                completedTasks,
                progress);
    }
}
