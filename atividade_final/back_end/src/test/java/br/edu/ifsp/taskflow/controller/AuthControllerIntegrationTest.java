package br.edu.ifsp.taskflow.controller;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.edu.ifsp.taskflow.TestcontainersConfiguration;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerThenLoginReturnsValidToken() throws Exception {
        String registerBody = objectMapper.writeValueAsString(new RegisterPayload("Gustavo Coelho", "gustavo.auth@taskflow.com", "senhaSegura123"));

        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value(notNullValue()))
                .andExpect(jsonPath("$.user.email").value("gustavo.auth@taskflow.com"));

        String loginBody = objectMapper.writeValueAsString(new LoginPayload("gustavo.auth@taskflow.com", "senhaSegura123"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(loginBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value(notNullValue()));
    }

    @Test
    void registerWithDuplicateEmailReturnsConflict() throws Exception {
        String body = objectMapper.writeValueAsString(new RegisterPayload("Duplicado", "duplicado@taskflow.com", "senhaSegura123"));

        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void loginWithWrongPasswordReturnsUnauthorized() throws Exception {
        String registerBody = objectMapper.writeValueAsString(new RegisterPayload("Login Teste", "login.teste@taskflow.com", "senhaCorreta1"));
        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(registerBody))
                .andExpect(status().isCreated());

        String wrongLoginBody = objectMapper.writeValueAsString(new LoginPayload("login.teste@taskflow.com", "senhaErrada1"));
        mockMvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content(wrongLoginBody))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedRouteWithoutTokenReturnsUnauthorized() throws Exception {
        mockMvc.perform(get("/projects"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedRouteWithValidTokenIsAuthenticatedButNotYetImplemented() throws Exception {
        String registerBody = objectMapper.writeValueAsString(new RegisterPayload("Token Teste", "token.teste@taskflow.com", "senhaSegura123"));
        String response = mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String token = objectMapper.readTree(response).get("token").asString();

        // /projects ainda não existe (módulo seguinte) — o importante aqui é confirmar que o
        // filtro JWT autenticou a requisição (404, não 401) quando o token é válido.
        mockMvc.perform(get("/projects").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    private record RegisterPayload(String nome, String email, String senha) {
    }

    private record LoginPayload(String email, String senha) {
    }
}
