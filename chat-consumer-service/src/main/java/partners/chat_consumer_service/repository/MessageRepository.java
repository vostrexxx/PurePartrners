package partners.chat_consumer_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.chat_consumer_service.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
}
