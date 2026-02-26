package groupproject.backend.service;

import groupproject.backend.model.User;
import groupproject.backend.request.CreateLinkRequest;
import groupproject.backend.request.ReorderLinksRequest;
import groupproject.backend.request.UpdateLinkRequest;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.LinkResponse;
import groupproject.backend.response.PublicProfileResponse;

import java.util.List;

public interface LinkService {

    ApiResponse<LinkResponse> createLink(User user, CreateLinkRequest request);

    ApiResponse<List<LinkResponse>> getUserLinks(User user);

    ApiResponse<LinkResponse> updateLink(User user, Long linkId, UpdateLinkRequest request);

    ApiResponse<Void> deleteLink(User user, Long linkId);

    ApiResponse<List<LinkResponse>> reorderLinks(User user, ReorderLinksRequest request);

    PublicProfileResponse getPublicProfile(String username);

    String trackClickAndGetUrl(Long linkId, String userAgent, String referrer);

    void trackProfileView(String username, String userAgent, String referrer);
}
