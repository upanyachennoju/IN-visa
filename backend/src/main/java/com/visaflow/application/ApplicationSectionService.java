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

	public ApplicationStateResponse saveAddress(String tempId, AddressRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.presentLine1(), "presentLine1");
		validateRequired(request.presentCity(), "presentCity");
		validateRequired(request.presentState(), "presentState");
		validateRequired(request.presentCountry(), "presentCountry");
		validateRequired(request.postalCode(), "postalCode");
		validateRequired(request.phone(), "phone");
		validateRequired(request.mobile(), "mobile");

		boolean sameAsPresent = Boolean.TRUE.equals(request.sameAsPresent());
		if (!sameAsPresent) {
			validateRequired(request.permanentLine1(), "permanentLine1");
			validateRequired(request.permanentCity(), "permanentCity");
			validateRequired(request.permanentState(), "permanentState");
			validateRequired(request.permanentCountry(), "permanentCountry");
		}

		Application.PresentAddress present = new Application.PresentAddress();
		present.setLine1(request.presentLine1());
		present.setLine2(request.presentLine2());
		present.setCity(request.presentCity());
		present.setState(request.presentState());
		present.setCountry(request.presentCountry());

		Application.PermanentAddress permanent = new Application.PermanentAddress();
		permanent.setLine1(sameAsPresent ? request.presentLine1() : request.permanentLine1());
		permanent.setLine2(sameAsPresent ? request.presentLine2() : request.permanentLine2());
		permanent.setCity(sameAsPresent ? request.presentCity() : request.permanentCity());
		permanent.setState(sameAsPresent ? request.presentState() : request.permanentState());
		permanent.setCountry(sameAsPresent ? request.presentCountry() : request.permanentCountry());

		Application.Address address = new Application.Address();
		address.setPresent(present);
		address.setPermanent(permanent);
		address.setSameAsPresent(sameAsPresent);
		address.setPostalCode(request.postalCode());
		address.setPhone(request.phone());
		address.setMobile(request.mobile());

		application.setAddress(address);
		application.setCurrentSection("FAMILY");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse saveFamily(String tempId, FamilyRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.fatherName(), "fatherName");
		validateRequired(request.fatherNationality(), "fatherNationality");
		validateRequired(request.fatherPrevNationality(), "fatherPrevNationality");
		validateRequired(request.fatherBirthplace(), "fatherBirthplace");
		validateRequired(request.fatherBirthCountry(), "fatherBirthCountry");
		validateRequired(request.motherName(), "motherName");
		validateRequired(request.motherNationality(), "motherNationality");
		validateRequired(request.motherPrevNationality(), "motherPrevNationality");
		validateRequired(request.motherBirthplace(), "motherBirthplace");
		validateRequired(request.motherBirthCountry(), "motherBirthCountry");
		validateRequired(request.grandparentPakistanOrigin(), "grandparentPakistanOrigin");
		validateRequired(request.maritalStatus(), "maritalStatus");

		Application.Family family = new Application.Family();
		family.setFatherName(request.fatherName());
		family.setFatherNationality(request.fatherNationality());
		family.setFatherPrevNationality(request.fatherPrevNationality());
		family.setFatherBirthplace(request.fatherBirthplace());
		family.setFatherBirthCountry(request.fatherBirthCountry());
		family.setMotherName(request.motherName());
		family.setMotherNationality(request.motherNationality());
		family.setMotherPrevNationality(request.motherPrevNationality());
		family.setMotherBirthplace(request.motherBirthplace());
		family.setMotherBirthCountry(request.motherBirthCountry());
		family.setGrandparentPakistanOrigin(request.grandparentPakistanOrigin());
		family.setMaritalStatus(request.maritalStatus());

		application.setFamily(family);
		application.setCurrentSection("OCCUPATION");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse saveOccupation(String tempId, OccupationRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.current(), "current");
		validateRequired(request.employer(), "employer");
		validateRequired(request.designation(), "designation");
		validateRequired(request.employerAddress(), "employerAddress");
		validateRequired(request.employerPhone(), "employerPhone");
		validateRequired(request.previous(), "previous");
		validateRequired(request.militaryBackground(), "militaryBackground");

		Application.Occupation occupation = new Application.Occupation();
		occupation.setCurrent(request.current());
		occupation.setEmployer(request.employer());
		occupation.setDesignation(request.designation());
		occupation.setEmployerAddress(request.employerAddress());
		occupation.setEmployerPhone(request.employerPhone());
		occupation.setPrevious(request.previous());
		occupation.setMilitaryBackground(request.militaryBackground());

		application.setOccupation(occupation);
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
			toAddress(application.getAddress()),
			toFamily(application.getFamily()),
			toOccupation(application.getOccupation()),
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
		if (application.getAddress() != null) {
			sections.add("ADDRESS");
		}
		if (application.getFamily() != null) {
			sections.add("FAMILY");
		}
		if (application.getOccupation() != null) {
			sections.add("OCCUPATION");
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

	private static AddressState toAddress(Application.Address address) {
		if (address == null) {
			return null;
		}
		return new AddressState(
			toAddressLine(address.getPresent()),
			toAddressLine(address.getPermanent()),
			address.getSameAsPresent(),
			address.getPostalCode(),
			address.getPhone(),
			address.getMobile()
		);
	}

	private static AddressLineState toAddressLine(Application.PresentAddress address) {
		if (address == null) {
			return null;
		}
		return new AddressLineState(address.getLine1(), address.getLine2(), address.getCity(), address.getState(), address.getCountry());
	}

	private static AddressLineState toAddressLine(Application.PermanentAddress address) {
		if (address == null) {
			return null;
		}
		return new AddressLineState(address.getLine1(), address.getLine2(), address.getCity(), address.getState(), address.getCountry());
	}

	private static FamilyState toFamily(Application.Family family) {
		if (family == null) {
			return null;
		}
		return new FamilyState(
			family.getFatherName(),
			family.getFatherNationality(),
			family.getFatherPrevNationality(),
			family.getFatherBirthplace(),
			family.getFatherBirthCountry(),
			family.getMotherName(),
			family.getMotherNationality(),
			family.getMotherPrevNationality(),
			family.getMotherBirthplace(),
			family.getMotherBirthCountry(),
			family.getGrandparentPakistanOrigin(),
			family.getMaritalStatus()
		);
	}

	private static OccupationState toOccupation(Application.Occupation occupation) {
		if (occupation == null) {
			return null;
		}
		return new OccupationState(
			occupation.getCurrent(),
			occupation.getEmployer(),
			occupation.getDesignation(),
			occupation.getEmployerAddress(),
			occupation.getEmployerPhone(),
			occupation.getPrevious(),
			occupation.getMilitaryBackground()
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
