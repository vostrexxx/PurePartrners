package partners.agreement_connection_info.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import partners.agreement_connection_info.dto.AgreementInfo;
import partners.agreement_connection_info.model.Agreement;

@Configuration
public class ModelMapperConfiguration {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        modelMapper.addMappings(new PropertyMap<AgreementInfo, Agreement>() {
            @Override
            protected void configure() {
                skip(destination.getId());
                map(source.getInitiatorId(), destination.getInitiatorId());
                map(source.getReceiverId(), destination.getReceiverId());
                map(source.getInitiatorItemId(), destination.getInitiatorItemId());
                map(source.getReceiverItemId(), destination.getReceiverItemId());
                map(source.getComment(), destination.getComment());
                map(source.getMode(), destination.getMode());
//                map(source.getStatus(), destination.getStatus());
//                map(source.getCreateDate(), destination.getCreateDate());
//                map(source.getUpdateDate(), destination.getUpdateDate());
            }
        });
        return modelMapper;
    }
}
