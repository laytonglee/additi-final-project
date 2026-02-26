package groupproject.backend.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ReorderLinksRequest {

    @NotEmpty(message = "Link IDs list cannot be empty")
    private List<Long> linkIds;
}
