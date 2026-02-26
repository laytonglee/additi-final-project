package groupproject.backend.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.hibernate.validator.constraints.URL;

@Data
public class CreateLinkRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "URL is required")
    @URL(message = "Must be a valid URL")
    private String url;

    private String platform;

    private String description;

    private Boolean featured;
}
