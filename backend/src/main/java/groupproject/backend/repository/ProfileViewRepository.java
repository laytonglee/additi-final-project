package groupproject.backend.repository;

import groupproject.backend.model.ProfileView;
import groupproject.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ProfileViewRepository extends JpaRepository<ProfileView, Long> {

    long countByUser(User user);

    long countByUserAndViewedAtAfter(User user, LocalDateTime since);

    @Query(value = "SELECT CAST(pv.viewed_at AS DATE) as view_date, COUNT(pv.id) " +
            "FROM profile_views pv WHERE pv.user_id = :userId AND pv.viewed_at >= :since " +
            "GROUP BY view_date ORDER BY view_date", nativeQuery = true)
    List<Object[]> countViewsPerDay(@Param("userId") Long userId, @Param("since") LocalDateTime since);

    @Query("SELECT pv.deviceType, COUNT(pv) FROM ProfileView pv WHERE pv.user = :user GROUP BY pv.deviceType")
    List<Object[]> countViewsGroupedByDevice(@Param("user") User user);

    @Query("SELECT pv.referrer, COUNT(pv) FROM ProfileView pv WHERE pv.user = :user AND pv.referrer IS NOT NULL GROUP BY pv.referrer ORDER BY COUNT(pv) DESC")
    List<Object[]> countViewsGroupedByReferrer(@Param("user") User user);
}
