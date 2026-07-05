package br.edu.ifsp.taskflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifsp.taskflow.TestcontainersConfiguration;
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

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class TaskControllerIntegrationTest {

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
        String body = objectMapper.writeValueAsString(new ProjectPayload("Projeto de Testes", "QA", memberIds));
        String response = mockMvc.perform(post("/projects")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    @Test
    void createsTaskLinkedToProjectAndListsIt() throws Exception {
        String ownerToken = registerAndLogin("Dono Task 1", "dono.task1@taskflow.com");
        Long ownerId = userRepository.findByEmail("dono.task1@taskflow.com").orElseThrow().getId();
        Long projectId = createProject(ownerToken, null);

        String taskBody = objectMapper.writeValueAsString(
                new TaskPayload("Implementar login", "Tela + integração", "ALTA", null, 4, ownerId, null));

        String createResponse = mockMvc.perform(post("/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Implementar login"))
                .andExpect(jsonPath("$.status").value("A_FAZER"))
                .andExpect(jsonPath("$.projectId").value(projectId))
                .andReturn().getResponse().getContentAsString();

        Long taskId = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(get("/projects/" + projectId + "/tasks").header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + taskId + ")]").exists());
    }

    @Test
    void assigneeMustBeProjectMember() throws Exception {
        String ownerToken = registerAndLogin("Dono Task 2", "dono.task2@taskflow.com");
        registerAndLogin("Fora do Time", "fora.task2@taskflow.com");
        Long outsiderId = userRepository.findByEmail("fora.task2@taskflow.com").orElseThrow().getId();
        Long projectId = createProject(ownerToken, null);

        String taskBody = objectMapper.writeValueAsString(
                new TaskPayload("Tarefa inválida", null, "MEDIA", null, null, outsiderId, null));

        mockMvc.perform(post("/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody))
                .andExpect(status().isBadRequest());
    }

    @Test
    void nonMemberCannotListOrCreateTasksInProject() throws Exception {
        String ownerToken = registerAndLogin("Dono Task 3", "dono.task3@taskflow.com");
        Long ownerId = userRepository.findByEmail("dono.task3@taskflow.com").orElseThrow().getId();
        String outsiderToken = registerAndLogin("Estranho Task 3", "estranho.task3@taskflow.com");
        Long projectId = createProject(ownerToken, null);

        mockMvc.perform(get("/projects/" + projectId + "/tasks").header("Authorization", "Bearer " + outsiderToken))
                .andExpect(status().isNotFound());

        String taskBody = objectMapper.writeValueAsString(
                new TaskPayload("Tarefa", null, "BAIXA", null, null, ownerId, null));
        mockMvc.perform(post("/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + outsiderToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody))
                .andExpect(status().isNotFound());
    }

    @Test
    void updatesTaskStatusAndReflectsProjectProgress() throws Exception {
        String ownerToken = registerAndLogin("Dono Task 4", "dono.task4@taskflow.com");
        Long ownerId = userRepository.findByEmail("dono.task4@taskflow.com").orElseThrow().getId();
        Long projectId = createProject(ownerToken, null);

        String taskBody = objectMapper.writeValueAsString(
                new TaskPayload("Tarefa única", null, "ALTA", null, null, ownerId, null));
        String createResponse = mockMvc.perform(post("/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long taskId = objectMapper.readTree(createResponse).get("id").asLong();

        // Antes de concluir a única tarefa, progresso do projeto deve ser 0%
        mockMvc.perform(get("/projects/" + projectId).header("Authorization", "Bearer " + ownerToken))
                .andExpect(jsonPath("$.totalTasks").value(1))
                .andExpect(jsonPath("$.completedTasks").value(0))
                .andExpect(jsonPath("$.progressPercentage").value(0));

        String statusBody = objectMapper.writeValueAsString(new StatusPayload("CONCLUIDA"));
        mockMvc.perform(patch("/tasks/" + taskId + "/status")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(statusBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONCLUIDA"));

        // Depois de concluir, progresso deve refletir 100%
        mockMvc.perform(get("/projects/" + projectId).header("Authorization", "Bearer " + ownerToken))
                .andExpect(jsonPath("$.completedTasks").value(1))
                .andExpect(jsonPath("$.progressPercentage").value(100));
    }

    @Test
    void deletesTask() throws Exception {
        String ownerToken = registerAndLogin("Dono Task 5", "dono.task5@taskflow.com");
        Long ownerId = userRepository.findByEmail("dono.task5@taskflow.com").orElseThrow().getId();
        Long projectId = createProject(ownerToken, null);

        String taskBody = objectMapper.writeValueAsString(
                new TaskPayload("Tarefa a excluir", null, "BAIXA", null, null, ownerId, null));
        String createResponse = mockMvc.perform(post("/projects/" + projectId + "/tasks")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long taskId = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(delete("/tasks/" + taskId).header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/tasks/" + taskId).header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isNotFound());
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
