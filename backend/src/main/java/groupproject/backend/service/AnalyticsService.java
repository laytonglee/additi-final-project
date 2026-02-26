package groupproject.backend.service;

import groupproject.backend.model.User;
import groupproject.backend.response.AiSuggestionResponse;
import groupproject.backend.response.AnalyticsResponse;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.LinkDetailAnalyticsResponse;

public interface AnalyticsService {

    ApiResponse<AnalyticsResponse> getAnalytics(User user, Integer days);

    ApiResponse<AiSuggestionResponse> getAiSuggestions(User user);

    ApiResponse<LinkDetailAnalyticsResponse> getLinkDetail(User user, Long linkId, Integer days);

    String exportCsv(User user, Integer days);
}
