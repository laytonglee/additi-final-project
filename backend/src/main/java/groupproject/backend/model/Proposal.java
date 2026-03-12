package groupproject.backend.model;

import groupproject.backend.model.enums.ProposalStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
    name = "proposals",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_proposal_project_freelancer", columnNames = {"project_id", "freelancer_id"})
    }
)
public class Proposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private User freelancer;

    @Column(name = "pitch_text", columnDefinition = "TEXT")
    private String pitchText;

    @Column(name = "offered_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal offeredPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProposalStatus status = ProposalStatus.PENDING;

    @Column(name = "read_by_client", nullable = false)
    private boolean readByClient = false;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
