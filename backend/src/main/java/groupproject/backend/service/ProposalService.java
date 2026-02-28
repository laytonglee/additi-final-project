package groupproject.backend.service;

import groupproject.backend.model.Proposal;
import groupproject.backend.model.User;
import groupproject.backend.request.CreateProposalRequest;

import java.util.List;

public interface ProposalService {
    Proposal submit(Long projectId, CreateProposalRequest request, User freelancer);
    List<Proposal> getByProject(Long projectId, User client);
    List<Proposal> getMyProposals(User freelancer);
    Proposal accept(Long proposalId, User client);
    Proposal reject(Long proposalId, User client);
}
