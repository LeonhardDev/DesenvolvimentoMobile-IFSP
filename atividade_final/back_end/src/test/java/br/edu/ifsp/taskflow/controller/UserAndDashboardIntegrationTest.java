package br.edu.ifsp.taskflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifsp.taskflow.TestcontainersConfiguration;
import br.edu.ifsp.taskflow.repository.UserRepository;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class UserAndDashboardIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    private String registerAndLogin(String name, String email) throws Exception {
        String body = objectMapper.writeValueAsString(new RegisterPayload(name, email, "senhaSegura123"));
        String response = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asString();
    }

    private Long createProject(String ownerToken, List<Long> memberIds) throws Exception {
        String body = objectMapper.writeValueAsString(new ProjectPayload("Projeto Dashboard", "QA", memberIds));
        String response = mockMvc.perform(post("/projects")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private Long createTask(String token, Long projectId, String title, String dueDate, Long assigneeId)
            throws Exception {
        String body = objectMapper.writeValueAsString(
                new TaskPayload(title, null, "ALTA", dueDate, null, assigneeId, null));
        String response = mockMvc.perform(post("/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    @Test
    void listUsersRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/users")).andExpect(status().isUnauthorized());
    }

    @Test
    void listUsersReturnsRegisteredUsers() throws Exception {
        String token = registerAndLogin("Usuario Lista", "usuario.lista@taskflow.com");

        mockMvc.perform(get("/users").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.email == 'usuario.lista@taskflow.com')]").exists())
                // Nunca expõe senha nem role no resumo público.
                .andExpect(jsonPath("$[0].password").doesNotExist())
                .andExpect(jsonPath("$[0].role").doesNotExist());
    }

    @Test
    void summaryCountsTasksDueTodayAndOverdue() throws Exception {
        String token = registerAndLogin("Dono Summary", "dono.summary@taskflow.com");
        Long ownerId = userRepository.findByEmail("dono.summary@taskflow.com").orElseThrow().getId();
        Long projectId = createProject(token, null);

        createTask(token, projectId, "Tarefa de hoje", LocalDate.now().toString(), ownerId);
        createTask(token, projectId, "Tarefa atrasada", LocalDate.now().minusDays(1).toString(), ownerId);

        mockMvc.perform(get("/dashboard/summary").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tasksDueToday").value(1))
                .andExpect(jsonPath("$.overdueTasks").value(1));
    }

    @Test
    void activitiesIncludeCompletedTaskAndCreatedProject() throws Exception {
        String token = registerAndLogin("Dono Atividades", "dono.atividades@taskflow.com");
        Long ownerId = userRepository.findByEmail("dono.atividades@taskflow.com").orElseThrow().getId();
        Long projectId = createProject(token, null);
        Long taskId = createTask(token, projectId, "Tarefa a concluir", null, ownerId);

        String statusBody = objectMapper.writeValueAsString(new StatusPayload("CONCLUIDA"));
        mockMvc.perform(patch("/tasks/" + taskId + "/status")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody))
                .andExpect(status().isOk());

        mockMvc.perform(get("/dashboard/activities").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.type == 'TASK_COMPLETED')]").exists())
                .andExpect(jsonPath("$[?(@.type == 'PROJECT_CREATED')]").exists());
    }

    private record RegisterPayload(String name, String email, String password) {
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
