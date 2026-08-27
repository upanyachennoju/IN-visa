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

record AddressRequest(
	String tempId,
	String presentLine1,
	String presentLine2,
	String presentCity,
	String presentState,
	String presentCountry,
	String permanentLine1,
	String permanentLine2,
	String permanentCity,
	String permanentState,
	String permanentCountry,
	Boolean sameAsPresent,
	String postalCode,
	String phone,
	String mobile
) {
}

record FamilyRequest(
	String tempId,
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

record OccupationRequest(
	String tempId,
	String current,
	String employer,
	String designation,
	String employerAddress,
	String employerPhone,
	String previous,
	String militaryBackground
) {
}

record VisaTripRequest(
	String tempId,
	String visaType,
	String duration,
	String entries,
	String purpose,
	List<String> placesToVisit,
	LocalDate arrivalDate,
	String portOfArrival,
	String portOfExit
) {
}

record PreviousIndiaTravelRequest(
	String tempId,
	Boolean visitedBefore,
	String previousVisa,
	String previousVisaNumber,
	String previousAddress,
	List<String> citiesVisited
) {
}

record TravelHistoryRequest(
	String tempId,
	List<String> countriesVisitedLast10Years,
	List<String> saarcTravel
) {
}

record ReferencesRequest(
	String tempId,
	IndiaRefRequest indiaRef,
	HomeCountryRefRequest homeCountryRef
) {
}

record BackgroundAnswersRequest(
	String tempId,
	Boolean arrestOrConviction,
	String arrestOrConvictionDetails,
	Boolean refusedEntryOrDeported,
	String refusedEntryOrDeportedDetails,
	Boolean traffickingOrDrugs,
	String traffickingOrDrugsDetails,
	Boolean cyberOrTerrorism,
	String cyberOrTerrorismDetails,
	Boolean terrorismViews,
	String terrorismViewsDetails,
	Boolean asylum,
	String asylumDetails
) {
}

record IndiaRefRequest(
	String name,
	String address,
	String state,
	String district,
	String phone
) {
}

record HomeCountryRefRequest(
	String name,
	String address,
	String phone
) {
}
