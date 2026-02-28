package groupproject.backend.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateProposalRequest {

    @NotBlank(message = "Pitch text is required")
    private String pitchText;

    @NotNull(message = "Offered price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal offeredPrice;
}
