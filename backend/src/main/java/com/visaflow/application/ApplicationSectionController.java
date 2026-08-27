package com.visaflow.application;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/applications")
public class ApplicationSectionController {

	private final ApplicationSectionService service;

	public ApplicationSectionController(ApplicationSectionService service) {
		this.service = service;
	}

	@PostMapping("/application-context")
	public ApplicationStateResponse saveApplicationContext(@RequestBody ApplicationContextRequest request) {
		return service.saveApplicationContext(request);
	}

	@PostMapping("/{tempId}/identity")
	public ApplicationStateResponse saveIdentity(@PathVariable String tempId, @RequestBody IdentityRequest request) {
		return service.saveIdentity(tempId, request);
	}

	@PostMapping("/{tempId}/passport")
	public ApplicationStateResponse savePassport(@PathVariable String tempId, @RequestBody PassportRequest request) {
		return service.savePassport(tempId, request);
	}

	@PostMapping("/{tempId}/address")
	public ApplicationStateResponse saveAddress(@PathVariable String tempId, @RequestBody AddressRequest request) {
		return service.saveAddress(tempId, request);
	}

	@PostMapping("/{tempId}/family")
	public ApplicationStateResponse saveFamily(@PathVariable String tempId, @RequestBody FamilyRequest request) {
		return service.saveFamily(tempId, request);
	}

	@PostMapping("/{tempId}/occupation")
	public ApplicationStateResponse saveOccupation(@PathVariable String tempId, @RequestBody OccupationRequest request) {
		return service.saveOccupation(tempId, request);
	}
}
