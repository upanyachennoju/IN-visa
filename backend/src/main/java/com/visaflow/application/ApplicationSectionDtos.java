package com.visaflow.application;

import java.time.LocalDate;
import java.util.List;

record ApplicationContextRequest(
	String tempId,
	String countryApplyingFrom,
	String indianMission,
	String nationality,
	String passportType,
	String portOfArrival,
	LocalDate expectedArrivalDate,
	LocalDate dateOfBirth,
	String visaPurpose
) {
}

record IdentityRequest(
	String firstName,
	String lastName,
	String previousName,
	String gender,
	LocalDate dob,
	String cityOfBirth,
	String countryOfBirth,
	String citizenshipId,
	String religion,
	String identificationMark,
	String education,
	String nationality,
	String nationalityAcquiredBy,
	List<String> residenceHistory
) {
}

record PassportRequest(
	String number,
	String placeOfIssue,
	LocalDate dateOfIssue,
	LocalDate dateOfExpiry,
	Boolean hasAdditionalPassport,
	String additionalPassportDetails
) {
}
