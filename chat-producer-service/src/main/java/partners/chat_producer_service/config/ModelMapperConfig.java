package partners.chat_producer_service.config;

import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.ui.ModelMap;
import partners.chat_producer_service.dto.ChatMessage;
import partners.chat_producer_service.dto.SendChatMessage;

@Configuration
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();

        modelMapper.addMappings(new PropertyMap<ChatMessage, SendChatMessage>() {
            @Override
            protected void configure() {
                map(source.getInitiatorId(), destination.getInitiatorId());
                map(source.getChatId(), destination.getChatId());
            }
        });
        return modelMapper;
    }
}
