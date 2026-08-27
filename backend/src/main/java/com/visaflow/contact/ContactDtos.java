package com.visaflow.contact;

import java.util.List;

record ContactSaveRequest(Long applicationId, String email, String confirmEmail, String countryCode, String phone) {
}

record ContactSaveResponse(Long applicationId, String tempId, String applicationStatus, String email, String countryCode, String phone) {
}

record OtpResponse(Long applicationId, String channel, String otp) {
}

record VerifyRequest(String emailOtp, String phoneOtp) {
}

record VerifyResponse(Long applicationId, String tempId, String currentSection, List<String> completedSections, List<DispatchLine> dispatchLog) {
}

record DispatchLine(String channel, String message) {
}

enum OtpChannel {
	EMAIL, PHONE
}
