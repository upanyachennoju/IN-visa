package com.visaflow.contact;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.CrossOrigin;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/contact")
public class ContactController {

	private final ContactApplicationService service;

	public ContactController(ContactApplicationService service) {
		this.service = service;
	}

	@PostMapping
	public ContactSaveResponse saveDraft(@RequestBody ContactSaveRequest request) {
		return service.saveDraft(request);
	}

	@PostMapping("/{applicationId}/otp/email")
	public OtpResponse triggerEmailOtp(@PathVariable long applicationId) {
		return service.triggerOtp(applicationId, OtpChannel.EMAIL);
	}

	@PostMapping("/{applicationId}/otp/phone")
	public OtpResponse triggerPhoneOtp(@PathVariable long applicationId) {
		return service.triggerOtp(applicationId, OtpChannel.PHONE);
	}

	@PostMapping("/{applicationId}/verify")
	public VerifyResponse verify(@PathVariable long applicationId, @RequestBody VerifyRequest request) {
		return service.verify(applicationId, request);
	}
}
