package partners.contractorInfo.service;

import jakarta.ws.rs.BadRequestException;
import lombok.AllArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import partners.contractorInfo.dto.GetContractorInfoResponse;
import partners.contractorInfo.dto.OperationStatusResponse;
import partners.contractorInfo.dto.ContractorInfo;
import partners.contractorInfo.model.Contractor;
import partners.contractorInfo.repository.ContractorRepository;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.Optional;

@Service
@AllArgsConstructor
public class ContractorService {

    private final ContractorRepository contractorRepository;

    public OperationStatusResponse saveContractorInfo(Long userId, ContractorInfo contractorInfo){
        Contractor contractor = Contractor.builder()
                .id(userId)
                .categoriesOfWork(contractorInfo.getCategoriesOfWork())
                .hasTeam(contractorInfo.getHasTeam())
                .team(contractorInfo.getTeam())
                .hasEdu(contractorInfo.getHasEdu())
                .eduEst(contractorInfo.getEduEst())
                .eduDateStart(contractorInfo.getEduDateStart())
                .eduDateEnd(contractorInfo.getEduDateEnd())
                .workExp(contractorInfo.getWorkExp())
                .selfInfo(contractorInfo.getSelfInfo())
                .prices(contractorInfo.getPrices())
                .build();

        Contractor savedContractor = contractorRepository.save(contractor);
        if (savedContractor.getId() == null)
            throw new BadRequestException("Can't save contractor");
        return new OperationStatusResponse(1);
    }

    public GetContractorInfoResponse getContractorInfo(Long userId){
        Optional<Contractor> contractor = contractorRepository.findById(userId);
        if (contractor.isEmpty())
            return new GetContractorInfoResponse(0, null);
        Contractor actualContractorData = contractor.get();
        ContractorInfo contractorInfo = ContractorInfo.builder()
                .categoriesOfWork(actualContractorData.getCategoriesOfWork())
                .hasTeam(actualContractorData.getHasTeam())
                .team(actualContractorData.getTeam())
                .hasEdu(actualContractorData.getHasEdu())
                .eduEst(actualContractorData.getEduEst())
                .eduDateStart(actualContractorData.getEduDateStart())
                .eduDateEnd(actualContractorData.getEduDateEnd())
                .workExp(actualContractorData.getWorkExp())
                .selfInfo(actualContractorData.getSelfInfo())
                .prices(actualContractorData.getPrices())
                .build();
        return new GetContractorInfoResponse(1, contractorInfo);
    }

    public Resource getCompletedImage(Long userId) throws MalformedURLException {
        Path firstImagePath = Path.of("src/main/resources/images/" + userId + ".jpg");
        File isFileExists = new File(firstImagePath.toUri());
        if (isFileExists.isFile()) {
            Resource resource = new UrlResource(firstImagePath.toUri());
            return resource;
        }
        else
            throw new BadRequestException("No image found");
    }

    public OperationStatusResponse saveCompletedImage(Long userId, MultipartFile image) throws IOException {
        String imagePath = "src/main/resources/images/" + userId + ".jpg";
        File userImage = new File(imagePath);
        image.transferTo(userImage.toPath());
        File checkFile = new File(imagePath);
        if (checkFile.isFile())
            return new OperationStatusResponse(1);
        return new OperationStatusResponse(0);
    }

}
