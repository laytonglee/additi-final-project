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
@Table(name = "click_events", indexes = {
        @Index(name = "idx_click_link_id", columnList = "link_id"),
        @Index(name = "idx_click_clicked_at", columnList = "clickedAt")
})
public class ClickEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "link_id", nullable = false)
    private Link link;

    @Column(nullable = false)
    private LocalDateTime clickedAt;

    @Column(length = 20)
    private String deviceType; // MOBILE, DESKTOP, TABLET

    @Column(length = 50)
    private String browser;

    @Column(length = 512)
    private String referrer;

    @Column(length = 512)
    private String userAgent;

    @Column(length = 50)
    private String country;

    @PrePersist
    protected void onCreate() {
        if (this.clickedAt == null) {
            this.clickedAt = LocalDateTime.now();
        }
    }
}
