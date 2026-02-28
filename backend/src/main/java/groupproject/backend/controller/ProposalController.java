package groupproject.backend.controller;

import groupproject.backend.model.Proposal;
import groupproject.backend.model.User;
import groupproject.backend.request.CreateProposalRequest;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.response.ProposalResponse;
import groupproject.backend.service.ProposalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProposalController {

    private final ProposalService proposalService;

    @PostMapping("/api/projects/{id}/proposals")
    public ResponseEntity<ApiResponse<ProposalResponse>> submit(
            @PathVariable Long id,
            @Valid @RequestBody CreateProposalRequest request,
            @AuthenticationPrincipal User user) {
        Proposal p = proposalService.submit(id, request, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(toResponse(p), "Proposal submitted"));
    }

    @GetMapping("/api/projects/{id}/proposals")
    public ResponseEntity<ApiResponse<List<ProposalResponse>>> getByProject(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        List<Proposal> proposals = proposalService.getByProject(id, user);
        return ResponseEntity.ok(ApiResponse.success(
                proposals.stream().map(this::toResponse).toList(), "Proposals retrieved"));
    }

    @GetMapping("/api/proposals/my")
    public ResponseEntity<ApiResponse<List<ProposalResponse>>> getMy(
            @AuthenticationPrincipal User user) {
        List<Proposal> proposals = proposalService.getMyProposals(user);
        return ResponseEntity.ok(ApiResponse.success(
                proposals.stream().map(this::toResponse).toList(), "My proposals retrieved"));
    }

    @PutMapping("/api/proposals/{id}/accept")
    public ResponseEntity<ApiResponse<ProposalResponse>> accept(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Proposal p = proposalService.accept(id, user);
        return ResponseEntity.ok(ApiResponse.success(toResponse(p), "Proposal accepted, contract created"));
    }

    @PutMapping("/api/proposals/{id}/reject")
    public ResponseEntity<ApiResponse<ProposalResponse>> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Proposal p = proposalService.reject(id, user);
        return ResponseEntity.ok(ApiResponse.success(toResponse(p), "Proposal rejected"));
    }

    private ProposalResponse toResponse(Proposal p) {
        return ProposalResponse.builder()
                .id(p.getId())
                .projectId(p.getProject().getId())
                .projectTitle(p.getProject().getTitle())
                .freelancerId(p.getFreelancer().getId())
                .freelancerName(p.getFreelancer().getRealName())
                .freelancerAvatarUrl(p.getFreelancer().getAvatarUrl())
                .pitchText(p.getPitchText())
                .offeredPrice(p.getOfferedPrice())
                .status(p.getStatus().name())
                .readByClient(p.isReadByClient())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
