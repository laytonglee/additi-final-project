package groupproject.backend.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyReviewRequest {

    @NotBlank(message = "Reply text is required")
    private String reply;
}
