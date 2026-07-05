package br.edu.ifsp.taskflow.dto.response;

public record AuthResponse(String token, UserSummaryResponse user) {
}
