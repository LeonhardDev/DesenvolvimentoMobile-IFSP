package br.edu.ifsp.taskflow.service;

import br.edu.ifsp.taskflow.dto.response.UserSummaryResponse;
import br.edu.ifsp.taskflow.mapper.UserMapper;
import br.edu.ifsp.taskflow.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Lista os usuários cadastrados para popular os seletores de responsável/membros
 * no app (criação de projetos e tarefas). Expõe apenas o resumo público (id, nome,
 * e-mail) — nunca a senha nem a role.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public List<UserSummaryResponse> listUsers() {
        return userRepository.findAll().stream().map(UserMapper::toSummary).toList();
    }
}
