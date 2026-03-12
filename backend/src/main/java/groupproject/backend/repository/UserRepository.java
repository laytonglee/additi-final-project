package groupproject.backend.repository;

import groupproject.backend.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByName(String name);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE " +
            "(:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "OR LOWER(u.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
            "(:role IS NULL OR r.name = :role) AND " +
            "(:banned IS NULL OR u.isBanned = :banned)")
    Page<User> searchUsers(
            @Param("search") String search,
            @Param("role") String role,
            @Param("banned") Boolean banned,
            Pageable pageable
    );
}
