package groupproject.backend.service.impl;

import groupproject.backend.model.Contract;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ContractStatus;
import groupproject.backend.model.enums.NotificationType;
import groupproject.backend.model.enums.ProjectStatus;
import groupproject.backend.model.enums.ReferenceType;
import groupproject.backend.repository.ContractRepository;
import groupproject.backend.repository.ProjectRepository;
import groupproject.backend.service.ContractService;
import groupproject.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepository contractRepository;
    private final ProjectRepository projectRepository;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public List<Contract> getMyContracts(User user) {
        return contractRepository.findByClientOrFreelancer(user);
    }

    @Override
    public Contract getById(Long id, User user) {
        Contract c = contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));

        if (!c.getClient().getId().equals(user.getId()) &&
                !c.getFreelancer().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your contract");
        }

        return c;
    }

    @Override
    @Transactional
    public Contract complete(Long id, String completedNote, User client) {
        Contract c = contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contract not found"));

        if (!c.getClient().getId().equals(client.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the client can complete a contract");
        }

        if (c.getStatus() != ContractStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Contract is not active");
        }

        c.setStatus(ContractStatus.COMPLETED);
        c.setCompletedNote(completedNote);
        c.setCompletedAt(LocalDateTime.now());
        contractRepository.save(c);

        // Update project status
        c.getProject().setStatus(ProjectStatus.COMPLETED);
        projectRepository.save(c.getProject());

        // Notify freelancer
        notificationService.create(
                c.getFreelancer(),
                NotificationType.CONTRACT_COMPLETED,
                "Contract Completed",
                "The contract for \"" + c.getProject().getTitle() + "\" has been marked as complete by " + client.getRealName(),
                c.getId(),
                ReferenceType.CONTRACT
        );

        // Broadcast status change so both parties see it in real time
        messagingTemplate.convertAndSend(
                "/topic/contracts/" + c.getId() + "/status",
                java.util.Map.of("status", c.getStatus().name())
        );

        return c;
    }
}
