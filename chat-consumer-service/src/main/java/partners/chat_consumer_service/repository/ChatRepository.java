package partners.chat_consumer_service.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import partners.chat_consumer_service.model.Chat;

import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, String>{
    @Query("SELECT c FROM Chat c WHERE (c.chatReceiverId = :userId OR c.chatInitiatorId = :userId) AND c.isSpecialist = :isSpecialist")
    List<Chat> findAllChatsByUserIdAndIsSpecialist(@Param("userId") Long userId, @Param("isSpecialist") boolean isSpecialist);
}
