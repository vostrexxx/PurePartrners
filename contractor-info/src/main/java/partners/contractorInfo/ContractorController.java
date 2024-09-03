package partners.contractorInfo;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@AllArgsConstructor
@RequestMapping("/contractor")
@CrossOrigin
public class ContractorController {

    private final ContractorService contractorService;

    @GetMapping("")
    public

}
