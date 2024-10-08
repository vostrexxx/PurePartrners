package partners.customer_info.service;

import jakarta.ws.rs.InternalServerErrorException;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import org.springframework.web.multipart.MultipartFile;
import partners.customer_info.config.Constants;
import partners.customer_info.dto.*;
import partners.customer_info.model.Customer;
import partners.customer_info.repository.CustomerRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CustomerService {
    private CustomerRepository repository;
    private final ModelMapper modelMapper = new ModelMapper();

    public GetCustomerInfoResponse getCustomerInfo(Long customerId) {
        Optional<Customer> customer = repository.findById(customerId);
        if (customer.isEmpty()){
            return new GetCustomerInfoResponse(0, null);
        }
        Customer actualCustomerInfo = customer.get();
        CustomerInfo customerInfo = modelMapper.map(actualCustomerInfo, CustomerInfo.class);
        return new GetCustomerInfoResponse(1, customerInfo);
    }

    public OperationStatusResponse saveCustomerInfo(Long userId, CustomerInfo customerInfo){
        Customer customer = modelMapper.map(customerInfo, Customer.class);
        customer.setUserId(userId);
        try {
            repository.save(customer);
            return new OperationStatusResponse(1);
        } catch (Exception e){
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_CUSTOMER);
        }
    }

    public GetImageResponse getCustomerImage(Long userId) throws IOException{
        Path firstImagePath = Path.of(Constants.KEY_IMAGES_PATH + userId + Constants.KEY_DEFAULT_IMAGE_EXTENSION);
        File isFileExists = new File(firstImagePath.toUri());
        if (isFileExists.isFile()) {
            Resource resource = new UrlResource(firstImagePath.toUri());
            byte[] image = StreamUtils.copyToByteArray(resource.getInputStream());
            return new GetImageResponse(1, image);
        } else
            return new GetImageResponse(0, null);
    }

    public OperationStatusResponse saveCustomerImage(Long userId, MultipartFile image) throws IOException {
        String imagePath = Constants.KEY_IMAGES_PATH + userId + Constants.KEY_DEFAULT_IMAGE_EXTENSION;
        File userImage = new File(imagePath);
        image.transferTo(userImage.toPath());
        File checkFile = new File(imagePath);
        if (checkFile.isFile())
            return new OperationStatusResponse(1);
        else
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_IMAGE);
    }

    public OperationStatusResponse deleteCustomerImage(Long userId) {
        File fileToDelete = new File(Constants.KEY_IMAGES_PATH + userId + Constants.KEY_DEFAULT_IMAGE_EXTENSION);
        if (fileToDelete.delete())
            return new OperationStatusResponse(1);
        else
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_DELETE_IMAGE);
    }

    public GetAllPreviews getAllPreviews(Long userId){
        List<Customer> previews = repository.findAllByUserId(userId);
        List<CustomInfoPreview> customInfoPreviews = new ArrayList<>();
        for (Customer customer : previews){
            CustomInfoPreview anotherPreview = modelMapper.map(customer, CustomInfoPreview.class);
            customInfoPreviews.add(anotherPreview);
        }
        if (customInfoPreviews.isEmpty())
            return new GetAllPreviews(0, null);
        return new GetAllPreviews(1, customInfoPreviews);
    }
}
