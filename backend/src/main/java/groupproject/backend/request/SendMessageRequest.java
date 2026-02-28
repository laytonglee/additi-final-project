package groupproject.backend.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendMessageRequest {

    @NotBlank(message = "Message body is required")
    private String body;

    private String attachmentUrl;
}
