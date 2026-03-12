package groupproject.backend.controller;

import groupproject.backend.model.User;
import groupproject.backend.repository.UserRepository;
import groupproject.backend.response.ApiResponse;
import groupproject.backend.service.R2StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final R2StorageService r2StorageService;
    private final UserRepository userRepository;

    /**
     * Upload a profile avatar image to Cloudflare R2.
     * The returned URL is automatically saved to the authenticated user's avatarUrl field.
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No file provided"));
        }

        // Validate content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only image files are allowed"));
        }

        // Validate file size (max 5 MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File size must not exceed 5 MB"));
        }

        try {
            String url = r2StorageService.upload(file, "avatars");

            // Persist the new avatar URL on the user record
            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            user.setAvatarUrl(url);
            userRepository.save(user);

            return ResponseEntity.ok(
                    ApiResponse.success(Map.of("url", url), "Avatar uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    /**
     * Upload a message attachment (image, PDF, Word, Excel, or plain text) to Cloudflare R2.
     * Returns the public URL, original file name, and content type.
     */
    @PostMapping(value = "/attachment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadAttachment(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No file provided"));
        }

        // Validate file size (max 10 MB)
        if (file.getSize() > 10L * 1024 * 1024) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File size must not exceed 10 MB"));
        }

        String contentType = file.getContentType();
        if (contentType == null || !isAllowedAttachmentType(contentType)) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(
                            "File type not allowed. Supported: images, PDF, Word, Excel, text"));
        }

        try {
            String url = r2StorageService.upload(file, "attachments");
            String originalName = file.getOriginalFilename() != null
                    ? file.getOriginalFilename() : "file";
            return ResponseEntity.ok(ApiResponse.success(
                    Map.of("url", url, "fileName", originalName, "contentType", contentType),
                    "Attachment uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    private boolean isAllowedAttachmentType(String contentType) {
        return contentType.startsWith("image/")
                || contentType.equals("application/pdf")
                || contentType.equals("application/msword")
                || contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                || contentType.equals("application/vnd.ms-excel")
                || contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                || contentType.startsWith("text/");
    }
}
