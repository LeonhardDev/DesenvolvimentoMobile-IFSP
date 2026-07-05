package br.edu.ifsp.taskflow.service;

import br.edu.ifsp.taskflow.dto.response.ActivityResponse;
import br.edu.ifsp.taskflow.dto.response.DashboardSummaryResponse;
import br.edu.ifsp.taskflow.model.Project;
import br.edu.ifsp.taskflow.model.Task;
import br.edu.ifsp.taskflow.model.TaskStatus;
import br.edu.ifsp.taskflow.repository.ProjectRepository;
import br.edu.ifsp.taskflow.repository.TaskRepository;
import br.edu.ifsp.taskflow.security.CustomUserPrincipal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Agrega os dados da Home a partir das entidades existentes (não há tabela de auditoria):
 * contadores de "hoje"/"em atraso" das tarefas do usuário e um feed com as atividades
 * mais recentes (tarefas concluídas e projetos criados) nos projetos em que ele participa.
 *
 * Transacional (readOnly) porque o feed acessa associações LAZY (project.name) e
 * open-in-view está desligado.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final Clock clock = Clock.systemDefaultZone();

    public DashboardSummaryResponse getSummary(CustomUserPrincipal principal) {
        LocalDate today = LocalDate.now(clock);
        long dueToday = taskRepository.countByAssigneeIdAndStatusNotAndDueDate(
                principal.getId(), TaskStatus.CONCLUIDA, today);
        long overdue = taskRepository.countByAssigneeIdAndStatusNotAndDueDateBefore(
                principal.getId(), TaskStatus.CONCLUIDA, today);
        return new DashboardSummaryResponse(dueToday, overdue);
    }

    public List<ActivityResponse> getActivities(CustomUserPrincipal principal, int limit) {
        PageRequest page = PageRequest.of(0, limit);

        List<ActivityResponse> activities = new ArrayList<>();

        for (Task task :
                taskRepository.findRecentByStatusForUser(TaskStatus.CONCLUIDA, principal.getId(), page)) {
            activities.add(new ActivityResponse(
                    "TASK_COMPLETED", "\"" + task.getTitle() + "\" concluída", task.getUpdatedAt()));
        }

        for (Project project : projectRepository.findRecentForUser(principal.getId(), page)) {
            activities.add(new ActivityResponse(
                    "PROJECT_CREATED", "Projeto \"" + project.getName() + "\" criado", project.getCreatedAt()));
        }

        return activities.stream()
                .sorted(Comparator.comparing(ActivityResponse::timestamp).reversed())
                .limit(limit)
                .toList();
    }
}
