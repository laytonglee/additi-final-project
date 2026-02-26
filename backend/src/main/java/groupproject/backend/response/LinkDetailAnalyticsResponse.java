package groupproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkDetailAnalyticsResponse {

    private Long linkId;
    private String title;
    private String url;
    private String platform;
    private boolean active;
    private long totalClicks;
    private String createdAt;

    private Map<String, Long> clicksPerDevice;
    private Map<String, Long> clicksPerBrowser;
    private Map<String, Long> clicksPerReferrer;
    private List<AnalyticsResponse.DailyClickData> clicksPerDay;
    private Map<Integer, Long> clicksPerHour;
    private Map<Integer, Long> clicksPerDayOfWeek;

    private List<ClickDetail> recentClicks;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClickDetail {
        private Long id;
        private String clickedAt;
        private String deviceType;
        private String browser;
        private String referrer;
        private String country;
    }
}
