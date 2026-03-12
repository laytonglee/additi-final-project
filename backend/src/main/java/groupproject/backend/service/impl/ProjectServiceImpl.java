package groupproject.backend.service.impl;

import groupproject.backend.model.Project;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ExperienceLevel;
import groupproject.backend.model.enums.ProjectStatus;
import groupproject.backend.model.enums.ProjectType;
import groupproject.backend.repository.ProjectRepository;
import groupproject.backend.request.CreateProjectRequest;
import groupproject.backend.request.UpdateProjectRequest;
import groupproject.backend.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    @Override
    @Transactional
    public Project create(CreateProjectRequest request, User client) {
        Project p = new Project();
        p.setClient(client);
        p.setTitle(request.getTitle());
        p.setDescription(request.getDescription());
        p.setCategory(request.getCategory());
        if (request.getProjectType() != null) p.setProjectType(ProjectType.valueOf(request.getProjectType()));
        if (request.getExperienceLevel() != null) p.setExperienceLevel(ExperienceLevel.valueOf(request.getExperienceLevel()));
        p.setBudgetMin(request.getBudgetMin());
        p.setBudgetMax(request.getBudgetMax());
        p.setDeadline(request.getDeadline());
        p.setStatus(ProjectStatus.OPEN);
        return projectRepository.save(p);
    }

    @Override
    @Transactional
    public Project update(Long id, UpdateProjectRequest request, User client) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!p.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your project");
        }

        if (p.getStatus() != ProjectStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only open projects can be edited");
        }

        if (request.getTitle() != null) p.setTitle(request.getTitle());
        if (request.getDescription() != null) p.setDescription(request.getDescription());
        if (request.getCategory() != null) p.setCategory(request.getCategory());
        if (request.getProjectType() != null) p.setProjectType(ProjectType.valueOf(request.getProjectType()));
        if (request.getExperienceLevel() != null) p.setExperienceLevel(ExperienceLevel.valueOf(request.getExperienceLevel()));
        if (request.getBudgetMin() != null) p.setBudgetMin(request.getBudgetMin());
        if (request.getBudgetMax() != null) p.setBudgetMax(request.getBudgetMax());
        if (request.getDeadline() != null) p.setDeadline(request.getDeadline());

        return projectRepository.save(p);
    }

    @Override
    @Transactional
    public void delete(Long id, User user) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        boolean isOwner = p.getClient().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("ADMIN"));

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to delete this project");
        }

        if (!isAdmin && p.getStatus() != ProjectStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only open projects can be deleted");
        }

        projectRepository.delete(p);
    }

    @Override
    @Transactional(readOnly = true)
    public Project getById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    @Override
    @Transactional
    public void incrementViewCount(Long id) {
        Project p = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        p.setViewCount(p.getViewCount() + 1);
        projectRepository.save(p);
    }

    @Override
    public Page<Project> getOpen(Pageable pageable) {
        return projectRepository.findByStatus(ProjectStatus.OPEN, pageable);
    }

    @Override
    public Page<Project> search(String keyword, String category, BigDecimal minBudget, BigDecimal maxBudget,
                                ProjectStatus status, Pageable pageable) {
        return projectRepository.search(keyword, category, minBudget, maxBudget, status, pageable);
    }

    @Override
    public Page<Project> getByClient(User client, Pageable pageable) {
        return projectRepository.findByClient(client, pageable);
    }
}
