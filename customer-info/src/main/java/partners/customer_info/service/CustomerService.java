package partners.customer_info.service;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.InternalServerErrorException;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import partners.customer_info.config.Constants;
import partners.customer_info.dto.GetCustomerInfoResponse;
import partners.customer_info.dto.OperationStatusResponse;
import partners.customer_info.model.Customer;
import partners.customer_info.model.CustomerInfo;
import partners.customer_info.repository.CustomerRepository;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Optional;

@Service
@AllArgsConstructor
public class CustomerService {
    private CustomerRepository repository;
    private final ModelMapper modelMapper = new ModelMapper();

    public GetCustomerInfoResponse getCustomerInfo(Long userId){
        Optional<Customer> customer = repository.findById(userId);
        if (customer.isEmpty()){
            return new GetCustomerInfoResponse(0, null);
        }
        Customer actualCustomerInfo = customer.get();
        CustomerInfo customerInfo = modelMapper.map(actualCustomerInfo, CustomerInfo.class);
//        CustomerInfo customerInfo = CustomerInfo.builder()
//                .totalCost(actualCustomerInfo.getTotalCost())
//                .workCategories(actualCustomerInfo.getWorkCategories())
//                .metro(actualCustomerInfo.getMetro())
//                .house(actualCustomerInfo.getHouse())
//                .other(actualCustomerInfo.getOther())
//                .objectName(actualCustomerInfo.getObjectName())
//                .startDate(actualCustomerInfo.getStartDate())
//                .finishDate(actualCustomerInfo.getFinishDate())
//                .comments(actualCustomerInfo.getComments())
//                .build();

        return new GetCustomerInfoResponse(1, customerInfo);
    }

    public OperationStatusResponse saveCustomerInfo(Long userId, CustomerInfo customerInfo){
        Customer customer = modelMapper.map(customerInfo, Customer.class);
        customer.setId(userId);
//        Customer customer = Customer.builder()
//                .id(userId)
//                .totalCost(customerInfo.getTotalCost())
//                .workCategories(customerInfo.getWorkCategories())
//                .metro(customerInfo.getMetro())
//                .house(customerInfo.getHouse())
//                .hasOther(customerInfo.getHasOther())
//                .other(customerInfo.getOther())
//                .objectName(customerInfo.getObjectName())
//                .startDate(customerInfo.getStartDate())
//                .finishDate(customerInfo.getFinishDate())
//                .comments(customerInfo.getComments())
//                .build();
        try {
            repository.save(customer);
            return new OperationStatusResponse(1);
        } catch (Exception e){
            throw new InternalServerErrorException(Constants.KEY_EXCEPTION_CANT_SAVE_CUSTOMER);
        }
    }

    public Resource getCustomerImage(Long userId) throws IOException{
        Path firstImagePath = Path.of(Constants.KEY_IMAGES_PATH + userId + Constants.KEY_DEFAULT_IMAGE_EXTENSION);
        File isFileExists = new File(firstImagePath.toUri());
        if (isFileExists.isFile()) {
            Resource resource = new UrlResource(firstImagePath.toUri());
            return resource;
        } else
            throw new BadRequestException(Constants.KEY_EXCEPTION_NO_IMAGE_FOUND);
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
}
