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
		application.setCurrentSection("VISA_TRIP");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse saveVisaTrip(String tempId, VisaTripRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.visaType(), "visaType");
		validateRequired(request.duration(), "duration");
		validateRequired(request.entries(), "entries");
		validateRequired(request.purpose(), "purpose");
		validateRequired(request.placesToVisit(), "placesToVisit");
		validateRequired(request.arrivalDate(), "arrivalDate");
		validateRequired(request.portOfArrival(), "portOfArrival");
		validateRequired(request.portOfExit(), "portOfExit");

		Application.VisaTrip visaTrip = new Application.VisaTrip();
		visaTrip.setVisaType(request.visaType());
		visaTrip.setDuration(request.duration());
		visaTrip.setEntries(request.entries());
		visaTrip.setPurpose(request.purpose());
		visaTrip.setPlacesToVisit(new ArrayList<>(request.placesToVisit()));
		visaTrip.setArrivalDate(request.arrivalDate());
		visaTrip.setPortOfArrival(request.portOfArrival());
		visaTrip.setPortOfExit(request.portOfExit());

		application.setVisaTrip(visaTrip);
		application.setCurrentSection("PREVIOUS_INDIA_TRAVEL");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse savePreviousIndiaTravel(String tempId, PreviousIndiaTravelRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.visitedBefore(), "visitedBefore");

		boolean visitedBefore = Boolean.TRUE.equals(request.visitedBefore());
		if (visitedBefore) {
			validateRequired(request.previousVisa(), "previousVisa");
			validateRequired(request.previousVisaNumber(), "previousVisaNumber");
			validateRequired(request.previousAddress(), "previousAddress");
			validateRequired(request.citiesVisited(), "citiesVisited");
		}

		Application.PreviousIndiaTravel previousIndiaTravel = new Application.PreviousIndiaTravel();
		previousIndiaTravel.setVisitedBefore(request.visitedBefore());
		previousIndiaTravel.setPreviousVisa(request.previousVisa());
		previousIndiaTravel.setPreviousVisaNumber(request.previousVisaNumber());
		previousIndiaTravel.setPreviousAddress(request.previousAddress());
		previousIndiaTravel.setCitiesVisited(request.citiesVisited() == null ? null : new ArrayList<>(request.citiesVisited()));

		application.setPreviousIndiaTravel(previousIndiaTravel);
		application.setCurrentSection("TRAVEL_HISTORY");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse saveTravelHistory(String tempId, TravelHistoryRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.countriesVisitedLast10Years(), "countriesVisitedLast10Years");
		validateRequired(request.saarcTravel(), "saarcTravel");

		Application.TravelHistory travelHistory = new Application.TravelHistory();
		travelHistory.setCountriesVisitedLast10Years(new ArrayList<>(request.countriesVisitedLast10Years()));
		travelHistory.setSaarcTravel(new ArrayList<>(request.saarcTravel()));

		application.setTravelHistory(travelHistory);
		application.setCurrentSection("REFERENCES");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse saveReferences(String tempId, ReferencesRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.indiaRef(), "indiaRef");
		validateRequired(request.homeCountryRef(), "homeCountryRef");
		validateRequired(request.indiaRef().name(), "indiaRef.name");
		validateRequired(request.indiaRef().address(), "indiaRef.address");
		validateRequired(request.indiaRef().state(), "indiaRef.state");
		validateRequired(request.indiaRef().district(), "indiaRef.district");
		validateRequired(request.indiaRef().phone(), "indiaRef.phone");
		validateRequired(request.homeCountryRef().name(), "homeCountryRef.name");
		validateRequired(request.homeCountryRef().address(), "homeCountryRef.address");
		validateRequired(request.homeCountryRef().phone(), "homeCountryRef.phone");

		Application.IndiaRef indiaRef = new Application.IndiaRef();
		indiaRef.setName(request.indiaRef().name());
		indiaRef.setAddress(request.indiaRef().address());
		indiaRef.setState(request.indiaRef().state());
		indiaRef.setDistrict(request.indiaRef().district());
		indiaRef.setPhone(request.indiaRef().phone());

		Application.HomeCountryRef homeCountryRef = new Application.HomeCountryRef();
		homeCountryRef.setName(request.homeCountryRef().name());
		homeCountryRef.setAddress(request.homeCountryRef().address());
		homeCountryRef.setPhone(request.homeCountryRef().phone());

		Application.References references = new Application.References();
		references.setIndiaRef(indiaRef);
		references.setHomeCountryRef(homeCountryRef);

		application.setReferences(references);
		application.setCurrentSection("BACKGROUND_ANSWERS");
		application.markDraft();
		application.setLastUpdatedAt(LocalDateTime.now());
		repository.save(application);
		return toResponse(application);
	}

	public ApplicationStateResponse saveBackgroundAnswers(String tempId, BackgroundAnswersRequest request) {
		Application application = loadApplication(tempId);
		validateRequired(request.arrestOrConviction(), "arrestOrConviction");
		validateRequired(request.refusedEntryOrDeported(), "refusedEntryOrDeported");
		validateRequired(request.traffickingOrDrugs(), "traffickingOrDrugs");
		validateRequired(request.cyberOrTerrorism(), "cyberOrTerrorism");
		validateRequired(request.terrorismViews(), "terrorismViews");
		validateRequired(request.asylum(), "asylum");

		Application.BackgroundAnswers backgroundAnswers = new Application.BackgroundAnswers();
		backgroundAnswers.setArrestOrConviction(request.arrestOrConviction());
		backgroundAnswers.setArrestOrConvictionDetails(Boolean.TRUE.equals(request.arrestOrConviction()) ? request.arrestOrConvictionDetails() : null);
		backgroundAnswers.setRefusedEntryOrDeported(request.refusedEntryOrDeported());
		backgroundAnswers.setRefusedEntryOrDeportedDetails(Boolean.TRUE.equals(request.refusedEntryOrDeported()) ? request.refusedEntryOrDeportedDetails() : null);
		backgroundAnswers.setTraffickingOrDrugs(request.traffickingOrDrugs());
		backgroundAnswers.setTraffickingOrDrugsDetails(Boolean.TRUE.equals(request.traffickingOrDrugs()) ? request.traffickingOrDrugsDetails() : null);
		backgroundAnswers.setCyberOrTerrorism(request.cyberOrTerrorism());
		backgroundAnswers.setCyberOrTerrorismDetails(Boolean.TRUE.equals(request.cyberOrTerrorism()) ? request.cyberOrTerrorismDetails() : null);
		backgroundAnswers.setTerrorismViews(request.terrorismViews());
		backgroundAnswers.setTerrorismViewsDetails(Boolean.TRUE.equals(request.terrorismViews()) ? request.terrorismViewsDetails() : null);
		backgroundAnswers.setAsylum(request.asylum());
		backgroundAnswers.setAsylumDetails(Boolean.TRUE.equals(request.asylum()) ? request.asylumDetails() : null);

		application.setBackgroundAnswers(backgroundAnswers);
		application.setCurrentSection("DOCUMENTS");
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
			toVisaTrip(application.getVisaTrip()),
			toPreviousIndiaTravel(application.getPreviousIndiaTravel()),
			toTravelHistory(application.getTravelHistory()),
			toReferences(application.getReferences()),
			toBackgroundAnswers(application.getBackgroundAnswers()),
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
		if (application.getVisaTrip() != null) {
			sections.add("VISA_TRIP");
		}
		if (application.getPreviousIndiaTravel() != null) {
			sections.add("PREVIOUS_INDIA_TRAVEL");
		}
		if (application.getTravelHistory() != null) {
			sections.add("TRAVEL_HISTORY");
		}
		if (application.getReferences() != null) {
			sections.add("REFERENCES");
		}
		if (application.getBackgroundAnswers() != null) {
			sections.add("BACKGROUND_ANSWERS");
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

	private static VisaTripState toVisaTrip(Application.VisaTrip visaTrip) {
		if (visaTrip == null) {
			return null;
		}
		return new VisaTripState(
			visaTrip.getVisaType(),
			visaTrip.getDuration(),
			visaTrip.getEntries(),
			visaTrip.getPurpose(),
			visaTrip.getPlacesToVisit(),
			visaTrip.getArrivalDate(),
			visaTrip.getPortOfArrival(),
			visaTrip.getPortOfExit()
		);
	}

	private static PreviousIndiaTravelState toPreviousIndiaTravel(Application.PreviousIndiaTravel previousIndiaTravel) {
		if (previousIndiaTravel == null) {
			return null;
		}
		return new PreviousIndiaTravelState(
			previousIndiaTravel.getVisitedBefore(),
			previousIndiaTravel.getPreviousVisa(),
			previousIndiaTravel.getPreviousVisaNumber(),
			previousIndiaTravel.getPreviousAddress(),
			previousIndiaTravel.getCitiesVisited()
		);
	}

	private static TravelHistoryState toTravelHistory(Application.TravelHistory travelHistory) {
		if (travelHistory == null) {
			return null;
		}
		return new TravelHistoryState(
			travelHistory.getCountriesVisitedLast10Years(),
			travelHistory.getSaarcTravel()
		);
	}

	private static ReferencesState toReferences(Application.References references) {
		if (references == null) {
			return null;
		}
		return new ReferencesState(
			toIndiaRef(references.getIndiaRef()),
			toHomeCountryRef(references.getHomeCountryRef())
		);
	}

	private static IndiaRefState toIndiaRef(Application.IndiaRef indiaRef) {
		if (indiaRef == null) {
			return null;
		}
		return new IndiaRefState(
			indiaRef.getName(),
			indiaRef.getAddress(),
			indiaRef.getState(),
			indiaRef.getDistrict(),
			indiaRef.getPhone()
		);
	}

	private static HomeCountryRefState toHomeCountryRef(Application.HomeCountryRef homeCountryRef) {
		if (homeCountryRef == null) {
			return null;
		}
		return new HomeCountryRefState(
			homeCountryRef.getName(),
			homeCountryRef.getAddress(),
			homeCountryRef.getPhone()
		);
	}

	private static BackgroundAnswersState toBackgroundAnswers(Application.BackgroundAnswers backgroundAnswers) {
		if (backgroundAnswers == null) {
			return null;
		}
		return new BackgroundAnswersState(
			backgroundAnswers.getArrestOrConviction(),
			backgroundAnswers.getArrestOrConvictionDetails(),
			backgroundAnswers.getRefusedEntryOrDeported(),
			backgroundAnswers.getRefusedEntryOrDeportedDetails(),
			backgroundAnswers.getTraffickingOrDrugs(),
			backgroundAnswers.getTraffickingOrDrugsDetails(),
			backgroundAnswers.getCyberOrTerrorism(),
			backgroundAnswers.getCyberOrTerrorismDetails(),
			backgroundAnswers.getTerrorismViews(),
			backgroundAnswers.getTerrorismViewsDetails(),
			backgroundAnswers.getAsylum(),
			backgroundAnswers.getAsylumDetails()
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
