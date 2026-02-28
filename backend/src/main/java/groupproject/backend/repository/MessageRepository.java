package groupproject.backend.repository;

import groupproject.backend.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByContractIdOrderByCreatedAtAsc(Long contractId, Pageable pageable);

    @Modifying
    @Query("UPDATE Message m SET m.isRead = true, m.readAt = CURRENT_TIMESTAMP " +
            "WHERE m.contract.id = :contractId AND m.receiver.id = :userId AND m.isRead = false")
    int markAllAsRead(@Param("contractId") Long contractId, @Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver.id = :userId AND m.isRead = false")
    long countUnreadByReceiver(@Param("userId") Long userId);

    /**
     * Returns the latest message per contract for contracts the user is a party of.
     * Used to build the conversations list.
     */
    @Query("SELECT m FROM Message m " +
           "WHERE m.contract.id = :contractId " +
           "ORDER BY m.createdAt DESC")
    List<Message> findLatestByContractId(@Param("contractId") Long contractId, Pageable pageable);

    /**
     * Count unread messages for a specific contract and receiver.
     */
    @Query("SELECT COUNT(m) FROM Message m " +
           "WHERE m.contract.id = :contractId AND m.receiver.id = :userId AND m.isRead = false")
    long countUnreadByContractAndReceiver(@Param("contractId") Long contractId, @Param("userId") Long userId);
}
