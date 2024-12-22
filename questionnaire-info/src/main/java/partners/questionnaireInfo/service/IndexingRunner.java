package partners.questionnaireInfo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Log4j2
public class IndexingRunner implements CommandLineRunner {
    private final IndexingService indexingService;

    @Override
    public void run(String... args) {
        log.info("Executing indexing on application startup");
        try {
            indexingService.indexQuestionnaire();
        } catch (InterruptedException e) {
            log.error("Indexing was interrupted", e);
        }
    }
}
