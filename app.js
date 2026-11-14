/* ==========================================================================
   ENVISION '26 — Client Application Logic (Vanilla JS)
   Manages Schemes, Bilingual i18n, Accessibility Panel, Speech Synthesis,
   Eligibility Engine, Side-by-Side Comparison, and Reference Tracker.
   ========================================================================== */

const SCHEMES = [
  {
    id: "tn-bc-fee-reimburse",
    name: "Educational Fee Reimbursement for BC, MBC & DNC Student Schemes",
    category: "Education",
    disabilityType: "any",
    ageGroup: "child",
    summary: "Full fee reimbursement for eligible BC, MBC & DNC differently abled students studying in 11th or 12th standard (English medium).",
    easyRead: "If you are a BC, MBC or DNC student in 11th or 12th standard (English medium) with family income under ₹1,00,000 and no graduate in the family, your school fees are covered.",
    benefit: "Full school fee reimbursement / scholarship grant.",
    criteria: {
      studentRequired: true,
      minAge: 13,
      maxAge: 20,
      maxIncome: 100000,
      community: ["bc", "mbc"],
      education: ["school11_12_eng"],
      firstGenGraduate: true,
      disabilityRequired: false
    },
    documents: ["Community certificate (BC/MBC/DNC)", "Income certificate (< ₹1,00,000)", "Bonafide student certificate from 11th/12th school", "UDID / Disability certificate"]
  },
  {
    id: "tn-bus-pass-visual",
    name: "Free Bus Travel Concession for Visually Impaired Persons",
    category: "Transport",
    disabilityType: "visual",
    ageGroup: "adult",
    summary: "Free bus travel concession up to 100 km to and fro without any income condition in State-owned Transport Corporation buses.",
    easyRead: "Visually impaired persons can travel up to 100 km to and fro free of cost on government buses with no income limit.",
    benefit: "Free bus travel up to 100 km (to and fro) on State Transport buses.",
    criteria: {
      disabilityType: "visual",
      minIncome: 0,
      maxIncome: Infinity,
      disabilityRequired: true
    },
    documents: ["Disability Identity Card / UDID card", "Bus pass application form verified by DDAWO"]
  },
  {
    id: "tn-bus-pass-intellectual",
    name: "Free Bus Travel Concession for Intellectually Disabled with Escort",
    category: "Transport",
    disabilityType: "intellectual",
    ageGroup: "child",
    summary: "Free-of-cost travel concession for intellectually disabled persons to travel with one escort on State-owned Transport Corporation buses.",
    easyRead: "Intellectually disabled persons get free bus travel along with one escort, with no income ceiling.",
    benefit: "Free bus travel for beneficiary and one accompanying escort.",
    criteria: {
      disabilityType: "intellectual",
      maxIncome: Infinity,
      disabilityRequired: true
    },
    documents: ["Disability Identity Card / UDID card", "Medical board certificate"]
  },
  {
    id: "tn-bus-pass-commute",
    name: "Free Bus Travel for Speech/Hearing & Locomotor Impaired to Work/School",
    category: "Transport",
    disabilityType: "locomotor",
    ageGroup: "adult",
    summary: "Free bus travel up to 100 km to commute to schools, colleges, hospitals, training centers, or work spots.",
    easyRead: "Speech, hearing, and locomotor impaired individuals travel free up to 100 km to reach schools, colleges, hospitals, or work.",
    benefit: "Free travel concession up to 100 km for education, healthcare, or employment commute.",
    criteria: {
      disabilityType: ["hearing", "locomotor"],
      maxIncome: Infinity,
      disabilityRequired: true
    },
    documents: ["Disability ID card", "Institution / Workplace ID or certificate"]
  },
  {
    id: "tn-bus-pass-early",
    name: "Free Bus Travel for Children with Disabilities to Early Intervention Centres",
    category: "Transport",
    disabilityType: "any",
    ageGroup: "child",
    summary: "Free travel concession provided to children with disabilities and one escort/parent to attend early intervention centres and pre-schools.",
    easyRead: "Children with disabilities and a parent/escort travel free to early intervention and pre-schools.",
    benefit: "Free bus travel for child and parent/escort to pre-schools/intervention centers.",
    criteria: {
      maxAge: 10,
      maxIncome: Infinity,
      disabilityRequired: true
    },
    documents: ["Disability ID / UDID", "Early intervention center enrolment proof"]
  },
  {
    id: "tn-book-binder-training",
    name: "Book Binder Training for Visually Impaired Persons",
    category: "Training",
    disabilityType: "visual",
    ageGroup: "youth",
    summary: "Imparted book binder training for visually impaired candidates at the Government Higher Secondary School, Poonamallee every year.",
    easyRead: "Visually impaired youth (18–40) who have passed 8th standard receive free annual book binding training at Poonamallee.",
    benefit: "Free vocational book binding training with skill certification.",
    criteria: {
      disabilityType: "visual",
      minAge: 18,
      maxAge: 40,
      minEducation: "passed8",
      disabilityRequired: true
    },
    documents: ["8th Standard Pass Marksheet", "Disability ID Card", "Transfer Certificate"]
  },
  {
    id: "tn-smartphone-support",
    name: "Smart Phone for Hearing and Visually Impaired Persons",
    category: "Assistive Technology",
    disabilityType: "visual",
    ageGroup: "youth",
    summary: "Free distribution of smartphones to needy visually and hearing-impaired students, unemployed youth, self-employed persons, and women.",
    easyRead: "Free smartphones for visually or hearing-impaired students, job seekers, self-employed persons, and women.",
    benefit: "Free assistive smartphone equipped with accessibility software.",
    criteria: {
      disabilityType: ["visual", "hearing"],
      disabilityRequired: true
    },
    documents: ["Disability Certificate / UDID", "Student ID, Employment exchange card, or Self-employment proof"]
  },
  {
    id: "tn-maintenance-allowance",
    name: "Severe Disability Maintenance Allowance",
    category: "Financial Support",
    disabilityType: "any",
    ageGroup: "senior",
    summary: "Monthly financial maintenance grant for persons with severe, multiple, or intellectual disabilities.",
    easyRead: "Monthly financial support for individuals with severe or multiple disabilities to assist with daily living.",
    benefit: "Direct monthly maintenance allowance credited to bank account.",
    criteria: {
      minDisabilityPercent: 60,
      disabilityRequired: true
    },
    documents: ["UDID Card (Severe/Multiple)", "Bank passbook copy", "Aadhaar / Address proof"]
  },
  {
    id: "tn-marriage-assistance",
    name: "Differently Abled Marriage Assistance Scheme",
    category: "Financial Support",
    disabilityType: "any",
    ageGroup: "youth",
    summary: "Financial assistance for the marriage of differently abled persons, with higher grants for graduates.",
    easyRead: "Cash assistance and gold coin for marriage when one or both partners are differently abled.",
    benefit: "Financial grant and gold coin for wedding expenses.",
    criteria: {
      minAge: 18,
      disabilityRequired: true
    },
    documents: ["Disability ID Card", "Marriage invitation & registration certificate", "Income certificate"]
  },
  {
    id: "tn-artificial-limbs",
    name: "Free Artificial Limbs & Assistive Devices Distribution",
    category: "Assistive Technology",
    disabilityType: "locomotor",
    ageGroup: "senior",
    summary: "Provision of motorized tricycles, wheel chairs, crutches, hearing aids, and artificial limbs.",
    easyRead: "Free wheel chairs, tricycles, hearing aids, or artificial limbs distributed through district camps.",
    benefit: "Free custom assistive devices and mobility aids.",
    criteria: {
      disabilityType: ["locomotor", "hearing", "visual"],
      disabilityRequired: true
    },
    documents: ["Disability Certificate", "Passport photo", "Income certificate"]
  },
  {
    id: "tn-higher-education-scholarship",
    name: "Higher Education Scholarship for Students with Disabilities",
    category: "Education",
    disabilityType: "any",
    ageGroup: "youth",
    summary: "Stipends and maintenance allowances for differently abled students pursuing undergraduate, postgraduate, and professional degrees.",
    easyRead: "Scholarships and book allowances for students with disabilities in college or professional courses.",
    benefit: "Annual scholarship and reader allowance for visually impaired scholars.",
    criteria: {
      studentRequired: true,
      minEducation: "ug_pg",
      disabilityRequired: true
    },
    documents: ["College admission / Bonafide certificate", "Previous year marksheet", "UDID Card"]
  },
  {
    id: "tn-self-employment-loan",
    name: "Self-Employment Bank Loan Subsidy for Differently Abled",
    category: "Employment",
    disabilityType: "any",
    ageGroup: "adult",
    summary: "Subsidized bank loans and financial assistance for differently abled entrepreneurs to start small businesses.",
    easyRead: "Subsidy loans up to ₹50,000 or more for starting micro-enterprises and shops.",
    benefit: "Capital subsidy and low-interest bank loan linkage.",
    criteria: {
      minAge: 18,
      maxAge: 55,
      disabilityRequired: true
    },
    documents: ["Business project proposal", "Disability ID Card", "Income certificate", "Address proof"]
  },
  {
    id: "tn-job-fair-placement",
    name: "Exclusive Employment Fair (Thozhil Vaippu) for Differently Abled",
    category: "Employment",
    disabilityType: "any",
    ageGroup: "youth",
    summary: "Special private and public sector job fairs organized periodically across districts for job seekers with disabilities.",
    easyRead: "Special job placement camps connecting trained differently abled youth with inclusive employers.",
    benefit: "Direct recruitment opportunities in private companies and public undertakings.",
    criteria: {
      minAge: 18,
      occupation: "unemployed",
      disabilityRequired: true
    },
    documents: ["Resume / Bio-data", "Disability ID Card", "Educational qualification certificates"]
  },
  {
    id: "tn-homeless-shelter",
    name: "Special Homes & Day Care Centers for Intellectually Disabled",
    category: "Welfare",
    disabilityType: "intellectual",
    ageGroup: "child",
    summary: "Institutional care, special education, and day care rehabilitation centers run by NGOs with state support.",
    easyRead: "Day care and residential homes offering therapy and skill development for intellectually disabled children.",
    benefit: "Free therapeutic care, special schooling, and nutrition.",
    criteria: {
      disabilityType: "intellectual",
      disabilityRequired: true
    },
    documents: ["Disability Certificate (Intellectual)", "Medical history records"]
  },
  {
    id: "tn-braille-books",
    name: "Free Braille Books and Learning Materials",
    category: "Education",
    disabilityType: "visual",
    ageGroup: "child",
    summary: "Free supply of Braille textbooks, tactile diagrams, and audio learning devices for school and college students.",
    easyRead: "Free Braille books and study materials for visually impaired students.",
    benefit: "Free academic textbooks in Braille and audio formats.",
    criteria: {
      disabilityType: "visual",
      studentRequired: true,
      disabilityRequired: true
    },
    documents: ["School / College ID", "Disability ID Card"]
  },
  {
    id: "tn-interpreter-support",
    name: "Sign Language Interpreter Assistance for Deaf Citizens",
    category: "Welfare",
    disabilityType: "hearing",
    ageGroup: "adult",
    summary: "Provision of certified Indian Sign Language (ISL) interpreters for official hearings, medical visits, and legal assistance.",
    easyRead: "Free sign language interpreter support for government offices, legal matters, and healthcare.",
    benefit: "Professional ISL interpreter services for official communication.",
    criteria: {
      disabilityType: "hearing",
      disabilityRequired: true
    },
    documents: ["Hearing Impairment / Deaf Certificate", "Request letter"]
  },
  {
    id: "tn-prosthetic-repair",
    name: "Prosthetic & Orthotic Appliance Repair Grant",
    category: "Assistive Technology",
    disabilityType: "locomotor",
    ageGroup: "senior",
    summary: "Financial assistance for the maintenance, repair, and battery replacement of motorized tricycles and artificial limbs.",
    easyRead: "Grant money to repair artificial limbs or motorized tricycles when they break down.",
    benefit: "Repair and maintenance financial grant.",
    criteria: {
      disabilityType: "locomotor",
      disabilityRequired: true
    },
    documents: ["Device maintenance estimate", "Disability ID Card"]
  },
  {
    id: "tn-unemployment-allowance",
    name: "Unemployment Allowance for Educated Youth with Disabilities",
    category: "Employment",
    disabilityType: "any",
    ageGroup: "youth",
    summary: "Monthly financial assistance paid through employment exchanges to registered educated job seekers with disabilities.",
    easyRead: "Monthly allowance for registered educated job seekers with disabilities while looking for employment.",
    benefit: "Monthly cash stipend for registered unemployed graduates/diploma holders.",
    criteria: {
      minAge: 18,
      maxAge: 45,
      occupation: "unemployed",
      disabilityRequired: true
    },
    documents: ["Employment exchange registration card", "Degree / Diploma certificate", "Disability ID Card"]
  },
  {
    id: "tn-petrol-subsidy",
    name: "Petrol Subsidy Grant for Scooter / Modified Vehicle Owners",
    category: "Transport",
    disabilityType: "locomotor",
    ageGroup: "adult",
    summary: "Monthly petrol allowance subsidy for orthopaedically challenged persons using modified scooters or motorized vehicles for work.",
    easyRead: "Monthly petrol allowance for working individuals using modified two-wheelers.",
    benefit: "Direct monthly petrol subsidy reimbursement.",
    criteria: {
      disabilityType: "locomotor",
      minAge: 18,
      occupation: "employed",
      disabilityRequired: true
    },
    documents: ["Driving license (Modified vehicle)", "Vehicle RC book", "Employment certificate"]
  },
  {
    id: "tn-legal-aid",
    name: "Free Legal Aid & Counseling for Differently Abled",
    category: "Welfare",
    disabilityType: "any",
    ageGroup: "senior",
    summary: "Free legal counseling and representation through State Legal Services Authority for disputes, discrimination, or property matters.",
    easyRead: "Free legal support and advocates for differently abled persons facing discrimination or disputes.",
    benefit: "Free legal representation and counseling.",
    criteria: {
      disabilityRequired: true
    },
    documents: ["Disability ID Card", "Case petition / grievance application"]
  },
  {
    id: "tn-conveyance-allowance",
    name: "Conveyance Allowance for Government Employees with Disabilities",
    category: "Employment",
    disabilityType: "any",
    ageGroup: "adult",
    summary: "Special monthly conveyance allowance provided to differently abled employees working in government and public sector undertakings.",
    easyRead: "Extra monthly travel allowance for government employees with disabilities.",
    benefit: "Enhanced monthly conveyance allowance added to salary.",
    criteria: {
      occupation: "employed",
      disabilityRequired: true
    },
    documents: ["Service ID card", "Medical board disability certificate"]
  },
  {
    id: "tn-early-intervention",
    name: "Early Intervention & Rehabilitation Centers for Infants",
    category: "Health",
    disabilityType: "any",
    ageGroup: "child",
    summary: "Early screening, physiotherapy, speech therapy, and corrective surgeries for infants and children aged 0 to 6 years.",
    easyRead: "Free early therapy and screening for young children with developmental delays or disabilities.",
    benefit: "Free physiotherapy, speech therapy, and pediatric medical support.",
    criteria: {
      maxAge: 6,
      disabilityRequired: true
    },
    documents: ["Birth certificate", "Medical evaluation report"]
  },
  {
    id: "tn-sheltered-workshop",
    name: "Sheltered Workshops & Production Units for Adults",
    category: "Employment",
    disabilityType: "any",
    ageGroup: "adult",
    summary: "Production centers offering dignified employment, skill training, and daily wages for adults with intellectual and severe disabilities.",
    easyRead: "Safe work environments offering daily wages and skill training for adults with disabilities.",
    benefit: "Daily wages and vocational production training.",
    criteria: {
      minAge: 18,
      disabilityRequired: true
    },
    documents: ["Disability ID Card", "Address proof"]
  },
  {
    id: "tn-housing-subsidy",
    name: "Special Housing Scheme & Plot Allotment Priority",
    category: "Welfare",
    disabilityType: "any",
    ageGroup: "adult",
    summary: "Priority reservation and financial subsidies for house construction and TNHB plot allotments for differently abled persons.",
    easyRead: "Priority and financial subsidies for housing plots and home construction.",
    benefit: "Housing subsidy grant and priority housing board allotment.",
    criteria: {
      minAge: 21,
      maxIncome: 200000,
      disabilityRequired: true
    },
    documents: ["Income certificate", "Disability ID Card", "Aadhaar / Address proof"]
  },
  {
    id: "tn-bus-priority-seating",
    name: "Reserved Seating & Accessible Bus Infrastructure Mandate",
    category: "Transport",
    disabilityType: "any",
    ageGroup: "senior",
    summary: "Mandatory reserved seating (front rows) and low-floor accessibility features across all state transport corporation buses.",
    easyRead: "Reserved front seats and accessible boarding support on all government buses.",
    benefit: "Guaranteed priority seating and boarding assistance on all public buses.",
    criteria: {
      disabilityRequired: true
    },
    documents: ["Disability Identity Card"]
  }
];

