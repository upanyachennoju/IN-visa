import { useEffect, useState } from 'react';
import DocumentUpload from './DocumentUpload';
import ReviewSubmit from './ReviewSubmit';
import StatusPage from './StatusPage';
import { explainFieldErrors, getPlainLanguageError } from './errorExplainer';

const API_BASE = 'http://localhost:3000/api';

const SECTION_STEPS = [
  { key: 'APPLICATION_CONTEXT', label: 'Application Context' },
  { key: 'IDENTITY', label: 'Identity' },
  { key: 'PASSPORT', label: 'Passport' },
  { key: 'CONTACT', label: 'Contact' },
  { key: 'ADDRESS', label: 'Address' },
  { key: 'FAMILY', label: 'Family' },
  { key: 'OCCUPATION', label: 'Occupation' },
  { key: 'VISA_TRIP', label: 'Visa Trip' },
  { key: 'PREVIOUS_INDIA_TRAVEL', label: 'Previous India Travel' },
  { key: 'TRAVEL_HISTORY', label: 'Travel History' },
  { key: 'REFERENCES', label: 'References' },
  { key: 'BACKGROUND_ANSWERS', label: 'Background Answers' },
  { key: 'DOCUMENTS', label: 'Documents' },
  { key: 'PHOTO_STATUS', label: 'Photo Status' },
  { key: 'SUBMISSION', label: 'Submission' },
];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PASSPORT_RE = /^VF-[A-Z0-9]{6}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{6,15}$/;
const COUNTRY_CODE_RE = /^\+\d{1,3}$/;

const EMPTY_APPLICATION = {
  applicationId: null,
  tempId: '',
  currentSection: 'APPLICATION_CONTEXT',
  completedSections: [],
  applicationStatus: 'DRAFT',
  applicationContext: null,
  identity: null,
  passport: null,
  contact: null,
  address: null,
  family: null,
  occupation: null,
  visaTrip: null,
  previousIndiaTravel: null,
  travelHistory: null,
  references: null,
  backgroundAnswers: null,
};

const EMPTY_CONTEXT_FORM = {
  tempId: '',
  countryApplyingFrom: '',
  indianMission: '',
  nationality: '',
  passportType: '',
  portOfArrival: '',
  expectedArrivalDate: '',
  dateOfBirth: '',
  visaPurpose: '',
};

const EMPTY_IDENTITY_FORM = {
  firstName: '',
  lastName: '',
  previousName: '',
  gender: '',
  dob: '',
  cityOfBirth: '',
  countryOfBirth: '',
  citizenshipId: '',
  religion: '',
  identificationMark: '',
  education: '',
  nationality: '',
  nationalityAcquiredBy: '',
  residenceHistory: '',
};

const EMPTY_PASSPORT_FORM = {
  number: '',
  placeOfIssue: '',
  dateOfIssue: '',
  dateOfExpiry: '',
  hasAdditionalPassport: false,
  additionalPassportDetails: '',
};

const EMPTY_CONTACT_FORM = {
  email: '',
  confirmEmail: '',
  countryCode: '+91',
  phone: '',
};

const EMPTY_ADDRESS_FORM = {
  sameAsPresent: false,
  presentLine1: '',
  presentLine2: '',
  presentCity: '',
  presentState: '',
  presentCountry: '',
  permanentLine1: '',
  permanentLine2: '',
  permanentCity: '',
  permanentState: '',
  permanentCountry: '',
  postalCode: '',
  phone: '',
  mobile: '',
};

const EMPTY_FAMILY_FORM = {
  fatherName: '',
  fatherNationality: '',
  fatherPrevNationality: '',
  fatherBirthplace: '',
  fatherBirthCountry: '',
  motherName: '',
  motherNationality: '',
  motherPrevNationality: '',
  motherBirthplace: '',
  motherBirthCountry: '',
  grandparentPakistanOrigin: '',
  maritalStatus: '',
};

const EMPTY_OCCUPATION_FORM = {
  current: '',
  employer: '',
  designation: '',
  employerAddress: '',
  employerPhone: '',
  previous: '',
  militaryBackground: '',
};

const EMPTY_VISA_TRIP_FORM = {
  visaType: '',
  duration: '',
  entries: '',
  purpose: '',
  placesToVisit: '',
  arrivalDate: '',
  portOfArrival: '',
  portOfExit: '',
};

const EMPTY_PREVIOUS_INDIA_TRAVEL_FORM = {
  visitedBefore: '',
  previousVisa: '',
  previousVisaNumber: '',
  previousAddress: '',
  citiesVisited: '',
};

const EMPTY_TRAVEL_HISTORY_FORM = {
  countriesVisitedLast10Years: '',
  saarcTravel: '',
};

const EMPTY_REFERENCES_FORM = {
  indiaRefName: '',
  indiaRefAddress: '',
  indiaRefState: '',
  indiaRefDistrict: '',
  indiaRefPhone: '',
  homeCountryRefName: '',
  homeCountryRefAddress: '',
  homeCountryRefPhone: '',
};

const EMPTY_BACKGROUND_FORM = {
  arrestOrConviction: '',
  arrestOrConvictionDetails: '',
  refusedEntryOrDeported: '',
  refusedEntryOrDeportedDetails: '',
  traffickingOrDrugs: '',
  traffickingOrDrugsDetails: '',
  cyberOrTerrorism: '',
  cyberOrTerrorismDetails: '',
  terrorismViews: '',
  terrorismViewsDetails: '',
  asylum: '',
  asylumDetails: '',
};

function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('status')) {
    const parts = hash.split('/');
    return { view: 'status', finalRef: parts[1] ? decodeURIComponent(parts[1]) : '' };
  }
  if (hash.startsWith('resume')) {
    return { view: 'resume' };
  }
  if (hash.startsWith('app/')) {
    return { view: 'app', tempId: decodeURIComponent(hash.slice(4)) };
  }
  return { view: 'shell' };
}

function normalizeResponse(data) {
  return {
    applicationId: data.applicationId ?? null,
    tempId: data.tempId ?? '',
    currentSection: data.currentSection || 'APPLICATION_CONTEXT',
    completedSections: data.completedSections || [],
    applicationStatus: data.applicationStatus || 'DRAFT',
    applicationContext: data.applicationContext || null,
    identity: data.identity || null,
    passport: data.passport || null,
    address: data.address || null,
    family: data.family || null,
    occupation: data.occupation || null,
    visaTrip: data.visaTrip || null,
    previousIndiaTravel: data.previousIndiaTravel || null,
    travelHistory: data.travelHistory || null,
    references: data.references || null,
    backgroundAnswers: data.backgroundAnswers || null,
    contact: data.contact || null,
  };
}

function buildContextForm(application) {
  const context = application.applicationContext || {};
  return {
    tempId: application.tempId || '',
    countryApplyingFrom: context.countryApplyingFrom || '',
    indianMission: context.indianMission || '',
    nationality: context.nationality || '',
    passportType: context.passportType || '',
    portOfArrival: context.portOfArrival || '',
    expectedArrivalDate: context.expectedArrivalDate || '',
    dateOfBirth: context.dateOfBirth || '',
    visaPurpose: context.visaPurpose || '',
  };
}

function buildIdentityForm(application) {
  const identity = application.identity || {};
  return {
    firstName: identity.firstName || '',
    lastName: identity.lastName || '',
    previousName: identity.previousName || '',
    gender: identity.gender || '',
    dob: identity.dob || '',
    cityOfBirth: identity.cityOfBirth || '',
    countryOfBirth: identity.countryOfBirth || '',
    citizenshipId: identity.citizenshipId || '',
    religion: identity.religion || '',
    identificationMark: identity.identificationMark || '',
    education: identity.education || '',
    nationality: identity.nationality || '',
    nationalityAcquiredBy: identity.nationalityAcquiredBy || '',
    residenceHistory: Array.isArray(identity.residenceHistory) ? identity.residenceHistory.join(', ') : '',
  };
}

function buildPassportForm(application) {
  const passport = application.passport || {};
  return {
    number: passport.number || '',
    placeOfIssue: passport.placeOfIssue || '',
    dateOfIssue: passport.dateOfIssue || '',
    dateOfExpiry: passport.dateOfExpiry || '',
    hasAdditionalPassport: Boolean(passport.hasAdditionalPassport),
    additionalPassportDetails: passport.additionalPassportDetails || '',
  };
}

function buildContactForm(application) {
  const contact = application.contact || {};
  return {
    applicationId: application.applicationId || null,
    email: contact.email || '',
    confirmEmail: contact.email || '',
    countryCode: contact.countryCode || '+91',
    phone: contact.phone || '',
  };
}

function buildAddressForm(application) {
  const address = application.address || {};
  const present = address.present || {};
  const permanent = address.permanent || {};
  return {
    sameAsPresent: Boolean(address.sameAsPresent),
    presentLine1: present.line1 || '',
    presentLine2: present.line2 || '',
    presentCity: present.city || '',
    presentState: present.state || '',
    presentCountry: present.country || '',
    permanentLine1: permanent.line1 || '',
    permanentLine2: permanent.line2 || '',
    permanentCity: permanent.city || '',
    permanentState: permanent.state || '',
    permanentCountry: permanent.country || '',
    postalCode: address.postalCode || '',
    phone: address.phone || '',
    mobile: address.mobile || '',
  };
}

function buildFamilyForm(application) {
  const family = application.family || {};
  return {
    fatherName: family.fatherName || '',
    fatherNationality: family.fatherNationality || '',
    fatherPrevNationality: family.fatherPrevNationality || '',
    fatherBirthplace: family.fatherBirthplace || '',
    fatherBirthCountry: family.fatherBirthCountry || '',
    motherName: family.motherName || '',
    motherNationality: family.motherNationality || '',
    motherPrevNationality: family.motherPrevNationality || '',
    motherBirthplace: family.motherBirthplace || '',
    motherBirthCountry: family.motherBirthCountry || '',
    grandparentPakistanOrigin:
      family.grandparentPakistanOrigin === null || family.grandparentPakistanOrigin === undefined
        ? ''
        : String(Boolean(family.grandparentPakistanOrigin)),
    maritalStatus: family.maritalStatus || '',
  };
}

