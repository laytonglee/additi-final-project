package groupproject.backend.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateProjectRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String category;

    private String projectType;

    private String experienceLevel;

    @NotNull(message = "Minimum budget is required")
    @Positive
    private BigDecimal budgetMin;

    @NotNull(message = "Maximum budget is required")
    @Positive
    private BigDecimal budgetMax;

    private LocalDate deadline;
}
