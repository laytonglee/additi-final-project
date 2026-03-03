package groupproject.backend.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String currentPassword;
    private String newPassword;
    private String bio;
    private String skills;
    private String avatarUrl;
    private Boolean notifEmail;
    private Boolean notifPush;
}

