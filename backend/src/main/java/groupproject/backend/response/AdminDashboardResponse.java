package groupproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {

    private long totalUsers;
    private long totalLinks;
    private long totalClicks;
    private List<AdminUserItem> users;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminUserItem {
        private Long id;
        private String username;
        private String email;
        private boolean enabled;
        private Set<String> roles;
        private int linkCount;
        private long clickCount;
        private String photo;
    }
}
