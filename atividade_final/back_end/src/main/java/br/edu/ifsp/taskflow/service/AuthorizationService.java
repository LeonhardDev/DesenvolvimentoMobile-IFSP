package br.edu.ifsp.taskflow.service;

import br.edu.ifsp.taskflow.model.Project;
import br.edu.ifsp.taskflow.model.Role;
import br.edu.ifsp.taskflow.model.Task;
import br.edu.ifsp.taskflow.security.CustomUserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Ponto único das regras de autorização do domínio (regra 1-3 do requirements.md):
 * USER só enxerga/manipula o que é seu ou dos projetos em que é membro; ADMIN é irrestrito.
 */
@Service
public class AuthorizationService {

    public boolean isAdmin(CustomUserPrincipal principal) {
        return principal.getRole() == Role.ADMIN;
    }

    public boolean isOwner(Project project, Long userId) {
        return project.getOwner().getId().equals(userId);
    }

    public boolean isOwner(Project project, CustomUserPrincipal principal) {
        return isOwner(project, principal.getId());
    }

    public boolean isMember(Project project, Long userId) {
        return isOwner(project, userId) || project.getMembers().stream().anyMatch(m -> m.getId().equals(userId));
    }

    public boolean isMember(Project project, CustomUserPrincipal principal) {
        return isMember(project, principal.getId());
    }

    /** Visualização: ADMIN ou membro/owner do projeto. Esconde a existência do projeto (404) para quem não tem acesso. */
    public void assertCanView(Project project, CustomUserPrincipal principal) {
        if (isAdmin(principal) || isMember(project, principal)) {
            return;
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado");
    }

    /** Edição/exclusão do projeto: ADMIN ou dono. Membros não-donos recebem 403 (sabem que existe, não podem alterar). */
    public void assertCanManage(Project project, CustomUserPrincipal principal) {
        if (isAdmin(principal) || isOwner(project, principal)) {
            return;
        }
        if (isMember(project, principal)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o dono do projeto pode fazer essa alteração");
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Projeto não encontrado");
    }

    /**
     * Edição/exclusão/mudança de status de tarefa (regra 3): ADMIN, criador ou assignee.
     * Outros membros do projeto (mesmo colaboradores da tarefa) recebem 403; quem não é
     * sequer membro do projeto recebe 404 (esconde a existência da tarefa).
     */
    public void assertCanModifyTask(Task task, CustomUserPrincipal principal) {
        if (isAdmin(principal)) {
            return;
        }
        boolean isCreator = task.getCreator().getId().equals(principal.getId());
        boolean isAssignee = task.getAssignee().getId().equals(principal.getId());
        if (isCreator || isAssignee) {
            return;
        }
        if (isMember(task.getProject(), principal)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Apenas o criador ou o responsável pode alterar esta tarefa");
        }
        throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa não encontrada");
    }
}
