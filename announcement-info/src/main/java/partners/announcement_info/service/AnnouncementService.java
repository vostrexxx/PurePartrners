package partners.announcement_info.service;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.InternalServerErrorException;
import jakarta.ws.rs.NotFoundException;
import lombok.AllArgsConstructor;
import org.hibernate.search.mapper.orm.Search;
import org.hibernate.search.mapper.orm.session.SearchSession;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import partners.announcement_info.config.Constants;
import partners.announcement_info.dto.*;
import partners.announcement_info.model.Announcement;
import partners.announcement_info.repository.AnnouncementRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AnnouncementService {
    private AnnouncementRepository repository;
    private final ModelMapper modelMapper = new ModelMapper();
    private final EntityManager entityManager;

    public GetAnnouncementInfoResponse getAnnouncementInfo(Long announcementId) {
        Announcement announcement = repository.findById(announcementId)
                .orElseThrow(() -> new NotFoundException(Constants.KEY_EXCEPTION_ANNOUNCEMENT_NOT_FOUND));
        AnnouncementInfo announcementInfo = modelMapper.map(announcement, AnnouncementInfo.class);

        //Получение ссылок на изображения
        String announcementImagesPath = Constants.KEY_DEFAULT_IMAGES_PATH + announcementId;
        File directory = new File(announcementImagesPath);
//        List<String> announcementImages = new ArrayList<>();
        List<String> announcementImages = Arrays.stream(Objects.requireNonNull(directory.listFiles()))
                .filter(File::isFile)
                .map(file -> announcementId + file.getName())
                .collect(Collectors.toList());
//        if (directory.exists() && directory.isDirectory() && directory.list().length > 0) {
//            for (File file : directory.listFiles()){
//                if (file.isFile()){
//                    String imagePath = announcementId + file.getName();
//                    announcementImages.add(imagePath);
//                }
//            }
//        } else
//            announcementImages = null;
        announcementInfo.setAnnouncementImages(announcementImages.isEmpty() ? null : announcementImages);
//        announcementInfo.setAnnouncementImages(announcementImages);
        return new GetAnnouncementInfoResponse(1, announcementInfo);
    }

    public OperationStatusResponse saveAnnouncementInfo(Long userId, AnnouncementInfo announcementInfo){
        Announcement announcement = modelMapper.map(announcementInfo, Announcement.class);
        announcement.setUserId(userId);
        try {
            repository.save(announcement);
            return new OperationStatusResponse(1);
        } catch (Exception e){
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_CUSTOMER);
        }
    }

    public OperationStatusResponse saveAnnouncementImages(SaveAnnouncementImages images) throws IOException {
        Long announcementId = images.getAnnouncementId();
        MultipartFile[] announcementImages = images.getAnnouncementImages();
        for (int i = 0; i < announcementImages.length; i++){
            String imagePath = Constants.KEY_DEFAULT_IMAGES_PATH + announcementId;
            Files.createDirectory(Path.of(imagePath));
            imagePath += "/" + i + Constants.KEY_DEFAULT_IMAGE_EXTENSION;
            Path anotherImagePath = Path.of(imagePath);
            announcementImages[i].transferTo(anotherImagePath);
            if (!Files.exists(anotherImagePath))
                return new OperationStatusResponse(0);
        }
        return new OperationStatusResponse(1);
    }

    public GetAllPreviews getAllCustomerPreviews(Long userId){
        List<Announcement> previews = repository.findAllByUserId(userId);
        List<AnnouncementInfoPreview> announcementInfoPreviews = new ArrayList<>();
        for (Announcement announcement : previews){
            AnnouncementInfoPreview anotherPreview = modelMapper.map(announcement, AnnouncementInfoPreview.class);
            announcementInfoPreviews.add(anotherPreview);
        }
        return new GetAllPreviews(1, announcementInfoPreviews);
    }

    public Resource getImageByPath(String imagePath){
        String fullImagePath = Constants.KEY_DEFAULT_IMAGES_PATH + imagePath;
        File file = new File(fullImagePath);
        if (file.exists()){
            return new FileSystemResource(file);
        } else
            return null;
    }

    public OperationStatusResponse deleteImageByPath(String imagePath) throws IOException {
        String fullImagePath = Constants.KEY_DEFAULT_IMAGES_PATH + imagePath;
        File file = new File(fullImagePath);
        boolean success = Files.deleteIfExists(file.toPath());
        if (success)
            return new OperationStatusResponse(1);
        else
            return new OperationStatusResponse(0);
    }

    public OperationStatusResponse deleteAnnouncement(Long announcementId){
        if (repository.existsById(announcementId)) {
            repository.deleteById(announcementId);
            return new OperationStatusResponse(1);
        } else
            return new OperationStatusResponse(0);
    }

    public OperationStatusResponse updateAnnouncement(Long announcementId, AnnouncementInfo announcementInfo){
        //TODO динамическое обновление полей (обновились ли поля или нет проверка нужна)
        Announcement announcement = repository.getReferenceById(announcementId);
        announcement.setTotalCost(announcementInfo.getTotalCost());
        announcement.setWorkCategories(announcementInfo.getWorkCategories());
        announcement.setMetro(announcementInfo.getMetro());
        announcement.setHouse(announcementInfo.getHouse());
        announcement.setHasOther(announcementInfo.getHasOther());
        announcement.setOther(announcementInfo.getOther());
        announcement.setObjectName(announcementInfo.getObjectName());
        announcement.setStartDate(announcementInfo.getStartDate());
        announcement.setFinishDate(announcementInfo.getFinishDate());
        announcement.setComments(announcementInfo.getComments());
        repository.save(announcement);
        return new OperationStatusResponse(1);
    }

    @Transactional
    public GetAllPreviews filterAnnouncement(Long userId, String text,
                                             Integer minPrice, Integer maxPrice,
                                             Boolean hasOther, String startDate, String endDate){
        SearchSession session = Search.session(entityManager);
        List<AnnouncementInfoPreview> finalFilteredResult;
        if (!Objects.equals(text, "")) {
            //Пока что просто поиск по словам
//            List<Announcement> result = session.search(Announcement.class)
//                    .where(f -> f.match()
//                            .fields("comments", "objectName", "other", "house", "metro", "workCategories")
//                            .matching(text))
//                    .fetchHits(20);

            //Поиск и фильтрация
//            SearchSession searchSession = Search.session(entityManager);
//            List<Announcement> result = session.search(Announcement.class)
//                    .where(f -> {
//                        f.bool().must(f.match()
//                                .fields("comments", "objectName", "other", "house", "metro", "workCategories")
//                                .matching(text));
//                        f.
//                    })
            List<Announcement> result = session.search(Announcement.class)
                    .where(f -> {
                        // Начинаем с базового условия для полнотекстового поиска
                        var query = f.bool()
                                .must(f.match()
                                        .fields("comments", "objectName", "other", "house", "metro", "workCategories")
                                        .matching(text));

                        // Добавляем фильтр по цене, если параметры заданы
                        if (minPrice != null && maxPrice != null) {
                            query = query.filter(f.range()
                                    .field("totalCost")
                                    .between(minPrice, maxPrice));
                        } else if (minPrice != null) {
                            query = query.filter(f.range()
                                    .field("totalCost")
                                    .atLeast(minPrice));
                        } else if (maxPrice != null) {
                            query = query.filter(f.range()
                                    .field("totalCost")
                                    .atMost(maxPrice));
                        }
                        // Добавляем фильтр по другому, если параметр задан
                        if (hasOther != null) {
                            query = query.filter(f.match()
                                    .field("hasOther")
                                    .matching(hasOther));
                        }

                        if (startDate != null)
                            query = query.filter(f.range()
                                    .field("startDate")
                                    .atLeast(startDate));

                        if (endDate != null)
                            query = query.filter(f.range()
                                    .field("endDate")
                                    .atMost(endDate));
                        return query;
                    })
                    .fetchHits(20); // Лимит на количество возвращаемых результатов

            finalFilteredResult = result.stream()
                    .filter(announcement -> !announcement.getUserId().equals(userId))
                    .map(announcement -> modelMapper.map(announcement, AnnouncementInfoPreview.class))
                    .toList();
        } else {
            List<Announcement> result = repository.findAll();
            finalFilteredResult = result.stream()
                    .filter(announcement -> !announcement.getUserId().equals(userId))
                    .map(announcement -> modelMapper.map(announcement, AnnouncementInfoPreview.class))
                    .toList();
            return new GetAllPreviews(1, finalFilteredResult);
        }
        return new GetAllPreviews(1, finalFilteredResult);
    }
}