package br.edu.ifsp.taskflow.repository;

import br.edu.ifsp.taskflow.model.Task;
import br.edu.ifsp.taskflow.model.TaskStatus;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByProjectId(Long projectId);

    List<Task> findAllByProjectIdAndStatus(Long projectId, TaskStatus status);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, TaskStatus status);

    // Dashboard: tarefas atribuídas ao usuário, ainda não concluídas, com prazo exatamente na data.
    long countByAssigneeIdAndStatusNotAndDueDate(Long assigneeId, TaskStatus status, LocalDate dueDate);

    // Dashboard: tarefas atribuídas ao usuário, ainda não concluídas, com prazo já vencido.
    long countByAssigneeIdAndStatusNotAndDueDateBefore(Long assigneeId, TaskStatus status, LocalDate date);

    // Feed de atividades: tarefas em determinado status dentro dos projetos do usuário, mais recentes primeiro.
    @Query("SELECT t FROM Task t WHERE t.status = :status "
            + "AND (t.project.owner.id = :userId OR :userId IN (SELECT m.id FROM t.project.members m)) "
            + "ORDER BY t.updatedAt DESC")
    List<Task> findRecentByStatusForUser(
            @Param("status") TaskStatus status, @Param("userId") Long userId, Pageable pageable);
}
