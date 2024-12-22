package partners.announcement_info.controller;

import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import partners.announcement_info.dto.*;
import partners.announcement_info.exception.CantDeleteAnnouncementException;
import partners.announcement_info.exception.CantUpdateAnnouncementException;
import partners.announcement_info.service.AnnouncementService;

import java.io.IOException;
import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/announcement")
public class AnnouncementController {

    private final AnnouncementService service;

    @GetMapping("")
    public ResponseEntity<GetAnnouncementInfoResponse> getAnnouncementInfo(@RequestParam Long announcementId){
        GetAnnouncementInfoResponse response = service.getAnnouncementInfo(announcementId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("")
    public ResponseEntity<OperationStatusResponse> saveAnnouncementInfo(@RequestHeader Long userId, @RequestBody AnnouncementInfo announcementInfo){
        OperationStatusResponse response = service.saveAnnouncementInfo(userId, announcementInfo);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/image")
    public ResponseEntity<Resource> getImageByPath(@RequestParam String imagePath){
        Resource image = service.getImageByPath(imagePath);
        return ResponseEntity.ok(image);
    }

    @DeleteMapping("")
    public ResponseEntity<OperationStatusResponse> deleteAnnouncement(@RequestParam Long announcementId) throws CantDeleteAnnouncementException {
        OperationStatusResponse response = service.deleteAnnouncement(announcementId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{announcementId}")
    public ResponseEntity<OperationStatusResponse> updateAnnouncement(@PathVariable("announcementId") Long announcementId, @RequestBody AnnouncementInfo announcementInfo) throws CantUpdateAnnouncementException {
        OperationStatusResponse response = service.updateAnnouncement(announcementId, announcementInfo);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/image")
    public ResponseEntity<OperationStatusResponse> deleteImageByPath(@RequestParam String imagePath) throws IOException{
        OperationStatusResponse response = service.deleteImageByPath(imagePath);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/image")
    public ResponseEntity<OperationStatusResponse> saveAnnouncementImages(@RequestBody SaveAnnouncementImages images) throws IOException {
        OperationStatusResponse response = service.saveAnnouncementImages(images);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/previews")
    public ResponseEntity<GetAllPreviews> getAllCustomerPreviews(@RequestHeader Long userId){
        GetAllPreviews response = service.getAllCustomerPreviews(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/preview")
    public ResponseEntity<AnnouncementInfoPreview> getPreviewByAnnouncementId(@RequestParam Long announcementId){
        AnnouncementInfoPreview response = service.getPreviewByAnnouncementId(announcementId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/filter")
    public ResponseEntity<GetAllPreviews> filter(@RequestHeader Long userId, @RequestParam(required = false) String text,
                                                @RequestParam(required = false) Double minPrice, @RequestParam(required = false) Double maxPrice,
                                                 @RequestParam(required = false) Boolean hasOther, @RequestParam(required = false) String startDate,
                                                 @RequestParam(required = false) String endDate){
        GetAllPreviews allPreviews = service.filterAnnouncement(userId, text, minPrice, maxPrice,
                                                                hasOther, startDate, endDate);
        return ResponseEntity.ok(allPreviews);
    }
}
