package groupproject.backend.repository;

import groupproject.backend.model.Link;
import groupproject.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LinkRepository extends JpaRepository<Link, Long> {

    List<Link> findByUserOrderByDisplayOrderAsc(User user);

    List<Link> findByUserAndActiveTrueOrderByDisplayOrderAsc(User user);

    Optional<Link> findByIdAndUser(Long id, User user);

    int countByUser(User user);
}
