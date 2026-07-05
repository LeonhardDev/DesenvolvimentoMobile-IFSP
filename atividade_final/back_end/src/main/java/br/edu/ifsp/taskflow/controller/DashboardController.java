package br.edu.ifsp.taskflow.controller;

import br.edu.ifsp.taskflow.dto.response.ActivityResponse;
import br.edu.ifsp.taskflow.dto.response.DashboardSummaryResponse;
import br.edu.ifsp.taskflow.security.CustomUserPrincipal;
import br.edu.ifsp.taskflow.service.DashboardService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryResponse summary(@AuthenticationPrincipal CustomUserPrincipal principal) {
        return dashboardService.getSummary(principal);
    }

    @GetMapping("/activities")
    public List<ActivityResponse> activities(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal CustomUserPrincipal principal) {
        return dashboardService.getActivities(principal, limit);
    }
}