const I18N = {
  en: {
    skipToMain: "Skip to main content",
    brandSub: "TN SCHEME ACCESS",
    navHome: "Home",
    navBrowse: "Browse schemes",
    navEligibility: "Check eligibility",
    navApps: "My applications",
    navHelp: "Need help?",
    accessibilityBtn: "Accessibility",
    accessTitle: "Accessibility & Reading Preferences",
    accessDesc: "Saved automatically on this device. Press Alt+A anytime to open or close.",
    resetDefault: "Reset to default",
    textSizeLabel: "Text size",
    sizeStandard: "Standard",
    sizeLarge: "Large",
    sizeExtra: "Extra large",
    contrastLabel: "Contrast & Theme",
    contrastDefault: "Default",
    contrastLight: "Light",
    contrastDark: "Dark",
    contrastAAA: "High Contrast (AAA)",
    paletteLabel: "Colour-blind friendly palette",
    paletteNone: "Standard",
    typographyLabel: "Readable fonts & alignment",
    fontStandard: "Standard Font",
    fontDyslexic: "Atkinson / Dyslexia-Friendly",
    leftAlign: "Force Left-Align",
    lineSpacing: "Line spacing",
    letterSpacing: "Letter spacing",
    wordSpacing: "Word spacing",
    aidsLabel: "Reading aids & Motion",
    readingRuler: "Reading Ruler",
    highlightLinks: "Highlight Links",
    largeCursor: "Large Cursor",
    reduceMotion: "Reduce Motion",
    demoDisclaimer: "Prototype Notice: Scheme details are compiled for demonstration. Always confirm final eligibility, documents, and deadlines with the Tamil Nadu Department for the Welfare of Differently Abled Persons.",
    heroEyebrow: "TAMIL NADU DIFFERENTLY ABLED WELFARE",
    heroTitle1: "Your benefits.",
    heroTitle2: "Within reach.",
    heroSubtitle: "Discover Tamil Nadu government schemes for differently abled persons. Check which ones you qualify for in plain language, listen aloud, and generate a pre-filled draft application form.",
    ctaCheck: "Check my eligibility",
    ctaBrowse: "Browse all 25 schemes",
    trust1: "English & தமிழ் support with Read Aloud",
    trust2: "Easy-read summaries & plain eligibility reasons",
    trust3: "Instant draft application PDF & reference tracker",
    cardTag1: "SCHEME DIRECTORY",
    cardLabel1: "Tamil Nadu Welfare Schemes",
    cardTag2: "ACCESSIBILITY",
    cardLabel2: "WCAG 2.2 Contrast, Voice & Dyslexia Controls",
    cardTag3: "LAST-MILE READY",
    cardLabel3: "Pre-filled Drafts for CSC / e-Sevai",
    howEyebrow: "A CLEARER JOURNEY",
    howTitle: "How ENVISION '26 works",
    step1Title: "Share basic details",
    step1Desc: "Enter age, disability type, percentage, education, and income—no Aadhaar or sensitive numbers required.",
    step2Title: "Plain-word matching",
    step2Desc: "See exactly why you qualify for each scheme—or which single criterion is missing.",
    step3Title: "Easy-read & audio",
    step3Desc: "Read short summaries, compare up to 3 schemes side by side, or listen aloud in English or Tamil.",
    step4Title: "Draft & track",
    step4Desc: "Download a print-ready draft application form and save a reference code for your records.",
    browseEyebrow: "SCHEME DIRECTORY",
    browseTitle: "Explore Tamil Nadu Welfare Schemes",
    savedOnly: "Saved Schemes",
    searchLabel: "Search schemes",
    filterCat: "Category",
    filterDis: "Disability Type",
    filterAge: "Age Group",
    sortBy: "Sort by",
    clearFilters: "Clear all filters",
    compareSelected: "Compare Schemes:",
    compareNow: "Compare Side by Side",
    clearCompare: "Clear",
    eligEyebrow: "STEP 01 / YOUR PROFILE",
    eligTitle: "Check Your Scheme Eligibility",
    eligSubtitle: "Fill in the basic details below. We explain every match—and every near-match—in plain words. Do not enter sensitive personal IDs.",
    lblName: "Applicant Full Name",
    lblAge: "Age (in years)",
    lblDisability: "Disability Category",
    lblPercent: "Disability Percentage (%)",
    lblIncome: "Annual Family Income (₹)",
    lblCommunity: "Community Category",
    lblEducation: "Current Education / Qualification",
    lblOccupation: "Current Status",
    lblGender: "Gender",
    lblDistrict: "Tamil Nadu District",
    chkResident: "Applicant is a permanent resident of Tamil Nadu",
    chkFirstGrad: "No graduate in the applicant's family (First-generation graduate family)",
    btnRunMatch: "See Matching Schemes",
    resEyebrow: "STEP 02 / YOUR RESULTS",
    resTitle: "Your Eligibility Breakdown",
    readResultsAloud: "Read results aloud",
    editProfile: "Edit profile",
    tabMatched: "Likely Eligible",
    tabUnmatched: "Other Schemes & Missing Criteria",
    backBtn: "Back",
    printScheme: "Print this scheme",
    shareScheme: "Share",
    appsEyebrow: "LOCAL PROTOTYPE RECORDS",
    appsTitle: "My Draft Applications",
    appsSubtitle: "Saved locally in your browser so you can reference them at a CSC / e-Sevai centre or District Differently Abled Welfare Office.",
    helpEyebrow: "OFFICIAL GUIDANCE & SUPPORT",
    helpTitle: "Need Help Applying?",
    deptName: "Department for the Welfare of Differently Abled Persons, Government of Tamil Nadu",
    deptDesc: "For official scheme verification, UDID card registration, assistive device camps, and application submission, contact your local District Differently Abled Welfare Office (DDAWO) or visit a nearby TN e-Sevai / Common Service Centre (CSC).",
    helpOfficeLabel: "State Commissionerate:",
    helpOfficeVal: "Commissionerate for Welfare of the Differently Abled, No. 5, Kamarajar Salai, Lady Willingdon College Campus, Chennai – 600 005.",
    helpDistrictLabel: "District Level:",
    helpDistrictVal: "District Differently Abled Welfare Officer (DDAWO) located at every District Collectorate in Tamil Nadu.",
    helpPortalsLabel: "Official Portals:",
    helpNoPhone: "Note: Please verify current office timings and official helpline numbers directly via the Tamil Nadu Government directory before travelling.",
    compareModalTitle: "Side-by-Side Scheme Comparison",
    footerTag: "Accessible Scheme Discovery Prototype for Tamil Nadu",
    footerNote: "Confirm all scheme details with the relevant Tamil Nadu Government department."
  },
  ta: {
    skipToMain: "முதன்மை பகுதிக்குச் செல்லவும்",
    brandSub: "TN திட்டம் அணுகல்",
    navHome: "முகப்பு",
    navBrowse: "திட்டங்களை உலவு",
    navEligibility: "தகுதியைச் சரிபார்க்க",
    navApps: "எனது விண்ணப்பங்கள்",
    navHelp: "உதவி தேவையா?",
    accessibilityBtn: "அணுகல் விருப்பங்கள்",
    accessTitle: "அணுகல் மற்றும் வாசிப்பு விருப்பங்கள்",
    accessDesc: "இந்த சாதனத்தில் தானாகவே சேமிக்கப்படும். எப்போது வேண்டுமானாலும் திறக்க Alt+A அழுத்தவும்.",
    resetDefault: "இயல்புநிலைக்கு மீட்டமை",
    textSizeLabel: "எழுத்து அளவு",
    sizeStandard: "சாதாரண",
    sizeLarge: "பெரிய",
    sizeExtra: "மிகப்பெரிய",
    contrastLabel: "நிறமாலை மற்றும் தீம்",
    contrastDefault: "இயல்புநிலை",
    contrastLight: "வெளிர்",
    contrastDark: "இருள்",
    contrastAAA: "அதிக kontrast (AAA)",
    paletteLabel: "நிறக்குருட்டு நட்பு தட்டு",
    paletteNone: "இயல்புநிலை",
    typographyLabel: "எழுத்துரு மற்றும் சீரமைப்பு",
    fontStandard: "சாதாரண எழுத்துரு",
    fontDyslexic: "டிஸ்லெக்சியா நட்பு",
    leftAlign: "இடதுபுறம் சீரமை",
    lineSpacing: "வரி இடைவெளி",
    letterSpacing: "எழுத்து இடைவெளி",
    wordSpacing: "சொல் இடைவெளி",
    aidsLabel: "வாசிப்பு உதவிகள் & இயக்கம்",
    readingRuler: "வாசிப்பு கோடு",
    highlightLinks: "இணைப்புகளை হাইলাইট செய்",
    largeCursor: "பெரிய கர்சர்",
    reduceMotion: "இயக்கத்தை குறை",
    demoDisclaimer: "முன்மாதிரி அறிவிப்பு: திட்ட விவரங்கள் சோதனைக்காக மட்டுமே. இறுதி தகுதி மற்றும் ஆவணங்களை தமிழ்நாடு மாற்றுத்திறனாளிகள் நலத்துறை அலுவலகத்தில் உறுதிப்படுத்தவும்.",
    heroEyebrow: "தமிழ்நாடு மாற்றுத்திறனாளிகள் நலத்துறை",
    heroTitle1: "உங்கள் உரிமைகள்.",
    heroTitle2: "உங்கள் கைகளில்.",
    heroSubtitle: "மாற்றுத்திறனாளிகளுக்கான தமிழ்நாடு அரசு திட்டங்களை எளிதில் கண்டறியுங்கள். எளிய தமிழில் தகுதியைச் சரிபார்த்து, விண்ணப்ப நகலை தயார் செய்யுங்கள்.",
    ctaCheck: "எனது தகுதியை சரிபார்",
    ctaBrowse: "அனைத்து 25 திட்டங்களையும் காண்க",
    trust1: "ஆங்கிலம் & தமிழ் ஆதரவுடன் குரல் வாசிப்பு",
    trust2: "எளிய வாசிப்பு சுருக்கங்கள் & தகுதி காரணங்கள்",
    trust3: "உடனடி விண்ணப்ப வரைவு PDF & குறிப்பு கண்காணிப்பு",
    cardTag1: "திட்ட அடைவு",
    cardLabel1: "தமிழ்நாடு நலத்திட்டங்கள்",
    cardTag2: "அணுகல்",
    cardLabel2: "WCAG 2.2 AAA கான்ட்ராஸ்ட் & குரல் கட்டுப்பாடுகள்",
    cardTag3: "கடைசி மைல்",
    cardLabel3: "CSC / e-Sevai க்கான முன் நிரப்பப்பட்ட வரைவு",
    howEyebrow: "எளிய பயணம்",
    howTitle: "ENVISION '26 எவ்வாறு செயல்படுகிறது",
    step1Title: "அடிப்படை விவரங்களை பகிரவும்",
    step1Desc: "வயது, இயலாமை வகை, வருமானம் ஆகியவற்றை உள்ளிடவும் - ஆதார் தேவையில்லை.",
    step2Title: "எளிய மொழி பொருத்தம்",
    step2Desc: "நீங்கள் எந்த திட்டத்திற்கு தகுதியுடையவர் என்பதை தெளிவாக காண்க.",
    step3Title: "எளிய வாசிப்பு & ஆடியோ",
    step3Desc: "சுருக்கங்களை வாசிக்கவும் அல்லது ஆங்கிலம்/தமிழில் கேட்கவும்.",
    step4Title: "வரைவு & கண்காணிப்பு",
    step4Desc: "அச்சிடக்கூடிய வரைவு விண்ணப்ப படிவத்தைப் பதிவிறக்கவும்.",
    browseEyebrow: "திட்ட அடைவு",
    browseTitle: "தமிழ்நாடு நலத்திட்டங்களை ஆராயுங்கள்",
    savedOnly: "சேமிக்கப்பட்ட திட்டங்கள்",
    searchLabel: "திட்டங்களை தேடுங்கள்",
    filterCat: "வகை",
    filterDis: "இயலாமை வகை",
    filterAge: "வயது குழு",
    sortBy: "வரிசைப்படுத்து",
    clearFilters: "வடிகட்டிகளை அகற்று",
    compareSelected: "திட்டங்களை ஒப்பிடு:",
    compareNow: "பக்கத்து பக்கமாக ஒப்பிடு",
    clearCompare: "அகற்று",
    eligEyebrow: "படி 01 / உங்கள் விவரங்கள்",
    eligTitle: "உங்கள் திட்ட தகுதியை சரிபார்க்கவும்",
    eligSubtitle: "கீழே உள்ள அடிப்படை விவரங்களை உள்ளிடவும். உணர்திறன் மிக்க எண்களை உள்ளிட வேண்டாம்.",
    lblName: "விண்ணப்பதாரர் முழு பெயர்",
    lblAge: "வயது",
    lblDisability: "இயலாமை வகை",
    lblPercent: "இயலாமை சதவீதம் (%)",
    lblIncome: "ஆண்டு குடும்ப வருமானம் (₹)",
    lblCommunity: "சமூக பிரிவு",
    lblEducation: "தற்போதைய கல்வி",
    lblOccupation: "தற்போதைய நிலை",
    lblGender: "பாலினம்",
    lblDistrict: "தமிழ்நாடு மாவட்டம்",
    chkResident: "விண்ணப்பதாரர் தமிழ்நாட்டின் நிரந்தர வசிப்பவர்",
    chkFirstGrad: "குடும்பத்தில் பட்டதாரி இல்லை (முதல் தலைமுறை பட்டதாரி)",
    btnRunMatch: "பொருத்தமான திட்டங்களைக் காண்க",
    resEyebrow: "படி 02 / உங்கள் முடிவுகள்",
    resTitle: "உங்கள் தகுதி விவரம்",
    readResultsAloud: "முடிவுகளை குரலில் வாசி",
    editProfile: "விவரங்களை மாற்று",
    tabMatched: "தகுதியுடையவை",
    tabUnmatched: "மற்ற திட்டங்கள் & விடுபட்ட நிபந்தனைகள்",
    backBtn: "பின்செல்",
    printScheme: "இத்திட்டத்தை அச்சிடு",
    shareScheme: "பகிர்",
    appsEyebrow: "உள்ளூர் முன்மாதிரி பதிவுகள்",
    appsTitle: "எனது வரைவு விண்ணப்பங்கள்",
    appsSubtitle: "CSC / இ-சேவை மையத்தில் சமர்ப்பிக்க உங்கள் உலாவியில் சேமிக்கப்பட்டவை.",
    helpEyebrow: "அதிகாரப்பூர்வ வழிகாட்டுதல்",
    helpTitle: "உதவி தேவையா?",
    deptName: "மாற்றுத்திறனாளிகள் நலத்துறை, தமிழ்நாடு அரசு",
    deptDesc: "அதிகாரப்பூர்வ சரிபார்ப்பு மற்றும் UDID பதிவு செய்ய உங்கள் மாவட்ட மாற்றுத்திறனாளிகள் நல அலுவலரை (DDAWO) அணுகவும்.",
    helpOfficeLabel: "மாநில ஆணையரகம்:",
    helpOfficeVal: "மாற்றுத்திறனாளிகள் நல ஆணையரகம், எண் 5, காமராஜர் சாலை, சென்னை – 600 005.",
    helpDistrictLabel: "மாவட்ட மட்டம்:",
    helpDistrictVal: "ஒவ்வொரு மாவட்ட ஆட்சியரகத்திலும் உள்ள மாற்றுத்திறனாளிகள் நல அலுவலர் (DDAWO).",
    helpPortalsLabel: "அதிகாரப்பூர்வ வலைத்தளங்கள்:",
    helpNoPhone: "குறிப்பு: பயணம் செய்வதற்கு முன் அலுவலக நேரங்களை உறுதிப்படுத்தவும்.",
    compareModalTitle: "பக்கத்து பக்கமாக திட்ட ஒப்பீடு",
    footerTag: "தமிழ்நாட்டிற்கான அணுகக்கூடிய திட்ட கண்டுபிடிப்பு முன்மாதிரி",
    footerNote: "அதிகாரப்பூர்வ துறையுடன் அனைத்து விவரங்களையும் உறுதிப்படுத்தவும்."
  }
};

