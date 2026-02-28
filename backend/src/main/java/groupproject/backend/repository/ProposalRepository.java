package groupproject.backend.repository;

import groupproject.backend.model.Proposal;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ProposalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    List<Proposal> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Proposal> findByFreelancerOrderByCreatedAtDesc(User freelancer);

    boolean existsByProjectIdAndFreelancer(Long projectId, User freelancer);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, ProposalStatus status);

    long countByFreelancer(User freelancer);
}
