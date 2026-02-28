package groupproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MeResponse {
    private Long id;
    private String name;
    private String email;
    private String bio;
    private String skills;
    private String avatarUrl;
    private boolean isBanned;
    private boolean isOnline;
    private boolean notifEmail;
    private boolean notifPush;
    private Set<String> roles;
}