let currentLang = "en";
let activeBookmarks = JSON.parse(localStorage.getItem("envision-bookmarks") || "[]");
let savedApplications = JSON.parse(localStorage.getItem("envision-applications") || "[]");
let comparedSchemes = [];
let currentFilteredSchemes = [...SCHEMES];
let lastProfile = null;
let currentSynthUtterance = null;

document.addEventListener("DOMContentLoaded", () => {
  initAccessibilityPanel();
  initRouter();
  initFilters();
  initEligibilityForm();
  initVoiceSearch();
  updateBookmarksBadge();
  renderSchemes(SCHEMES);
  loadApplicationsList();
});

/* --- ACCESSIBILITY PANEL & PREFERENCES --- */
function initAccessibilityPanel() {
  const panel = document.getElementById("accessibility-panel");
  const toggleBtn = document.getElementById("access-toggle");
  const closeBtn = document.getElementById("close-access-btn");
  const resetBtn = document.getElementById("reset-access-btn");

  const savedScale = localStorage.getItem("envision-scale") || "100";
  const savedContrast = localStorage.getItem("envision-contrast") || "default";
  const savedPalette = localStorage.getItem("envision-palette") || "none";
  const savedFont = localStorage.getItem("envision-font") || "standard";
  const savedAlign = localStorage.getItem("envision-align") || "normal";
  const savedRuler = localStorage.getItem("envision-ruler") === "true";
  const savedLinks = localStorage.getItem("envision-links") === "true";
  const savedCursor = localStorage.getItem("envision-cursor") === "true";
  const savedMotion = localStorage.getItem("envision-motion") === "true";
  const savedLineSpace = localStorage.getItem("envision-linespace") || "1.6";
  const savedLetterSpace = localStorage.getItem("envision-letterspace") || "0";
  const savedWordSpace = localStorage.getItem("envision-wordspace") || "0";

  applyTextScale(savedScale);
  applyContrast(savedContrast);
  applyPalette(savedPalette);
  applyFont(savedFont);
  applyAlign(savedAlign);
  toggleReadingRuler(savedRuler);
  toggleLinkHighlight(savedLinks);
  toggleLargeCursor(savedCursor);
  toggleReduceMotion(savedMotion);
  applySpacing(savedLineSpace, savedLetterSpace, savedWordSpace);

  toggleBtn.addEventListener("click", () => {
    const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
    toggleBtn.setAttribute("aria-expanded", !expanded);
    panel.hidden = expanded;
    if (!expanded) panel.focus();
  });

  closeBtn.addEventListener("click", () => {
    toggleBtn.setAttribute("aria-expanded", "false");
    panel.hidden = true;
    toggleBtn.focus();
  });

  window.addEventListener("keydown", (e) => {
    if (e.altKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      toggleBtn.click();
    }
  });

  resetBtn.addEventListener("click", () => {
    localStorage.clear();
    location.reload();
  });

  const slider = document.getElementById("text-scale-slider");
  slider.value = savedScale;
  document.getElementById("text-scale-val").textContent = savedScale + "%";
  slider.addEventListener("input", (e) => {
    applyTextScale(e.target.value);
  });

  document.querySelectorAll("[data-scale]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyTextScale(btn.getAttribute("data-scale"));
    });
  });

  document.querySelectorAll("[data-contrast-opt]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyContrast(btn.getAttribute("data-contrast-opt"));
    });
  });

  document.querySelectorAll("[data-palette-opt]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyPalette(btn.getAttribute("data-palette-opt"));
    });
  });

  document.querySelectorAll("[data-font-opt]").forEach(btn => {
    btn.addEventListener("click", () => {
      applyFont(btn.getAttribute("data-font-opt"));
    });
  });

  document.getElementById("toggle-left-align").addEventListener("click", function() {
    const isLeft = this.getAttribute("aria-pressed") === "true";
    applyAlign(isLeft ? "normal" : "left");
  });

  document.getElementById("line-space-slider").addEventListener("input", (e) => {
    document.getElementById("line-space-val").textContent = e.target.value;
    applySpacing(e.target.value, null, null);
  });
  document.getElementById("letter-space-slider").addEventListener("input", (e) => {
    document.getElementById("letter-space-val").textContent = e.target.value + "px";
    applySpacing(null, e.target.value, null);
  });
  document.getElementById("word-space-slider").addEventListener("input", (e) => {
    document.getElementById("word-space-val").textContent = e.target.value + "px";
    applySpacing(null, null, e.target.value);
  });

  document.getElementById("toggle-ruler").addEventListener("click", function() {
    const active = this.getAttribute("aria-pressed") === "true";
    toggleReadingRuler(!active);
  });
  document.getElementById("toggle-links").addEventListener("click", function() {
    const active = this.getAttribute("aria-pressed") === "true";
    toggleLinkHighlight(!active);
  });
  document.getElementById("toggle-cursor").addEventListener("click", function() {
    const active = this.getAttribute("aria-pressed") === "true";
    toggleLargeCursor(!active);
  });
  document.getElementById("toggle-motion").addEventListener("click", function() {
    const active = this.getAttribute("aria-pressed") === "true";
    toggleReduceMotion(!active);
  });

  window.addEventListener("mousemove", (e) => {
    const ruler = document.getElementById("reading-ruler");
    if (ruler.classList.contains("active")) {
      ruler.style.top = e.clientY + "px";
    }
  });

  document.getElementById("lang-toggle").addEventListener("click", toggleLanguage);
  document.getElementById("theme-quick-toggle").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-contrast");
    applyContrast(current === "dark" ? "default" : "dark");
  });
}

