package br.edu.ifsp.taskflow.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record ProjectRequest(
        @NotBlank(message = "Nome é obrigatório") String name,
        String category,
        List<Long> memberIds) {
}
