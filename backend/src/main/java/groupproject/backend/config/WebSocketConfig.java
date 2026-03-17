package groupproject.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.DefaultContentTypeResolver;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.converter.MessageConverter;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final WebSocketAuthChannelInterceptor authChannelInterceptor;
    private final WebSocketHandshakeInterceptor handshakeInterceptor;
    private final ObjectMapper objectMapper;

    @Value("${app.frontend-url:http://localhost:3000}")
    private String frontendUrl;

    public WebSocketConfig(WebSocketAuthChannelInterceptor authChannelInterceptor,
                           WebSocketHandshakeInterceptor handshakeInterceptor,
                           ObjectMapper objectMapper) {
        this.authChannelInterceptor = authChannelInterceptor;
        this.handshakeInterceptor = handshakeInterceptor;
        this.objectMapper = objectMapper;
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
                .setAllowedOrigins("http://localhost:3000", "http://localhost:5173", frontendUrl)
                .withSockJS();

        // Also register a raw WebSocket endpoint (no SockJS) for native clients
        registry.addEndpoint("/ws")
                .addInterceptors(handshakeInterceptor)
                .setAllowedOrigins("http://localhost:3000", "http://localhost:5173", frontendUrl);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        // Authenticate STOMP CONNECT frames using JWT from cookies
        registration.interceptors(authChannelInterceptor);
    }

    @Override
    public boolean configureMessageConverters(List<MessageConverter> messageConverters) {
        DefaultContentTypeResolver resolver = new DefaultContentTypeResolver();
        resolver.setDefaultMimeType(MimeTypeUtils.APPLICATION_JSON);
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(objectMapper);
        converter.setContentTypeResolver(resolver);
        messageConverters.add(converter);
        return false;
    }
}
