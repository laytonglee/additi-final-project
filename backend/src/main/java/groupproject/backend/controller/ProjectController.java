package groupproject.backend.controller;

import groupproject.backend.model.Project;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ProjectStatus;
import groupproject.backend.repository.ProposalRepository;
import groupproject.backend.request.CreateProjectRequest;
import groupproject.backend.request.UpdateProjectRequest;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.ProjectResponse;
import groupproject.backend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;
    private final ProposalRepository proposalRepository;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getMy(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal User user) {
        Page<Project> projects = projectService.getByClient(user,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(projects.map(this::toResponse), "My projects retrieved"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Project> projects = projectService.getOpen(
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(projects.map(this::toResponse), "Projects retrieved"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ProjectResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BigDecimal minBudget,
            @RequestParam(required = false) BigDecimal maxBudget,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Project> projects = projectService.search(keyword, category, minBudget, maxBudget, status,
                PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success(projects.map(this::toResponse), "Search results"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getById(@PathVariable Long id) {
        Project p = projectService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(toResponse(p), "Project details"));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> incrementView(@PathVariable Long id) {
        projectService.incrementViewCount(id);
        return ResponseEntity.ok(ApiResponse.success(null, "View counted"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> create(
            @Valid @RequestBody CreateProjectRequest request,
            @AuthenticationPrincipal User user) {
        Project p = projectService.create(request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(p), "Project created"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProjectResponse>> update(
            @PathVariable Long id,
            @RequestBody UpdateProjectRequest request,
            @AuthenticationPrincipal User user) {
        Project p = projectService.update(id, request, user);
        return ResponseEntity.ok(ApiResponse.success(toResponse(p), "Project updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        projectService.delete(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted"));
    }

    private ProjectResponse toResponse(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .clientId(p.getClient().getId())
                .clientName(p.getClient().getRealName())
                .assignedFreelancerId(p.getAssignedFreelancer() != null ? p.getAssignedFreelancer().getId() : null)
                .assignedFreelancerName(p.getAssignedFreelancer() != null ? p.getAssignedFreelancer().getRealName() : null)
                .title(p.getTitle())
                .description(p.getDescription())
                .category(p.getCategory() != null ? p.getCategory().getName() : null)
                .projectType(p.getProjectType() != null ? p.getProjectType().name() : null)
                .experienceLevel(p.getExperienceLevel() != null ? p.getExperienceLevel().name() : null)
                .budgetMin(p.getBudgetMin())
                .budgetMax(p.getBudgetMax())
                .status(p.getStatus().name())
                .deadline(p.getDeadline())
                .viewCount(p.getViewCount())
                .proposalCount(proposalRepository.countByProjectId(p.getId()))
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
