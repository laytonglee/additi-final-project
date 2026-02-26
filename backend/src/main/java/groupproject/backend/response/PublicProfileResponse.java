package groupproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicProfileResponse {

    private String username;
    private String bio;
    private String photo;
    private String themeColor;
    private String backgroundColor;
    private String buttonStyle;
    private List<PublicLinkItem> links;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicLinkItem {
        private Long id;
        private String title;
        private String url;
        private String platform;
        private String description;
        private Boolean featured;
    }
}