function buildOccupationForm(application) {
  const occupation = application.occupation || {};
  return {
    current: occupation.current || '',
    employer: occupation.employer || '',
    designation: occupation.designation || '',
    employerAddress: occupation.employerAddress || '',
    employerPhone: occupation.employerPhone || '',
    previous: occupation.previous || '',
    militaryBackground: occupation.militaryBackground || '',
  };
}

function buildVisaTripForm(application) {
  const visaTrip = application.visaTrip || {};
  return {
    visaType: visaTrip.visaType || '',
    duration: visaTrip.duration || '',
    entries: visaTrip.entries || '',
    purpose: visaTrip.purpose || '',
    placesToVisit: Array.isArray(visaTrip.placesToVisit) ? visaTrip.placesToVisit.join(', ') : '',
    arrivalDate: visaTrip.arrivalDate || '',
    portOfArrival: visaTrip.portOfArrival || '',
    portOfExit: visaTrip.portOfExit || '',
  };
}

function buildPreviousIndiaTravelForm(application) {
  const previousIndiaTravel = application.previousIndiaTravel || {};
  return {
    visitedBefore:
      previousIndiaTravel.visitedBefore === null || previousIndiaTravel.visitedBefore === undefined
        ? ''
        : String(Boolean(previousIndiaTravel.visitedBefore)),
    previousVisa: previousIndiaTravel.previousVisa || '',
    previousVisaNumber: previousIndiaTravel.previousVisaNumber || '',
    previousAddress: previousIndiaTravel.previousAddress || '',
    citiesVisited: Array.isArray(previousIndiaTravel.citiesVisited) ? previousIndiaTravel.citiesVisited.join(', ') : '',
  };
}

function buildTravelHistoryForm(application) {
  const travelHistory = application.travelHistory || {};
  return {
    countriesVisitedLast10Years: Array.isArray(travelHistory.countriesVisitedLast10Years)
      ? travelHistory.countriesVisitedLast10Years.join(', ')
      : '',
    saarcTravel: Array.isArray(travelHistory.saarcTravel) ? travelHistory.saarcTravel.join(', ') : '',
  };
}

function buildReferencesForm(application) {
  const references = application.references || {};
  const indiaRef = references.indiaRef || {};
  const homeCountryRef = references.homeCountryRef || {};
  return {
    indiaRefName: indiaRef.name || '',
    indiaRefAddress: indiaRef.address || '',
    indiaRefState: indiaRef.state || '',
    indiaRefDistrict: indiaRef.district || '',
    indiaRefPhone: indiaRef.phone || '',
    homeCountryRefName: homeCountryRef.name || '',
    homeCountryRefAddress: homeCountryRef.address || '',
    homeCountryRefPhone: homeCountryRef.phone || '',
  };
}

function buildBackgroundForm(application) {
  const backgroundAnswers = application.backgroundAnswers || {};
  return {
    arrestOrConviction:
      backgroundAnswers.arrestOrConviction === null || backgroundAnswers.arrestOrConviction === undefined
        ? ''
        : String(Boolean(backgroundAnswers.arrestOrConviction)),
    arrestOrConvictionDetails: backgroundAnswers.arrestOrConvictionDetails || '',
    refusedEntryOrDeported:
      backgroundAnswers.refusedEntryOrDeported === null || backgroundAnswers.refusedEntryOrDeported === undefined
        ? ''
        : String(Boolean(backgroundAnswers.refusedEntryOrDeported)),
    refusedEntryOrDeportedDetails: backgroundAnswers.refusedEntryOrDeportedDetails || '',
    traffickingOrDrugs:
      backgroundAnswers.traffickingOrDrugs === null || backgroundAnswers.traffickingOrDrugs === undefined
        ? ''
        : String(Boolean(backgroundAnswers.traffickingOrDrugs)),
    traffickingOrDrugsDetails: backgroundAnswers.traffickingOrDrugsDetails || '',
    cyberOrTerrorism:
      backgroundAnswers.cyberOrTerrorism === null || backgroundAnswers.cyberOrTerrorism === undefined
        ? ''
        : String(Boolean(backgroundAnswers.cyberOrTerrorism)),
    cyberOrTerrorismDetails: backgroundAnswers.cyberOrTerrorismDetails || '',
    terrorismViews:
      backgroundAnswers.terrorismViews === null || backgroundAnswers.terrorismViews === undefined
        ? ''
        : String(Boolean(backgroundAnswers.terrorismViews)),
    terrorismViewsDetails: backgroundAnswers.terrorismViewsDetails || '',
    asylum:
      backgroundAnswers.asylum === null || backgroundAnswers.asylum === undefined
        ? ''
        : String(Boolean(backgroundAnswers.asylum)),
    asylumDetails: backgroundAnswers.asylumDetails || '',
  };
}

function validateContextForm(form) {
  const errors = {};
  if (!form.countryApplyingFrom.trim()) errors.countryApplyingFrom = 'Required.';
  if (!form.indianMission.trim()) errors.indianMission = 'Required.';
  if (!form.nationality.trim()) errors.nationality = 'Required.';
  if (!form.passportType.trim()) errors.passportType = 'Required.';
  if (!form.portOfArrival.trim()) errors.portOfArrival = 'Required.';
  if (!DATE_RE.test(form.expectedArrivalDate)) errors.expectedArrivalDate = 'Use YYYY-MM-DD.';
  if (!DATE_RE.test(form.dateOfBirth)) errors.dateOfBirth = 'Use YYYY-MM-DD.';
  if (!form.visaPurpose.trim()) errors.visaPurpose = 'Required.';
  return errors;
}

function validateIdentityForm(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'Required.';
  if (!form.lastName.trim()) errors.lastName = 'Required.';
  if (!form.gender.trim()) errors.gender = 'Required.';
  if (!DATE_RE.test(form.dob)) errors.dob = 'Use YYYY-MM-DD.';
  if (!form.cityOfBirth.trim()) errors.cityOfBirth = 'Required.';
  if (!form.countryOfBirth.trim()) errors.countryOfBirth = 'Required.';
  if (!form.citizenshipId.trim()) errors.citizenshipId = 'Required.';
  if (!form.religion.trim()) errors.religion = 'Required.';
  if (!form.identificationMark.trim()) errors.identificationMark = 'Required.';
  if (!form.education.trim()) errors.education = 'Required.';
  if (!form.nationality.trim()) errors.nationality = 'Required.';
  if (!form.nationalityAcquiredBy.trim()) errors.nationalityAcquiredBy = 'Required.';
  if (!form.residenceHistory.trim()) errors.residenceHistory = 'Required.';
  return errors;
}

function validatePassportForm(form) {
  const errors = {};
  if (!PASSPORT_RE.test(form.number.trim())) errors.number = 'Use the synthetic format VF-XXXXXX.';
  if (!form.placeOfIssue.trim()) errors.placeOfIssue = 'Required.';
  if (!DATE_RE.test(form.dateOfIssue)) errors.dateOfIssue = 'Use YYYY-MM-DD.';
  if (!DATE_RE.test(form.dateOfExpiry)) errors.dateOfExpiry = 'Use YYYY-MM-DD.';
  return errors;
}

function validateContactForm(form) {
  const errors = {};
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email.';
  if (form.email.trim() !== form.confirmEmail.trim()) errors.confirmEmail = 'Emails must match.';
  if (!COUNTRY_CODE_RE.test(form.countryCode.trim())) errors.countryCode = 'Use + and 1-3 digits.';
  if (!PHONE_RE.test(form.phone.trim())) errors.phone = 'Use 6-15 digits.';
  return errors;
}

function validateAddressForm(form) {
  const errors = {};
  if (!form.presentLine1.trim()) errors.presentLine1 = 'Required.';
  if (!form.presentCity.trim()) errors.presentCity = 'Required.';
  if (!form.presentState.trim()) errors.presentState = 'Required.';
  if (!form.presentCountry.trim()) errors.presentCountry = 'Required.';
  if (!form.postalCode.trim()) errors.postalCode = 'Required.';
  if (!form.phone.trim()) errors.phone = 'Required.';
  if (!form.mobile.trim()) errors.mobile = 'Required.';
  if (!form.sameAsPresent) {
    if (!form.permanentLine1.trim()) errors.permanentLine1 = 'Required.';
    if (!form.permanentCity.trim()) errors.permanentCity = 'Required.';
    if (!form.permanentState.trim()) errors.permanentState = 'Required.';
    if (!form.permanentCountry.trim()) errors.permanentCountry = 'Required.';
  }
  return errors;
}

function validateFamilyForm(form) {
  const errors = {};
  if (!form.fatherName.trim()) errors.fatherName = 'Required.';
  if (!form.fatherNationality.trim()) errors.fatherNationality = 'Required.';
  if (!form.fatherPrevNationality.trim()) errors.fatherPrevNationality = 'Required.';
  if (!form.fatherBirthplace.trim()) errors.fatherBirthplace = 'Required.';
  if (!form.fatherBirthCountry.trim()) errors.fatherBirthCountry = 'Required.';
  if (!form.motherName.trim()) errors.motherName = 'Required.';
  if (!form.motherNationality.trim()) errors.motherNationality = 'Required.';
  if (!form.motherPrevNationality.trim()) errors.motherPrevNationality = 'Required.';
  if (!form.motherBirthplace.trim()) errors.motherBirthplace = 'Required.';
  if (!form.motherBirthCountry.trim()) errors.motherBirthCountry = 'Required.';
  if (form.grandparentPakistanOrigin === '') errors.grandparentPakistanOrigin = 'Required.';
  if (!form.maritalStatus.trim()) errors.maritalStatus = 'Required.';
  return errors;
}

function validateOccupationForm(form) {
  const errors = {};
  if (!form.current.trim()) errors.current = 'Required.';
  if (!form.employer.trim()) errors.employer = 'Required.';
  if (!form.designation.trim()) errors.designation = 'Required.';
  if (!form.employerAddress.trim()) errors.employerAddress = 'Required.';
  if (!form.employerPhone.trim()) errors.employerPhone = 'Required.';
  if (!form.previous.trim()) errors.previous = 'Required.';
  if (!form.militaryBackground.trim()) errors.militaryBackground = 'Required.';
  return errors;
}

