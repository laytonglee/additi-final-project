package groupproject.backend;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    @Value("${spring.ai.google.genai.project-id:NOT_FOUND}")
    private String projectId;

    @Value("${spring.ai.google.genai.api-key:NOT_FOUND}")
    private String apiKey;

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @PostConstruct
    public void checkProperties() {
        System.out.println("==================================");
        System.out.println("Gemini Project ID: " + projectId);
        System.out.println("Gemini API Key: " +
                (apiKey.equals("NOT_FOUND") ? "NOT_FOUND" : "LOADED"));
        System.out.println("==================================");
    }
}