package br.edu.ifsp.taskflow.repository;

import br.edu.ifsp.taskflow.model.Task;
import br.edu.ifsp.taskflow.model.TaskStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findAllByProjectId(Long projectId);

    List<Task> findAllByProjectIdAndStatus(Long projectId, TaskStatus status);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, TaskStatus status);
}
