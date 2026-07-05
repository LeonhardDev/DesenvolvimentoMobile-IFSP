package br.edu.ifsp.taskflow.service;

import br.edu.ifsp.taskflow.dto.request.ProjectRequest;
import br.edu.ifsp.taskflow.dto.response.ProjectResponse;
import br.edu.ifsp.taskflow.mapper.ProjectMapper;
import br.edu.ifsp.taskflow.model.Project;
import br.edu.ifsp.taskflow.model.ProjectStatus;
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
 * Classe inteira transacional: owner/members são LAZY e open-in-view está desligado,
 * então o acesso a essas associações (no ProjectMapper) precisa acontecer dentro da
 * mesma transação que carregou a entidade — senão estoura LazyInitializationException,
 * e updateProject não persistiria as mudanças (entidade ficaria detached).
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AuthorizationService authorizationService;

    public List<ProjectResponse> listProjects(CustomUserPrincipal principal) {
        List<Project> projects = authorizationService.isAdmin(principal)
                ? projectRepository.findAll()
                : projectRepository.findAllByOwnerOrMember(principal.getId());
        return projects.stream().map(this::toResponseWithProgress).toList();
    }

    public ProjectResponse getProject(Long id, CustomUserPrincipal principal) {
        Project project = findProjectOrThrow(id);
        authorizationService.assertCanView(project, principal);
        return toResponseWithProgress(project);
    }

    public ProjectResponse createProject(ProjectRequest request, CustomUserPrincipal principal) {
        User owner = userRepository.getReferenceById(principal.getId());

        Set<User> members = resolveMembers(request.memberIds());
        members.add(owner);

        Project project = Project.builder()
                .name(request.name())
                .category(request.category())
                .status(ProjectStatus.ATIVO)
                .owner(owner)
                .members(members)
                .build();

        projectRepository.save(project);
        return toResponseWithProgress(project);
    }

    public ProjectResponse updateProject(Long id, ProjectRequest request, CustomUserPrincipal principal) {
        Project project = findProjectOrThrow(id);
        authorizationService.assertCanManage(project, principal);

        project.setName(request.name());
        project.setCategory(request.category());

        Set<User> members = resolveMembers(request.memberIds());
        members.add(project.getOwner());
        project.setMembers(members);

        return toResponseWithProgress(project);
    }

    public void deleteProject(Long id, CustomUserPrincipal principal) {
        Project project = findProjectOrThrow(id);
        authorizationService.assertCanManage(project, principal);
        projectRepository.delete(project);
    }

    private ProjectResponse toResponseWithProgress(Project project) {
        long total = taskRepository.countByProjectId(project.getId());
        long completed = taskRepository.countByProjectIdAndStatus(project.getId(), TaskStatus.CONCLUIDA);
        return ProjectMapper.toResponse(project, total, completed);
    }

    private Project findProjectOrThrow(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado"));
    }

    private Set<User> resolveMembers(List<Long> memberIds) {
        if (memberIds == null || memberIds.isEmpty()) {
            return new HashSet<>();
        }
        return new HashSet<>(userRepository.findAllById(memberIds));
    }
}
