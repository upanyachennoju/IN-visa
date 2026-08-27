package com.visaflow.application;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/applications")
public class ApplicationStateController {

	private final ApplicationSectionService service;

	public ApplicationStateController(ApplicationSectionService service) {
		this.service = service;
	}

	@GetMapping("/{tempId}")
	public ApplicationStateResponse getState(@PathVariable String tempId) {
		return service.loadState(tempId);
	}
}
