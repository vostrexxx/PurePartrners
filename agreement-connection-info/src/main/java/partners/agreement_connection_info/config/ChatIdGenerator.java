package partners.agreement_connection_info.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.atomic.AtomicInteger;

@Configuration
@Slf4j
public class ChatIdGenerator {

    public static final AtomicInteger counter = new AtomicInteger();
    public static final int RESET_THRESHOLD = 10000;

    public static String generateChatId(Long initiatorId, Long receiverId) {
        long timestamp = System.currentTimeMillis();
        log.info("Текущие миллисекунды " + timestamp);
        int uniqueCounter = counter.getAndUpdate((curr) -> (curr + 1) % RESET_THRESHOLD);
        return initiatorId + "-" + receiverId + "-" + timestamp + "-" + uniqueCounter;
    }
}
