package groupproject.backend.service.impl;

import groupproject.backend.model.Project;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ProjectStatus;
import groupproject.backend.repository.ContractRepository;
import groupproject.backend.repository.ProjectRepository;
import groupproject.backend.repository.ProposalRepository;
import groupproject.backend.repository.UserRepository;
import groupproject.backend.response.AdminStatsResponse;
import groupproject.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ProposalRepository proposalRepository;
    private final ContractRepository contractRepository;

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Page<User> searchUsers(String search, String role, Boolean banned, Pageable pageable) {
        return userRepository.searchUsers(
                (search != null && search.isBlank()) ? null : search,
                (role != null && role.isBlank()) ? null : role,
                banned,
                pageable
        );
    }

    @Override
    @Transactional
    public void toggleBan(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        user.setBanned(!user.isBanned());
        userRepository.save(user);
    }

    @Override
    public Page<Project> searchProjects(String keyword, String status, Pageable pageable) {
        ProjectStatus ps = null;
        if (status != null && !status.isBlank()) {
            ps = ProjectStatus.valueOf(status);
        }
        return projectRepository.search(
                (keyword != null && keyword.isBlank()) ? null : keyword,
                null, null, null, ps, pageable
        );
    }

    @Override
    @Transactional
    public void forceDeleteProject(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
        }
        projectRepository.deleteById(projectId);
    }

    @Override
    public AdminStatsResponse getStats() {
        return AdminStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalProjects(projectRepository.count())
                .totalProposals(proposalRepository.count())
                .totalContracts(contractRepository.count())
                .build();
    }
}
