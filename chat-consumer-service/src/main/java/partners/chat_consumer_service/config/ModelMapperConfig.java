package partners.chat_consumer_service.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import partners.chat_consumer_service.dto.SendChatMessage;
import partners.chat_consumer_service.model.Message;

@Configuration
public class ModelMapperConfig {
    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        modelMapper.addMappings(new PropertyMap<SendChatMessage, Message>() {
            @Override
            protected void configure() {
                skip(destination.getId());
                map(source.getInitiatorId(), destination.getInitiatorId());
            }
        });
        return modelMapper;
    }
}
