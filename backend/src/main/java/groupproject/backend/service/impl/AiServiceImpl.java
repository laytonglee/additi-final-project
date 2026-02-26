package groupproject.backend.service.impl;

import groupproject.backend.model.Link;
import groupproject.backend.model.User;
import groupproject.backend.repository.ClickEventRepository;
import groupproject.backend.repository.LinkRepository;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.service.AiService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AiServiceImpl implements AiService {

    private final ChatClient chatClient;
    private final LinkRepository linkRepository;
    private final ClickEventRepository clickEventRepository;

    public AiServiceImpl(ChatClient.Builder chatClientBuilder,
                         LinkRepository linkRepository,
                         ClickEventRepository clickEventRepository) {
        this.chatClient = chatClientBuilder.build();
        this.linkRepository = linkRepository;
        this.clickEventRepository = clickEventRepository;
    }

    // ── Smart Analytics Suggestions ────────────────────────

    @Override
    public ApiResponse<String> getSmartSuggestions(User user) {
        List<Link> links = linkRepository.findByUserOrderByDisplayOrderAsc(user);

        if (links.isEmpty()) {
            return ApiResponse.success(
                    "🚀 You haven't added any links yet! Start by adding your social media links to get AI-powered insights.",
                    "AI analysis generated");
        }

        // Gather analytics data
        long totalClicks = clickEventRepository.countByLinkIn(links);

        Map<String, Long> clicksPerLink = clickEventRepository.countClicksGroupedByLink(links).stream()
                .collect(Collectors.toMap(
                        row -> links.stream().filter(l -> l.getId().equals((Long) row[0]))
                                .findFirst().map(Link::getTitle).orElse("Unknown"),
                        row -> (Long) row[1], Long::sum));

        Map<String, Long> deviceData = clickEventRepository.countClicksGroupedByDevice(links).stream()
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Unknown",
                        row -> (Long) row[1], Long::sum));

        Map<String, Long> referrerData = clickEventRepository.countClicksGroupedByReferrer(links).stream()
                .limit(5)
                .collect(Collectors.toMap(
                        row -> row[0] != null ? (String) row[0] : "Direct",
                        row -> (Long) row[1], Long::sum));

        // Build data context
        StringBuilder dataContext = new StringBuilder();
        dataContext.append("User: @").append(user.getRealUsername()).append("\n");
        dataContext.append("Total links: ").append(links.size()).append("\n");
        dataContext.append("Total clicks: ").append(totalClicks).append("\n\n");

        dataContext.append("Links and clicks:\n");
        links.forEach(l -> dataContext.append("- ").append(l.getTitle())
                .append(" (").append(l.getPlatform()).append(") → ")
                .append(clicksPerLink.getOrDefault(l.getTitle(), 0L)).append(" clicks\n"));

        dataContext.append("\nDevice breakdown: ").append(deviceData).append("\n");
        dataContext.append("Top referrers: ").append(referrerData).append("\n");

        // Hourly data
        List<Long> linkIds = links.stream().map(Link::getId).collect(Collectors.toList());
        List<Object[]> hourData = clickEventRepository.countClicksPerHour(linkIds);
        if (!hourData.isEmpty()) {
            Map<Integer, Long> hourMap = hourData.stream().collect(Collectors.toMap(
                    row -> ((Number) row[0]).intValue(), row -> (Long) row[1], Long::sum));
            dataContext.append("Hourly clicks: ").append(hourMap).append("\n");
        }

        String prompt = """
                You are an expert social media and link-in-bio analytics advisor.
                Analyze this LinkHub user's data and provide a helpful analysis with actionable suggestions.
                
                %s
                
                Write a clear, friendly analysis that includes:
                - A brief overview of their performance
                - What's working well
                - 3-5 specific, actionable suggestions to improve engagement
                - Mention actual link names, numbers, and platforms from their data
                
                Keep it concise, conversational, and helpful. Use emojis to make it engaging.
                Do NOT return JSON. Write it as a normal readable analysis.
                """.formatted(dataContext);

        try {
            String response = chatClient.prompt().user(prompt).call().content();
            return ApiResponse.success(response, "AI analysis generated");
        } catch (Exception e) {
            return ApiResponse.success(
                    "⚠️ AI analysis is temporarily unavailable. Please try again later.",
                    "AI analysis fallback");
        }
    }

    // ── Bio Generator ──────────────────────────────────────

    @Override
    public ApiResponse<String> generateBio(User user) {
        List<Link> links = linkRepository.findByUserOrderByDisplayOrderAsc(user);

        StringBuilder context = new StringBuilder();
        context.append("Username: @").append(user.getRealUsername()).append("\n");
        if (user.getBio() != null && !user.getBio().isBlank()) {
            context.append("Current bio: ").append(user.getBio()).append("\n");
        }
        context.append("Platforms/links:\n");
        links.forEach(l -> context.append("- ").append(l.getTitle())
                .append(" (").append(l.getPlatform()).append("): ").append(l.getUrl()).append("\n"));

        String prompt = """
                You are a creative copywriter specializing in social media bios.
                Generate a catchy, concise bio (max 150 characters) for this link-in-bio profile.
                
                %s
                
                The bio should:
                - Reflect the user's platforms and content focus
                - Be engaging and personality-driven
                - Use 1-2 relevant emojis
                - Be concise (under 150 characters)
                
                Return ONLY the bio text, nothing else. No quotes.
                """.formatted(context);

        try {
            String bio = chatClient.prompt().user(prompt).call().content().trim();
            if (bio.startsWith("\"") && bio.endsWith("\"")) {
                bio = bio.substring(1, bio.length() - 1);
            }
            return ApiResponse.success(bio, "Bio generated successfully");
        } catch (Exception e) {
            return ApiResponse.error("Failed to generate bio: " + e.getMessage());
        }
    }

    // ── Link Title Optimizer ───────────────────────────────

    @Override
    public ApiResponse<String> optimizeLinkTitle(User user, Long linkId) {
        Link link = linkRepository.findByIdAndUser(linkId, user)
                .orElseThrow(() -> new RuntimeException("Link not found"));

        long clicks = clickEventRepository.countByLink(link);

        String prompt = """
                You are a conversion rate optimization expert.
                Suggest 3 better, more clickable titles for this link:
                
                Current title: "%s"
                Platform: %s
                URL: %s
                Total clicks so far: %d
                
                For each suggestion, briefly explain why it would perform better.
                Make them action-oriented and engaging. Use different styles: professional, casual, and bold.
                
                Write your response as a readable list, not JSON.
                """.formatted(link.getTitle(), link.getPlatform(), link.getUrl(), clicks);

        try {
            String response = chatClient.prompt().user(prompt).call().content();
            return ApiResponse.success(response, "Title suggestions generated");
        } catch (Exception e) {
            return ApiResponse.error("Failed to generate title suggestions: " + e.getMessage());
        }
    }

    // ── Platform Recommendations ───────────────────────────

    @Override
    public ApiResponse<String> recommendPlatforms(User user) {
        List<Link> links = linkRepository.findByUserOrderByDisplayOrderAsc(user);

        Set<String> existingPlatforms = links.stream()
                .map(Link::getPlatform)
                .collect(Collectors.toSet());

        StringBuilder context = new StringBuilder();
        context.append("Username: @").append(user.getRealUsername()).append("\n");
        context.append("Current platforms: ").append(existingPlatforms).append("\n");
        context.append("Current links:\n");
        links.forEach(l -> context.append("- ").append(l.getTitle())
                .append(" (").append(l.getPlatform()).append(")\n"));

        String prompt = """
                You are a social media strategist for a link-in-bio platform.
                Based on this user's existing links, recommend 3 platforms they should add.
                
                %s
                
                Only recommend platforms they DON'T already have.
                For each recommendation, explain the synergy with their existing platforms.
                
                Write your response as a friendly, readable analysis with clear recommendations. Not JSON.
                """.formatted(context);

        try {
            String response = chatClient.prompt().user(prompt).call().content();
            return ApiResponse.success(response, "Platform recommendations generated");
        } catch (Exception e) {
            return ApiResponse.error("Failed to generate recommendations: " + e.getMessage());
        }
    }
}
