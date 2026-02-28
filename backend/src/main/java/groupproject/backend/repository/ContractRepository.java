package groupproject.backend.repository;

import groupproject.backend.model.Contract;
import groupproject.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    @Query("SELECT c FROM Contract c WHERE c.client = :user OR c.freelancer = :user ORDER BY c.startedAt DESC")
    List<Contract> findByClientOrFreelancer(@Param("user") User user);

    Optional<Contract> findByProjectId(Long projectId);

    boolean existsByProjectId(Long projectId);

    @Query("SELECT SUM(c.agreedPrice) FROM Contract c WHERE c.freelancer = :user AND c.status = groupproject.backend.model.enums.ContractStatus.COMPLETED")
    java.math.BigDecimal sumEarningsByFreelancer(@Param("user") User user);

    long countByClient(User client);

    long countByFreelancer(User freelancer);
}
