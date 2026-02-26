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
public class AnalyticsResponse {

    private long totalClicks;
    private long totalLinks;
    private long totalViews;
    private double ctr; // click-through rate (totalClicks / totalViews * 100)
    private Map<String, Long> clicksPerLink;
    private Map<String, Long> clicksPerDevice;
    private Map<String, Long> clicksPerBrowser;
    private Map<String, Long> clicksPerReferrer;
    private List<DailyClickData> clicksPerDay;
    private List<DailyClickData> viewsPerDay;
    private Map<Integer, Long> clicksPerHour;
    private Map<Integer, Long> clicksPerDayOfWeek;
    private List<LinkPerformance> linkPerformance;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyClickData {
        private String date;
        private Long clicks;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkPerformance {
        private Long linkId;
        private String title;
        private String platform;
        private long clicks;
        private boolean featured;
        private String status; // "hot", "warm", "cold", "frozen"
    }
}
