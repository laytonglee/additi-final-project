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
public class UserProfileResponse {
    private Long id;
    private String name;
    private String bio;
    private String skills;
    private String avatarUrl;
    private Set<String> roles;
    private Double averageRating;
    private long reviewCount;
    private boolean isOnline;
    private List<ReviewResponse> reviews;
}
