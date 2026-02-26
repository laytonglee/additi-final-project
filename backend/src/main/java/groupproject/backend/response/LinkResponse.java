package groupproject.backend.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LinkResponse {

    private Long id;
    private String title;
    private String url;
    private String platform;
    private Integer displayOrder;
    private Boolean active;
    private Long totalClicks;
    private String description;
    private Boolean featured;
    private LocalDateTime createdAt;
}
