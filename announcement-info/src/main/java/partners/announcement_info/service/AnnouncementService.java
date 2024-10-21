package partners.announcement_info.service;

import jakarta.ws.rs.InternalServerErrorException;
import lombok.AllArgsConstructor;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class AnnouncementService {
    private AnnouncementRepository repository;
    private final ModelMapper modelMapper = new ModelMapper();

    public GetAnnouncementInfoResponse getAnnouncementInfo(Long announcementId) {
        Optional<Announcement> announcement = repository.findById(announcementId);
        if (announcement.isEmpty()){
            return new GetAnnouncementInfoResponse(0, null);
        }
        Announcement actualAnnouncementInfo = announcement.get();
        AnnouncementInfo announcementInfo = modelMapper.map(actualAnnouncementInfo, AnnouncementInfo.class);

        //Получение ссылок на изображения
        String announcementImagesPath = Constants.KEY_DEFAULT_IMAGES_PATH + announcementId;
        File directory = new File(announcementImagesPath);
        List<String> announcementImages = new ArrayList<>();
        if (directory.exists() && directory.isDirectory() && directory.list().length > 0) {
            for (File file : directory.listFiles()){
                if (file.isFile()){
                    String imagePath = announcementId + file.getName();
                    announcementImages.add(imagePath);
                }
            }
        } else
            announcementImages = null;
        announcementInfo.setAnnouncementImages(announcementImages);
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
            File directory = new File(imagePath);
            if (!directory.exists())
                directory.mkdirs();
            imagePath += "/" + i + Constants.KEY_DEFAULT_IMAGE_EXTENSION;
            File userImage = new File(imagePath);
            announcementImages[i].transferTo(userImage.toPath());
            File checkFile = new File(imagePath);
            if (!checkFile.isFile())
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

    public GetAllPreviews filterPreviews(Long userId){
        List<Announcement> previews = repository.findAllByUserIdNot(userId);
        List<AnnouncementInfoPreview> announcementInfoPreviews = new ArrayList<>();
        for (Announcement announcement : previews){
            AnnouncementInfoPreview anotherPreview = modelMapper.map(announcement, AnnouncementInfoPreview.class);
            announcementInfoPreviews.add(anotherPreview);
        }
        if (announcementInfoPreviews.isEmpty())
            return new GetAllPreviews(0, null);
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
}
