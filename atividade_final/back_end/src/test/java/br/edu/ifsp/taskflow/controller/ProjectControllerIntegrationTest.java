package br.edu.ifsp.taskflow.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifsp.taskflow.TestcontainersConfiguration;
import br.edu.ifsp.taskflow.model.Role;
import br.edu.ifsp.taskflow.repository.UserRepository;
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
class ProjectControllerIntegrationTest {

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

    private String promoteToAdminAndLogin(String name, String email) throws Exception {
        registerAndLogin(name, email);
        var user = userRepository.findByEmail(email).orElseThrow();
        user.setRole(Role.ADMIN);
        userRepository.save(user);

        String loginBody = objectMapper.writeValueAsString(new LoginPayload(email, "senhaSegura123"));
        String response = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return objectMapper.readTree(response).get("token").asString();
    }

    @Test
    void ownerCreatesProjectAndSeesItInOwnList() throws Exception {
        String token = registerAndLogin("Dono do Projeto", "dono1@taskflow.com");

        String createBody = objectMapper.writeValueAsString(new ProjectPayload("Redesign do Site", "Design & Dev", null));
        String createResponse = mockMvc.perform(post("/projects")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Redesign do Site"))
                .andExpect(jsonPath("$.owner.email").value("dono1@taskflow.com"))
                .andReturn().getResponse().getContentAsString();

        Long projectId = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(get("/projects").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + projectId + ")]").exists());
    }

    @Test
    void nonMemberCannotSeeOrFetchAnotherUsersProject() throws Exception {
        String ownerToken = registerAndLogin("Dono Isolado", "dono2@taskflow.com");
        String outsiderToken = registerAndLogin("Estranho no Ninho", "estranho2@taskflow.com");

        String createBody = objectMapper.writeValueAsString(new ProjectPayload("Projeto Privado", null, null));
        String createResponse = mockMvc.perform(post("/projects")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long projectId = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(get("/projects").header("Authorization", "Bearer " + outsiderToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id == " + projectId + ")]").doesNotExist());

        mockMvc.perform(get("/projects/" + projectId).header("Authorization", "Bearer " + outsiderToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void adminSeesAndCanDeleteAnyProject() throws Exception {
        String ownerToken = registerAndLogin("Dono Comum", "dono3@taskflow.com");
        String adminToken = promoteToAdminAndLogin("Administradora", "admin3@taskflow.com");

        String createBody = objectMapper.writeValueAsString(new ProjectPayload("Projeto Sob Auditoria", null, null));
        String createResponse = mockMvc.perform(post("/projects")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long projectId = objectMapper.readTree(createResponse).get("id").asLong();

        mockMvc.perform(get("/projects/" + projectId).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/projects/" + projectId).header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNoContent());
    }

    @Test
    void memberCanViewButNotDeleteProjectTheyDoNotOwn() throws Exception {
        String ownerToken = registerAndLogin("Dono do Time", "dono4@taskflow.com");
        registerAndLogin("Membro do Time", "membro4@taskflow.com");
        Long memberId = userRepository.findByEmail("membro4@taskflow.com").orElseThrow().getId();

        String createBody = objectMapper.writeValueAsString(new ProjectPayload("Projeto em Equipe", null, java.util.List.of(memberId)));
        String createResponse = mockMvc.perform(post("/projects")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        Long projectId = objectMapper.readTree(createResponse).get("id").asLong();

        String memberLoginBody = objectMapper.writeValueAsString(new LoginPayload("membro4@taskflow.com", "senhaSegura123"));
        String memberLoginResponse = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(memberLoginBody))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String memberToken = objectMapper.readTree(memberLoginResponse).get("token").asString();

        mockMvc.perform(get("/projects/" + projectId).header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/projects/" + projectId).header("Authorization", "Bearer " + memberToken))
                .andExpect(status().isForbidden());
    }

    private record RegisterPayload(String name, String email, String password) {
    }

    private record LoginPayload(String email, String password) {
    }

    private record ProjectPayload(String name, String category, java.util.List<Long> memberIds) {
    }
}
