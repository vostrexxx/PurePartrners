package partners.chat_consumer_service.repository;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import partners.chat_consumer_service.model.Chat;

@Repository
public interface ChatRepository extends JpaRepository<Chat, String>{

}
