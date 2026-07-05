package br.edu.ifsp.taskflow.mapper;

import br.edu.ifsp.taskflow.dto.response.UserSummaryResponse;
import br.edu.ifsp.taskflow.model.User;

public class UserMapper {

    private UserMapper() {
    }

    public static UserSummaryResponse toSummary(User user) {
        return new UserSummaryResponse(user.getId(), user.getName(), user.getEmail());
    }
}
