package com.visaflow.application;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.visaflow.contact.ContactApplicationRepository;

@Service
public class ApplicationSectionService {

	private static final SecureRandom RANDOM = new SecureRandom();
	private static final char[] ALPHANUMERIC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".toCharArray();

	private final ContactApplicationRepository repository;

	public ApplicationSectionService(ContactApplicationRepository repository) {
		this.repository = repository;
	}

	public ApplicationStateResponse saveApplicationContext(ApplicationContextRequest request) {
		validateRequired(request.countryApplyingFrom(), "countryApplyingFrom");
		validateRequired(request.indianMission(), "indianMission");
		validateRequired(request.nationality(), "nationality");
		validateRequired(request.passportType(), "passportType");
		validateRequired(request.portOfArrival(), "portOfArrival");
		validateRequired(request.expectedArrivalDate(), "expectedArrivalDate");
		validateRequired(request.dateOfBirth(), "dateOfBirth");
		validateRequired(request.visaPurpose(), "visaPurpose");

		Application application = request.tempId() == null || request.tempId().isBlank()
			? new Application()
			: repository.findByTempId(request.tempId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));

		if (application.getTempId() == null) {
			application.setTempId(generateTempId());
			application.setCreatedAt(LocalDateTime.now());
		}

		Application.ApplicationContext context = new Application.ApplicationContext();
		context.setCountryApplyingFrom(request.countryApplyingFrom());
		context.setIndianMission(request.indianMission());
		context.setNationality(request.nationality());
		context.setPassportType(request.passportType());
		context.setPortOfArrival(request.portOfArrival());
		context.setExpectedArrivalDate(request.expectedArrivalDate());
		context.setDateOfBirth(request.dateOfBirth());
		context.setVisaPurpose(request.visaPurpose());

		application.setApplicationContext(context);
		application.setCurrentSection("IDENTITY");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse saveIdentity(String tempId, IdentityRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.firstName(), "firstName");
		validateRequired(request.lastName(), "lastName");
		validateRequired(request.gender(), "gender");
		validateRequired(request.dob(), "dob");
		validateRequired(request.cityOfBirth(), "cityOfBirth");
		validateRequired(request.countryOfBirth(), "countryOfBirth");
		validateRequired(request.citizenshipId(), "citizenshipId");
		validateRequired(request.religion(), "religion");
		validateRequired(request.identificationMark(), "identificationMark");
		validateRequired(request.education(), "education");
		validateRequired(request.nationality(), "nationality");
		validateRequired(request.nationalityAcquiredBy(), "nationalityAcquiredBy");
		validateRequired(request.residenceHistory(), "residenceHistory");

		Application.Identity identity = new Application.Identity();
		identity.setFirstName(request.firstName());
		identity.setLastName(request.lastName());
		identity.setPreviousName(request.previousName());
		identity.setGender(request.gender());
		identity.setDob(request.dob());
		identity.setCityOfBirth(request.cityOfBirth());
		identity.setCountryOfBirth(request.countryOfBirth());
		identity.setCitizenshipId(request.citizenshipId());
		identity.setReligion(request.religion());
		identity.setIdentificationMark(request.identificationMark());
		identity.setEducation(request.education());
		identity.setNationality(request.nationality());
		identity.setNationalityAcquiredBy(request.nationalityAcquiredBy());
		identity.setResidenceHistory(new ArrayList<>(request.residenceHistory()));

		application.setIdentity(identity);
		application.setCurrentSection("PASSPORT");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse savePassport(String tempId, PassportRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.number(), "number");
		validateRequired(request.placeOfIssue(), "placeOfIssue");
		validateRequired(request.dateOfIssue(), "dateOfIssue");
		validateRequired(request.dateOfExpiry(), "dateOfExpiry");

		if (!Objects.requireNonNullElse(request.number(), "").matches("^VF-[A-Z0-9]{6}$")) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Passport number must match the synthetic VF-XXXXXX pattern.");
		}

		Application.Passport passport = new Application.Passport();
		passport.setNumber(request.number());
		passport.setPlaceOfIssue(request.placeOfIssue());
		passport.setDateOfIssue(request.dateOfIssue());
		passport.setDateOfExpiry(request.dateOfExpiry());
		passport.setHasAdditionalPassport(request.hasAdditionalPassport());
		passport.setAdditionalPassportDetails(request.additionalPassportDetails());

		application.setPassport(passport);
		application.setCurrentSection("CONTACT");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse loadState(String tempId) {
		return toResponse(loadApplication(tempId));
	}

	private Application loadApplication(String tempId) {
		return repository.findByTempId(tempId)
			.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
	}

	private static void validateRequired(Object value, String field) {
		boolean missing = value == null || (value instanceof String text && text.isBlank()) || (value instanceof List<?> list && list.isEmpty());
		if (missing) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, field + " is required.");
		}
	}

	private static String generateTempId() {
		StringBuilder builder = new StringBuilder(8);
		for (int i = 0; i < 8; i++) {
			builder.append(ALPHANUMERIC[RANDOM.nextInt(ALPHANUMERIC.length)]);
		}
		return builder.toString();
	}

	private static ApplicationStateResponse toResponse(Application application) {
		return new ApplicationStateResponse(
			application.getId(),
			application.getTempId(),
			application.getCurrentSection() == null || application.getCurrentSection().isBlank()
				? "APPLICATION_CONTEXT"
				: application.getCurrentSection(),
			completedSections(application),
			application.getApplicationStatus() == null ? "DRAFT" : application.getApplicationStatus().name(),
			toContext(application.getApplicationContext()),
			toIdentity(application.getIdentity()),
			toPassport(application.getPassport()),
			toContact(application.getContact())
		);
	}

	private static List<String> completedSections(Application application) {
		List<String> sections = new ArrayList<>();
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

	private static ApplicationContextState toContext(Application.ApplicationContext context) {
		if (context == null) {
			return null;
		}
		return new ApplicationContextState(
			context.getCountryApplyingFrom(),
			context.getIndianMission(),
			context.getNationality(),
			context.getPassportType(),
			context.getPortOfArrival(),
			context.getExpectedArrivalDate(),
			context.getDateOfBirth(),
			context.getVisaPurpose()
		);
	}

	private static IdentityState toIdentity(Application.Identity identity) {
		if (identity == null) {
			return null;
		}
		return new IdentityState(
			identity.getFirstName(),
			identity.getLastName(),
			identity.getPreviousName(),
			identity.getGender(),
			identity.getDob(),
			identity.getCityOfBirth(),
			identity.getCountryOfBirth(),
			identity.getCitizenshipId(),
			identity.getReligion(),
			identity.getIdentificationMark(),
			identity.getEducation(),
			identity.getNationality(),
			identity.getNationalityAcquiredBy(),
			identity.getResidenceHistory()
		);
	}

	private static PassportState toPassport(Application.Passport passport) {
		if (passport == null) {
			return null;
		}
		return new PassportState(
			passport.getNumber(),
			passport.getPlaceOfIssue(),
			passport.getDateOfIssue(),
			passport.getDateOfExpiry(),
			passport.getHasAdditionalPassport(),
			passport.getAdditionalPassportDetails()
		);
	}

	private static ContactState toContact(Application.Contact contact) {
		if (contact == null) {
			return null;
		}
		return new ContactState(
			contact.getEmail(),
			contact.getCountryCode(),
			contact.getPhone(),
			contact.isEmailVerified(),
			contact.isPhoneVerified()
		);
	}
}
