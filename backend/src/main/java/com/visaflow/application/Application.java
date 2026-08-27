package com.visaflow.application;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "visa_applications")
public class Application {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@jakarta.persistence.Column(unique = true)
	private String tempId;

	private String finalReferenceNumber;

	@Embedded
	private ApplicationContext applicationContext;

	@Embedded
	private Identity identity;

	@Embedded
	private Passport passport;

	@Embedded
	private Contact contact;

	@Embedded
	private Address address;

	@Embedded
	private Family family;

	@Embedded
	private Occupation occupation;

	@Embedded
	private VisaTrip visaTrip;

	@Embedded
	private PreviousIndiaTravel previousIndiaTravel;

	@Embedded
	private TravelHistory travelHistory;

	@Embedded
	private References references;

	@Embedded
	private BackgroundAnswers backgroundAnswers;

	@Embedded
	private Documents documents;

	@Enumerated(EnumType.STRING)
	private PhotoStatus photoStatus;

	@Enumerated(EnumType.STRING)
	private DocumentStatus documentStatus;

	@Enumerated(EnumType.STRING)
	private ApplicationStatus applicationStatus;

	private String currentSection;

	private LocalDateTime createdAt;

	private LocalDateTime lastUpdatedAt;

	public Application() {
	}

	@Embeddable
	public static class ApplicationContext {
		private String countryApplyingFrom;
		private String indianMission;
		private String nationality;
		private String passportType;
		private String portOfArrival;
		private LocalDate expectedArrivalDate;
		private LocalDate dateOfBirth;
		private String visaPurpose;

		protected ApplicationContext() {
		}

		public String getCountryApplyingFrom() {
			return countryApplyingFrom;
		}

		public void setCountryApplyingFrom(String countryApplyingFrom) {
			this.countryApplyingFrom = countryApplyingFrom;
		}

		public String getIndianMission() {
			return indianMission;
		}

		public void setIndianMission(String indianMission) {
			this.indianMission = indianMission;
		}

		public String getNationality() {
			return nationality;
		}

		public void setNationality(String nationality) {
			this.nationality = nationality;
		}

		public String getPassportType() {
			return passportType;
		}

		public void setPassportType(String passportType) {
			this.passportType = passportType;
		}

		public String getPortOfArrival() {
			return portOfArrival;
		}

		public void setPortOfArrival(String portOfArrival) {
			this.portOfArrival = portOfArrival;
		}

		public LocalDate getExpectedArrivalDate() {
			return expectedArrivalDate;
		}

		public void setExpectedArrivalDate(LocalDate expectedArrivalDate) {
			this.expectedArrivalDate = expectedArrivalDate;
		}

		public LocalDate getDateOfBirth() {
			return dateOfBirth;
		}

		public void setDateOfBirth(LocalDate dateOfBirth) {
			this.dateOfBirth = dateOfBirth;
		}

		public String getVisaPurpose() {
			return visaPurpose;
		}

		public void setVisaPurpose(String visaPurpose) {
			this.visaPurpose = visaPurpose;
		}
	}

	@Embeddable
	public static class Identity {
		private String firstName;
		private String lastName;
		private String previousName;
		private String gender;
		private LocalDate dob;
		private String cityOfBirth;
		private String countryOfBirth;
		private String citizenshipId;
		private String religion;
		private String identificationMark;
		private String education;
		private String nationality;
		private String nationalityAcquiredBy;

		@ElementCollection
		private List<String> residenceHistory = new ArrayList<>();

		protected Identity() {
		}

		public String getFirstName() {
			return firstName;
		}

		public void setFirstName(String firstName) {
			this.firstName = firstName;
		}

		public String getLastName() {
			return lastName;
		}

		public void setLastName(String lastName) {
			this.lastName = lastName;
		}

		public String getPreviousName() {
			return previousName;
		}

		public void setPreviousName(String previousName) {
			this.previousName = previousName;
		}

		public String getGender() {
			return gender;
		}

		public void setGender(String gender) {
			this.gender = gender;
		}

		public LocalDate getDob() {
			return dob;
		}

		public void setDob(LocalDate dob) {
			this.dob = dob;
		}

		public String getCityOfBirth() {
			return cityOfBirth;
		}

		public void setCityOfBirth(String cityOfBirth) {
			this.cityOfBirth = cityOfBirth;
		}

		public String getCountryOfBirth() {
			return countryOfBirth;
		}

		public void setCountryOfBirth(String countryOfBirth) {
			this.countryOfBirth = countryOfBirth;
		}

