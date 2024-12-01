package partners.chat_consumer_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import partners.chat_consumer_service.model.Chat;
import partners.chat_consumer_service.model.Message;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findAllByChat(Chat chat);
    Message findFirstByChatOrderByTimestampDesc(Chat chat);
}
