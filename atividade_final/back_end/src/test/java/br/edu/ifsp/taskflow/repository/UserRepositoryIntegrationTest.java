package br.edu.ifsp.taskflow.repository;

import static org.assertj.core.api.Assertions.assertThat;

import br.edu.ifsp.taskflow.TestcontainersConfiguration;
import br.edu.ifsp.taskflow.model.Role;
import br.edu.ifsp.taskflow.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;

@DataJpaTest
@Import(TestcontainersConfiguration.class)
class UserRepositoryIntegrationTest {

    @org.springframework.beans.factory.annotation.Autowired
    private UserRepository userRepository;

    @Test
    void savesAndFindsUserByEmail() {
        User user = User.builder()
                .name("Gustavo Coelho")
                .email("gustavo@taskflow.com")
                .passwordHash("hash-fake")
                .role(Role.USER)
                .build();

        userRepository.save(user);

        assertThat(userRepository.findByEmail("gustavo@taskflow.com"))
                .isPresent()
                .get()
                .satisfies(found -> {
                    assertThat(found.getName()).isEqualTo("Gustavo Coelho");
                    assertThat(found.getRole()).isEqualTo(Role.USER);
                });
        assertThat(userRepository.existsByEmail("gustavo@taskflow.com")).isTrue();
    }
}
