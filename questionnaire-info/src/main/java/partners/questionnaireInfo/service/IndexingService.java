package partners.questionnaireInfo.service;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.massindexing.MassIndexer;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.springframework.stereotype.Service;
import partners.questionnaireInfo.model.Questionnaire;

@Service
@RequiredArgsConstructor
@Log4j2
public class IndexingService {
    private final EntityManager entityManager;

    @Transactional
    public void indexQuestionnaire() throws InterruptedException {
        log.info("Started indexing questionnaire");
        SearchSession session = Search.session(entityManager);
        MassIndexer indexer = session.massIndexer(Questionnaire.class).threadsToLoadObjects(2);
        indexer.startAndWait();
        log.info("Finished indexing questionnaire");
    }
}

