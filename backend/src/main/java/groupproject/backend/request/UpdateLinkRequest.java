package groupproject.backend.request;

import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class UpdateLinkRequest {

    private String title;

    @URL(message = "Must be a valid URL")
    private String url;

    private String platform;

    private Boolean active;

    private String description;

    private Boolean featured;
}
