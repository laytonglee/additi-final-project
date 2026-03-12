package groupproject.backend.service;

import groupproject.backend.model.Project;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ProjectStatus;
import groupproject.backend.request.CreateProjectRequest;
import groupproject.backend.request.UpdateProjectRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface ProjectService {
    Project create(CreateProjectRequest request, User client);
    Project update(Long id, UpdateProjectRequest request, User client);
    void delete(Long id, User user);
    Project getById(Long id);
    void incrementViewCount(Long id);
    Page<Project> getOpen(Pageable pageable);
    Page<Project> search(String keyword, String category, BigDecimal minBudget, BigDecimal maxBudget,
                         ProjectStatus status, Pageable pageable);
    Page<Project> getByClient(User client, Pageable pageable);
}
