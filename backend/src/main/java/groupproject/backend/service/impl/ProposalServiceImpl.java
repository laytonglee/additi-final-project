package groupproject.backend.service.impl;

import groupproject.backend.model.*;
import groupproject.backend.model.enums.ContractStatus;
import groupproject.backend.model.enums.NotificationType;
import groupproject.backend.model.enums.ProjectStatus;
import groupproject.backend.model.enums.ProposalStatus;
import groupproject.backend.model.enums.ReferenceType;
import groupproject.backend.repository.ContractRepository;
import groupproject.backend.repository.ProjectRepository;
import groupproject.backend.repository.ProposalRepository;
import groupproject.backend.request.CreateProposalRequest;
import groupproject.backend.service.NotificationService;
import groupproject.backend.service.ProposalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProposalServiceImpl implements ProposalService {

    private final ProposalRepository proposalRepository;
    private final ProjectRepository projectRepository;
    private final ContractRepository contractRepository;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public Proposal submit(Long projectId, CreateProposalRequest request, User freelancer) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (project.getStatus() != ProjectStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project is not open for proposals");
        }

        if (proposalRepository.existsByProjectIdAndFreelancer(projectId, freelancer)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already submitted a proposal");
        }

        Proposal proposal = new Proposal();
        proposal.setProject(project);
        proposal.setFreelancer(freelancer);
        proposal.setPitchText(request.getPitchText());
        proposal.setOfferedPrice(request.getOfferedPrice());
        proposal.setStatus(ProposalStatus.PENDING);
        Proposal saved = proposalRepository.save(proposal);

        // Notify client
        notificationService.create(
                project.getClient(),
                NotificationType.PROPOSAL_RECEIVED,
                "New Proposal Received",
                freelancer.getRealName() + " submitted a proposal for \"" + project.getTitle() + "\"",
                saved.getId(),
                ReferenceType.PROPOSAL
        );

        return saved;
    }

    @Override
    public List<Proposal> getByProject(Long projectId, User client) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));

        if (!project.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your project");
        }

        return proposalRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
    }

    @Override
    public List<Proposal> getMyProposals(User freelancer) {
        return proposalRepository.findByFreelancerOrderByCreatedAtDesc(freelancer);
    }

    @Override
    @Transactional
    public Proposal accept(Long proposalId, User client) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposal not found"));

        Project project = proposal.getProject();
        if (!project.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your project");
        }

        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proposal already processed");
        }

        // Accept this proposal
        proposal.setStatus(ProposalStatus.ACCEPTED);
        proposalRepository.save(proposal);

        // Reject all other pending proposals
        List<Proposal> others = proposalRepository.findByProjectIdOrderByCreatedAtDesc(project.getId());
        for (Proposal other : others) {
            if (!other.getId().equals(proposalId) && other.getStatus() == ProposalStatus.PENDING) {
                other.setStatus(ProposalStatus.REJECTED);
                proposalRepository.save(other);
                notificationService.create(
                        other.getFreelancer(),
                        NotificationType.PROPOSAL_REJECTED,
                        "Proposal Rejected",
                        "Your proposal for \"" + project.getTitle() + "\" was not selected.",
                        other.getId(),
                        ReferenceType.PROPOSAL
                );
            }
        }

        // Update project status
        project.setStatus(ProjectStatus.IN_PROGRESS);
        projectRepository.save(project);

        // Auto-create contract
        Contract contract = new Contract();
        contract.setProject(project);
        contract.setClient(client);
        contract.setFreelancer(proposal.getFreelancer());
        contract.setAgreedPrice(proposal.getOfferedPrice());
        contract.setStatus(ContractStatus.ACTIVE);
        Contract savedContract = contractRepository.save(contract);

        // Notify freelancer
        notificationService.create(
                proposal.getFreelancer(),
                NotificationType.PROPOSAL_ACCEPTED,
                "Proposal Accepted!",
                "Your proposal for \"" + project.getTitle() + "\" has been accepted! A contract has been created.",
                savedContract.getId(),
                ReferenceType.CONTRACT
        );

        notificationService.create(
                proposal.getFreelancer(),
                NotificationType.CONTRACT_CREATED,
                "New Contract",
                "Contract created for \"" + project.getTitle() + "\" with " + client.getRealName(),
                savedContract.getId(),
                ReferenceType.CONTRACT
        );

        return proposal;
    }

    @Override
    @Transactional
    public Proposal reject(Long proposalId, User client) {
        Proposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proposal not found"));

        if (!proposal.getProject().getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your project");
        }

        if (proposal.getStatus() != ProposalStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proposal already processed");
        }

        proposal.setStatus(ProposalStatus.REJECTED);
        proposalRepository.save(proposal);

        notificationService.create(
                proposal.getFreelancer(),
                NotificationType.PROPOSAL_REJECTED,
                "Proposal Rejected",
                "Your proposal for \"" + proposal.getProject().getTitle() + "\" was rejected.",
                proposal.getId(),
                ReferenceType.PROPOSAL
        );

        return proposal;
    }
}