		public String getCitizenshipId() {
			return citizenshipId;
		}

		public void setCitizenshipId(String citizenshipId) {
			this.citizenshipId = citizenshipId;
		}

		public String getReligion() {
			return religion;
		}

		public void setReligion(String religion) {
			this.religion = religion;
		}

		public String getIdentificationMark() {
			return identificationMark;
		}

		public void setIdentificationMark(String identificationMark) {
			this.identificationMark = identificationMark;
		}

		public String getEducation() {
			return education;
		}

		public void setEducation(String education) {
			this.education = education;
		}

		public String getNationality() {
			return nationality;
		}

		public void setNationality(String nationality) {
			this.nationality = nationality;
		}

		public String getNationalityAcquiredBy() {
			return nationalityAcquiredBy;
		}

		public void setNationalityAcquiredBy(String nationalityAcquiredBy) {
			this.nationalityAcquiredBy = nationalityAcquiredBy;
		}

		public List<String> getResidenceHistory() {
			return residenceHistory;
		}

		public void setResidenceHistory(List<String> residenceHistory) {
			this.residenceHistory = residenceHistory;
		}
	}

	@Embeddable
	public static class Passport {
		private String number;
		private String placeOfIssue;
		private LocalDate dateOfIssue;
		private LocalDate dateOfExpiry;
		private Boolean hasAdditionalPassport;
		private String additionalPassportDetails;

		protected Passport() {
		}

		public String getNumber() {
			return number;
		}

		public void setNumber(String number) {
			this.number = number;
		}

		public String getPlaceOfIssue() {
			return placeOfIssue;
		}

		public void setPlaceOfIssue(String placeOfIssue) {
			this.placeOfIssue = placeOfIssue;
		}

		public LocalDate getDateOfIssue() {
			return dateOfIssue;
		}

		public void setDateOfIssue(LocalDate dateOfIssue) {
			this.dateOfIssue = dateOfIssue;
		}

		public LocalDate getDateOfExpiry() {
			return dateOfExpiry;
		}

		public void setDateOfExpiry(LocalDate dateOfExpiry) {
			this.dateOfExpiry = dateOfExpiry;
		}

		public Boolean getHasAdditionalPassport() {
			return hasAdditionalPassport;
		}

		public void setHasAdditionalPassport(Boolean hasAdditionalPassport) {
			this.hasAdditionalPassport = hasAdditionalPassport;
		}

		public String getAdditionalPassportDetails() {
			return additionalPassportDetails;
		}

		public void setAdditionalPassportDetails(String additionalPassportDetails) {
			this.additionalPassportDetails = additionalPassportDetails;
		}
	}

	@Embeddable
	public static class Contact {
		private String email;
		private Boolean emailVerified;
		private String phone;
		private String countryCode;
		private Boolean phoneVerified;
		private String emailOtp;
		private String phoneOtp;

		public Contact() {
		}

		public void setDetails(String email, String countryCode, String phone) {
			this.email = email;
			this.countryCode = countryCode;
			this.phone = phone;
		}

		public void setEmailOtp(String emailOtp) {
			this.emailOtp = emailOtp;
		}

		public void setPhoneOtp(String phoneOtp) {
			this.phoneOtp = phoneOtp;
		}

		public boolean matchesEmailOtp(String submittedOtp) {
			return emailOtp != null && emailOtp.equals(submittedOtp);
		}

		public boolean matchesPhoneOtp(String submittedOtp) {
			return phoneOtp != null && phoneOtp.equals(submittedOtp);
		}

		public boolean isEmailVerified() {
			return Boolean.TRUE.equals(emailVerified);
		}

		public boolean isPhoneVerified() {
			return Boolean.TRUE.equals(phoneVerified);
		}

		public void markEmailVerified() {
			this.emailVerified = true;
		}

		public void markPhoneVerified() {
			this.phoneVerified = true;
		}

		public String getEmail() {
			return email;
		}

		public String getPhone() {
			return phone;
		}

		public String getCountryCode() {
			return countryCode;
		}
	}

	@Embeddable
	public static class Address {
		@Embedded
		private PresentAddress present;

		@Embedded
		private PermanentAddress permanent;

		private Boolean sameAsPresent;
		private String postalCode;
		private String phone;
		private String mobile;

		protected Address() {
		}
	}

	@Embeddable
	public static class PresentAddress {
		private String line1;
		private String line2;
		private String city;
		private String state;
		private String country;

		protected PresentAddress() {
		}
	}

	@Embeddable
	public static class PermanentAddress {
		private String line1;
		private String line2;
		private String city;
		private String state;
		private String country;

