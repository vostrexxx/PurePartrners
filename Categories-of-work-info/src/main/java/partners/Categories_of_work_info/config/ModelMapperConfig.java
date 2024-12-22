package partners.Categories_of_work_info.config;

import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.modelmapper.PropertyMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import partners.Categories_of_work_info.dto.NodeUpdateRequest;
import partners.Categories_of_work_info.model.EstimateChanges;

import java.util.Map;

@Configuration
@AllArgsConstructor
public class ModelMapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper modelMapper = new ModelMapper();
        modelMapper.addMappings(new PropertyMap<NodeUpdateRequest, EstimateChanges>() {
            @Override
            protected void configure() {
                map(source.getType(), destination.getType());
                map(source.getOperation(), destination.getOperation());
                map(source.getElementId(), destination.getElementId());
                map(source.getNodeId(), destination.getNodeId());
                map(source.getParentId(), destination.getParentId());

                skip(destination.getId());
                skip(destination.getUpdatedFields());
                skip(destination.getSubSubCategories());
            }
        });

        modelMapper.addMappings(new PropertyMap<EstimateChanges, NodeUpdateRequest>() {

            @Override
            protected void configure() {
                map(source.getType(), destination.getType());
                map(source.getOperation(), destination.getOperation());
                map(source.getElementId(), destination.getElementId());
                map(source.getNodeId(), destination.getNodeId());
                map(source.getParentId(), destination.getParentId());
                map(source.getInitiatorId(), destination.getInitiatorId());

                skip(destination.getUpdatedFields());
                skip(destination.getSubSubCategories());
            }
        });

        return modelMapper;
    }
}
