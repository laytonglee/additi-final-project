package groupproject.backend.config;

import groupproject.backend.service.JwtService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    public WebSocketAuthChannelInterceptor(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String token = extractTokenFromHandshake(accessor);

            if (token != null) {
                try {
                    String username = jwtService.extractUserName(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    if (jwtService.validateToken(token, userDetails)) {
                        UsernamePasswordAuthenticationToken auth =
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                        accessor.setUser(auth);
                    }
                } catch (Exception ignored) {
                    // Invalid token — connection will proceed unauthenticated
                }
            }
        }

        return message;
    }

    /**
     * Extract the JWT from the Cookie header that was passed during the HTTP handshake.
     */
    @SuppressWarnings("unchecked")
    private String extractTokenFromHandshake(StompHeaderAccessor accessor) {
        // Try to get token from native headers (cookies are forwarded in the handshake)
        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
        if (sessionAttributes != null) {
            Object token = sessionAttributes.get("accessToken");
            if (token instanceof String) {
                return (String) token;
            }
        }

        // Fallback: check STOMP native headers for a custom "Authorization" header
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders != null && !authHeaders.isEmpty()) {
            String header = authHeaders.get(0);
            if (header.startsWith("Bearer ")) {
                return header.substring(7);
            }
        }

        return null;
    }
}
