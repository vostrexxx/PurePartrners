package partners.agreement_connection_info.config;

import org.springframework.context.annotation.Configuration;

import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class ChatIdGenerator {

    public static final AtomicInteger counter = new AtomicInteger();
    public static final int RESET_THRESHOLD = 10000;

    public static String generateChatId(Long initiatorId, Long receiverId) {
        long timestamp = System.currentTimeMillis();
        int uniqueCounter = counter.getAndUpdate((curr) -> (curr + 1) % RESET_THRESHOLD);
        return initiatorId + "-" + receiverId + "-" + timestamp + "-" + uniqueCounter;
    }
}
