package groupproject.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor authChannelInterceptor;
    private final WebSocketHandshakeInterceptor handshakeInterceptor;

    public WebSocketConfig(WebSocketAuthChannelInterceptor authChannelInterceptor,
                           WebSocketHandshakeInterceptor handshakeInterceptor) {
        this.authChannelInterceptor = authChannelInterceptor;
        this.handshakeInterceptor = handshakeInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // In-memory broker for destinations starting with /topic and /queue
        registry.enableSimpleBroker("/topic", "/queue");
        // Prefix for messages bound to @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");
        // Prefix for user-specific destinations (/user/{userId}/queue/...)
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOrigins("http://localhost:3000", "http://localhost:5173")
                .withSockJS();

        // Also register a raw WebSocket endpoint (no SockJS) for native clients
        registry.addEndpoint("/ws")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOrigins("http://localhost:3000", "http://localhost:5173");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Authenticate STOMP CONNECT frames using JWT from cookies
        registration.interceptors(authChannelInterceptor);
    }
}
