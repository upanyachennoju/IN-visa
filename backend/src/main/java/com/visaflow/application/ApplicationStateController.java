package com.visaflow.application;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.visaflow.contact.ContactApplicationRepository;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/applications")
public class ApplicationStateController {

	private final ContactApplicationRepository repository;

	public ApplicationStateController(ContactApplicationRepository repository) {
		this.repository = repository;
	}

	@GetMapping("/{tempId}")
	public ApplicationStateResponse getState(@PathVariable String tempId) {
		Application application = repository.findByTempId(tempId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));

		boolean contactComplete = application.getContact() != null
			&& application.getContact().isEmailVerified()
			&& application.getContact().isPhoneVerified();

		String currentSection = application.getCurrentSection();
		if (currentSection == null || currentSection.isBlank()) {
			currentSection = contactComplete ? "IDENTITY" : "CONTACT";
		}

		List<String> completedSections = contactComplete ? List.of("CONTACT") : List.of();

		return new ApplicationStateResponse(
			application.getTempId(),
			currentSection,
			completedSections,
			application.getApplicationStatus() == null ? "DRAFT" : application.getApplicationStatus().name(),
			application.getContact() == null ? null : new ContactState(
				application.getContact().getEmail(),
				application.getContact().getCountryCode(),
				application.getContact().getPhone(),
				application.getContact().isEmailVerified(),
				application.getContact().isPhoneVerified()
			)
		);
	}
}
