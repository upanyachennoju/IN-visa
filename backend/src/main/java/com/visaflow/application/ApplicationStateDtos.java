package com.visaflow.application;

import java.util.List;
import java.time.LocalDate;

record ApplicationStateResponse(
	Long applicationId,
	String tempId,
	String currentSection,
	List<String> completedSections,
	String applicationStatus,
	ApplicationContextState applicationContext,
	IdentityState identity,
	PassportState passport,
	AddressState address,
	FamilyState family,
	OccupationState occupation,
	ContactState contact
) {
}

record ApplicationContextState(
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

record IdentityState(
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

record PassportState(
	String number,
	String placeOfIssue,
	LocalDate dateOfIssue,
	LocalDate dateOfExpiry,
	Boolean hasAdditionalPassport,
	String additionalPassportDetails
) {
}

record AddressState(
	AddressLineState present,
	AddressLineState permanent,
	Boolean sameAsPresent,
	String postalCode,
	String phone,
	String mobile
) {
}

record AddressLineState(
	String line1,
	String line2,
	String city,
	String state,
	String country
) {
}

record FamilyState(
	String fatherName,
	String fatherNationality,
	String fatherPrevNationality,
	String fatherBirthplace,
	String fatherBirthCountry,
	String motherName,
	String motherNationality,
	String motherPrevNationality,
	String motherBirthplace,
	String motherBirthCountry,
	Boolean grandparentPakistanOrigin,
	String maritalStatus
) {
}

record OccupationState(
	String current,
	String employer,
	String designation,
	String employerAddress,
	String employerPhone,
	String previous,
	String militaryBackground
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
