package groupproject.backend.config;

import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.format.DateTimeFormatter;
import java.util.TimeZone;

/**
 * Forces Jackson to serialize all dates in UTC with an ISO-8601 offset suffix
 * so the browser can correctly convert to the user's local timezone.
 *
 * Without this, LocalDateTime is serialized without any timezone info (e.g.
 * "2026-03-17T12:01:00") and the browser treats it as local time, causing
 * wrong timestamps when the server runs in a different timezone (e.g. Render
 * uses UTC while the user is in UTC+7).
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jacksonCustomizer() {
        return builder -> {
            builder.timeZone(TimeZone.getTimeZone("UTC"));
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
            // Serialize LocalDateTime with a trailing "Z" so JS Date() knows it's UTC
            builder.serializers(new LocalDateTimeSerializer(
                    DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")));
        };
    }
}
