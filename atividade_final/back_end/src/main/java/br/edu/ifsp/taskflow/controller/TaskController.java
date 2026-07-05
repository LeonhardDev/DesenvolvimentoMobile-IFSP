package br.edu.ifsp.taskflow.controller;

import br.edu.ifsp.taskflow.dto.request.TaskRequest;
import br.edu.ifsp.taskflow.dto.request.TaskStatusUpdateRequest;
import br.edu.ifsp.taskflow.dto.response.TaskResponse;
import br.edu.ifsp.taskflow.model.TaskStatus;
import br.edu.ifsp.taskflow.security.CustomUserPrincipal;
import br.edu.ifsp.taskflow.service.TaskService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @GetMapping("/projects/{projectId}/tasks")
    public List<TaskResponse> list(
            @PathVariable Long projectId,
            @RequestParam(required = false) TaskStatus status,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return taskService.listTasks(projectId, status, principal);
    }

    @PostMapping("/projects/{projectId}/tasks")
    @ResponseStatus(HttpStatus.CREATED)
    public TaskResponse create(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return taskService.createTask(projectId, request, principal);
    }

    @GetMapping("/tasks/{id}")
    public TaskResponse get(@PathVariable Long id, @AuthenticationPrincipal CustomUserPrincipal principal) {
        return taskService.getTask(id, principal);
    }

    @PutMapping("/tasks/{id}")
    public TaskResponse update(
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return taskService.updateTask(id, request, principal);
    }

    @PatchMapping("/tasks/{id}/status")
    public TaskResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusUpdateRequest request,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return taskService.updateStatus(id, request.status(), principal);
    }

    @DeleteMapping("/tasks/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal CustomUserPrincipal principal) {
        taskService.deleteTask(id, principal);
    }
}