function applyTextScale(scale) {
  document.documentElement.style.setProperty("--font-scale", scale / 100);
  document.getElementById("text-scale-val").textContent = scale + "%";
  document.getElementById("text-scale-slider").value = scale;
  localStorage.setItem("envision-scale", scale);
  document.querySelectorAll("[data-scale]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-scale") === scale);
  });
}

function applyContrast(opt) {
  document.documentElement.setAttribute("data-contrast", opt);
  localStorage.setItem("envision-contrast", opt);
  document.querySelectorAll("[data-contrast-opt]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-contrast-opt") === opt);
  });
  const isDark = opt === "dark" || opt === "aaa";
  document.getElementById("theme-icon").textContent = isDark ? "☀" : "☾";
}

function applyPalette(palette) {
  document.documentElement.setAttribute("data-palette", palette);
  localStorage.setItem("envision-palette", palette);
  document.querySelectorAll("[data-palette-opt]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-palette-opt") === palette);
  });
}

function applyFont(font) {
  document.documentElement.setAttribute("data-font", font);
  localStorage.setItem("envision-font", font);
  document.querySelectorAll("[data-font-opt]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-font-opt") === font);
  });
}

function applyAlign(align) {
  document.documentElement.setAttribute("data-align", align);
  localStorage.setItem("envision-align", align);
  const btn = document.getElementById("toggle-left-align");
  btn.setAttribute("aria-pressed", align === "left");
  btn.classList.toggle("active", align === "left");
}

