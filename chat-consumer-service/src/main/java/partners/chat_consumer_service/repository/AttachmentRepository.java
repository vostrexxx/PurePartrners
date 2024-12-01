package partners.chat_consumer_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import partners.chat_consumer_service.model.Attachment;
import partners.chat_consumer_service.model.Message;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findAllByMessage(Message message);
}
