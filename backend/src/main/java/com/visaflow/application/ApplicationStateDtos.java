package com.visaflow.application;

import java.util.List;

record ApplicationStateResponse(
	String tempId,
	String currentSection,
	List<String> completedSections,
	String applicationStatus,
	ContactState contact
) {
}

record ContactState(
	String email,
	String countryCode,
	String phone,
	Boolean emailVerified,
	Boolean phoneVerified
) {
}