function applySpacing(line, letter, word) {
  const root = document.documentElement;
  if (line !== null) {
    root.style.setProperty("--line-height-base", line);
    localStorage.setItem("envision-linespace", line);
  }
  if (letter !== null) {
    root.style.setProperty("--letter-spacing-base", letter + "px");
    localStorage.setItem("envision-letterspace", letter);
  }
  if (word !== null) {
    root.style.setProperty("--word-spacing-base", word + "px");
    localStorage.setItem("envision-wordspace", word);
  }
}

function toggleReadingRuler(active) {
  const ruler = document.getElementById("reading-ruler");
  ruler.classList.toggle("active", active);
  const btn = document.getElementById("toggle-ruler");
  btn.setAttribute("aria-pressed", active);
  btn.classList.toggle("active", active);
  localStorage.setItem("envision-ruler", active);
}

function toggleLinkHighlight(active) {
  document.documentElement.setAttribute("data-links", active ? "highlight" : "normal");
  const btn = document.getElementById("toggle-links");
  btn.setAttribute("aria-pressed", active);
  btn.classList.toggle("active", active);
  localStorage.setItem("envision-links", active);
}

function toggleLargeCursor(active) {
  document.documentElement.setAttribute("data-cursor", active ? "large" : "normal");
  const btn = document.getElementById("toggle-cursor");
  btn.setAttribute("aria-pressed", active);
  btn.classList.toggle("active", active);
  localStorage.setItem("envision-cursor", active);
}