		protected PermanentAddress() {
		}
	}

	@Embeddable
	public static class Family {
		private String fatherName;
		private String fatherNationality;
		private String fatherPrevNationality;
		private String fatherBirthplace;
		private String fatherBirthCountry;
		private String motherName;
		private String motherNationality;
		private String motherPrevNationality;
		private String motherBirthplace;
		private String motherBirthCountry;
		private Boolean grandparentPakistanOrigin;
		private String maritalStatus;

		protected Family() {
		}
	}

	@Embeddable
	public static class Occupation {
		private String current;
		private String employer;
		private String designation;
		private String employerAddress;
		private String employerPhone;
		private String previous;
		private String militaryBackground;

		protected Occupation() {
		}
	}

	@Embeddable
	public static class VisaTrip {
		private String visaType;
		private String duration;
		private String entries;
		private String purpose;

		@ElementCollection
		private List<String> placesToVisit = new ArrayList<>();

		private LocalDate arrivalDate;
		private String portOfArrival;
		private String portOfExit;

		protected VisaTrip() {
		}
	}

	@Embeddable
	public static class PreviousIndiaTravel {
		private Boolean visitedBefore;
		private String previousVisa;
		private String previousVisaNumber;
		private String previousAddress;

		@ElementCollection
		private List<String> citiesVisited = new ArrayList<>();

		protected PreviousIndiaTravel() {
		}
	}

	@Embeddable
	public static class TravelHistory {
		@ElementCollection
		private List<String> countriesVisitedLast10Years = new ArrayList<>();

		@ElementCollection
		private List<String> saarcTravel = new ArrayList<>();

		protected TravelHistory() {
		}
	}

	@Embeddable
	public static class References {
		@Embedded
		private IndiaRef indiaRef;

		@Embedded
		private HomeCountryRef homeCountryRef;

		protected References() {
		}
	}

	@Embeddable
	public static class IndiaRef {
		private String name;
		private String address;
		private String state;
		private String district;
		private String phone;

		protected IndiaRef() {
		}
	}

	@Embeddable
	public static class HomeCountryRef {
		private String name;
		private String address;
		private String phone;

		protected HomeCountryRef() {
		}
	}

	@Embeddable
	public static class BackgroundAnswers {
		private String arrestOrConviction;
		private String refusedEntryOrDeported;
		private String traffickingOrDrugs;
		private String cyberOrTerrorism;
		private String terrorismViews;
		private String asylum;

		protected BackgroundAnswers() {
		}
	}

	@Embeddable
	public static class Documents {
		private String passportUploadRef;
		private String photoUploadRef;

		@ElementCollection
		private List<String> otherUploadRefs = new ArrayList<>();

		protected Documents() {
		}
	}

	public enum PhotoStatus {
		PENDING, PASSED, FAILED
	}

	public enum DocumentStatus {
		PENDING, PASSED, FAILED
	}

	public enum ApplicationStatus {
		DRAFT, SUBMITTED, UNDER_VERIFICATION, DECISION_PENDING, APPROVED, REJECTED
	}

	public void markDraft() {
		this.applicationStatus = ApplicationStatus.DRAFT;
	}

	public void setContact(Contact contact) {
		this.contact = contact;
	}

	public ApplicationContext getApplicationContext() {
		return applicationContext;
	}

	public void setApplicationContext(ApplicationContext applicationContext) {
		this.applicationContext = applicationContext;
	}

	public Identity getIdentity() {
		return identity;
	}

	public void setIdentity(Identity identity) {
		this.identity = identity;
	}

	public Passport getPassport() {
		return passport;
	}

	public void setPassport(Passport passport) {
		this.passport = passport;
	}

	public Contact getContact() {
		return contact;
	}

	public Long getId() {
		return id;
	}

	public String getTempId() {
		return tempId;
	}

	public void setTempId(String tempId) {
		this.tempId = tempId;
	}

	public ApplicationStatus getApplicationStatus() {
		return applicationStatus;
	}

	public void setApplicationStatus(ApplicationStatus applicationStatus) {
		this.applicationStatus = applicationStatus;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getLastUpdatedAt() {
		return lastUpdatedAt;
	}

	public void setLastUpdatedAt(LocalDateTime lastUpdatedAt) {
		this.lastUpdatedAt = lastUpdatedAt;
	}

	public String getCurrentSection() {
		return currentSection;
	}

	public void setCurrentSection(String currentSection) {
		this.currentSection = currentSection;
	}
}
