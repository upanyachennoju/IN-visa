package com.visaflow.contact;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import com.visaflow.application.Application;
import com.visaflow.application.Application.ApplicationStatus;
import com.visaflow.application.Application.Contact;

@Service
public class ContactApplicationService {

	private static final SecureRandom RANDOM = new SecureRandom();
	private static final char[] ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toCharArray();

	private final ContactApplicationRepository repository;

	public ContactApplicationService(ContactApplicationRepository repository) {
		this.repository = repository;
	}

	public ContactSaveResponse saveDraft(ContactSaveRequest request) {
		if (!Objects.equals(request.email(), request.confirmEmail())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email and confirm email must match.");
		}

		Application application = request.applicationId() == null
			? new Application()
			: repository.findById(request.applicationId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));

		Contact contact = new Contact();
		contact.setDetails(request.email(), request.countryCode(), request.phone());
		application.setContact(contact);
		application.setCurrentSection("CONTACT");
		application.markDraft();
		if (application.getCreatedAt() == null) {
			application.setCreatedAt(LocalDateTime.now());
		}
		application.setLastUpdatedAt(LocalDateTime.now());

		Application saved = repository.save(application);
		return new ContactSaveResponse(saved.getId(), saved.getTempId(), saved.getApplicationStatus().name(), saved.getContact().getEmail(), saved.getContact().getCountryCode(), saved.getContact().getPhone());
	}

	public OtpResponse triggerOtp(long applicationId, OtpChannel channel) {
		Application application = repository.findById(applicationId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));

		String otp = generateOtp();
		Contact contact = application.getContact();
		if (channel == OtpChannel.EMAIL) {
			contact.setEmailOtp(otp);
		} else {
			contact.setPhoneOtp(otp);
		}
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);

		return new OtpResponse(applicationId, channel.name(), otp);
	}

	public VerifyResponse verify(long applicationId, VerifyRequest request) {
		Application application = repository.findById(applicationId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));

		Contact contact = application.getContact();
		boolean emailMatch = contact.matchesEmailOtp(request.emailOtp());
		boolean phoneMatch = contact.matchesPhoneOtp(request.phoneOtp());

		if (!emailMatch || !phoneMatch) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submitted OTPs do not match.");
		}

		contact.markEmailVerified();
		contact.markPhoneVerified();

		if (application.getTempId() == null) {
			application.setTempId(generateTempId());
		}

		application.setLastUpdatedAt(LocalDateTime.now());
		application.setApplicationStatus(ApplicationStatus.SUBMITTED);
		application.setCurrentSection("ADDRESS");
		repository.save(application);

		return new VerifyResponse(
			applicationId,
			application.getTempId(),
			application.getCurrentSection(),
			completedSections(application),
			List.of(
				new DispatchLine("SMS", "Simulated SMS dispatch for " + contact.getPhone()),
				new DispatchLine("WhatsApp", "Simulated WhatsApp dispatch for " + contact.getPhone()),
				new DispatchLine("Email", "Simulated Email dispatch for " + contact.getEmail())
			)
		);
	}

	private static String generateOtp() {
		int value = RANDOM.nextInt(900000) + 100000;
		return Integer.toString(value);
	}

	private static String generateTempId() {
		StringBuilder builder = new StringBuilder(8);
		for (int i = 0; i < 8; i++) {
			builder.append(ALPHANUMERIC[RANDOM.nextInt(ALPHANUMERIC.length)]);
		}
		return builder.toString();
	}

	private static List<String> completedSections(Application application) {
		List<String> sections = new java.util.ArrayList<>();
		if (application.getApplicationContext() != null) {
			sections.add("APPLICATION_CONTEXT");
		}
		if (application.getIdentity() != null) {
			sections.add("IDENTITY");
		}
		if (application.getPassport() != null) {
			sections.add("PASSPORT");
		}
		if (application.getContact() != null && application.getContact().isEmailVerified() && application.getContact().isPhoneVerified()) {
			sections.add("CONTACT");
		}
		return sections;
	}
}