function toggleReduceMotion(active) {
  document.documentElement.setAttribute("data-motion", active ? "reduce" : "normal");
  const btn = document.getElementById("toggle-motion");
  btn.setAttribute("aria-pressed", active);
  btn.classList.toggle("active", active);
  localStorage.setItem("envision-motion", active);
}

/* --- BILINGUAL I18N --- */
function toggleLanguage() {
  currentLang = currentLang === "en" ? "ta" : "en";
  document.getElementById("lang-label").textContent = currentLang === "en" ? "தமிழ்" : "English";
  document.documentElement.setAttribute("lang", currentLang);
  if (currentLang === "ta") {
    document.documentElement.style.setProperty("--font-family-base", "'Noto Sans Tamil', Inter, sans-serif");
  } else {
    const fontOpt = document.documentElement.getAttribute("data-font");
    document.documentElement.style.setProperty("--font-family-base", fontOpt === "dyslexic" ? "'Atkinson Hyperlegible', sans-serif" : "'Inter', sans-serif");
  }
  updateStaticTexts();
  renderSchemes(currentFilteredSchemes);
}

function updateStaticTexts() {
  const dict = I18N[currentLang];
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}

/* --- ROUTER & VIEW MANAGEMENT --- */
function initRouter() {
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const targetView = btn.getAttribute("data-nav");
      switchView(targetView);
    });
  });
}

function switchView(viewName) {
  document.querySelectorAll(".view").forEach(v => {
    v.classList.remove("active");
    v.hidden = true;
  });
  const target = document.getElementById("view-" + viewName);
  if (target) {
    target.classList.add("active");
    target.hidden = false;
    target.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  document.querySelectorAll(".nav-btn").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-nav") === viewName);
  });
}

/* --- SCHEMES DIRECTORY & FILTERING --- */
function initFilters() {
  const catSelect = document.getElementById("filter-category");
  const categories = [...new Set(SCHEMES.map(s => s.category))];
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  });

  document.getElementById("scheme-search").addEventListener("input", applyFilters);
  document.getElementById("filter-category").addEventListener("change", applyFilters);
  document.getElementById("filter-disability").addEventListener("change", applyFilters);
  document.getElementById("filter-age").addEventListener("change", applyFilters);
  document.getElementById("sort-schemes").addEventListener("change", applyFilters);
  document.getElementById("clear-filters-btn").addEventListener("click", clearFilters);
  document.getElementById("bookmark-filter-btn").addEventListener("click", toggleBookmarkFilter);
  document.getElementById("open-compare-modal").addEventListener("click", openCompareModal);
  document.getElementById("close-compare-modal").addEventListener("click", closeCompareModal);
  document.getElementById("clear-compare-btn").addEventListener("click", clearCompare);
}

function applyFilters() {
  const query = document.getElementById("scheme-search").value.toLowerCase();
  const cat = document.getElementById("filter-category").value;
  const dis = document.getElementById("filter-disability").value;
  const age = document.getElementById("filter-age").value;
  const sort = document.getElementById("sort-schemes").value;
  const showSavedOnly = document.getElementById("bookmark-filter-btn").getAttribute("aria-pressed") === "true";

  let filtered = SCHEMES.filter(s => {
    const matchQuery = !query || s.name.toLowerCase().includes(query) || s.summary.toLowerCase().includes(query) || s.benefit.toLowerCase().includes(query);
    const matchCat = cat === "all" || s.category === cat;
    const matchDis = dis === "all" || s.disabilityType === dis || s.disabilityType === "any" || (Array.isArray(s.disabilityType) && s.disabilityType.includes(dis));
    const matchAge = age === "all" || s.ageGroup === age || s.ageGroup === "senior";
    const matchSaved = !showSavedOnly || activeBookmarks.includes(s.id);
    return matchQuery && matchCat && matchDis && matchAge && matchSaved;
  });

  if (sort === "az") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "category") {
    filtered.sort((a, b) => a.category.localeCompare(b.category));
  }

  currentFilteredSchemes = filtered;
  renderSchemes(filtered);
}

function clearFilters() {
  document.getElementById("scheme-search").value = "";
  document.getElementById("filter-category").value = "all";
  document.getElementById("filter-disability").value = "all";
  document.getElementById("filter-age").value = "all";
  document.getElementById("sort-schemes").value = "featured";
  document.getElementById("bookmark-filter-btn").setAttribute("aria-pressed", "false");
  document.getElementById("bookmark-filter-btn").classList.remove("active");
  applyFilters();
}

function toggleBookmarkFilter() {
  const btn = document.getElementById("bookmark-filter-btn");
  const active = btn.getAttribute("aria-pressed") === "true";
  btn.setAttribute("aria-pressed", !active);
  btn.classList.toggle("active", !active);
  applyFilters();
}

