package partners.contractorInfo.service;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.InternalServerErrorException;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import partners.contractorInfo.config.Constants;
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
    private final ModelMapper modelMapper = new ModelMapper();

    public OperationStatusResponse saveContractorInfo(Long userId, ContractorInfo contractorInfo){

        Contractor contractor = modelMapper.map(contractorInfo, Contractor.class);
        contractor.setId(userId);

//        Contractor contractor = Contractor.builder()
//                .id(userId)
//                .categoriesOfWork(contractorInfo.getCategoriesOfWork())
//                .hasTeam(contractorInfo.getHasTeam())
//                .team(contractorInfo.getTeam())
//                .hasEdu(contractorInfo.getHasEdu())
//                .eduEst(contractorInfo.getEduEst())
//                .eduDateStart(contractorInfo.getEduDateStart())
//                .eduDateEnd(contractorInfo.getEduDateEnd())
//                .workExp(contractorInfo.getWorkExp())
//                .selfInfo(contractorInfo.getSelfInfo())
//                .prices(contractorInfo.getPrices())
//                .build();
        try {
            contractorRepository.save(contractor);
            return new OperationStatusResponse(1);
        } catch (Exception e){
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_CONTRACTOR);
        }
    }

    public GetContractorInfoResponse getContractorInfo(Long userId){
        Optional<Contractor> contractor = contractorRepository.findById(userId);
        if (contractor.isEmpty())
            return new GetContractorInfoResponse(0, null);
        Contractor actualContractorData = contractor.get();
        ContractorInfo contractorInfo = modelMapper.map(actualContractorData, ContractorInfo.class);
//        ContractorInfo contractorInfo = ContractorInfo.builder()
//                .categoriesOfWork(actualContractorData.getCategoriesOfWork())
//                .hasTeam(actualContractorData.getHasTeam())
//                .team(actualContractorData.getTeam())
//                .hasEdu(actualContractorData.getHasEdu())
//                .eduEst(actualContractorData.getEduEst())
//                .eduDateStart(actualContractorData.getEduDateStart())
//                .eduDateEnd(actualContractorData.getEduDateEnd())
//                .workExp(actualContractorData.getWorkExp())
//                .selfInfo(actualContractorData.getSelfInfo())
//                .prices(actualContractorData.getPrices())
//                .build();
        return new GetContractorInfoResponse(1, contractorInfo);
    }

    public Resource getCompletedImage(Long userId) throws MalformedURLException {
        Path firstImagePath = Path.of(Constants.KEY_IMAGES_PATH + userId + Constants.KEY_IMAGES_DEFAULT_EXTENSION);
        File isFileExists = new File(firstImagePath.toUri());
        if (isFileExists.isFile()) {
            Resource resource = new UrlResource(firstImagePath.toUri());
            return resource;
        }
        else
            throw new BadRequestException(Constants.KEY_EXCEPTION_NO_IMAGE_FOUND);
    }

    public OperationStatusResponse saveCompletedImage(Long userId, MultipartFile image) throws IOException {
        String imagePath = Constants.KEY_IMAGES_PATH + userId + Constants.KEY_IMAGES_DEFAULT_EXTENSION;
        File userImage = new File(imagePath);
        image.transferTo(userImage.toPath());
        File checkFile = new File(imagePath);
        if (checkFile.isFile())
            return new OperationStatusResponse(1);
        else
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_IMAGE);
    }

}
