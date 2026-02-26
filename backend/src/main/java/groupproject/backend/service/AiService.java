package groupproject.backend.service;

import groupproject.backend.model.User;
import groupproject.backend.response.ApiResponse;

public interface AiService {

    /** AI-powered analytics analysis based on user's click data */
    ApiResponse<String> getSmartSuggestions(User user);

    /** Generate a profile bio based on user's links and platforms */
    ApiResponse<String> generateBio(User user);

    /** Suggest better titles for a specific link */
    ApiResponse<String> optimizeLinkTitle(User user, Long linkId);

    /** Recommend platforms the user should add based on existing links */
    ApiResponse<String> recommendPlatforms(User user);
}