function renderSchemes(list) {
  const grid = document.getElementById("schemes-grid");
  grid.innerHTML = "";
  document.getElementById("results-counter").textContent = `Showing ${list.length} schemes`;

  if (list.length === 0) {
    grid.innerHTML = `<div class="card" style="grid-column: 1/-1; text-align: center; padding: 40px;"><h3>No schemes found matching your filter criteria.</h3></div>`;
    return;
  }

  list.forEach(s => {
    const isSaved = activeBookmarks.includes(s.id);
    const isCompared = comparedSchemes.includes(s.id);

    const card = document.createElement("article");
    card.className = "scheme-card";
    card.innerHTML = `
      <div>
        <div class="scheme-card-top">
          <span class="cat-badge">${s.category}</span>
          <button type="button" class="btn btn-ghost btn-sm bookmark-btn" data-id="${s.id}" aria-label="Bookmark scheme">
            ${isSaved ? "★ Saved" : "☆ Save"}
          </button>
        </div>
        <h3>${s.name}</h3>
        <div class="easy-read-box"><strong>Easy-Read:</strong> ${s.easyRead}</div>
        <p style="margin: 10px 0; font-size: 0.95rem; color: var(--text-secondary);">${s.summary}</p>
        <div class="scheme-benefit-pill">🎁 ${s.benefit}</div>
      </div>
      <div class="scheme-card-actions">
        <button type="button" class="btn btn-primary btn-sm view-detail-btn" data-id="${s.id}">View Details &rarr;</button>
        <button type="button" class="btn btn-outline btn-sm compare-toggle-btn" data-id="${s.id}" aria-pressed="${isCompared}">
          ${isCompared ? "✓ Comparing" : "+ Compare"}
        </button>
        <button type="button" class="btn btn-outline btn-sm tts-read-btn" data-id="${s.id}" aria-label="Read scheme aloud">🔊 Listen</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll(".view-detail-btn").forEach(btn => {
    btn.addEventListener("click", () => openSchemeDetail(btn.getAttribute("data-id")));
  });
  grid.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleBookmark(btn.getAttribute("data-id")));
  });
  grid.querySelectorAll(".compare-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => toggleCompare(btn.getAttribute("data-id")));
  });
  grid.querySelectorAll(".tts-read-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const scheme = SCHEMES.find(x => x.id === btn.getAttribute("data-id"));
      if (scheme) speakText(`${scheme.name}. ${scheme.summary}. Benefit: ${scheme.benefit}`);
    });
  });
}

function toggleBookmark(id) {
  if (activeBookmarks.includes(id)) {
    activeBookmarks = activeBookmarks.filter(x => x !== id);
  } else {
    activeBookmarks.push(id);
  }
  localStorage.setItem("envision-bookmarks", JSON.stringify(activeBookmarks));
  document.getElementById("saved-count").textContent = activeBookmarks.length;
  renderSchemes(currentFilteredSchemes);
}

function updateBookmarksBadge() {
  document.getElementById("saved-count").textContent = activeBookmarks.length;
}

/* --- SIDE BY SIDE COMPARISON --- */
function toggleCompare(id) {
  if (comparedSchemes.includes(id)) {
    comparedSchemes = comparedSchemes.filter(x => x !== id);
  } else {
    if (comparedSchemes.length >= 3) {
      alert("You can compare up to 3 schemes side by side.");
      return;
    }
    comparedSchemes.push(id);
  }
  updateCompareBar();
  renderSchemes(currentFilteredSchemes);
}

function updateCompareBar() {
  const bar = document.getElementById("compare-bar");
  const namesSpan = document.getElementById("compare-list-names");
  if (comparedSchemes.length > 0) {
    bar.hidden = false;
    const names = comparedSchemes.map(id => SCHEMES.find(s => s.id === id)?.name).filter(Boolean);
    namesSpan.textContent = names.join(" | ");
  } else {
    bar.hidden = true;
  }
}

function clearCompare() {
  comparedSchemes = [];
  updateCompareBar();
  renderSchemes(currentFilteredSchemes);
}

function openCompareModal() {
  if (comparedSchemes.length === 0) return;
  const modal = document.getElementById("compare-modal");
  const wrap = document.getElementById("compare-table-wrap");

  const schemesToCompare = comparedSchemes.map(id => SCHEMES.find(s => s.id === id)).filter(Boolean);

  let html = `<table><thead><tr><th>Feature</th>`;
  schemesToCompare.forEach(s => html += `<th>${s.name}</th>`);
  html += `</tr></thead><tbody>`;

  html += `<tr><td><strong>Category</strong></td>`;
  schemesToCompare.forEach(s => html += `<td>${s.category}</td>`);
  html += `</tr>`;

  html += `<tr><td><strong>Easy-Read Summary</strong></td>`;
  schemesToCompare.forEach(s => html += `<td>${s.easyRead}</td>`);
  html += `</tr>`;

  html += `<tr><td><strong>Benefit</strong></td>`;
  schemesToCompare.forEach(s => html += `<td>${s.benefit}</td>`);
  html += `</tr>`;

  html += `<tr><td><strong>Required Documents</strong></td>`;
  schemesToCompare.forEach(s => html += `<td><ul>${s.documents.map(d => `<li>${d}</li>`).join("")}</ul></td>`);
  html += `</tr>`;

  html += `</tbody></table>`;
  wrap.innerHTML = html;
  modal.hidden = false;
}

function closeCompareModal() {
  document.getElementById("compare-modal").hidden = true;
}

/* --- ELIGIBILITY ENGINE & PLAIN WORDS REASONS --- */
function initEligibilityForm() {
  const form = document.getElementById("eligibility-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    runEligibilityMatching();
  });
}

function runEligibilityMatching() {
  const name = document.getElementById("inp-name").value.trim();
  if (!name) {
    showFormError("Please enter the applicant's full name.");
    return;
  }
  hideFormError();

  const profile = {
    name,
    age: Number(document.getElementById("inp-age").value),
    disabilityCategory: document.getElementById("inp-disability").value,
    disabilityPercent: Number(document.getElementById("inp-percent").value),
    income: Number(document.getElementById("inp-income").value),
    community: document.getElementById("inp-community").value,
    education: document.getElementById("inp-education").value,
    occupation: document.getElementById("inp-occupation").value,
    gender: document.getElementById("inp-gender").value,
    district: document.getElementById("inp-district").value,
    isResident: document.getElementById("chk-tn-resident").checked,
    isFirstGrad: document.getElementById("chk-first-grad").checked
  };

  lastProfile = profile;
  const { matched, unmatched } = evaluateSchemes(profile);

  document.getElementById("count-matched").textContent = matched.length;
  document.getElementById("count-unmatched").textContent = unmatched.length;
  document.getElementById("res-profile-summary").textContent = `Profile: ${profile.name}, Age ${profile.age}, ${profile.disabilityCategory} (${profile.disabilityPercent}%), Family Income ₹${profile.income.toLocaleString("en-IN")}, District: ${profile.district}`;

  renderResultsList("matched-results-list", matched, true, profile);
  renderResultsList("unmatched-results-list", unmatched, false, profile);

  switchView("results");
}

function evaluateSchemes(p) {
  const matched = [];
  const unmatched = [];

  SCHEMES.forEach(s => {
    const reasons = [];
    let isEligible = true;

    if (!p.isResident) {
      isEligible = false;
      reasons.push("Applicant must be a permanent resident of Tamil Nadu.");
    } else {
      reasons.push("✓ Permanent resident of Tamil Nadu.");
    }

    if (s.criteria.disabilityRequired) {
      if (p.disabilityPercent < 40) {
        isEligible = false;
        reasons.push(`✗ Disability percentage is ${p.disabilityPercent}%. Benchmark requires at least 40%.`);
      } else {
        reasons.push(`✓ Benchmark disability percentage (${p.disabilityPercent}%) met.`);
      }

      if (s.criteria.disabilityType) {
        const types = Array.isArray(s.criteria.disabilityType) ? s.criteria.disabilityType : [s.criteria.disabilityType];
        if (!types.includes("any") && !types.includes(p.disabilityCategory)) {
          isEligible = false;
          reasons.push(`✗ Scheme requires disability type: ${types.join(", ")} (applicant has ${p.disabilityCategory}).`);
        } else {
          reasons.push(`✓ Disability category matches scheme requirement.`);
        }
      }
    }

    if (s.criteria.maxIncome !== undefined) {
      if (p.income > s.criteria.maxIncome) {
        isEligible = false;
        reasons.push(`✗ Family income of ₹${p.income.toLocaleString("en-IN")} exceeds maximum limit of ₹${s.criteria.maxIncome.toLocaleString("en-IN")}.`);
      } else {
        reasons.push(`✓ Family income within permissible limit (≤ ₹${s.criteria.maxIncome.toLocaleString("en-IN")}).`);
      }
    }

    if (s.criteria.minAge !== undefined && p.age < s.criteria.minAge) {
      isEligible = false;
      reasons.push(`✗ Age ${p.age} is below minimum requirement of ${s.criteria.minAge} years.`);
    }
    if (s.criteria.maxAge !== undefined && p.age > s.criteria.maxAge) {
      isEligible = false;
      reasons.push(`✗ Age ${p.age} exceeds maximum limit of ${s.criteria.maxAge} years.`);
    }

    if (s.criteria.community && !s.criteria.community.includes(p.community)) {
      isEligible = false;
      reasons.push(`✗ Community category does not match scheme restriction.`);
    }
    if (s.criteria.education && !s.criteria.education.includes(p.education)) {
      isEligible = false;
      reasons.push(`✗ Educational qualification requirement not met for this scheme.`);
    }
    if (s.criteria.firstGenGraduate && !p.isFirstGrad) {
      isEligible = false;
      reasons.push(`✗ Scheme requires no graduate in family (first-generation graduate family).`);
    }

    if (isEligible) {
      matched.push({ scheme: s, reasons });
    } else {
      unmatched.push({ scheme: s, reasons });
    }
  });

  return { matched, unmatched };
}

function renderResultsList(containerId, list, isMatch, profile) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<div class="card"><p>No schemes in this category for the current profile.</p></div>`;
    return;
  }

  list.forEach(item => {
    const s = item.scheme;
    const div = document.createElement("article");
    div.className = `result-item ${isMatch ? "matched" : "unmatched"}`;
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
        <div>
          <span class="cat-badge">${s.category}</span>
          <h3 style="margin: 6px 0 2px;">${s.name}</h3>
        </div>
        <span class="status-pill ${isMatch ? "match" : "miss"}">
          ${isMatch ? "✓ Likely Eligible" : "ℹ Missing Criteria"}
        </span>
      </div>
      <p><strong>Benefit:</strong> ${s.benefit}</p>
      <div class="easy-read-box" style="margin: 10px 0;"><strong>Easy-Read:</strong> ${s.easyRead}</div>
      <p><strong>Why this result:</strong></p>
      <ul class="reason-list">
        ${item.reasons.map(r => `<li>${r}</li>`).join("")}
      </ul>
      <div style="margin-top: 14px; display: flex; gap: 10px;">
        <button type="button" class="btn btn-primary btn-sm view-detail-btn" data-id="${s.id}">View Details &amp; Draft PDF &rarr;</button>
      </div>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".view-detail-btn").forEach(btn => {
    btn.addEventListener("click", () => openSchemeDetail(btn.getAttribute("data-id")));
  });
}

function showFormError(msg) {
  const err = document.getElementById("form-error-msg");
  err.textContent = msg;
  err.hidden = false;
  err.scrollIntoView({ behavior: "smooth" });
}

function hideFormError() {
  document.getElementById("form-error-msg").hidden = true;
}

/* --- SCHEME DETAIL & DRAFT PDF GENERATION --- */
function openSchemeDetail(id) {
  const scheme = SCHEMES.find(s => s.id === id);
  if (!scheme) return;

  const card = document.getElementById("scheme-detail-card");
  const profileName = lastProfile ? lastProfile.name : "Kavitha / Arjun";
  const profileAge = lastProfile ? lastProfile.age : "22";
  const profileIncome = lastProfile ? lastProfile.income : "72,000";

  card.innerHTML = `
    <span class="cat-badge">${scheme.category}</span>
    <h1 style="margin: 10px 0;">${scheme.name}</h1>
    <p class="lead">${scheme.summary}</p>
    
    <div class="easy-read-box" style="margin: 20px 0;">
      <h3 style="margin-top: 0;">Easy-Read Summary</h3>
      <p style="margin-bottom: 0;">${scheme.easyRead}</p>
    </div>

    <div class="detail-section">
      <h3>Benefit Details</h3>
      <p><strong>${scheme.benefit}</strong></p>
    </div>

    <div class="detail-section">
      <h3>Required Documents to Check</h3>
      <ul>
        ${scheme.documents.map(d => `<li>${d}</li>`).join("")}
      </ul>
    </div>

    <div class="detail-section">
      <h3>Step-by-Step How to Apply</h3>
      <ol style="padding-left: 20px; line-height: 1.7;">
        <li>Verify your eligibility using the ENVISION check tool and confirm your UDID / Disability Identity card is up to date.</li>
        <li>Gather the required original documents listed above.</li>
        <li>Visit your nearest <strong>TN e-Sevai Centre</strong> or <strong>Common Service Centre (CSC)</strong>, or approach the District Differently Abled Welfare Officer (DDAWO) at the District Collectorate.</li>
        <li>Submit the pre-filled draft form and reference code.</li>
      </ol>
      <div class="alert alert-info" style="margin-top: 14px;">
        <span>ℹ️</span>
        <span>Note: If specific department guidelines or office addresses are updated, confirm directly with the Department for the Welfare of Differently Abled Persons.</span>
      </div>
    </div>

    <div class="card" style="background: var(--bg-subtle); margin-top: 24px;">
      <h3 style="margin-top: 0;">Pre-Filled Draft Application Preview</h3>
      <p style="font-size: 0.9rem; color: var(--text-secondary);">This draft is generated instantly on your device for demonstration and offline printing.</p>
      <div style="background: var(--bg-surface); border: 1px dashed var(--border-color); padding: 16px; border-radius: 8px; margin: 12px 0;">
        <p><strong>Applicant Name:</strong> ${profileName}</p>
        <p><strong>Age:</strong> ${profileAge} &bull; <strong>Annual Income:</strong> ₹${profileIncome}</p>
        <p><strong>Scheme:</strong> ${scheme.name}</p>
        <p style="color: #dc2626; font-size: 0.85rem; font-weight: 700; margin-bottom: 0;">DEMO ONLY — NOT AN OFFICIAL GOVERNMENT SUBMISSION</p>
      </div>
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px;">
        <button type="button" id="generate-pdf-btn" class="btn btn-primary" data-id="${scheme.id}">
          🖨️ Download / Print Draft PDF Form
        </button>
      </div>
    </div>
  `;

  const bookmarkBtn = document.getElementById("detail-bookmark-btn");
  const isSaved = activeBookmarks.includes(scheme.id);
  bookmarkBtn.textContent = isSaved ? "★ Saved" : "☆ Save";
  bookmarkBtn.onclick = () => {
    toggleBookmark(scheme.id);
    bookmarkBtn.textContent = activeBookmarks.includes(scheme.id) ? "★ Saved" : "☆ Save";
  };

  document.getElementById("detail-print-btn").onclick = () => window.print();
  document.getElementById("detail-share-btn").onclick = () => {
    if (navigator.share) {
      navigator.share({ title: scheme.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Scheme link copied to clipboard!");
    }
  };

  document.getElementById("generate-pdf-btn").onclick = () => {
    generateDraftPDF(scheme, profileName, profileAge, profileIncome);
  };

  document.getElementById("back-from-detail").onclick = () => {
    switchView(lastProfile ? "results" : "browse");
  };

  switchView("detail");
}

function generateDraftPDF(scheme, name, age, income) {
  const refCode = "ENV-TN-" + Math.floor(100000 + Math.random() * 900000);
  const dateStr = new Date().toLocaleDateString("en-IN");

  const newApp = {
    reference: refCode,
    applicantName: name,
    schemeId: scheme.id,
    schemeName: scheme.name,
    status: "Draft created (Print-Ready)",
    createdAt: dateStr
  };

  savedApplications.unshift(newApp);
  localStorage.setItem("envision-applications", JSON.stringify(savedApplications));
  updateAppBadge();

  window.print();
  alert(`Draft application successfully created!\nReference Number: ${refCode}\nSaved to "My applications".`);
}

function updateAppBadge() {
  document.getElementById("app-count-badge").textContent = savedApplications.length;
}

function loadApplicationsList() {
  updateAppBadge();
  const container = document.getElementById("applications-container");
  if (savedApplications.length === 0) {
    container.innerHTML = `<div class="card"><p>No draft applications created yet. Browse schemes and generate a draft PDF to save records here.</p></div>`;
    return;
  }

  let html = `<div class="table-responsive"><table><thead><tr><th>Reference</th><th>Applicant Name</th><th>Scheme Name</th><th>Status</th><th>Date</th></tr></thead><tbody>`;
  savedApplications.forEach(a => {
    html += `<tr><td><strong>${a.reference}</strong></td><td>${a.applicantName}</td><td>${a.schemeName}</td><td><span class="status-pill match">${a.status}</span></td><td>${a.createdAt}</td></tr>`;
  });
  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

/* --- VOICE & SPEECH SYNTHESIS --- */
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    alert("Speech synthesis is not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = currentLang === "ta" ? "ta-IN" : "en-IN";
  utterance.rate = Number(document.getElementById("tts-rate").value);

  const player = document.getElementById("tts-player");
  player.hidden = false;
  document.getElementById("tts-status-text").textContent = "Reading aloud...";

  utterance.onend = () => { player.hidden = true; };
  utterance.onerror = () => { player.hidden = true; };

  currentSynthUtterance = utterance;
  window.speechSynthesis.speak(utterance);

  document.getElementById("tts-pause-btn").onclick = () => window.speechSynthesis.pause();
  document.getElementById("tts-resume-btn").onclick = () => window.speechSynthesis.resume();
  document.getElementById("tts-stop-btn").onclick = () => {
    window.speechSynthesis.cancel();
    player.hidden = true;
  };
}

document.getElementById("read-results-btn")?.addEventListener("click", () => {
  const matchedCount = document.getElementById("count-matched").textContent;
  speakText(`You have ${matchedCount} matching schemes based on your eligibility profile.`);
});

/* --- VOICE SEARCH & DICTATION --- */
function initVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;

  document.getElementById("voice-search-btn").addEventListener("click", () => {
    recognition.lang = currentLang === "ta" ? "ta-IN" : "en-IN";
    recognition.start();
    document.getElementById("scheme-search").placeholder = "Listening...";
  });

  recognition.onresult = (e) => {
    const text = e.results[0][0].transcript;
    document.getElementById("scheme-search").value = text;
    applyFilters();
    document.getElementById("scheme-search").placeholder = "Search by keyword, benefit...";
  };

  recognition.onerror = () => {
    document.getElementById("scheme-search").placeholder = "Search by keyword, benefit...";
  };

  document.querySelectorAll(".mic-field-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const field = document.getElementById(targetId);
      const rec = new SpeechRecognition();
      rec.lang = currentLang === "ta" ? "ta-IN" : "en-IN";
      rec.start();
      rec.onresult = (evt) => {
        field.value = evt.results[0][0].transcript;
      };
    });
  });
}
