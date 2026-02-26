package groupproject.backend.repository;

import groupproject.backend.model.ClickEvent;
import groupproject.backend.model.Link;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClickEventRepository extends JpaRepository<ClickEvent, Long> {

    long countByLink(Link link);

    long countByLinkIn(List<Link> links);

    List<ClickEvent> findByLinkInOrderByClickedAtDesc(List<Link> links);

    List<ClickEvent> findByLinkInAndClickedAtBetweenOrderByClickedAtDesc(
            List<Link> links, LocalDateTime start, LocalDateTime end);

    // ── Single-link queries ───────────────────────────
    List<ClickEvent> findByLinkOrderByClickedAtDesc(Link link);

    @Query("SELECT ce.deviceType, COUNT(ce) FROM ClickEvent ce WHERE ce.link = :link GROUP BY ce.deviceType")
    List<Object[]> countClicksGroupedByDeviceForLink(@Param("link") Link link);

    @Query("SELECT ce.browser, COUNT(ce) FROM ClickEvent ce WHERE ce.link = :link GROUP BY ce.browser")
    List<Object[]> countClicksGroupedByBrowserForLink(@Param("link") Link link);

    @Query("SELECT ce.referrer, COUNT(ce) FROM ClickEvent ce WHERE ce.link = :link AND ce.referrer IS NOT NULL GROUP BY ce.referrer ORDER BY COUNT(ce) DESC")
    List<Object[]> countClicksGroupedByReferrerForLink(@Param("link") Link link);

    @Query(value = "SELECT CAST(ce.clicked_at AS DATE) as click_date, COUNT(ce.id) FROM click_events ce WHERE ce.link_id = :linkId AND ce.clicked_at >= :since GROUP BY click_date ORDER BY click_date", nativeQuery = true)
    List<Object[]> countClicksPerDayForLink(@Param("linkId") Long linkId, @Param("since") LocalDateTime since);

    @Query(value = "SELECT EXTRACT(HOUR FROM ce.clicked_at) as click_hour, COUNT(ce.id) FROM click_events ce WHERE ce.link_id = :linkId GROUP BY click_hour ORDER BY click_hour", nativeQuery = true)
    List<Object[]> countClicksPerHourForLink(@Param("linkId") Long linkId);

    @Query(value = "SELECT EXTRACT(DOW FROM ce.clicked_at) as day_of_week, COUNT(ce.id) FROM click_events ce WHERE ce.link_id = :linkId GROUP BY day_of_week ORDER BY day_of_week", nativeQuery = true)
    List<Object[]> countClicksPerDayOfWeekForLink(@Param("linkId") Long linkId);

    @Query("SELECT ce.link.id, COUNT(ce) FROM ClickEvent ce WHERE ce.link IN :links GROUP BY ce.link.id")
    List<Object[]> countClicksGroupedByLink(@Param("links") List<Link> links);

    @Query("SELECT ce.deviceType, COUNT(ce) FROM ClickEvent ce WHERE ce.link IN :links GROUP BY ce.deviceType")
    List<Object[]> countClicksGroupedByDevice(@Param("links") List<Link> links);

    @Query("SELECT ce.browser, COUNT(ce) FROM ClickEvent ce WHERE ce.link IN :links GROUP BY ce.browser")
    List<Object[]> countClicksGroupedByBrowser(@Param("links") List<Link> links);

    @Query("SELECT ce.referrer, COUNT(ce) FROM ClickEvent ce WHERE ce.link IN :links AND ce.referrer IS NOT NULL GROUP BY ce.referrer ORDER BY COUNT(ce) DESC")
    List<Object[]> countClicksGroupedByReferrer(@Param("links") List<Link> links);

    @Query(value = "SELECT CAST(ce.clicked_at AS DATE) as click_date, COUNT(ce.id) FROM click_events ce WHERE ce.link_id IN :linkIds AND ce.clicked_at >= :since GROUP BY click_date ORDER BY click_date", nativeQuery = true)
    List<Object[]> countClicksPerDay(@Param("linkIds") List<Long> linkIds, @Param("since") LocalDateTime since);

    @Query(value = "SELECT EXTRACT(HOUR FROM ce.clicked_at) as click_hour, COUNT(ce.id) FROM click_events ce WHERE ce.link_id IN :linkIds GROUP BY click_hour ORDER BY click_hour", nativeQuery = true)
    List<Object[]> countClicksPerHour(@Param("linkIds") List<Long> linkIds);

    @Query(value = "SELECT EXTRACT(DOW FROM ce.clicked_at) as day_of_week, COUNT(ce.id) FROM click_events ce WHERE ce.link_id IN :linkIds GROUP BY day_of_week ORDER BY day_of_week", nativeQuery = true)
    List<Object[]> countClicksPerDayOfWeek(@Param("linkIds") List<Long> linkIds);
}
