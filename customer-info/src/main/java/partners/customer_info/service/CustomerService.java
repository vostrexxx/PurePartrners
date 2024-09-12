package partners.customer_info.service;

import lombok.AllArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import partners.customer_info.dto.GetCustomerInfoResponse;
import partners.customer_info.dto.OperationStatusResponse;
import partners.customer_info.exception.ImageNotFoundException;
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

    public GetCustomerInfoResponse getCustomerInfo(Long userId){
        Optional<Customer> customer = repository.findById(userId);
        if (customer.isEmpty()){
            return new GetCustomerInfoResponse(0, null);
        }
        Customer actualCustomerInfo = customer.get();
        CustomerInfo customerInfo = CustomerInfo.builder()
                .totalCost(actualCustomerInfo.getTotalCost())
                .workCategories(actualCustomerInfo.getWorkCategories())
                .metro(actualCustomerInfo.getMetro())
                .house(actualCustomerInfo.getHouse())
                .other(actualCustomerInfo.getOther())
                .objectName(actualCustomerInfo.getObjectName())
                .startDate(actualCustomerInfo.getStartDate())
                .finishDate(actualCustomerInfo.getFinishDate())
                .comments(actualCustomerInfo.getComments())
                .build();

        return new GetCustomerInfoResponse(1, customerInfo);
    }

    public OperationStatusResponse saveCustomerInfo(Long userId, CustomerInfo customerInfo){
        Customer customer = Customer.builder()
                .totalCost(customerInfo.getTotalCost())
                .workCategories(customerInfo.getWorkCategories())
                .metro(customerInfo.getMetro())
                .house(customerInfo.getHouse())
                .other(customerInfo.getOther())
                .objectName(customerInfo.getObjectName())
                .startDate(customerInfo.getStartDate())
                .finishDate(customerInfo.getFinishDate())
                .comments(customerInfo.getComments())
                .build();
        //TODO builder
        Customer savedCustomer = repository.save(customer);
        if (savedCustomer.getId() != null){
            return new OperationStatusResponse(0);
        }
        return new OperationStatusResponse(1);
    }

    public Resource getCustomerImage(Long userId) throws IOException, ImageNotFoundException {
        Path firstImagePath = Path.of("src/main/resources/images/" + userId + ".jpg");
        File isFileExists = new File(firstImagePath.toUri());
        if (isFileExists.isFile()) {
            Resource resource = new UrlResource(firstImagePath.toUri());
            return resource;
        }
        else
            throw new ImageNotFoundException("Image not found", HttpStatus.BAD_REQUEST);
    }

    public OperationStatusResponse saveCustomerImage(Long userId, MultipartFile image) throws IOException {
        String imagePath = "src/main/resources/images/" + userId + ".jpg";
        File userImage = new File(imagePath);
        image.transferTo(userImage.toPath());
        File checkFile = new File(imagePath);
        if (checkFile.isFile())
            return new OperationStatusResponse(1);
        return new OperationStatusResponse(0);
    }
}