function validateVisaTripForm(form) {
  const errors = {};
  if (!form.visaType.trim()) errors.visaType = 'Required.';
  if (!form.duration.trim()) errors.duration = 'Required.';
  if (!form.entries.trim()) errors.entries = 'Required.';
  if (!form.purpose.trim()) errors.purpose = 'Required.';
  if (!form.placesToVisit.trim()) errors.placesToVisit = 'Required.';
  if (!DATE_RE.test(form.arrivalDate)) errors.arrivalDate = 'Use YYYY-MM-DD.';
  if (!form.portOfArrival.trim()) errors.portOfArrival = 'Required.';
  if (!form.portOfExit.trim()) errors.portOfExit = 'Required.';
  return errors;
}

function validatePreviousIndiaTravelForm(form) {
  const errors = {};
  if (form.visitedBefore === '') errors.visitedBefore = 'Required.';
  if (form.visitedBefore === 'true') {
    if (!form.previousVisa.trim()) errors.previousVisa = 'Required.';
    if (!form.previousVisaNumber.trim()) errors.previousVisaNumber = 'Required.';
    if (!form.previousAddress.trim()) errors.previousAddress = 'Required.';
    if (!form.citiesVisited.trim()) errors.citiesVisited = 'Required.';
  }
  return errors;
}

function validateTravelHistoryForm(form) {
  const errors = {};
  if (!form.countriesVisitedLast10Years.trim()) errors.countriesVisitedLast10Years = 'Required.';
  if (!form.saarcTravel.trim()) errors.saarcTravel = 'Required.';
  return errors;
}

function validateReferencesForm(form) {
  const errors = {};
  if (!form.indiaRefName.trim()) errors.indiaRefName = 'Required.';
  if (!form.indiaRefAddress.trim()) errors.indiaRefAddress = 'Required.';
  if (!form.indiaRefState.trim()) errors.indiaRefState = 'Required.';
  if (!form.indiaRefDistrict.trim()) errors.indiaRefDistrict = 'Required.';
  if (!form.indiaRefPhone.trim()) errors.indiaRefPhone = 'Required.';
  if (!form.homeCountryRefName.trim()) errors.homeCountryRefName = 'Required.';
  if (!form.homeCountryRefAddress.trim()) errors.homeCountryRefAddress = 'Required.';
  if (!form.homeCountryRefPhone.trim()) errors.homeCountryRefPhone = 'Required.';
  return errors;
}

function validateBackgroundForm(form) {
  const errors = {};
  const checks = [
    ['arrestOrConviction', 'arrestOrConviction', 'arrestOrConvictionDetails'],
    ['refusedEntryOrDeported', 'refusedEntryOrDeported', 'refusedEntryOrDeportedDetails'],
    ['traffickingOrDrugs', 'traffickingOrDrugs', 'traffickingOrDrugsDetails'],
    ['cyberOrTerrorism', 'cyberOrTerrorism', 'cyberOrTerrorismDetails'],
    ['terrorismViews', 'terrorismViews', 'terrorismViewsDetails'],
    ['asylum', 'asylum', 'asylumDetails'],
  ];
  for (const [field, yesField, detailField] of checks) {
    if (form[field] === '') {
      errors[field] = 'Required.';
    }
    if (form[yesField] === 'true' && !form[detailField].trim()) {
      errors[detailField] = 'Required when yes.';
    }
  }
  return errors;
}

function splitCsvList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function sectionLabel(key) {
  return SECTION_STEPS.find((step) => step.key === key)?.label || 'Section';
}

function nextSection(key) {
  const index = SECTION_STEPS.findIndex((step) => step.key === key);
  return index >= 0 && index < SECTION_STEPS.length - 1 ? SECTION_STEPS[index + 1].key : key;
}

