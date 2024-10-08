package partners.questionnaireInfo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import partners.questionnaireInfo.dto.QuestionnairePreview;
import partners.questionnaireInfo.model.Questionnaire;

import java.util.List;

@Repository
public interface QuestionnaireRepository extends JpaRepository<Questionnaire, Long> {
    List<Questionnaire> findAllByUserId(Long userId);
}
