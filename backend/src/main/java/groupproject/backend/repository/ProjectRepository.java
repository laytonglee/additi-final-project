package groupproject.backend.repository;

import groupproject.backend.model.Project;
import groupproject.backend.model.User;
import groupproject.backend.model.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);

    Page<Project> findByClient(User client, Pageable pageable);

    @Query("SELECT p FROM Project p WHERE " +
            "(:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%'))) AND " +
            "(:category IS NULL OR p.category = :category) AND " +
            "(:minBudget IS NULL OR p.budgetMin >= :minBudget) AND " +
            "(:maxBudget IS NULL OR p.budgetMax <= :maxBudget) AND " +
            "(:status IS NULL OR p.status = :status)")
    Page<Project> search(
            @Param("keyword") String keyword,
            @Param("category") String category,
            @Param("minBudget") java.math.BigDecimal minBudget,
            @Param("maxBudget") java.math.BigDecimal maxBudget,
            @Param("status") ProjectStatus status,
            Pageable pageable
    );

    long countByClient(User client);
}
