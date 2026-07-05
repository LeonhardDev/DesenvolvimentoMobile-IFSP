package br.edu.ifsp.taskflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifsp.taskflow.TestcontainersConfiguration;
import br.edu.ifsp.taskflow.model.Role;
import br.edu.ifsp.taskflow.repository.UserRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

/**
 * Cobre a regra 3 do requirements.md: só o criador ou o assignee da tarefa pode
 * editar/excluir/mudar status — colaboradores e outros membros do projeto não podem,
 * mesmo tendo acesso de visualização. ADMIN é sempre irrestrito.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class TaskAuthorizationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private String registerAndLogin(String nome, String email) throws Exception {
        String body = objectMapper.writeValueAsString(new RegisterPayload(nome, email, "senhaSegura123"));
        String response = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asString();
    }

    private String login(String email) throws Exception {
        String body = objectMapper.writeValueAsString(new LoginPayload(email, "senhaSegura123"));
        String response = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asString();
    }

    private Long userId(String email) {
        return userRepository.findByEmail(email).orElseThrow().getId();
    }

    @Test
    void onlyCreatorAssigneeOrAdminCanModifyTask() throws Exception {
        String ownerToken = registerAndLogin("Criador da Tarefa", "criador8@taskflow.com");
        registerAndLogin("Responsavel Tarefa", "assignee8@taskflow.com");
        registerAndLogin("Colaborador Tarefa", "colaborador8@taskflow.com");
        registerAndLogin("Membro Nao Envolvido", "outromembro8@taskflow.com");
        String adminToken = registerAndLogin("Admin Tarefa", "admin8@taskflow.com");
        var adminUser = userRepository.findByEmail("admin8@taskflow.com").orElseThrow();
        adminUser.setRole(Role.ADMIN);
        userRepository.save(adminUser);
        adminToken = login("admin8@taskflow.com");

        Long assigneeId = userId("assignee8@taskflow.com");
        Long colaboradorId = userId("colaborador8@taskflow.com");
        Long outroMembroId = userId("outromembro8@taskflow.com");

        String projectBody = objectMapper.writeValueAsString(new ProjectPayload(
                "Projeto Autorizacao", null, List.of(assigneeId, colaboradorId, outroMembroId)));
        String projectResponse = mockMvc.perform(post("/projects")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long projectId = objectMapper.readTree(projectResponse).get("id").asLong();

        String taskBody = objectMapper.writeValueAsString(new TaskPayload(
                "Tarefa com regras finas", null, "ALTA", null, null, assigneeId, List.of(colaboradorId)));
        String taskResponse = mockMvc.perform(post("/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long taskId = objectMapper.readTree(taskResponse).get("id").asLong();

        String assigneeToken = login("assignee8@taskflow.com");
        String colaboradorToken = login("colaborador8@taskflow.com");
        String outroMembroToken = login("outromembro8@taskflow.com");

        String updateBody = objectMapper.writeValueAsString(new TaskPayload(
                "Tarefa atualizada", "nova descricao", "MEDIA", null, null, assigneeId, List.of(colaboradorId)));

        // Colaborador (não é criador nem assignee) não pode editar
        mockMvc.perform(put("/tasks/" + taskId)
                        .header("Authorization", "Bearer " + colaboradorToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isForbidden());

        // Outro membro do projeto (nem colaborador da tarefa) também não pode excluir
        mockMvc.perform(delete("/tasks/" + taskId).header("Authorization", "Bearer " + outroMembroToken))
                .andExpect(status().isForbidden());

        // Assignee pode editar
        mockMvc.perform(put("/tasks/" + taskId)
                        .header("Authorization", "Bearer " + assigneeToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk());

        // Criador pode mudar o status
        String statusBody = objectMapper.writeValueAsString(new StatusPayload("EM_ANDAMENTO"));
        mockMvc.perform(patch("/tasks/" + taskId + "/status")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody))
                .andExpect(status().isOk());

        // ADMIN pode excluir mesmo não sendo criador nem assignee
        mockMvc.perform(delete("/tasks/" + taskId).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    private record RegisterPayload(String name, String email, String password) {
    }

    private record LoginPayload(String email, String password) {
    }

    private record ProjectPayload(String name, String category, List<Long> memberIds) {
    }

    private record TaskPayload(
            String title,
            String description,
            String priority,
            String dueDate,
            Integer estimatedHours,
            Long assigneeId,
            List<Long> collaboratorIds) {
    }

    private record StatusPayload(String status) {
    }
}
