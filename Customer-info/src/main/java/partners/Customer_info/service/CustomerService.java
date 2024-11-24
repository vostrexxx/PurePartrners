package partners.Customer_info.service;

import jakarta.ws.rs.NotFoundException;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import partners.Customer_info.dto.CustomerInfoDTO;
import partners.Customer_info.model.CustomerInfo;
import partners.Customer_info.repository.CustomerInfoRepository;

@Service
@AllArgsConstructor
public class CustomerService {
    private final CustomerInfoRepository repository;
    private final ModelMapper modelMapper = new ModelMapper();

    public CustomerInfoDTO getCustomerInfo(Long userId){
        CustomerInfo customerInfo = repository.findByUserId(userId)
                .orElseThrow(NotFoundException::new);
        return modelMapper.map(customerInfo, CustomerInfoDTO.class);
    }
}
