package br.edu.ifsp.taskflow.controller;

import br.edu.ifsp.taskflow.dto.response.UserSummaryResponse;
import br.edu.ifsp.taskflow.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserSummaryResponse> list() {
        return userService.listUsers();
    }
}
