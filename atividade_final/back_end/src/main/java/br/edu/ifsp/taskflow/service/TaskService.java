package br.edu.ifsp.taskflow.service;

import br.edu.ifsp.taskflow.dto.request.TaskRequest;
import br.edu.ifsp.taskflow.dto.response.TaskResponse;
import br.edu.ifsp.taskflow.mapper.TaskMapper;
import br.edu.ifsp.taskflow.model.Project;
import br.edu.ifsp.taskflow.model.Task;
import br.edu.ifsp.taskflow.model.TaskStatus;
import br.edu.ifsp.taskflow.model.User;
import br.edu.ifsp.taskflow.repository.ProjectRepository;
import br.edu.ifsp.taskflow.repository.TaskRepository;
import br.edu.ifsp.taskflow.repository.UserRepository;
import br.edu.ifsp.taskflow.security.CustomUserPrincipal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Classe transacional pelo mesmo motivo do ProjectService: project/creator/assignee/
 * collaborators são LAZY e open-in-view está desligado.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;

    public List<TaskResponse> listTasks(Long projectId, TaskStatus statusFilter, CustomUserPrincipal principal) {
        Project project = findProjectOrThrow(projectId);
        authorizationService.assertCanView(project, principal);

        List<Task> tasks = statusFilter == null
                ? taskRepository.findAllByProjectId(projectId)
                : taskRepository.findAllByProjectIdAndStatus(projectId, statusFilter);
        return tasks.stream().map(TaskMapper::toResponse).toList();
    }

    public TaskResponse getTask(Long id, CustomUserPrincipal principal) {
        Task task = findTaskOrThrow(id);
        authorizationService.assertCanView(task.getProject(), principal);
        return TaskMapper.toResponse(task);
    }

    public TaskResponse createTask(Long projectId, TaskRequest request, CustomUserPrincipal principal) {
        Project project = findProjectOrThrow(projectId);
        authorizationService.assertCanView(project, principal);

        User creator = userRepository.getReferenceById(principal.getId());
        User assignee = resolveMemberOrThrow(project, request.assigneeId());
        Set<User> collaborators = resolveMembersOrThrow(project, request.collaboratorIds());

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .status(TaskStatus.A_FAZER)
                .priority(request.priority())
                .dueDate(request.dueDate())
                .estimatedHours(request.estimatedHours())
                .project(project)
                .creator(creator)
                .assignee(assignee)
                .collaborators(collaborators)
                .build();

        taskRepository.save(task);
        return TaskMapper.toResponse(task);
    }

    public TaskResponse updateTask(Long id, TaskRequest request, CustomUserPrincipal principal) {
        Task task = findTaskOrThrow(id);
        authorizationService.assertCanModifyTask(task, principal);

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setEstimatedHours(request.estimatedHours());
        task.setAssignee(resolveMemberOrThrow(task.getProject(), request.assigneeId()));
        task.setCollaborators(resolveMembersOrThrow(task.getProject(), request.collaboratorIds()));

        return TaskMapper.toResponse(task);
    }

    public TaskResponse updateStatus(Long id, TaskStatus newStatus, CustomUserPrincipal principal) {
        Task task = findTaskOrThrow(id);
        authorizationService.assertCanModifyTask(task, principal);
        task.setStatus(newStatus);
        return TaskMapper.toResponse(task);
    }

    public void deleteTask(Long id, CustomUserPrincipal principal) {
        Task task = findTaskOrThrow(id);
        authorizationService.assertCanModifyTask(task, principal);
        taskRepository.delete(task);
    }

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado"));
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa não encontrada"));
    }

    private User resolveMemberOrThrow(Project project, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário não encontrado: " + userId));
        if (!authorizationService.isMember(project, user.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário não é membro do projeto: " + userId);
        }
        return user;
    }

    private Set<User> resolveMembersOrThrow(Project project, List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return new HashSet<>();
        }
        Set<User> users = new HashSet<>();
        for (Long userId : userIds) {
            users.add(resolveMemberOrThrow(project, userId));
        }
        return users;
    }
}
