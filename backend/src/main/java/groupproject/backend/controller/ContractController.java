package groupproject.backend.controller;

import groupproject.backend.model.Contract;
import groupproject.backend.model.User;
import groupproject.backend.repository.ReviewRepository;
import groupproject.backend.request.CompleteContractRequest;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.ContractResponse;
import groupproject.backend.service.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;
    private final ReviewRepository reviewRepository;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getMy(
            @AuthenticationPrincipal User user) {
        List<Contract> contracts = contractService.getMyContracts(user);
        return ResponseEntity.ok(ApiResponse.success(
                contracts.stream().map(this::toResponse).toList(), "My contracts"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContractResponse>> getById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Contract c = contractService.getById(id, user);
        return ResponseEntity.ok(ApiResponse.success(toResponse(c), "Contract details"));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<ContractResponse>> complete(
            @PathVariable Long id,
            @RequestBody(required = false) CompleteContractRequest request,
            @AuthenticationPrincipal User user) {
        String note = request != null ? request.getCompletedNote() : null;
        Contract c = contractService.complete(id, note, user);
        return ResponseEntity.ok(ApiResponse.success(toResponse(c), "Contract completed"));
    }

    private ContractResponse toResponse(Contract c) {
        return ContractResponse.builder()
                .id(c.getId())
                .projectId(c.getProject().getId())
                .projectTitle(c.getProject().getTitle())
                .freelancerId(c.getFreelancer().getId())
                .freelancerName(c.getFreelancer().getRealName())
                .clientId(c.getClient().getId())
                .clientName(c.getClient().getRealName())
                .agreedPrice(c.getAgreedPrice())
                .status(c.getStatus().name())
                .completedNote(c.getCompletedNote())
                .startedAt(c.getStartedAt())
                .completedAt(c.getCompletedAt())
                .hasReview(reviewRepository.existsByContractId(c.getId()))
                .build();
    }
}
