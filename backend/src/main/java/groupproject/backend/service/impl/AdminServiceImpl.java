package groupproject.backend.service.impl;

import groupproject.backend.model.Link;
import groupproject.backend.model.Role;
import groupproject.backend.model.User;
import groupproject.backend.repository.ClickEventRepository;
import groupproject.backend.repository.LinkRepository;
import groupproject.backend.repository.UserRepository;
import groupproject.backend.response.AdminDashboardResponse;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final LinkRepository linkRepository;
    private final ClickEventRepository clickEventRepository;

    public AdminServiceImpl(UserRepository userRepository,
                            LinkRepository linkRepository,
                            ClickEventRepository clickEventRepository) {
        this.userRepository = userRepository;
        this.linkRepository = linkRepository;
        this.clickEventRepository = clickEventRepository;
    }

    @Override
    public ApiResponse<AdminDashboardResponse> getDashboard() {
        List<User> users = userRepository.findAll();
        long totalLinks = linkRepository.count();
        long totalClicks = clickEventRepository.count();

        List<AdminDashboardResponse.AdminUserItem> userItems = users.stream()
                .map(user -> {
                    List<Link> links = linkRepository.findByUserOrderByDisplayOrderAsc(user);
                    long clickCount = links.isEmpty() ? 0 : clickEventRepository.countByLinkIn(links);
                    return AdminDashboardResponse.AdminUserItem.builder()
                            .id(user.getId())
                            .username(user.getRealUsername())
                            .email(user.getEmail())
                            .enabled(user.isEnable())
                            .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toSet()))
                            .linkCount(links.size())
                            .clickCount(clickCount)
                            .photo(user.getPhoto())
                            .build();
                })
                .collect(Collectors.toList());

        AdminDashboardResponse response = AdminDashboardResponse.builder()
                .totalUsers(users.size())
                .totalLinks(totalLinks)
                .totalClicks(totalClicks)
                .users(userItems)
                .build();

        return ApiResponse.success(response, "Admin dashboard loaded");
    }

    @Override
    @Transactional
    public ApiResponse<Void> toggleUser(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setEnable(enabled);
        userRepository.save(user);

        return ApiResponse.success(null, enabled ? "User enabled" : "User disabled");
    }
}
