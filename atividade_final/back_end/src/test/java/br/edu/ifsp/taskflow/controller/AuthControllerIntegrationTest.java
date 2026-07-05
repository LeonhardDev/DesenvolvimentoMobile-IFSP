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
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.error").value("Conflict"))
                .andExpect(jsonPath("$.message").value("E-mail já cadastrado"))
                .andExpect(jsonPath("$.path").value("/auth/register"))
                .andExpect(jsonPath("$.timestamp").value(notNullValue()));
    }

    @Test
    void validationErrorReturnsFieldLevelMessages() throws Exception {
        String invalidBody = objectMapper.writeValueAsString(new RegisterPayload("", "nao-e-email", "123"));

        mockMvc.perform(post("/auth/register").contentType(MediaType.APPLICATION_JSON).content(invalidBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.name").value(notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.email").value(notNullValue()))
                .andExpect(jsonPath("$.fieldErrors.password").value(notNullValue()));
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


    private record RegisterPayload(String name, String email, String password) {
    }

    private record LoginPayload(String email, String password) {
    }
}
