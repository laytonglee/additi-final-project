package groupproject.backend.service.impl;

import groupproject.backend.model.ClickEvent;
import groupproject.backend.model.Link;
import groupproject.backend.model.ProfileView;
import groupproject.backend.model.User;
import groupproject.backend.repository.ClickEventRepository;
import groupproject.backend.repository.LinkRepository;
import groupproject.backend.repository.ProfileViewRepository;
import groupproject.backend.repository.UserRepository;
import groupproject.backend.request.CreateLinkRequest;
import groupproject.backend.request.ReorderLinksRequest;
import groupproject.backend.request.UpdateLinkRequest;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.LinkResponse;
import groupproject.backend.response.PublicProfileResponse;
import groupproject.backend.service.LinkService;
import groupproject.backend.util.PlatformDetector;
import groupproject.backend.util.UserAgentParser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LinkServiceImpl implements LinkService {

    private final LinkRepository linkRepository;
    private final ClickEventRepository clickEventRepository;
    private final UserRepository userRepository;
    private final ProfileViewRepository profileViewRepository;

    public LinkServiceImpl(LinkRepository linkRepository,
                           ClickEventRepository clickEventRepository,
                           UserRepository userRepository,
                           ProfileViewRepository profileViewRepository) {
        this.linkRepository = linkRepository;
        this.clickEventRepository = clickEventRepository;
        this.userRepository = userRepository;
        this.profileViewRepository = profileViewRepository;
    }

    @Override
    @Transactional
    public ApiResponse<LinkResponse> createLink(User user, CreateLinkRequest request) {
        Link link = new Link();
        link.setUser(user);
        link.setTitle(request.getTitle());
        link.setUrl(request.getUrl());
        link.setPlatform(request.getPlatform() != null ? request.getPlatform() : PlatformDetector.detect(request.getUrl()));
        link.setDisplayOrder(linkRepository.countByUser(user));
        link.setActive(true);
        if (request.getDescription() != null) link.setDescription(request.getDescription());
        if (request.getFeatured() != null) link.setFeatured(request.getFeatured());

        linkRepository.save(link);

        LinkResponse response = mapToResponse(link, 0L);
        return ApiResponse.success(response, "Link created successfully");
    }

    @Override
    public ApiResponse<List<LinkResponse>> getUserLinks(User user) {
        List<Link> links = linkRepository.findByUserOrderByDisplayOrderAsc(user);

        // Get click counts for all links
        Map<Long, Long> clickCounts = getClickCountsMap(links);

        List<LinkResponse> responses = links.stream()
                .map(link -> mapToResponse(link, clickCounts.getOrDefault(link.getId(), 0L)))
                .collect(Collectors.toList());

        return ApiResponse.success(responses, "Links retrieved successfully");
    }

    @Override
    @Transactional
    public ApiResponse<LinkResponse> updateLink(User user, Long linkId, UpdateLinkRequest request) {
        Link link = linkRepository.findByIdAndUser(linkId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));

        if (request.getTitle() != null) link.setTitle(request.getTitle());
        if (request.getUrl() != null) {
            link.setUrl(request.getUrl());
            link.setPlatform(request.getPlatform() != null ? request.getPlatform() : PlatformDetector.detect(request.getUrl()));
        } else if (request.getPlatform() != null) {
            link.setPlatform(request.getPlatform());
        }
        if (request.getActive() != null) link.setActive(request.getActive());
        if (request.getDescription() != null) link.setDescription(request.getDescription());
        if (request.getFeatured() != null) link.setFeatured(request.getFeatured());

        linkRepository.save(link);

        long clicks = clickEventRepository.countByLink(link);
        return ApiResponse.success(mapToResponse(link, clicks), "Link updated successfully");
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteLink(User user, Long linkId) {
        Link link = linkRepository.findByIdAndUser(linkId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));

        linkRepository.delete(link);
        return ApiResponse.success(null, "Link deleted successfully");
    }

    @Override
    @Transactional
    public ApiResponse<List<LinkResponse>> reorderLinks(User user, ReorderLinksRequest request) {
        List<Long> linkIds = request.getLinkIds();

        for (int i = 0; i < linkIds.size(); i++) {
            Link link = linkRepository.findByIdAndUser(linkIds.get(i), user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));
            link.setDisplayOrder(i);
            linkRepository.save(link);
        }

        return getUserLinks(user);
    }

    @Override
    public PublicProfileResponse getPublicProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Link> activeLinks = linkRepository.findByUserAndActiveTrueOrderByDisplayOrderAsc(user);

        List<PublicProfileResponse.PublicLinkItem> linkItems = activeLinks.stream()
                .map(link -> PublicProfileResponse.PublicLinkItem.builder()
                        .id(link.getId())
                        .title(link.getTitle())
                        .url(link.getUrl())
                        .platform(link.getPlatform())
                        .description(link.getDescription())
                        .featured(link.getFeatured())
                        .build())
                .collect(Collectors.toList());

        return PublicProfileResponse.builder()
                .username(user.getRealUsername())
                .bio(user.getBio())
                .photo(user.getPhoto())
                .themeColor(user.getThemeColor())
                .backgroundColor(user.getBackgroundColor())
                .buttonStyle(user.getButtonStyle())
                .links(linkItems)
                .build();
    }

    @Override
    @Transactional
    public String trackClickAndGetUrl(Long linkId, String userAgent, String referrer) {
        Link link = linkRepository.findById(linkId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));

        ClickEvent event = new ClickEvent();
        event.setLink(link);
        event.setClickedAt(LocalDateTime.now());
        event.setUserAgent(userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 512)) : null);
        event.setReferrer(referrer != null ? referrer.substring(0, Math.min(referrer.length(), 512)) : null);
        event.setDeviceType(UserAgentParser.getDeviceType(userAgent));
        event.setBrowser(UserAgentParser.getBrowser(userAgent));

        clickEventRepository.save(event);

        return link.getUrl();
    }

    // ── Helpers ──────────────────────────────────────────────

    @Override
    @Transactional
    public void trackProfileView(String username, String userAgent, String referrer) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) return;

        ProfileView view = new ProfileView();
        view.setUser(user);
        view.setViewedAt(LocalDateTime.now());
        view.setUserAgent(userAgent != null ? userAgent.substring(0, Math.min(userAgent.length(), 512)) : null);
        view.setReferrer(referrer != null ? referrer.substring(0, Math.min(referrer.length(), 512)) : null);
        view.setDeviceType(UserAgentParser.getDeviceType(userAgent));
        view.setBrowser(UserAgentParser.getBrowser(userAgent));

        profileViewRepository.save(view);
    }

    private LinkResponse mapToResponse(Link link, Long totalClicks) {
        return LinkResponse.builder()
                .id(link.getId())
                .title(link.getTitle())
                .url(link.getUrl())
                .platform(link.getPlatform())
                .displayOrder(link.getDisplayOrder())
                .active(link.getActive())
                .totalClicks(totalClicks)
                .description(link.getDescription())
                .featured(link.getFeatured())
                .createdAt(link.getCreatedAt())
                .build();
    }

    private Map<Long, Long> getClickCountsMap(List<Link> links) {
        if (links.isEmpty()) return Map.of();
        return clickEventRepository.countClicksGroupedByLink(links).stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));
    }
}
