package groupproject.backend.controller;

import groupproject.backend.model.Contract;
import groupproject.backend.model.User;
import groupproject.backend.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class TypingController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ContractRepository contractRepository;

    /**
     * Relay a typing indicator to all subscribers on the contract's typing topic.
     *
     * Clients publish to:  /app/contracts/{contractId}/typing
     * Subscribers receive: /topic/contracts/{contractId}/typing
     *
     * Payload: { "typing": true|false }
     * Broadcast: { "userId": Long, "userName": String, "typing": boolean }
     */
    @MessageMapping("/contracts/{contractId}/typing")
    public void typing(
            @DestinationVariable Long contractId,
            @Payload Map<String, Object> payload,
            Principal principal) {

        if (principal == null) return;

        // Extract the User from the STOMP session principal set during CONNECT auth
        UsernamePasswordAuthenticationToken auth =
                (UsernamePasswordAuthenticationToken) principal;
        User user = (User) auth.getPrincipal();

        // Silently ignore if user is not a party to this contract
        Optional<Contract> contractOpt = contractRepository.findById(contractId);
        if (contractOpt.isEmpty()) return;
        Contract contract = contractOpt.get();
        if (!contract.getClient().getId().equals(user.getId())
                && !contract.getFreelancer().getId().equals(user.getId())) {
            return;
        }

        boolean isTyping = Boolean.TRUE.equals(payload.get("typing"));

        Map<String, Object> typingEvent = Map.of(
                "userId", user.getId(),
                "userName", user.getRealName(),
                "typing", isTyping
        );

        messagingTemplate.convertAndSend(
                "/topic/contracts/" + contractId + "/typing", typingEvent);
    }
}
