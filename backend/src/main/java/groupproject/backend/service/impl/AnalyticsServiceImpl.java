package groupproject.backend.service.impl;

import groupproject.backend.model.ClickEvent;
import groupproject.backend.model.Link;
import groupproject.backend.model.User;
import groupproject.backend.repository.ClickEventRepository;
import groupproject.backend.repository.LinkRepository;
import groupproject.backend.repository.ProfileViewRepository;
import groupproject.backend.response.AiSuggestionResponse;
import groupproject.backend.response.AnalyticsResponse;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.LinkDetailAnalyticsResponse;
import groupproject.backend.service.AnalyticsService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final LinkRepository linkRepository;
    private final ClickEventRepository clickEventRepository;
    private final ProfileViewRepository profileViewRepository;

    public AnalyticsServiceImpl(LinkRepository linkRepository,
                                ClickEventRepository clickEventRepository,
                                ProfileViewRepository profileViewRepository) {
        this.linkRepository = linkRepository;
        this.clickEventRepository = clickEventRepository;
        this.profileViewRepository = profileViewRepository;
    }

    @Override
    public ApiResponse<AnalyticsResponse> getAnalytics(User user, Integer days) {
        List<Link> links = linkRepository.findByUserOrderByDisplayOrderAsc(user);

        if (links.isEmpty()) {
            long totalViews = profileViewRepository.countByUser(user);
            return ApiResponse.success(AnalyticsResponse.builder()
                    .totalClicks(0).totalLinks(0).totalViews(totalViews).ctr(0)
                    .clicksPerLink(Map.of()).clicksPerDevice(Map.of())
                    .clicksPerBrowser(Map.of()).clicksPerReferrer(Map.of())
                    .clicksPerDay(List.of()).viewsPerDay(List.of())
                    .clicksPerHour(Map.of()).clicksPerDayOfWeek(Map.of())
                    .linkPerformance(List.of())
                    .build(), "Analytics retrieved");
        }

        long totalClicks = clickEventRepository.countByLinkIn(links);
        long totalViews = profileViewRepository.countByUser(user);
        double ctr = totalViews > 0 ? Math.round((double) totalClicks / totalViews * 1000.0) / 10.0 : 0;
        List<Long> linkIds = links.stream().map(Link::getId).collect(Collectors.toList());

        // Clicks per link (use link title as key)
        Map<Long, String> linkTitleMap = links.stream()
                .collect(Collectors.toMap(Link::getId, Link::getTitle));

        Map<String, Long> clicksPerLink = clickEventRepository.countClicksGroupedByLink(links).stream()
                .collect(Collectors.toMap(
                        row -> linkTitleMap.getOrDefault((Long) row[0], "Unknown"),
                        row -> (Long) row[1],
                        Long::sum
                ));

        // Device distribution
        Map<String, Long> clicksPerDevice = clickEventRepository.countClicksGroupedByDevice(links).stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Unknown",
                        row -> (Long) row[1],
                        Long::sum
                ));

        // Browser distribution
        Map<String, Long> clicksPerBrowser = clickEventRepository.countClicksGroupedByBrowser(links).stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Unknown",
                        row -> (Long) row[1],
                        Long::sum
                ));

        // Referrer distribution (top 10)
        Map<String, Long> clicksPerReferrer = clickEventRepository.countClicksGroupedByReferrer(links).stream()
                .limit(10)
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Direct",
                        row -> (Long) row[1],
                        Long::sum,
                        LinkedHashMap::new
                ));

        // Daily clicks
        int daysRange = days != null ? days : 30;
        LocalDateTime since = LocalDateTime.now().minusDays(daysRange);
        List<AnalyticsResponse.DailyClickData> clicksPerDay = clickEventRepository.countClicksPerDay(linkIds, since)
                .stream()
                .map(row -> AnalyticsResponse.DailyClickData.builder()
                        .date(row[0].toString())
                        .clicks((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // Daily views
        List<AnalyticsResponse.DailyClickData> viewsPerDay = profileViewRepository.countViewsPerDay(user.getId(), since)
                .stream()
                .map(row -> AnalyticsResponse.DailyClickData.builder()
                        .date(row[0].toString())
                        .clicks((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // Hourly distribution
        Map<Integer, Long> clicksPerHour = clickEventRepository.countClicksPerHour(linkIds).stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).intValue(),
                        row -> (Long) row[1],
                        Long::sum,
                        TreeMap::new
                ));

        // Day of week distribution
        Map<Integer, Long> clicksPerDayOfWeek = clickEventRepository.countClicksPerDayOfWeek(linkIds).stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).intValue(),
                        row -> (Long) row[1],
                        Long::sum,
                        TreeMap::new
                ));

        // Per-link performance with status
        Map<Long, Long> clickCountMap = clickEventRepository.countClicksGroupedByLink(links).stream()
                .collect(Collectors.toMap(row -> (Long) row[0], row -> (Long) row[1]));
        long maxClicks = clickCountMap.values().stream().mapToLong(Long::longValue).max().orElse(0);

        List<AnalyticsResponse.LinkPerformance> linkPerformance = links.stream()
                .map(link -> {
                    long clicks = clickCountMap.getOrDefault(link.getId(), 0L);
                    String status;
                    if (maxClicks == 0 || clicks == 0) status = "frozen";
                    else if (clicks >= maxClicks * 0.7) status = "hot";
                    else if (clicks >= maxClicks * 0.3) status = "warm";
                    else status = "cold";
                    return AnalyticsResponse.LinkPerformance.builder()
                            .linkId(link.getId())
                            .title(link.getTitle())
                            .platform(link.getPlatform())
                            .clicks(clicks)
                            .featured(link.getFeatured())
                            .status(status)
                            .build();
                })
                .collect(Collectors.toList());

        AnalyticsResponse analytics = AnalyticsResponse.builder()
                .totalClicks(totalClicks)
                .totalLinks(links.size())
                .totalViews(totalViews)
                .ctr(ctr)
                .clicksPerLink(clicksPerLink)
                .clicksPerDevice(clicksPerDevice)
                .clicksPerBrowser(clicksPerBrowser)
                .clicksPerReferrer(clicksPerReferrer)
                .clicksPerDay(clicksPerDay)
                .viewsPerDay(viewsPerDay)
                .clicksPerHour(clicksPerHour)
                .clicksPerDayOfWeek(clicksPerDayOfWeek)
                .linkPerformance(linkPerformance)
                .build();

        return ApiResponse.success(analytics, "Analytics retrieved successfully");
    }

    @Override
    public ApiResponse<AiSuggestionResponse> getAiSuggestions(User user) {
        List<Link> links = linkRepository.findByUserOrderByDisplayOrderAsc(user);
        List<AiSuggestionResponse.Suggestion> suggestions = new ArrayList<>();

        if (links.isEmpty()) {
            suggestions.add(AiSuggestionResponse.Suggestion.builder()
                    .category("getting-started").icon("🚀")
                    .title("Add Your First Link")
                    .description("Start by adding your social media links. The more links you add, the better insights you'll get!")
                    .build());
            return ApiResponse.success(AiSuggestionResponse.builder().suggestions(suggestions).build(),
                    "AI suggestions generated");
        }

        long totalClicks = clickEventRepository.countByLinkIn(links);

        if (totalClicks == 0) {
            suggestions.add(AiSuggestionResponse.Suggestion.builder()
                    .category("promotion").icon("📢")
                    .title("Share Your Profile Link")
                    .description("You have links set up but no clicks yet! Share your profile link on your social media bios, WhatsApp status, and email signature to start getting traffic.")
                    .build());
            return ApiResponse.success(AiSuggestionResponse.builder().suggestions(suggestions).build(),
                    "AI suggestions generated");
        }

        // Analyze click distribution across links
        Map<String, Long> clicksPerLink = clickEventRepository.countClicksGroupedByLink(links).stream()
                .collect(Collectors.toMap(
                        row -> {
                            Long linkId = (Long) row[0];
                            return links.stream().filter(l -> l.getId().equals(linkId))
                                    .findFirst().map(Link::getTitle).orElse("Unknown");
                        },
                        row -> (Long) row[1]
                ));

        // Find top and bottom performing links
        if (!clicksPerLink.isEmpty()) {
            String topLink = clicksPerLink.entrySet().stream()
                    .max(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("");
            String bottomLink = clicksPerLink.entrySet().stream()
                    .min(Map.Entry.comparingByValue()).map(Map.Entry::getKey).orElse("");
            long topClicks = clicksPerLink.values().stream().max(Long::compareTo).orElse(0L);
            long bottomClicks = clicksPerLink.values().stream().min(Long::compareTo).orElse(0L);

            if (!topLink.equals(bottomLink)) {
                suggestions.add(AiSuggestionResponse.Suggestion.builder()
                        .category("engagement").icon("⭐")
                        .title("Top Performer: " + topLink)
                        .description(topLink + " is your most clicked link with " + topClicks + " clicks! Consider placing it at the top of your list for maximum visibility.")
                        .build());

                suggestions.add(AiSuggestionResponse.Suggestion.builder()
                        .category("optimization").icon("💡")
                        .title("Boost: " + bottomLink)
                        .description(bottomLink + " has only " + bottomClicks + " clicks. Try updating its title to be more engaging, or consider if this link is still relevant to your audience.")
                        .build());
            }
        }

        // Analyze device distribution
        Map<String, Long> deviceData = clickEventRepository.countClicksGroupedByDevice(links).stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Unknown",
                        row -> (Long) row[1],
                        Long::sum
                ));

        long mobileClicks = deviceData.getOrDefault("MOBILE", 0L);
        long desktopClicks = deviceData.getOrDefault("DESKTOP", 0L);

        if (mobileClicks + desktopClicks > 0) {
            double mobilePercent = (mobileClicks * 100.0) / (mobileClicks + desktopClicks);
            if (mobilePercent > 70) {
                suggestions.add(AiSuggestionResponse.Suggestion.builder()
                        .category("device").icon("📱")
                        .title("Mobile-First Audience")
                        .description(String.format("%.0f%% of your visitors are on mobile devices. Make sure all your linked pages are mobile-friendly for the best experience!", mobilePercent))
                        .build());
            } else if (desktopClicks > mobileClicks) {
                suggestions.add(AiSuggestionResponse.Suggestion.builder()
                        .category("device").icon("💻")
                        .title("Desktop-Heavy Traffic")
                        .description("Most of your visitors browse from desktop. Consider sharing your link in email newsletters and LinkedIn where desktop usage is higher.")
                        .build());
            }
        }

        // Analyze time patterns
        List<Long> suggestionLinkIds = links.stream().map(Link::getId).collect(Collectors.toList());
        List<Object[]> hourData = clickEventRepository.countClicksPerHour(suggestionLinkIds);
        if (!hourData.isEmpty()) {
            int peakHour = hourData.stream()
                    .max(Comparator.comparingLong(row -> (Long) row[1]))
                    .map(row -> ((Number) row[0]).intValue())
                    .orElse(12);

            String timeLabel;
            if (peakHour >= 6 && peakHour < 12) timeLabel = "morning (" + peakHour + ":00)";
            else if (peakHour >= 12 && peakHour < 17) timeLabel = "afternoon (" + peakHour + ":00)";
            else if (peakHour >= 17 && peakHour < 21) timeLabel = "evening (" + peakHour + ":00)";
            else timeLabel = "night (" + peakHour + ":00)";

            suggestions.add(AiSuggestionResponse.Suggestion.builder()
                    .category("timing").icon("⏰")
                    .title("Peak Activity Time")
                    .description("Your links get the most clicks in the " + timeLabel + ". Schedule your social media posts and promotions around this time for maximum engagement!")
                    .build());
        }

        // Analyze day of week patterns
        List<Object[]> dowData = clickEventRepository.countClicksPerDayOfWeek(suggestionLinkIds);
        if (!dowData.isEmpty()) {
            String[] dayNames = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
            int peakDay = dowData.stream()
                    .max(Comparator.comparingLong(row -> (Long) row[1]))
                    .map(row -> ((Number) row[0]).intValue())
                    .orElse(0);

            boolean isWeekend = peakDay == 0 || peakDay == 6;
            String dayName = (peakDay >= 0 && peakDay < 7) ? dayNames[peakDay] : "Unknown";

            suggestions.add(AiSuggestionResponse.Suggestion.builder()
                    .category("timing").icon("📅")
                    .title("Best Day: " + dayName)
                    .description("Your links perform best on " + dayName + "s. " +
                            (isWeekend
                                    ? "Weekend traffic is strong — schedule promotions and new content for " + dayName + "!"
                                    : "Consider launching promotions or sharing new content on " + dayName + " to maximize reach."))
                    .build());
        }

        // Analyze referrer sources
        Map<String, Long> referrerData = clickEventRepository.countClicksGroupedByReferrer(links).stream()
                .limit(5)
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Direct",
                        row -> (Long) row[1],
                        Long::sum
                ));

        if (!referrerData.isEmpty()) {
            String topReferrer = referrerData.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey).orElse("Direct");

            suggestions.add(AiSuggestionResponse.Suggestion.builder()
                    .category("traffic").icon("🔗")
                    .title("Top Traffic Source")
                    .description("Most of your visitors come from " + topReferrer + ". Double down on this channel — post more frequently there and engage with your audience!")
                    .build());
        }

        // General tips based on link count
        if (links.size() < 3) {
            suggestions.add(AiSuggestionResponse.Suggestion.builder()
                    .category("growth").icon("📈")
                    .title("Add More Links")
                    .description("You only have " + links.size() + " link(s). Adding more platforms (Instagram, TikTok, YouTube, Shopee) gives visitors more ways to connect with you!")
                    .build());
        }

        return ApiResponse.success(
                AiSuggestionResponse.builder().suggestions(suggestions).build(),
                "AI suggestions generated successfully"
        );
    }

    @Override
    public ApiResponse<LinkDetailAnalyticsResponse> getLinkDetail(User user, Long linkId, Integer days) {
        Link link = linkRepository.findByIdAndUser(linkId, user)
                .orElseThrow(() -> new RuntimeException("Link not found"));

        long totalClicks = clickEventRepository.countByLink(link);
        int daysRange = days != null ? days : 30;
        LocalDateTime since = LocalDateTime.now().minusDays(daysRange);

        // Device distribution
        Map<String, Long> clicksPerDevice = clickEventRepository.countClicksGroupedByDeviceForLink(link).stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Unknown",
                        row -> (Long) row[1],
                        Long::sum
                ));

        // Browser distribution
        Map<String, Long> clicksPerBrowser = clickEventRepository.countClicksGroupedByBrowserForLink(link).stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Unknown",
                        row -> (Long) row[1],
                        Long::sum
                ));

        // Referrer distribution
        Map<String, Long> clicksPerReferrer = clickEventRepository.countClicksGroupedByReferrerForLink(link).stream()
                .limit(10)
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Direct",
                        row -> (Long) row[1],
                        Long::sum,
                        LinkedHashMap::new
                ));

        // Daily clicks
        List<AnalyticsResponse.DailyClickData> clicksPerDay = clickEventRepository.countClicksPerDayForLink(linkId, since)
                .stream()
                .map(row -> AnalyticsResponse.DailyClickData.builder()
                        .date(row[0].toString())
                        .clicks((Long) row[1])
                        .build())
                .collect(Collectors.toList());

        // Hourly distribution
        Map<Integer, Long> clicksPerHour = clickEventRepository.countClicksPerHourForLink(linkId).stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).intValue(),
                        row -> (Long) row[1],
                        Long::sum,
                        TreeMap::new
                ));

        // Day of week distribution
        Map<Integer, Long> clicksPerDayOfWeek = clickEventRepository.countClicksPerDayOfWeekForLink(linkId).stream()
                .collect(Collectors.toMap(
                        row -> ((Number) row[0]).intValue(),
                        row -> (Long) row[1],
                        Long::sum,
                        TreeMap::new
                ));

        // Recent clicks (last 50)
        List<ClickEvent> recentClickEvents = clickEventRepository.findByLinkOrderByClickedAtDesc(link);
        List<LinkDetailAnalyticsResponse.ClickDetail> recentClicks = recentClickEvents.stream()
                .limit(50)
                .map(ce -> LinkDetailAnalyticsResponse.ClickDetail.builder()
                        .id(ce.getId())
                        .clickedAt(ce.getClickedAt().toString())
                        .deviceType(ce.getDeviceType())
                        .browser(ce.getBrowser())
                        .referrer(ce.getReferrer())
                        .country(ce.getCountry())
                        .build())
                .collect(Collectors.toList());

        LinkDetailAnalyticsResponse response = LinkDetailAnalyticsResponse.builder()
                .linkId(link.getId())
                .title(link.getTitle())
                .url(link.getUrl())
                .platform(link.getPlatform())
                .active(link.getActive())
                .totalClicks(totalClicks)
                .createdAt(link.getCreatedAt().toString())
                .clicksPerDevice(clicksPerDevice)
                .clicksPerBrowser(clicksPerBrowser)
                .clicksPerReferrer(clicksPerReferrer)
                .clicksPerDay(clicksPerDay)
                .clicksPerHour(clicksPerHour)
                .clicksPerDayOfWeek(clicksPerDayOfWeek)
                .recentClicks(recentClicks)
                .build();

        return ApiResponse.success(response, "Link analytics retrieved successfully");
    }

    @Override
    public String exportCsv(User user, Integer days) {
        List<Link> links = linkRepository.findByUserOrderByDisplayOrderAsc(user);
        int daysRange = days != null ? days : 30;
        LocalDateTime since = LocalDateTime.now().minusDays(daysRange);

        List<ClickEvent> clicks = clickEventRepository.findByLinkInAndClickedAtBetweenOrderByClickedAtDesc(
                links, since, LocalDateTime.now());

        // Build link id -> title map
        Map<Long, String> linkTitleMap = links.stream()
                .collect(Collectors.toMap(Link::getId, Link::getTitle));
        Map<Long, String> linkUrlMap = links.stream()
                .collect(Collectors.toMap(Link::getId, Link::getUrl));

        StringBuilder sb = new StringBuilder();
        sb.append("Clicked At,Link Title,Link URL,Device Type,Browser,Referrer,Country\n");

        for (ClickEvent ce : clicks) {
            sb.append(escapeCsv(ce.getClickedAt().toString())).append(",");
            sb.append(escapeCsv(linkTitleMap.getOrDefault(ce.getLink().getId(), "Unknown"))).append(",");
            sb.append(escapeCsv(linkUrlMap.getOrDefault(ce.getLink().getId(), ""))).append(",");
            sb.append(escapeCsv(ce.getDeviceType())).append(",");
            sb.append(escapeCsv(ce.getBrowser())).append(",");
            sb.append(escapeCsv(ce.getReferrer())).append(",");
            sb.append(escapeCsv(ce.getCountry())).append("\n");
        }

        return sb.toString();
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
