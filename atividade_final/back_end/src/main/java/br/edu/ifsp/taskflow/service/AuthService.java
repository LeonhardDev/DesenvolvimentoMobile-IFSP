package br.edu.ifsp.taskflow.service;

import br.edu.ifsp.taskflow.dto.request.LoginRequest;
import br.edu.ifsp.taskflow.dto.request.RegisterRequest;
import br.edu.ifsp.taskflow.dto.response.AuthResponse;
import br.edu.ifsp.taskflow.mapper.UserMapper;
import br.edu.ifsp.taskflow.model.Role;
import br.edu.ifsp.taskflow.model.User;
import br.edu.ifsp.taskflow.repository.UserRepository;
import br.edu.ifsp.taskflow.security.CustomUserPrincipal;
import br.edu.ifsp.taskflow.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        User user = User.builder()
                .nome(request.nome())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.senha()))
                .role(Role.USER)
                .build();
        userRepository.save(user);

        String token = jwtService.generateToken(CustomUserPrincipal.from(user));
        return new AuthResponse(token, UserMapper.toSummary(user));
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.senha()));
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas"));

        String token = jwtService.generateToken(CustomUserPrincipal.from(user));
        return new AuthResponse(token, UserMapper.toSummary(user));
    }
}