export default function App() {
  const [route, setRoute] = useState(parseRoute);
  const [application, setApplication] = useState(EMPTY_APPLICATION);
  const [activeSection, setActiveSection] = useState('APPLICATION_CONTEXT');
  const [contextForm, setContextForm] = useState(EMPTY_CONTEXT_FORM);
  const [identityForm, setIdentityForm] = useState(EMPTY_IDENTITY_FORM);
  const [passportForm, setPassportForm] = useState(EMPTY_PASSPORT_FORM);
  const [contactForm, setContactForm] = useState(EMPTY_CONTACT_FORM);
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS_FORM);
  const [familyForm, setFamilyForm] = useState(EMPTY_FAMILY_FORM);
  const [occupationForm, setOccupationForm] = useState(EMPTY_OCCUPATION_FORM);
  const [visaTripForm, setVisaTripForm] = useState(EMPTY_VISA_TRIP_FORM);
  const [previousIndiaTravelForm, setPreviousIndiaTravelForm] = useState(EMPTY_PREVIOUS_INDIA_TRAVEL_FORM);
  const [travelHistoryForm, setTravelHistoryForm] = useState(EMPTY_TRAVEL_HISTORY_FORM);
  const [referencesForm, setReferencesForm] = useState(EMPTY_REFERENCES_FORM);
  const [backgroundForm, setBackgroundForm] = useState(EMPTY_BACKGROUND_FORM);
  const [emailOtp, setEmailOtp] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    APPLICATION_CONTEXT: {},
    IDENTITY: {},
    PASSPORT: {},
    ADDRESS: {},
    FAMILY: {},
    OCCUPATION: {},
    VISA_TRIP: {},
    PREVIOUS_INDIA_TRAVEL: {},
    TRAVEL_HISTORY: {},
    REFERENCES: {},
    BACKGROUND_ANSWERS: {},
    CONTACT: {},
  });
  const [simulatedOtps, setSimulatedOtps] = useState({ email: '', phone: '' });
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    if (route.view === 'app' && route.tempId) {
      setLoading(true);
      setError('');
      fetch(`${API_BASE}/applications/${route.tempId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Not found');
          }
          return response.json();
        })
        .then((data) => {
          const nextApplication = normalizeResponse(data);
          setApplication(nextApplication);
          setActiveSection(nextApplication.currentSection);
          setContextForm(buildContextForm(nextApplication));
          setIdentityForm(buildIdentityForm(nextApplication));
          setPassportForm(buildPassportForm(nextApplication));
          setAddressForm(buildAddressForm(nextApplication));
          setFamilyForm(buildFamilyForm(nextApplication));
          setOccupationForm(buildOccupationForm(nextApplication));
          setVisaTripForm(buildVisaTripForm(nextApplication));
          setPreviousIndiaTravelForm(buildPreviousIndiaTravelForm(nextApplication));
          setTravelHistoryForm(buildTravelHistoryForm(nextApplication));
          setReferencesForm(buildReferencesForm(nextApplication));
          setBackgroundForm(buildBackgroundForm(nextApplication));
          setContactForm(buildContactForm(nextApplication));
          setEmailOtp('');
          setPhoneOtp('');
        })
        .catch(() => setError('Resume failed. Check the tempId and backend state.'))
        .finally(() => setLoading(false));
      return;
    }

    if (route.view === 'shell') {
      setApplication(EMPTY_APPLICATION);
      setActiveSection('APPLICATION_CONTEXT');
      setContextForm(EMPTY_CONTEXT_FORM);
      setIdentityForm(EMPTY_IDENTITY_FORM);
      setPassportForm(EMPTY_PASSPORT_FORM);
      setAddressForm(EMPTY_ADDRESS_FORM);
      setFamilyForm(EMPTY_FAMILY_FORM);
      setOccupationForm(EMPTY_OCCUPATION_FORM);
      setVisaTripForm(EMPTY_VISA_TRIP_FORM);
      setPreviousIndiaTravelForm(EMPTY_PREVIOUS_INDIA_TRAVEL_FORM);
      setTravelHistoryForm(EMPTY_TRAVEL_HISTORY_FORM);
      setReferencesForm(EMPTY_REFERENCES_FORM);
      setBackgroundForm(EMPTY_BACKGROUND_FORM);
      setContactForm(EMPTY_CONTACT_FORM);
      setEmailOtp('');
      setPhoneOtp('');
      setFieldErrors({
        APPLICATION_CONTEXT: {},
        IDENTITY: {},
        PASSPORT: {},
        ADDRESS: {},
        FAMILY: {},
        OCCUPATION: {},
        VISA_TRIP: {},
        PREVIOUS_INDIA_TRAVEL: {},
        TRAVEL_HISTORY: {},
        REFERENCES: {},
        BACKGROUND_ANSWERS: {},
        CONTACT: {},
      });
      setVerificationResult(null);
      setSimulatedOtps({ email: '', phone: '' });
      setError('');
    }
  }, [route]);

  function canOpenSection(key) {
    return key === application.currentSection || application.completedSections.includes(key);
  }

  function openSection(key) {
    if (canOpenSection(key)) {
      setActiveSection(key);
    }
  }

  function updateAddressField(field, value) {
    setAddressForm((current) => {
      const next = { ...current, [field]: value };
      if (current.sameAsPresent && field.startsWith('present')) {
        const permanentField = field.replace('present', 'permanent');
        if (permanentField in next) {
          next[permanentField] = value;
        }
      }
      return next;
    });
  }

  function toggleSameAsPresent(checked) {
    setAddressForm((current) => {
      const next = { ...current, sameAsPresent: checked };
      if (checked) {
        next.permanentLine1 = current.presentLine1;
        next.permanentLine2 = current.presentLine2;
        next.permanentCity = current.presentCity;
        next.permanentState = current.presentState;
        next.permanentCountry = current.presentCountry;
      }
      return next;
    });
  }

  async function applyErrorExplanations(sectionName, rawErrors) {
    setFieldErrors((current) => ({ ...current, [sectionName]: rawErrors }));
    if (Object.keys(rawErrors).length > 0) {
      const explained = await explainFieldErrors(sectionName, rawErrors);
      setFieldErrors((current) => ({ ...current, [sectionName]: explained }));
    }
  }

  async function handleFieldBlur(sectionName, validator, form, fieldName) {
    const errors = validator(form);
    const rawError = errors[fieldName];
    if (rawError) {
      setFieldErrors((current) => ({
        ...current,
        [sectionName]: { ...current[sectionName], [fieldName]: rawError },
      }));
      const explained = await getPlainLanguageError(fieldName, rawError, sectionName);
      setFieldErrors((current) => ({
        ...current,
        [sectionName]: { ...current[sectionName], [fieldName]: explained },
      }));
    } else {
      setFieldErrors((current) => {
        const copy = { ...(current[sectionName] || {}) };
        delete copy[fieldName];
        return { ...current, [sectionName]: copy };
      });
    }
  }

  async function saveApplicationContext(event) {
    event.preventDefault();
    setError('');
    const errors = validateContextForm(contextForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('APPLICATION_CONTEXT', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/application-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contextForm),
      });
      if (!response.ok) {
        setError('Application Context save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setContextForm(buildContextForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
      if (result.tempId) {
        window.location.hash = `#/app/${result.tempId}`;
      }
    } catch {
      setError('Application Context save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveIdentity(event) {
    event.preventDefault();
    setError('');
    const errors = validateIdentityForm(identityForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('IDENTITY', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/identity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...identityForm,
          residenceHistory: identityForm.residenceHistory
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
      if (!response.ok) {
        setError('Identity save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setIdentityForm(buildIdentityForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Identity save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function savePassport(event) {
    event.preventDefault();
    setError('');
    const errors = validatePassportForm(passportForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('PASSPORT', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/passport`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passportForm),
      });
      if (!response.ok) {
        setError('Passport save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setPassportForm(buildPassportForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Passport save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveAddress(event) {
    event.preventDefault();
    setError('');
    const errors = validateAddressForm(addressForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('ADDRESS', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: application.tempId,
          ...addressForm,
        }),
      });
      if (!response.ok) {
        setError('Address save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setAddressForm(buildAddressForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Address save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveFamily(event) {
    event.preventDefault();
    setError('');
    const errors = validateFamilyForm(familyForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('FAMILY', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/family`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: application.tempId,
          ...familyForm,
          grandparentPakistanOrigin: familyForm.grandparentPakistanOrigin === 'true',
        }),
      });
      if (!response.ok) {
        setError('Family save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setFamilyForm(buildFamilyForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Family save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveOccupation(event) {
    event.preventDefault();
    setError('');
    const errors = validateOccupationForm(occupationForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('OCCUPATION', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/occupation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: application.tempId,
          ...occupationForm,
        }),
      });
      if (!response.ok) {
        setError('Occupation save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setOccupationForm(buildOccupationForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Occupation save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveVisaTrip(event) {
    event.preventDefault();
    setError('');
    const errors = validateVisaTripForm(visaTripForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('VISA_TRIP', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/visa-trip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: application.tempId,
          ...visaTripForm,
          placesToVisit: splitCsvList(visaTripForm.placesToVisit),
        }),
      });
      if (!response.ok) {
        setError('Visa Trip save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setVisaTripForm(buildVisaTripForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Visa Trip save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function savePreviousIndiaTravel(event) {
    event.preventDefault();
    setError('');
    const errors = validatePreviousIndiaTravelForm(previousIndiaTravelForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('PREVIOUS_INDIA_TRAVEL', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/previous-india-travel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: application.tempId,
          visitedBefore: previousIndiaTravelForm.visitedBefore === 'true',
          previousVisa: previousIndiaTravelForm.previousVisa,
          previousVisaNumber: previousIndiaTravelForm.previousVisaNumber,
          previousAddress: previousIndiaTravelForm.previousAddress,
          citiesVisited: splitCsvList(previousIndiaTravelForm.citiesVisited),
        }),
      });
      if (!response.ok) {
        setError('Previous India Travel save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setPreviousIndiaTravelForm(buildPreviousIndiaTravelForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Previous India Travel save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveTravelHistory(event) {
    event.preventDefault();
    setError('');
    const errors = validateTravelHistoryForm(travelHistoryForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('TRAVEL_HISTORY', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/travel-history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: application.tempId,
          countriesVisitedLast10Years: splitCsvList(travelHistoryForm.countriesVisitedLast10Years),
          saarcTravel: splitCsvList(travelHistoryForm.saarcTravel),
        }),
      });
      if (!response.ok) {
        setError('Travel History save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setTravelHistoryForm(buildTravelHistoryForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Travel History save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveReferences(event) {
    event.preventDefault();
    setError('');
    const errors = validateReferencesForm(referencesForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('REFERENCES', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/references`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: application.tempId,
          indiaRef: {
            name: referencesForm.indiaRefName,
            address: referencesForm.indiaRefAddress,
            state: referencesForm.indiaRefState,
            district: referencesForm.indiaRefDistrict,
            phone: referencesForm.indiaRefPhone,
          },
          homeCountryRef: {
            name: referencesForm.homeCountryRefName,
            address: referencesForm.homeCountryRefAddress,
            phone: referencesForm.homeCountryRefPhone,
          },
        }),
      });
      if (!response.ok) {
        setError('References save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setReferencesForm(buildReferencesForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('References save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveBackgroundAnswers(event) {
    event.preventDefault();
    setError('');
    const errors = validateBackgroundForm(backgroundForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('BACKGROUND_ANSWERS', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/applications/${application.tempId}/background-answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tempId: application.tempId,
          arrestOrConviction: backgroundForm.arrestOrConviction === 'true',
          arrestOrConvictionDetails: backgroundForm.arrestOrConvictionDetails,
          refusedEntryOrDeported: backgroundForm.refusedEntryOrDeported === 'true',
          refusedEntryOrDeportedDetails: backgroundForm.refusedEntryOrDeportedDetails,
          traffickingOrDrugs: backgroundForm.traffickingOrDrugs === 'true',
          traffickingOrDrugsDetails: backgroundForm.traffickingOrDrugsDetails,
          cyberOrTerrorism: backgroundForm.cyberOrTerrorism === 'true',
          cyberOrTerrorismDetails: backgroundForm.cyberOrTerrorismDetails,
          terrorismViews: backgroundForm.terrorismViews === 'true',
          terrorismViewsDetails: backgroundForm.terrorismViewsDetails,
          asylum: backgroundForm.asylum === 'true',
          asylumDetails: backgroundForm.asylumDetails,
        }),
      });
      if (!response.ok) {
        setError('Background Answers save failed.');
        return;
      }

      const result = normalizeResponse(await response.json());
      setApplication(result);
      setActiveSection(result.currentSection);
      setBackgroundForm(buildBackgroundForm(result));
      setContactForm((current) => ({ ...current, applicationId: result.applicationId }));
    } catch {
      setError('Background Answers save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function saveContact(event) {
    event.preventDefault();
    setError('');
    const errors = validateContactForm(contactForm);
    if (Object.keys(errors).length > 0) {
      applyErrorExplanations('CONTACT', errors);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        setError('Please check the email fields and phone details.');
        return;
      }

      const saved = await response.json();
      const nextApplication = {
        ...application,
        applicationId: saved.applicationId,
        tempId: saved.tempId || application.tempId,
        applicationStatus: saved.applicationStatus,
        contact: {
          email: saved.email,
          countryCode: saved.countryCode,
          phone: saved.phone,
          emailVerified: false,
          phoneVerified: false,
        },
      };
      setApplication(nextApplication);
      setActiveSection('CONTACT');
      setContactForm({
        applicationId: saved.applicationId,
        email: contactForm.email,
        confirmEmail: contactForm.confirmEmail,
        countryCode: contactForm.countryCode,
        phone: contactForm.phone,
      });

      const [emailOtpResponse, phoneOtpResponse] = await Promise.all([
        fetch(`${API_BASE}/contact/${saved.applicationId}/otp/email`, { method: 'POST' }),
        fetch(`${API_BASE}/contact/${saved.applicationId}/otp/phone`, { method: 'POST' }),
      ]);

      const emailOtpPayload = await emailOtpResponse.json();
      const phoneOtpPayload = await phoneOtpResponse.json();
      setSimulatedOtps({ email: emailOtpPayload.otp, phone: phoneOtpPayload.otp });
    } catch {
      setError('Contact save failed. Make sure the backend is running on port 8080.');
    }
  }

  async function verifyContact(event) {
    event.preventDefault();
    setError('');

    if (!contactForm.applicationId) {
      setError('Save the contact details first.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/contact/${contactForm.applicationId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOtp, phoneOtp }),
      });

      if (!response.ok) {
        setError('OTP verification failed. Please try again.');
        return;
      }

      const result = await response.json();
      setVerificationResult(result);
      const nextApplication = {
        ...application,
        tempId: result.tempId,
        currentSection: result.currentSection,
        completedSections: result.completedSections,
        applicationStatus: 'SUBMITTED',
        contact: {
          ...(application.contact || {}),
          emailVerified: true,
          phoneVerified: true,
        },
      };
      setApplication(nextApplication);
      setActiveSection(result.currentSection);
      if (result.tempId) {
        window.location.hash = `#/app/${result.tempId}`;
      }
    } catch {
      setError('OTP verification failed. Make sure the backend is running on port 8080.');
    }
  }

  async function handleResume(event) {
    event.preventDefault();
    setError('');
    const tempId = event.currentTarget.tempId.value.trim();
    if (!tempId) {
      setError('Enter a tempId to resume.');
      return;
    }
    window.location.hash = `#/app/${encodeURIComponent(tempId)}`;
  }

  const currentStep = SECTION_STEPS.find((step) => step.key === activeSection) || SECTION_STEPS[0];

  return (
    <main className="app-shell">
      <div className="disclaimer-banner">
        Independent hackathon concept prototype — not affiliated with the Government of India. OTP,
        SMS/WhatsApp, and email delivery are simulated for this demo.
      </div>

      {route.view === 'status' ? (
        <StatusPage initialRef={route.finalRef} />
      ) : route.view === 'resume' ? (
        <section className="resume-card">
          <h1>Resume application</h1>
          <p className="panel-note">Re-enter your tempId to continue where you left off.</p>
          <form className="form-grid" onSubmit={handleResume}>
            <label>
              tempId
              <input name="tempId" type="text" autoComplete="off" />
            </label>
            <button type="submit">Resume application</button>
          </form>
          {error ? <div className="error-box">{error}</div> : null}
          <button type="button" className="link-button" onClick={() => (window.location.hash = '#')}>
            Back to application
          </button>
        </section>
      ) : (
        <section className="shell-grid">
          <aside className="step-rail">
            <div className="step-rail-header">
              <h1>VisaFlow</h1>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" className="link-button" onClick={() => (window.location.hash = '#/resume')}>
                  Resume
                </button>
                <button type="button" className="link-button" onClick={() => (window.location.hash = '#/status')}>
                  Check Status
                </button>
              </div>
            </div>
            <ol className="step-list">
              {SECTION_STEPS.map((step, index) => {
                const completed = application.completedSections.includes(step.key);
                const active = step.key === activeSection;
                const clickable = canOpenSection(step.key);
                return (
                  <li key={step.key}>
                    <button
                      type="button"
                      className={`step-item ${active ? 'is-active' : ''} ${completed ? 'is-complete' : ''}`}
                      onClick={() => openSection(step.key)}
                      disabled={!clickable}
                    >
                      <span className="step-badge">{completed ? '✓' : String(index + 1).padStart(2, '0')}</span>
                      <span>{step.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </aside>

          <section className="content-panel">
            <div className="panel-note">
              Current section: {currentStep.label}
              {application.tempId ? ` · tempId ${application.tempId}` : ''}
            </div>

            {loading ? <div className="info-box">Loading saved application...</div> : null}
            {error ? <div className="error-box">{error}</div> : null}
            {verificationResult ? (
              <section className="result-box">
                <div>Temp ID: {verificationResult.tempId}</div>
                <div className="result-note">In production, these would be real delivery messages.</div>
                {verificationResult.dispatchLog.map((item) => (
                  <div key={item.channel}>
                    {item.channel}: {item.message}
                  </div>
                ))}
              </section>
            ) : null}

            {activeSection === 'APPLICATION_CONTEXT' ? (
              <section className="section-card">
                <h2>Application Context</h2>
                <form className="form-grid" onSubmit={saveApplicationContext}>
                  <label>
                    Country applying from
                    <input
                      value={contextForm.countryApplyingFrom}
                      onChange={(event) => setContextForm({ ...contextForm, countryApplyingFrom: event.target.value })}
                      onBlur={() => handleFieldBlur('APPLICATION_CONTEXT', validateContextForm, contextForm, 'countryApplyingFrom')}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.countryApplyingFrom ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.countryApplyingFrom}</span>
                    ) : null}
                  </label>
                  <label>
                    Indian mission
                    <input
                      value={contextForm.indianMission}
                      onChange={(event) => setContextForm({ ...contextForm, indianMission: event.target.value })}
                      onBlur={() => handleFieldBlur('APPLICATION_CONTEXT', validateContextForm, contextForm, 'indianMission')}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.indianMission ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.indianMission}</span>
                    ) : null}
                  </label>
                  <label>
                    Nationality
                    <input
                      value={contextForm.nationality}
                      onChange={(event) => setContextForm({ ...contextForm, nationality: event.target.value })}
                      onBlur={() => handleFieldBlur('APPLICATION_CONTEXT', validateContextForm, contextForm, 'nationality')}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.nationality ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.nationality}</span>
                    ) : null}
                  </label>
                  <label>
                    Passport type
                    <input
                      value={contextForm.passportType}
                      onChange={(event) => setContextForm({ ...contextForm, passportType: event.target.value })}
                      onBlur={() => handleFieldBlur('APPLICATION_CONTEXT', validateContextForm, contextForm, 'passportType')}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.passportType ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.passportType}</span>
                    ) : null}
                  </label>
                  <label>
                    Port of arrival
                    <input
                      value={contextForm.portOfArrival}
                      onChange={(event) => setContextForm({ ...contextForm, portOfArrival: event.target.value })}
                      onBlur={() => handleFieldBlur('APPLICATION_CONTEXT', validateContextForm, contextForm, 'portOfArrival')}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.portOfArrival ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.portOfArrival}</span>
                    ) : null}
                  </label>
                  <label>
                    Expected arrival date
                    <input
                      value={contextForm.expectedArrivalDate}
                      onChange={(event) => setContextForm({ ...contextForm, expectedArrivalDate: event.target.value })}
                      onBlur={() => handleFieldBlur('APPLICATION_CONTEXT', validateContextForm, contextForm, 'expectedArrivalDate')}
                      type="text"
                      placeholder="YYYY-MM-DD"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.expectedArrivalDate ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.expectedArrivalDate}</span>
                    ) : null}
                  </label>
                  <label>
                    Date of birth
                    <input
                      value={contextForm.dateOfBirth}
                      onChange={(event) => setContextForm({ ...contextForm, dateOfBirth: event.target.value })}
                      onBlur={() => handleFieldBlur('APPLICATION_CONTEXT', validateContextForm, contextForm, 'dateOfBirth')}
                      type="text"
                      placeholder="YYYY-MM-DD"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.dateOfBirth ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.dateOfBirth}</span>
                    ) : null}
                  </label>
                  <label>
                    Visa purpose
                    <input
                      value={contextForm.visaPurpose}
                      onChange={(event) => setContextForm({ ...contextForm, visaPurpose: event.target.value })}
                      onBlur={() => handleFieldBlur('APPLICATION_CONTEXT', validateContextForm, contextForm, 'visaPurpose')}
                      type="text"
                    />
                    {fieldErrors.APPLICATION_CONTEXT.visaPurpose ? (
                      <span className="field-error">{fieldErrors.APPLICATION_CONTEXT.visaPurpose}</span>
                    ) : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'IDENTITY' ? (
              <section className="section-card">
                <h2>Identity</h2>
                <form className="form-grid" onSubmit={saveIdentity}>
                  <label>
                    First name
                    <input value={identityForm.firstName} onChange={(event) => setIdentityForm({ ...identityForm, firstName: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.firstName ? <span className="field-error">{fieldErrors.IDENTITY.firstName}</span> : null}
                  </label>
                  <label>
                    Last name
                    <input value={identityForm.lastName} onChange={(event) => setIdentityForm({ ...identityForm, lastName: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.lastName ? <span className="field-error">{fieldErrors.IDENTITY.lastName}</span> : null}
                  </label>
                  <label>
                    Previous name
                    <input value={identityForm.previousName} onChange={(event) => setIdentityForm({ ...identityForm, previousName: event.target.value })} type="text" />
                  </label>
                  <label>
                    Gender
                    <input value={identityForm.gender} onChange={(event) => setIdentityForm({ ...identityForm, gender: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.gender ? <span className="field-error">{fieldErrors.IDENTITY.gender}</span> : null}
                  </label>
                  <label>
                    Date of birth
                    <input value={identityForm.dob} onChange={(event) => setIdentityForm({ ...identityForm, dob: event.target.value })} type="text" placeholder="YYYY-MM-DD" />
                    {fieldErrors.IDENTITY.dob ? <span className="field-error">{fieldErrors.IDENTITY.dob}</span> : null}
                  </label>
                  <label>
                    City of birth
                    <input value={identityForm.cityOfBirth} onChange={(event) => setIdentityForm({ ...identityForm, cityOfBirth: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.cityOfBirth ? <span className="field-error">{fieldErrors.IDENTITY.cityOfBirth}</span> : null}
                  </label>
                  <label>
                    Country of birth
                    <input value={identityForm.countryOfBirth} onChange={(event) => setIdentityForm({ ...identityForm, countryOfBirth: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.countryOfBirth ? <span className="field-error">{fieldErrors.IDENTITY.countryOfBirth}</span> : null}
                  </label>
                  <label>
                    Citizenship ID
                    <input value={identityForm.citizenshipId} onChange={(event) => setIdentityForm({ ...identityForm, citizenshipId: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.citizenshipId ? <span className="field-error">{fieldErrors.IDENTITY.citizenshipId}</span> : null}
                  </label>
                  <label>
                    Religion
                    <input value={identityForm.religion} onChange={(event) => setIdentityForm({ ...identityForm, religion: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.religion ? <span className="field-error">{fieldErrors.IDENTITY.religion}</span> : null}
                  </label>
                  <label>
                    Identification mark
                    <input value={identityForm.identificationMark} onChange={(event) => setIdentityForm({ ...identityForm, identificationMark: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.identificationMark ? <span className="field-error">{fieldErrors.IDENTITY.identificationMark}</span> : null}
                  </label>
                  <label>
                    Education
                    <input value={identityForm.education} onChange={(event) => setIdentityForm({ ...identityForm, education: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.education ? <span className="field-error">{fieldErrors.IDENTITY.education}</span> : null}
                  </label>
                  <label>
                    Nationality
                    <input value={identityForm.nationality} onChange={(event) => setIdentityForm({ ...identityForm, nationality: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.nationality ? <span className="field-error">{fieldErrors.IDENTITY.nationality}</span> : null}
                  </label>
                  <label>
                    Nationality acquired by
                    <input value={identityForm.nationalityAcquiredBy} onChange={(event) => setIdentityForm({ ...identityForm, nationalityAcquiredBy: event.target.value })} type="text" />
                    {fieldErrors.IDENTITY.nationalityAcquiredBy ? <span className="field-error">{fieldErrors.IDENTITY.nationalityAcquiredBy}</span> : null}
                  </label>
                  <label>
                    Residence history
                    <input value={identityForm.residenceHistory} onChange={(event) => setIdentityForm({ ...identityForm, residenceHistory: event.target.value })} type="text" placeholder="Comma-separated entries" />
                    {fieldErrors.IDENTITY.residenceHistory ? <span className="field-error">{fieldErrors.IDENTITY.residenceHistory}</span> : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'PASSPORT' ? (
              <section className="section-card">
                <h2>Passport</h2>
                <form className="form-grid" onSubmit={savePassport}>
                  <label>
                    Passport number
                    <input value={passportForm.number} onChange={(event) => setPassportForm({ ...passportForm, number: event.target.value.toUpperCase() })} type="text" placeholder="VF-XXXXXX" />
                    {fieldErrors.PASSPORT.number ? <span className="field-error">{fieldErrors.PASSPORT.number}</span> : null}
                  </label>
                  <label>
                    Place of issue
                    <input value={passportForm.placeOfIssue} onChange={(event) => setPassportForm({ ...passportForm, placeOfIssue: event.target.value })} type="text" />
                    {fieldErrors.PASSPORT.placeOfIssue ? <span className="field-error">{fieldErrors.PASSPORT.placeOfIssue}</span> : null}
                  </label>
                  <label>
                    Date of issue
                    <input value={passportForm.dateOfIssue} onChange={(event) => setPassportForm({ ...passportForm, dateOfIssue: event.target.value })} type="text" placeholder="YYYY-MM-DD" />
                    {fieldErrors.PASSPORT.dateOfIssue ? <span className="field-error">{fieldErrors.PASSPORT.dateOfIssue}</span> : null}
                  </label>
                  <label>
                    Date of expiry
                    <input value={passportForm.dateOfExpiry} onChange={(event) => setPassportForm({ ...passportForm, dateOfExpiry: event.target.value })} type="text" placeholder="YYYY-MM-DD" />
                    {fieldErrors.PASSPORT.dateOfExpiry ? <span className="field-error">{fieldErrors.PASSPORT.dateOfExpiry}</span> : null}
                  </label>
                  <label>
                    Additional passport
                    <input checked={passportForm.hasAdditionalPassport} onChange={(event) => setPassportForm({ ...passportForm, hasAdditionalPassport: event.target.checked })} type="checkbox" />
                  </label>
                  <label>
                    Additional passport details
                    <input value={passportForm.additionalPassportDetails} onChange={(event) => setPassportForm({ ...passportForm, additionalPassportDetails: event.target.value })} type="text" />
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'CONTACT' ? (
              <section className="section-card">
                <h2>Contact</h2>
                <form className="form-grid" onSubmit={saveContact}>
                  <label>
                    Email
                    <input
                      value={contactForm.email}
                      onChange={(event) => setContactForm({ ...contactForm, email: event.target.value })}
                      type="email"
                      autoComplete="email"
                    />
                    {fieldErrors.CONTACT.email ? <span className="field-error">{fieldErrors.CONTACT.email}</span> : null}
                  </label>
                  <label>
                    Confirm email
                    <input
                      value={contactForm.confirmEmail}
                      onChange={(event) => setContactForm({ ...contactForm, confirmEmail: event.target.value })}
                      type="email"
                      autoComplete="email"
                    />
                    {fieldErrors.CONTACT.confirmEmail ? <span className="field-error">{fieldErrors.CONTACT.confirmEmail}</span> : null}
                  </label>
                  <label>
                    Country code
                    <input
                      value={contactForm.countryCode}
                      onChange={(event) => setContactForm({ ...contactForm, countryCode: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.CONTACT.countryCode ? <span className="field-error">{fieldErrors.CONTACT.countryCode}</span> : null}
                  </label>
                  <label>
                    Phone
                    <input
                      value={contactForm.phone}
                      onChange={(event) => setContactForm({ ...contactForm, phone: event.target.value })}
                      type="tel"
                      autoComplete="tel"
                    />
                    {fieldErrors.CONTACT.phone ? <span className="field-error">{fieldErrors.CONTACT.phone}</span> : null}
                  </label>
                  <button type="submit">Save contact details</button>
                </form>

                {contactForm.applicationId ? (
                  <form className="form-grid otp-grid" onSubmit={verifyContact}>
                    <div className="dev-box">
                      <strong>DEV MODE — Simulated SMS/Email</strong>
                      <div>Email OTP: {simulatedOtps.email || 'Pending'}</div>
                      <div>Phone OTP: {simulatedOtps.phone || 'Pending'}</div>
                    </div>

                    <label>
                      Email OTP
                      <input value={emailOtp} onChange={(event) => setEmailOtp(event.target.value)} inputMode="numeric" />
                    </label>
                    <label>
                      Phone OTP
                      <input value={phoneOtp} onChange={(event) => setPhoneOtp(event.target.value)} inputMode="numeric" />
                    </label>
                    <button type="submit">Verify OTPs</button>
                  </form>
                ) : null}
              </section>
            ) : activeSection === 'ADDRESS' ? (
              <section className="section-card">
                <h2>Address</h2>
                <form className="form-grid" onSubmit={saveAddress}>
                  <label>
                    Present line 1
                    <input
                      value={addressForm.presentLine1}
                      onChange={(event) => updateAddressField('presentLine1', event.target.value)}
                      type="text"
                    />
                    {fieldErrors.ADDRESS.presentLine1 ? <span className="field-error">{fieldErrors.ADDRESS.presentLine1}</span> : null}
                  </label>
                  <label>
                    Present line 2
                    <input
                      value={addressForm.presentLine2}
                      onChange={(event) => updateAddressField('presentLine2', event.target.value)}
                      type="text"
                    />
                  </label>
                  <label>
                    Present city
                    <input
                      value={addressForm.presentCity}
                      onChange={(event) => updateAddressField('presentCity', event.target.value)}
                      type="text"
                    />
                    {fieldErrors.ADDRESS.presentCity ? <span className="field-error">{fieldErrors.ADDRESS.presentCity}</span> : null}
                  </label>
                  <label>
                    Present state
                    <input
                      value={addressForm.presentState}
                      onChange={(event) => updateAddressField('presentState', event.target.value)}
                      type="text"
                    />
                    {fieldErrors.ADDRESS.presentState ? <span className="field-error">{fieldErrors.ADDRESS.presentState}</span> : null}
                  </label>
                  <label>
                    Present country
                    <input
                      value={addressForm.presentCountry}
                      onChange={(event) => updateAddressField('presentCountry', event.target.value)}
                      type="text"
                    />
                    {fieldErrors.ADDRESS.presentCountry ? <span className="field-error">{fieldErrors.ADDRESS.presentCountry}</span> : null}
                  </label>
                  <label>
                    <span>Same as present</span>
                    <input
                      checked={addressForm.sameAsPresent}
                      onChange={(event) => toggleSameAsPresent(event.target.checked)}
                      type="checkbox"
                    />
                  </label>
                  <label>
                    Permanent line 1
                    <input
                      value={addressForm.permanentLine1}
                      onChange={(event) => updateAddressField('permanentLine1', event.target.value)}
                      type="text"
                      disabled={addressForm.sameAsPresent}
                    />
                    {fieldErrors.ADDRESS.permanentLine1 ? <span className="field-error">{fieldErrors.ADDRESS.permanentLine1}</span> : null}
                  </label>
                  <label>
                    Permanent line 2
                    <input
                      value={addressForm.permanentLine2}
                      onChange={(event) => updateAddressField('permanentLine2', event.target.value)}
                      type="text"
                      disabled={addressForm.sameAsPresent}
                    />
                  </label>
                  <label>
                    Permanent city
                    <input
                      value={addressForm.permanentCity}
                      onChange={(event) => updateAddressField('permanentCity', event.target.value)}
                      type="text"
                      disabled={addressForm.sameAsPresent}
                    />
                    {fieldErrors.ADDRESS.permanentCity ? <span className="field-error">{fieldErrors.ADDRESS.permanentCity}</span> : null}
                  </label>
                  <label>
                    Permanent state
                    <input
                      value={addressForm.permanentState}
                      onChange={(event) => updateAddressField('permanentState', event.target.value)}
                      type="text"
                      disabled={addressForm.sameAsPresent}
                    />
                    {fieldErrors.ADDRESS.permanentState ? <span className="field-error">{fieldErrors.ADDRESS.permanentState}</span> : null}
                  </label>
                  <label>
                    Permanent country
                    <input
                      value={addressForm.permanentCountry}
                      onChange={(event) => updateAddressField('permanentCountry', event.target.value)}
                      type="text"
                      disabled={addressForm.sameAsPresent}
                    />
                    {fieldErrors.ADDRESS.permanentCountry ? <span className="field-error">{fieldErrors.ADDRESS.permanentCountry}</span> : null}
                  </label>
                  <label>
                    Postal code
                    <input
                      value={addressForm.postalCode}
                      onChange={(event) => updateAddressField('postalCode', event.target.value)}
                      type="text"
                    />
                    {fieldErrors.ADDRESS.postalCode ? <span className="field-error">{fieldErrors.ADDRESS.postalCode}</span> : null}
                  </label>
                  <label>
                    Phone
                    <input
                      value={addressForm.phone}
                      onChange={(event) => updateAddressField('phone', event.target.value)}
                      type="text"
                    />
                    {fieldErrors.ADDRESS.phone ? <span className="field-error">{fieldErrors.ADDRESS.phone}</span> : null}
                  </label>
                  <label>
                    Mobile
                    <input
                      value={addressForm.mobile}
                      onChange={(event) => updateAddressField('mobile', event.target.value)}
                      type="text"
                    />
                    {fieldErrors.ADDRESS.mobile ? <span className="field-error">{fieldErrors.ADDRESS.mobile}</span> : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'FAMILY' ? (
              <section className="section-card">
                <h2>Family</h2>
                <form className="form-grid" onSubmit={saveFamily}>
                  <label>
                    Father name
                    <input
                      value={familyForm.fatherName}
                      onChange={(event) => setFamilyForm({ ...familyForm, fatherName: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.fatherName ? <span className="field-error">{fieldErrors.FAMILY.fatherName}</span> : null}
                  </label>
                  <label>
                    Father nationality
                    <input
                      value={familyForm.fatherNationality}
                      onChange={(event) => setFamilyForm({ ...familyForm, fatherNationality: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.fatherNationality ? <span className="field-error">{fieldErrors.FAMILY.fatherNationality}</span> : null}
                  </label>
                  <label>
                    Father previous nationality
                    <input
                      value={familyForm.fatherPrevNationality}
                      onChange={(event) => setFamilyForm({ ...familyForm, fatherPrevNationality: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.fatherPrevNationality ? <span className="field-error">{fieldErrors.FAMILY.fatherPrevNationality}</span> : null}
                  </label>
                  <label>
                    Father birthplace
                    <input
                      value={familyForm.fatherBirthplace}
                      onChange={(event) => setFamilyForm({ ...familyForm, fatherBirthplace: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.fatherBirthplace ? <span className="field-error">{fieldErrors.FAMILY.fatherBirthplace}</span> : null}
                  </label>
                  <label>
                    Father birth country
                    <input
                      value={familyForm.fatherBirthCountry}
                      onChange={(event) => setFamilyForm({ ...familyForm, fatherBirthCountry: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.fatherBirthCountry ? <span className="field-error">{fieldErrors.FAMILY.fatherBirthCountry}</span> : null}
                  </label>
                  <label>
                    Mother name
                    <input
                      value={familyForm.motherName}
                      onChange={(event) => setFamilyForm({ ...familyForm, motherName: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.motherName ? <span className="field-error">{fieldErrors.FAMILY.motherName}</span> : null}
                  </label>
                  <label>
                    Mother nationality
                    <input
                      value={familyForm.motherNationality}
                      onChange={(event) => setFamilyForm({ ...familyForm, motherNationality: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.motherNationality ? <span className="field-error">{fieldErrors.FAMILY.motherNationality}</span> : null}
                  </label>
                  <label>
                    Mother previous nationality
                    <input
                      value={familyForm.motherPrevNationality}
                      onChange={(event) => setFamilyForm({ ...familyForm, motherPrevNationality: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.motherPrevNationality ? <span className="field-error">{fieldErrors.FAMILY.motherPrevNationality}</span> : null}
                  </label>
                  <label>
                    Mother birthplace
                    <input
                      value={familyForm.motherBirthplace}
                      onChange={(event) => setFamilyForm({ ...familyForm, motherBirthplace: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.motherBirthplace ? <span className="field-error">{fieldErrors.FAMILY.motherBirthplace}</span> : null}
                  </label>
                  <label>
                    Mother birth country
                    <input
                      value={familyForm.motherBirthCountry}
                      onChange={(event) => setFamilyForm({ ...familyForm, motherBirthCountry: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.motherBirthCountry ? <span className="field-error">{fieldErrors.FAMILY.motherBirthCountry}</span> : null}
                  </label>
                  <label>
                    Grandparent Pakistan origin
                    <select
                      value={familyForm.grandparentPakistanOrigin}
                      onChange={(event) => setFamilyForm({ ...familyForm, grandparentPakistanOrigin: event.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    {fieldErrors.FAMILY.grandparentPakistanOrigin ? <span className="field-error">{fieldErrors.FAMILY.grandparentPakistanOrigin}</span> : null}
                  </label>
                  <label>
                    Marital status
                    <input
                      value={familyForm.maritalStatus}
                      onChange={(event) => setFamilyForm({ ...familyForm, maritalStatus: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.FAMILY.maritalStatus ? <span className="field-error">{fieldErrors.FAMILY.maritalStatus}</span> : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'OCCUPATION' ? (
              <section className="section-card">
                <h2>Occupation</h2>
                <form className="form-grid" onSubmit={saveOccupation}>
                  <label>
                    Current
                    <input
                      value={occupationForm.current}
                      onChange={(event) => setOccupationForm({ ...occupationForm, current: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.OCCUPATION.current ? <span className="field-error">{fieldErrors.OCCUPATION.current}</span> : null}
                  </label>
                  <label>
                    Employer
                    <input
                      value={occupationForm.employer}
                      onChange={(event) => setOccupationForm({ ...occupationForm, employer: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.OCCUPATION.employer ? <span className="field-error">{fieldErrors.OCCUPATION.employer}</span> : null}
                  </label>
                  <label>
                    Designation
                    <input
                      value={occupationForm.designation}
                      onChange={(event) => setOccupationForm({ ...occupationForm, designation: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.OCCUPATION.designation ? <span className="field-error">{fieldErrors.OCCUPATION.designation}</span> : null}
                  </label>
                  <label>
                    Employer address
                    <input
                      value={occupationForm.employerAddress}
                      onChange={(event) => setOccupationForm({ ...occupationForm, employerAddress: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.OCCUPATION.employerAddress ? <span className="field-error">{fieldErrors.OCCUPATION.employerAddress}</span> : null}
                  </label>
                  <label>
                    Employer phone
                    <input
                      value={occupationForm.employerPhone}
                      onChange={(event) => setOccupationForm({ ...occupationForm, employerPhone: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.OCCUPATION.employerPhone ? <span className="field-error">{fieldErrors.OCCUPATION.employerPhone}</span> : null}
                  </label>
                  <label>
                    Previous
                    <input
                      value={occupationForm.previous}
                      onChange={(event) => setOccupationForm({ ...occupationForm, previous: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.OCCUPATION.previous ? <span className="field-error">{fieldErrors.OCCUPATION.previous}</span> : null}
                  </label>
                  <label>
                    Military background
                    <input
                      value={occupationForm.militaryBackground}
                      onChange={(event) => setOccupationForm({ ...occupationForm, militaryBackground: event.target.value })}
                      type="text"
                    />
                    {fieldErrors.OCCUPATION.militaryBackground ? <span className="field-error">{fieldErrors.OCCUPATION.militaryBackground}</span> : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'VISA_TRIP' ? (
              <section className="section-card">
                <h2>Visa / Trip</h2>
                <form className="form-grid" onSubmit={saveVisaTrip}>
                  <label>
                    Visa type
                    <input value={visaTripForm.visaType} onChange={(event) => setVisaTripForm({ ...visaTripForm, visaType: event.target.value })} type="text" />
                    {fieldErrors.VISA_TRIP.visaType ? <span className="field-error">{fieldErrors.VISA_TRIP.visaType}</span> : null}
                  </label>
                  <label>
                    Duration
                    <input value={visaTripForm.duration} onChange={(event) => setVisaTripForm({ ...visaTripForm, duration: event.target.value })} type="text" />
                    {fieldErrors.VISA_TRIP.duration ? <span className="field-error">{fieldErrors.VISA_TRIP.duration}</span> : null}
                  </label>
                  <label>
                    Entries
                    <input value={visaTripForm.entries} onChange={(event) => setVisaTripForm({ ...visaTripForm, entries: event.target.value })} type="text" />
                    {fieldErrors.VISA_TRIP.entries ? <span className="field-error">{fieldErrors.VISA_TRIP.entries}</span> : null}
                  </label>
                  <label>
                    Purpose
                    <input value={visaTripForm.purpose} onChange={(event) => setVisaTripForm({ ...visaTripForm, purpose: event.target.value })} type="text" />
                    {fieldErrors.VISA_TRIP.purpose ? <span className="field-error">{fieldErrors.VISA_TRIP.purpose}</span> : null}
                  </label>
                  <label>
                    Places to visit
                    <input
                      value={visaTripForm.placesToVisit}
                      onChange={(event) => setVisaTripForm({ ...visaTripForm, placesToVisit: event.target.value })}
                      type="text"
                      placeholder="Comma-separated entries"
                    />
                    {fieldErrors.VISA_TRIP.placesToVisit ? <span className="field-error">{fieldErrors.VISA_TRIP.placesToVisit}</span> : null}
                  </label>
                  <label>
                    Arrival date
                    <input value={visaTripForm.arrivalDate} onChange={(event) => setVisaTripForm({ ...visaTripForm, arrivalDate: event.target.value })} type="text" placeholder="YYYY-MM-DD" />
                    {fieldErrors.VISA_TRIP.arrivalDate ? <span className="field-error">{fieldErrors.VISA_TRIP.arrivalDate}</span> : null}
                  </label>
                  <label>
                    Port of arrival
                    <input value={visaTripForm.portOfArrival} onChange={(event) => setVisaTripForm({ ...visaTripForm, portOfArrival: event.target.value })} type="text" />
                    {fieldErrors.VISA_TRIP.portOfArrival ? <span className="field-error">{fieldErrors.VISA_TRIP.portOfArrival}</span> : null}
                  </label>
                  <label>
                    Port of exit
                    <input value={visaTripForm.portOfExit} onChange={(event) => setVisaTripForm({ ...visaTripForm, portOfExit: event.target.value })} type="text" />
                    {fieldErrors.VISA_TRIP.portOfExit ? <span className="field-error">{fieldErrors.VISA_TRIP.portOfExit}</span> : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'PREVIOUS_INDIA_TRAVEL' ? (
              <section className="section-card">
                <h2>Previous India Travel</h2>
                <form className="form-grid" onSubmit={savePreviousIndiaTravel}>
                  <label>
                    Visited before
                    <select value={previousIndiaTravelForm.visitedBefore} onChange={(event) => setPreviousIndiaTravelForm({ ...previousIndiaTravelForm, visitedBefore: event.target.value })}>
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    {fieldErrors.PREVIOUS_INDIA_TRAVEL.visitedBefore ? <span className="field-error">{fieldErrors.PREVIOUS_INDIA_TRAVEL.visitedBefore}</span> : null}
                  </label>
                  <label>
                    Previous visa
                    <input value={previousIndiaTravelForm.previousVisa} onChange={(event) => setPreviousIndiaTravelForm({ ...previousIndiaTravelForm, previousVisa: event.target.value })} type="text" />
                    {fieldErrors.PREVIOUS_INDIA_TRAVEL.previousVisa ? <span className="field-error">{fieldErrors.PREVIOUS_INDIA_TRAVEL.previousVisa}</span> : null}
                  </label>
                  <label>
                    Previous visa number
                    <input value={previousIndiaTravelForm.previousVisaNumber} onChange={(event) => setPreviousIndiaTravelForm({ ...previousIndiaTravelForm, previousVisaNumber: event.target.value })} type="text" />
                    {fieldErrors.PREVIOUS_INDIA_TRAVEL.previousVisaNumber ? <span className="field-error">{fieldErrors.PREVIOUS_INDIA_TRAVEL.previousVisaNumber}</span> : null}
                  </label>
                  <label>
                    Previous address
                    <input value={previousIndiaTravelForm.previousAddress} onChange={(event) => setPreviousIndiaTravelForm({ ...previousIndiaTravelForm, previousAddress: event.target.value })} type="text" />
                    {fieldErrors.PREVIOUS_INDIA_TRAVEL.previousAddress ? <span className="field-error">{fieldErrors.PREVIOUS_INDIA_TRAVEL.previousAddress}</span> : null}
                  </label>
                  <label>
                    Cities visited
                    <input
                      value={previousIndiaTravelForm.citiesVisited}
                      onChange={(event) => setPreviousIndiaTravelForm({ ...previousIndiaTravelForm, citiesVisited: event.target.value })}
                      type="text"
                      placeholder="Comma-separated entries"
                    />
                    {fieldErrors.PREVIOUS_INDIA_TRAVEL.citiesVisited ? <span className="field-error">{fieldErrors.PREVIOUS_INDIA_TRAVEL.citiesVisited}</span> : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'TRAVEL_HISTORY' ? (
              <section className="section-card">
                <h2>Travel History</h2>
                <form className="form-grid" onSubmit={saveTravelHistory}>
                  <label>
                    Countries visited in last 10 years
                    <input
                      value={travelHistoryForm.countriesVisitedLast10Years}
                      onChange={(event) => setTravelHistoryForm({ ...travelHistoryForm, countriesVisitedLast10Years: event.target.value })}
                      type="text"
                      placeholder="Comma-separated entries"
                    />
                    {fieldErrors.TRAVEL_HISTORY.countriesVisitedLast10Years ? <span className="field-error">{fieldErrors.TRAVEL_HISTORY.countriesVisitedLast10Years}</span> : null}
                  </label>
                  <label>
                    SAARC travel
                    <input
                      value={travelHistoryForm.saarcTravel}
                      onChange={(event) => setTravelHistoryForm({ ...travelHistoryForm, saarcTravel: event.target.value })}
                      type="text"
                      placeholder="Comma-separated entries"
                    />
                    {fieldErrors.TRAVEL_HISTORY.saarcTravel ? <span className="field-error">{fieldErrors.TRAVEL_HISTORY.saarcTravel}</span> : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'REFERENCES' ? (
              <section className="section-card">
                <h2>References</h2>
                <form className="form-grid" onSubmit={saveReferences}>
                  <div>
                    <h3>India reference</h3>
                  </div>
                  <label>
                    Name
                    <input value={referencesForm.indiaRefName} onChange={(event) => setReferencesForm({ ...referencesForm, indiaRefName: event.target.value })} type="text" />
                    {fieldErrors.REFERENCES.indiaRefName ? <span className="field-error">{fieldErrors.REFERENCES.indiaRefName}</span> : null}
                  </label>
                  <label>
                    Address
                    <input value={referencesForm.indiaRefAddress} onChange={(event) => setReferencesForm({ ...referencesForm, indiaRefAddress: event.target.value })} type="text" />
                    {fieldErrors.REFERENCES.indiaRefAddress ? <span className="field-error">{fieldErrors.REFERENCES.indiaRefAddress}</span> : null}
                  </label>
                  <label>
                    State
                    <input value={referencesForm.indiaRefState} onChange={(event) => setReferencesForm({ ...referencesForm, indiaRefState: event.target.value })} type="text" />
                    {fieldErrors.REFERENCES.indiaRefState ? <span className="field-error">{fieldErrors.REFERENCES.indiaRefState}</span> : null}
                  </label>
                  <label>
                    District
                    <input value={referencesForm.indiaRefDistrict} onChange={(event) => setReferencesForm({ ...referencesForm, indiaRefDistrict: event.target.value })} type="text" />
                    {fieldErrors.REFERENCES.indiaRefDistrict ? <span className="field-error">{fieldErrors.REFERENCES.indiaRefDistrict}</span> : null}
                  </label>
                  <label>
                    Phone
                    <input value={referencesForm.indiaRefPhone} onChange={(event) => setReferencesForm({ ...referencesForm, indiaRefPhone: event.target.value })} type="text" />
                    {fieldErrors.REFERENCES.indiaRefPhone ? <span className="field-error">{fieldErrors.REFERENCES.indiaRefPhone}</span> : null}
                  </label>
                  <div>
                    <h3>Home-country reference</h3>
                  </div>
                  <label>
                    Name
                    <input value={referencesForm.homeCountryRefName} onChange={(event) => setReferencesForm({ ...referencesForm, homeCountryRefName: event.target.value })} type="text" />
                    {fieldErrors.REFERENCES.homeCountryRefName ? <span className="field-error">{fieldErrors.REFERENCES.homeCountryRefName}</span> : null}
                  </label>
                  <label>
                    Address
                    <input value={referencesForm.homeCountryRefAddress} onChange={(event) => setReferencesForm({ ...referencesForm, homeCountryRefAddress: event.target.value })} type="text" />
                    {fieldErrors.REFERENCES.homeCountryRefAddress ? <span className="field-error">{fieldErrors.REFERENCES.homeCountryRefAddress}</span> : null}
                  </label>
                  <label>
                    Phone
                    <input value={referencesForm.homeCountryRefPhone} onChange={(event) => setReferencesForm({ ...referencesForm, homeCountryRefPhone: event.target.value })} type="text" />
                    {fieldErrors.REFERENCES.homeCountryRefPhone ? <span className="field-error">{fieldErrors.REFERENCES.homeCountryRefPhone}</span> : null}
                  </label>
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'BACKGROUND_ANSWERS' ? (
              <section className="section-card">
                <h2>Background Questions</h2>
                <form className="form-grid" onSubmit={saveBackgroundAnswers}>
                  <label>
                    Arrest or conviction
                    <select
                      value={backgroundForm.arrestOrConviction}
                      onChange={(event) => setBackgroundForm({ ...backgroundForm, arrestOrConviction: event.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    {fieldErrors.BACKGROUND_ANSWERS.arrestOrConviction ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.arrestOrConviction}</span> : null}
                  </label>
                  {backgroundForm.arrestOrConviction === 'true' ? (
                    <label>
                      Arrest or conviction details
                      <textarea
                        value={backgroundForm.arrestOrConvictionDetails}
                        onChange={(event) => setBackgroundForm({ ...backgroundForm, arrestOrConvictionDetails: event.target.value })}
                        rows="3"
                      />
                      {fieldErrors.BACKGROUND_ANSWERS.arrestOrConvictionDetails ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.arrestOrConvictionDetails}</span> : null}
                    </label>
                  ) : null}
                  <label>
                    Refused entry or deported
                    <select
                      value={backgroundForm.refusedEntryOrDeported}
                      onChange={(event) => setBackgroundForm({ ...backgroundForm, refusedEntryOrDeported: event.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    {fieldErrors.BACKGROUND_ANSWERS.refusedEntryOrDeported ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.refusedEntryOrDeported}</span> : null}
                  </label>
                  {backgroundForm.refusedEntryOrDeported === 'true' ? (
                    <label>
                      Refused entry or deported details
                      <textarea
                        value={backgroundForm.refusedEntryOrDeportedDetails}
                        onChange={(event) => setBackgroundForm({ ...backgroundForm, refusedEntryOrDeportedDetails: event.target.value })}
                        rows="3"
                      />
                      {fieldErrors.BACKGROUND_ANSWERS.refusedEntryOrDeportedDetails ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.refusedEntryOrDeportedDetails}</span> : null}
                    </label>
                  ) : null}
                  <label>
                    Trafficking or drugs
                    <select
                      value={backgroundForm.traffickingOrDrugs}
                      onChange={(event) => setBackgroundForm({ ...backgroundForm, traffickingOrDrugs: event.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    {fieldErrors.BACKGROUND_ANSWERS.traffickingOrDrugs ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.traffickingOrDrugs}</span> : null}
                  </label>
                  {backgroundForm.traffickingOrDrugs === 'true' ? (
                    <label>
                      Trafficking or drugs details
                      <textarea
                        value={backgroundForm.traffickingOrDrugsDetails}
                        onChange={(event) => setBackgroundForm({ ...backgroundForm, traffickingOrDrugsDetails: event.target.value })}
                        rows="3"
                      />
                      {fieldErrors.BACKGROUND_ANSWERS.traffickingOrDrugsDetails ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.traffickingOrDrugsDetails}</span> : null}
                    </label>
                  ) : null}
                  <label>
                    Cyber or terrorism
                    <select
                      value={backgroundForm.cyberOrTerrorism}
                      onChange={(event) => setBackgroundForm({ ...backgroundForm, cyberOrTerrorism: event.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    {fieldErrors.BACKGROUND_ANSWERS.cyberOrTerrorism ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.cyberOrTerrorism}</span> : null}
                  </label>
                  {backgroundForm.cyberOrTerrorism === 'true' ? (
                    <label>
                      Cyber or terrorism details
                      <textarea
                        value={backgroundForm.cyberOrTerrorismDetails}
                        onChange={(event) => setBackgroundForm({ ...backgroundForm, cyberOrTerrorismDetails: event.target.value })}
                        rows="3"
                      />
                      {fieldErrors.BACKGROUND_ANSWERS.cyberOrTerrorismDetails ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.cyberOrTerrorismDetails}</span> : null}
                    </label>
                  ) : null}
                  <label>
                    Terrorism views
                    <select
                      value={backgroundForm.terrorismViews}
                      onChange={(event) => setBackgroundForm({ ...backgroundForm, terrorismViews: event.target.value })}
                    >
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    {fieldErrors.BACKGROUND_ANSWERS.terrorismViews ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.terrorismViews}</span> : null}
                  </label>
                  {backgroundForm.terrorismViews === 'true' ? (
                    <label>
                      Terrorism views details
                      <textarea
                        value={backgroundForm.terrorismViewsDetails}
                        onChange={(event) => setBackgroundForm({ ...backgroundForm, terrorismViewsDetails: event.target.value })}
                        rows="3"
                      />
                      {fieldErrors.BACKGROUND_ANSWERS.terrorismViewsDetails ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.terrorismViewsDetails}</span> : null}
                    </label>
                  ) : null}
                  <label>
                    Asylum
                    <select value={backgroundForm.asylum} onChange={(event) => setBackgroundForm({ ...backgroundForm, asylum: event.target.value })}>
                      <option value="">Select</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                    {fieldErrors.BACKGROUND_ANSWERS.asylum ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.asylum}</span> : null}
                  </label>
                  {backgroundForm.asylum === 'true' ? (
                    <label>
                      Asylum details
                      <textarea
                        value={backgroundForm.asylumDetails}
                        onChange={(event) => setBackgroundForm({ ...backgroundForm, asylumDetails: event.target.value })}
                        rows="3"
                      />
                      {fieldErrors.BACKGROUND_ANSWERS.asylumDetails ? <span className="field-error">{fieldErrors.BACKGROUND_ANSWERS.asylumDetails}</span> : null}
                    </label>
                  ) : null}
                  <button type="submit">Save and continue</button>
                </form>
              </section>
            ) : activeSection === 'DOCUMENTS' ? (
              <DocumentUpload tempId={application.tempId} />
            ) : activeSection === 'SUBMISSION' ? (
              <ReviewSubmit tempId={application.tempId} application={application} />
            ) : (
              <section className="section-card placeholder-card">
                <h2>{sectionLabel(activeSection)}</h2>
                <p>This section is not built yet.</p>
              </section>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
