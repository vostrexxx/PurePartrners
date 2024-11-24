package partners.Contractor_info.controller;

import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import partners.Contractor_info.service.ContractorService;

@RestController
@AllArgsConstructor
@CrossOrigin
@RequestMapping("/contractor")
public class ContractorInfoController {
    private final ContractorService service;

    @GetMapping("")


}
