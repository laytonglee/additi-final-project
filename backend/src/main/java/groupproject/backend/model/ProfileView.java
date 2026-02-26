package groupproject.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "profile_views", indexes = {
        @Index(name = "idx_pv_user_id", columnList = "user_id"),
        @Index(name = "idx_pv_viewed_at", columnList = "viewedAt")
})
public class ProfileView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime viewedAt;

    @Column(length = 20)
    private String deviceType;

    @Column(length = 50)
    private String browser;

    @Column(length = 512)
    private String referrer;

    @Column(length = 512)
    private String userAgent;

    @PrePersist
    protected void onCreate() {
        if (this.viewedAt == null) {
            this.viewedAt = LocalDateTime.now();
        }
    }
}
