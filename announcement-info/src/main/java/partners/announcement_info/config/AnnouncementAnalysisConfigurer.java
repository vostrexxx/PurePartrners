package partners.announcement_info.config;

import org.apache.lucene.analysis.core.LowerCaseFilterFactory;
import org.apache.lucene.analysis.core.WhitespaceTokenizerFactory;
import org.apache.lucene.analysis.miscellaneous.ASCIIFoldingFilterFactory;
import org.apache.lucene.analysis.ngram.EdgeNGramFilterFactory;
import org.apache.lucene.analysis.ru.RussianLightStemFilterFactory;
import org.hibernate.search.backend.lucene.analysis.LuceneAnalysisConfigurationContext;
import org.hibernate.search.backend.lucene.analysis.LuceneAnalysisConfigurer;

public class AnnouncementAnalysisConfigurer implements LuceneAnalysisConfigurer {
    @Override
    public void configure(LuceneAnalysisConfigurationContext context) {
        context.analyzer("autocomplete_indexing").custom()
                .tokenizer(WhitespaceTokenizerFactory.class)
                .tokenFilter(LowerCaseFilterFactory.class)
                .tokenFilter(ASCIIFoldingFilterFactory.class)
                .tokenFilter(EdgeNGramFilterFactory.class)
                .param("minGramSize", "1")
                .param("maxGramSize", "10")
                .tokenFilter(RussianLightStemFilterFactory.class);

        context.analyzer("autocomplete_search").custom()
                .tokenizer(WhitespaceTokenizerFactory.class)
                .tokenFilter(LowerCaseFilterFactory.class)
                .tokenFilter(ASCIIFoldingFilterFactory.class)
                .tokenFilter(RussianLightStemFilterFactory.class);
    }
}
