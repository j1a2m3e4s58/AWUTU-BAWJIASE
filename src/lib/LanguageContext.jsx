import React, { createContext, useContext, useState } from 'react';

export const languages = [
  { code: 'en', label: 'ENG', short: 'ENG' },
  { code: 'twi', label: 'TWI', short: 'TWI' },
];

export const translations = {
  en: {
    // Nav
    home: 'Home',
    about: 'About',
    history: 'History',
    kings: 'Kings',
    memorial: 'Memorial',
    funeral: 'Funeral',
    gallery: 'Gallery',
    news: 'News',
    events: 'Events',
    lineage: 'Royal Lineage',
    familyTree: 'Family Tree',
    documents: 'Documents',
    contact: 'Contact',
    search: 'Search',
    training: 'Videos',
    videosPortal: 'Videos Portal',
    thePast: 'The Past',
    thePresent: 'The Present',
    theFuture: 'The Future',
    communityHistory: 'Community History',
    kingsArchive: 'Kings Archive',
    royalLineage: 'Royal Lineage',
    searchPlaceholder: 'Search the archive...',

    // Home
    homeLabel: 'Awutu Bawjiase Community',
    homeHeroTitle1: 'Preserving a',
    homeHeroTitle2: 'Sacred Legacy',
    homeHeroDesc: 'A digital sanctuary honoring our royal heritage, community history, and the enduring spirit of our sovereign lineage.',
    viewMemorial: 'View Memorial',
    inMemoriam: 'In Memoriam',
    exploreArchive: 'Explore the Archive',
    exploreDesc: 'Discover the rich history, royal legacy, and community heritage preserved within our digital sanctuary.',
    navigate: 'Navigate',
    announcements: 'Announcements',
    latestNews: 'Latest News',
    upcomingCeremonies: 'Upcoming Ceremonies',
    eventsLabel: 'Events',
    quote: '"A people without the knowledge of their past history, origin and culture is like a tree without roots."',

    // Kings
    corridorOfKings: 'The Corridor of Kings',
    royalArchive: 'Royal Archive',
    royalArchiveDesc: 'A complete chronicle of every sovereign who has guided our community through the ages.',
    searchKings: 'Search kings by name or title...',
    allStatus: 'All Status',
    reigning: 'Reigning',
    deceased: 'Deceased',
    abdicated: 'Abdicated',
    future: 'Future',
    noKingsFound: 'No kings found matching your criteria.',
    viewLegacy: 'View Legacy →',
    present: 'Present',

    // About
    ourIdentity: 'Our Identity',
    aboutTitle: 'About the Community',
    aboutDesc: 'Learn about the rich cultural heritage, traditions, and values that define our community.',
    contentComingSoon: 'Content will be published here by the administrators.',

    // History
    ourStory: 'Our Story',
    historyTitle: 'Community History',
    historyDesc: 'The story of our people — from ancient origins to the present day.',
    historicalContent: 'Historical content will be published here by the administrators.',

    // Memorial
    inMemoriamLabel: 'In Memoriam',
    lateKing: 'The Late King',
    hallOfEchoes: 'Hall of Echoes',
    leaveTribute: 'Leave a Tribute',
    tributeDesc: 'Share your words of remembrance and honor the legacy of our beloved king.',
    yourName: 'Your name',
    yourTribute: 'Your tribute message...',
    submitTribute: 'Submit Tribute',
    submitting: 'Submitting...',
    downloadCondolence: 'Download Condolence Book',
    beFirst: 'Be the first to leave a tribute.',

    // Funeral
    ceremonyLabel: 'Ceremony & Arrangements',
    funeralTitle: 'Funeral Information',
    funeralDesc: 'Details regarding the funeral ceremonies, arrangements, and schedule of events.',
    ceremonySchedule: 'Ceremony Schedule',
    funeralComingSoon: 'Funeral information will be published here.',
    printProgramme: 'Print Programme',

    // Gallery
    galleryLabel: 'The Visual Archive',
    galleryTitle: 'Gallery',
    galleryDesc: 'A curated collection of photographs preserving the visual history of our community.',
    allCategories: 'All',
    noImages: 'No gallery items in this category.',
    close: 'Close',

    // News
    stayInformed: 'Stay Informed',
    newsTitle: 'News & Announcements',
    noAnnouncements: 'No announcements at this time.',

    // Events
    ceremoniesLabel: 'Ceremonies & Gatherings',
    eventsTitle: 'Events',
    noEvents: 'No events scheduled at this time.',
    upcomingEvents: 'Upcoming Events',
    pastEvents: 'Past Events',

    // Lineage
    sovereignContinuum: 'The Sovereign Continuum',
    lineageTitle: 'Royal Lineage',
    lineageDesc: 'An unbroken chain of sovereignty — the complete family tree of our rulers.',
    lineageComingSoon: 'The royal lineage will be published here.',

    // Documents
    documentsLabel: 'The Sacred Scrolls',
    documentsTitle: 'Archive Documents',
    documentsDesc: 'Official documents, royal decrees, and historical records preserved for posterity.',
    searchDocuments: 'Search documents...',
    allCategories2: 'All Categories',
    noDocuments: 'No documents found.',
    download: 'Download',
    uploaded: 'Uploaded',

    // Contact
    reachOut: 'Reach Out',
    contactTitle: 'Contact Us',
    contactDesc: 'We welcome your inquiries, suggestions, and messages.',
    yourNamePlaceholder: 'Your name',
    yourEmail: 'Your email',
    subject: 'Subject',
    yourMessage: 'Your message...',
    sendMessage: 'Send Message',
    sending: 'Sending...',

    // Training
    knowledgeLabel: 'Knowledge & Heritage',
    trainingTitle: 'Videos Portal',
    trainingDesc: 'Watch ceremonial recordings, heritage explainers, and community video resources in one public portal.',
    noVideos: 'No videos are available yet.',

    // Footer
    preservingHeritage: 'Preserving the sacred history and royal heritage of our community for generations to come.',
    heritage: 'Heritage',
    current: 'Current',
    connect: 'Connect',
    allRightsReserved: 'All rights reserved.',
    digitalSanctuary: 'A digital sanctuary for the Awutu Bawjiase Community',
    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Use',
  },

  twi: {
    // Nav
    home: 'Fie',
    about: 'Fa Ho',
    history: 'Abakɔsɛm',
    kings: 'Ahemfo',
    memorial: 'Adwuma',
    funeral: 'Ayie',
    gallery: 'Foto',
    news: 'Nhyira',
    events: 'Nkɔmhyia',
    lineage: 'Ahennwa',
    familyTree: 'Abusua Dua',
    documents: 'Nwoma',
    contact: 'Kasa',
    search: 'Hwehwɛ',
    training: 'Video',
    videosPortal: 'Video Kwan',
    thePast: 'Daa',
    thePresent: 'Nnɛ',
    theFuture: 'Daakye',
    communityHistory: 'Oman Abakɔsɛm',
    kingsArchive: 'Ahemfo Nhoma',
    royalLineage: 'Ahennwa',
    searchPlaceholder: 'Hwehwɛ nhoma no mu...',

    // Home
    homeLabel: 'Awutu Bawjiase Oman',
    homeHeroTitle1: 'Yɛde',
    homeHeroTitle2: 'Kronkron Aguagyina',
    homeHeroDesc: 'Fie kronkron a ɛhyɛ yɛn ahennwa abakɔsɛm, oman akyi, ne yɛn ɔhene nhyehyɛe ho.',
    viewMemorial: 'Hwɛ Adwuma',
    inMemoriam: 'N\'adwuma',
    exploreArchive: 'Huro Nhoma No',
    exploreDesc: 'Di kan nhoma, ahennwa ne oman abakɔsɛm a wɔakyɛkyɛ wɔ yɛn nhoma mu.',
    navigate: 'Kwan',
    announcements: 'Amanneɛhyɛ',
    latestNews: 'Nhyira Foforɔ',
    upcomingCeremonies: 'Afahyɛ a Ɛreba',
    eventsLabel: 'Nkɔmhyia',
    quote: '"Onipa a onnim n\'abakɔsɛm, n\'ase ne n\'amanneɛ te sɛ dua a onni ntini."',

    // Kings
    corridorOfKings: 'Ahemfo Kwan',
    royalArchive: 'Ahemfo Nhoma',
    royalArchiveDesc: 'Ahemfo a wɔadi yɛn oman so daa no wɔn mu nsɛm.',
    searchKings: 'Hwehwɛ ɔhene din anaa tete...',
    allStatus: 'Wɔn Nyinaa',
    reigning: 'Ɔhene Tuntum',
    deceased: 'Owuo',
    abdicated: 'Gyae',
    future: 'Daakye',
    noKingsFound: 'Ahemfo biara nnhyia wo hwehwɛ.',
    viewLegacy: 'Hwɛ Aguagyina →',
    present: 'Nnɛ',

    // About
    ourIdentity: 'Yɛn Ho',
    aboutTitle: 'Oman Ho Nsɛm',
    aboutDesc: 'Sua yɛn oman amanneɛ, amammere ne suban.',
    contentComingSoon: 'Nyoma bɛtena ha na ɔhwɛsoɔ no bɛtwerɛ.',

    // History
    ourStory: 'Yɛn Anihasɛm',
    historyTitle: 'Oman Abakɔsɛm',
    historyDesc: 'Yɛn nnipa ho asɛm — firi tete besi nnɛ.',
    historicalContent: 'Tete nsɛm bɛtena ha na ɔhwɛsoɔ no bɛtwerɛ.',

    // Memorial
    inMemoriamLabel: 'N\'adwuma',
    lateKing: 'Ɔhene a Owui',
    hallOfEchoes: 'Mpaeɛbu Nkyinkyim',
    leaveTribute: 'Gyae Mpaeɛbu',
    tributeDesc: 'Kyerɛ w\'akoma na hyɛ yɛn ɔhene aguagyina.',
    yourName: 'Wo din',
    yourTribute: 'W\'asɛm...',
    submitTribute: 'Fa Mpaeɛbu',
    submitting: 'Retwerɛ...',
    downloadCondolence: 'Sare Mpaeɛbu Nhoma',
    beFirst: 'Yɛ ɔkantenten de gyae mpaeɛbu.',

    // Funeral
    ceremonyLabel: 'Ayie & Nhyehyɛe',
    funeralTitle: 'Ayie Ho Nsɛm',
    funeralDesc: 'Ayie afahyɛ, nhyehyɛe ne amammere ho nsɛm.',
    ceremonySchedule: 'Ayie Afahyɛ Bere',
    funeralComingSoon: 'Ayie nsɛm bɛtena ha.',
    printProgramme: 'Prent Amammere',

    // Gallery
    galleryLabel: 'Foto Nhoma',
    galleryTitle: 'Foto',
    galleryDesc: 'Foto a ɛkyerɛ yɛn oman abakɔsɛm.',
    allCategories: 'Wɔn Nyinaa',
    noImages: 'Foto biara nni ha.',
    close: 'To Mu',

    // News
    stayInformed: 'Hu Nhyira',
    newsTitle: 'Nhyira & Amanneɛhyɛ',
    noAnnouncements: 'Amanneɛhyɛ biara nni nnɛ.',

    // Events
    ceremoniesLabel: 'Afahyɛ & Nkɔmhyia',
    eventsTitle: 'Nkɔmhyia',
    noEvents: 'Nkɔmhyia biara nni nnɛ.',
    upcomingEvents: 'Nkɔmhyia a Ɛreba',
    pastEvents: 'Nkɔmhyia a Atwam',

    // Lineage
    sovereignContinuum: 'Ahennwa Ahoɔden',
    lineageTitle: 'Ahennwa',
    lineageDesc: 'Ahennwa a enni teɛ — yɛn ahemfo abusua dua.',
    lineageComingSoon: 'Ahennwa bɛtena ha.',

    // Documents
    documentsLabel: 'Nhoma Kronkron',
    documentsTitle: 'Nhoma Archive',
    documentsDesc: 'Ahemfo nhoma, amanneɛhyɛ ne tete nwoma.',
    searchDocuments: 'Hwehwɛ nwoma...',
    allCategories2: 'Nhoma Wɔn Nyinaa',
    noDocuments: 'Nwoma biara nnhyia.',
    download: 'Sare',
    uploaded: 'Wɔde baeɛ',

    // Contact
    reachOut: 'Bɔ Mmɔden',
    contactTitle: 'Bɔ Yɛn Ho',
    contactDesc: 'Yɛ akwaaba wʼasɛm, nkurɔfo ne nkɔmhyia.',
    yourNamePlaceholder: 'Wo din',
    yourEmail: 'Wo email',
    subject: 'Asɛm',
    yourMessage: 'W\'asɛm...',
    sendMessage: 'Fa Asɛm No',
    sending: 'Refra...',

    // Training
    knowledgeLabel: 'Ɔnyansafo ne Aguagyina',
    trainingTitle: 'Video Kwan',
    trainingDesc: 'Hwɛ amammerɛ, ahennwa, ne oman video ahorow wɔ kwan baako so.',
    noVideos: 'Video biara nni hɔ.',

    // Footer
    preservingHeritage: 'Yɛde yɛn oman nhoma kronkron akyɛ anuonyam.',
    heritage: 'Aguagyina',
    current: 'Nnɛ',
    connect: 'Kɔ Bɔ',
    allRightsReserved: 'Hômfo wɔn nyinaa akyɛ.',
    digitalSanctuary: 'Fie kronkron wɔ internet so ma Awutu Bawjiase Oman',
    privacyPolicy: 'Kokoam Nhyehyɛe',
    termsOfUse: 'Dwumadie Mmara',
  },

  awutu: {
    // Nav
    home: 'Fie',
    about: 'Ye Wↄ Ho',
    history: 'Amanyↄ Nyεε',
    kings: 'Omanfo',
    memorial: 'Edze Kↄm',
    funeral: 'Ayii',
    gallery: 'Nfoto',
    news: 'Amanyↄ',
    events: 'Akↄmhyia',
    lineage: 'Manfo Dzinli',
    familyTree: 'Onua Dua',
    documents: 'Nhoma',
    contact: 'Kasa Yɛn',
    search: 'Hwε',
    training: 'Video',
    videosPortal: 'Video Portal',
    thePast: 'Edze Wↄ Ho',
    thePresent: 'Edze Wↄ Fiε',
    theFuture: 'Edze Bε Ba',
    communityHistory: 'Oman Nyεε',
    kingsArchive: 'Omanfo Nhoma',
    royalLineage: 'Manfo Dzinli',
    searchPlaceholder: 'Hwε nhoma mu...',

    // Home
    homeLabel: 'Awutu Bawjiase Oman',
    homeHeroTitle1: 'Yε Gyina',
    homeHeroTitle2: 'Kronkron Dzinli',
    homeHeroDesc: 'Fie kronkron a ε yε yεn omanfo dzinli, oman amanyↄ ne yεn nhyehyεε ho.',
    viewMemorial: 'Hwε Edze Kↄm',
    inMemoriam: 'Edze Kↄm',
    exploreArchive: 'Hwε Nhoma',
    exploreDesc: 'Di kan nhoma, omanfo ne oman nyεε a wↄde asie wↄ yεn nhoma mu.',
    navigate: 'Kwan',
    announcements: 'Amanyↄ Nhyehyεε',
    latestNews: 'Amanyↄ Foforↄ',
    upcomingCeremonies: 'Afahyε a εreba',
    eventsLabel: 'Akↄmhyia',
    quote: '"Onipa a ↄnnim n\'abakↄsεm te sε dua a onni ntini."',

    // Kings
    corridorOfKings: 'Omanfo Kwan',
    royalArchive: 'Omanfo Nhoma',
    royalArchiveDesc: 'Omanfo a wↄadi yεn oman so wↄn mu nsεm nyinaa.',
    searchKings: 'Hwε oman din anaa tete...',
    allStatus: 'Wↄn Nyinaa',
    reigning: 'Oman Tuntum',
    deceased: 'Owuo',
    abdicated: 'Gyae',
    future: 'Bε Ba',
    noKingsFound: 'Omanfo biara nnhyia wo hwε.',
    viewLegacy: 'Hwε Dzinli →',
    present: 'Fiε',

    // About
    ourIdentity: 'Yεn Ho Nsεm',
    aboutTitle: 'Oman Ye Wↄ Ho',
    aboutDesc: 'Sua yεn oman amannerε ne amammere.',
    contentComingSoon: 'Nhoma bε tena ha na ↄhwεsoↄ bε twerε.',

    // History
    ourStory: 'Yεn Asεm',
    historyTitle: 'Oman Amanyↄ',
    historyDesc: 'Yεn nnipa asεm — firi tete besi fiε.',
    historicalContent: 'Tete nsεm bε tena ha.',

    // Memorial
    inMemoriamLabel: 'Edze Kↄm',
    lateKing: 'Oman a ↄawui',
    hallOfEchoes: 'Mpaeεbu Kwan',
    leaveTribute: 'Gyae Mpaeεbu',
    tributeDesc: 'Kyerε w\'akoma na hyε yεn oman aguagyina.',
    yourName: 'Wo din',
    yourTribute: 'W\'asεm...',
    submitTribute: 'Fa Mpaeεbu',
    submitting: 'Retwerε...',
    downloadCondolence: 'Sare Mpaeεbu Nhoma',
    beFirst: 'Yε ↄkantenten de gyae mpaeεbu.',

    // Funeral
    ceremonyLabel: 'Ayii & Nhyehyεε',
    funeralTitle: 'Ayii Ho Nsεm',
    funeralDesc: 'Ayii afahyε ne nhyehyεε ho nsεm.',
    ceremonySchedule: 'Ayii Bere',
    funeralComingSoon: 'Ayii nsεm bε tena ha.',
    printProgramme: 'Prent Nhoma',

    // Gallery
    galleryLabel: 'Nfoto Nhoma',
    galleryTitle: 'Nfoto',
    galleryDesc: 'Nfoto a εkyerε yεn oman nyεε.',
    allCategories: 'Wↄn Nyinaa',
    noImages: 'Nfoto biara nni ha.',
    close: 'To Mu',

    // News
    stayInformed: 'Hu Amanyↄ',
    newsTitle: 'Amanyↄ & Nhyehyεε',
    noAnnouncements: 'Nhyehyεε biara nni fiε.',

    // Events
    ceremoniesLabel: 'Afahyε & Akↄmhyia',
    eventsTitle: 'Akↄmhyia',
    noEvents: 'Akↄmhyia biara nni fiε.',
    upcomingEvents: 'Akↄmhyia a εreba',
    pastEvents: 'Akↄmhyia a atwam',

    // Lineage
    sovereignContinuum: 'Omanfo Dzinli',
    lineageTitle: 'Manfo Dzinli',
    lineageDesc: 'Omanfo dzinli a enni teε — abusua dua.',
    lineageComingSoon: 'Omanfo dzinli bε tena ha.',

    // Documents
    documentsLabel: 'Nhoma Kronkron',
    documentsTitle: 'Nhoma Archive',
    documentsDesc: 'Omanfo nhoma, nhyehyεε ne tete nwoma.',
    searchDocuments: 'Hwε nwoma...',
    allCategories2: 'Nhoma Nyinaa',
    noDocuments: 'Nwoma biara nnhyia.',
    download: 'Sare',
    uploaded: 'Baeε',

    // Contact
    reachOut: 'Bↄ Mmↄden',
    contactTitle: 'Kasa Yεn',
    contactDesc: 'Yε akwaaba w\'asεm ne nkurↄfo.',
    yourNamePlaceholder: 'Wo din',
    yourEmail: 'Wo email',
    subject: 'Asεm',
    yourMessage: 'W\'asεm...',
    sendMessage: 'Fa Asεm',
    sending: 'Refra...',

    // Training
    knowledgeLabel: 'Nyansa ne Dzinli',
    trainingTitle: 'Video Portal',
    trainingDesc: 'Hwɛ omanfo amannerɛ, nhyehyɛe, ne video ahorow wɔ portal kor do.',
    noVideos: 'Video biara nnyi hɔ.',

    // Footer
    preservingHeritage: 'Yε gyina yεn oman nhoma kronkron ama anuonyam.',
    heritage: 'Dzinli',
    current: 'Fiε',
    connect: 'Kↄ Bↄ',
    allRightsReserved: 'Nhoma nyinaa akyε.',
    digitalSanctuary: 'Fie kronkron wↄ internet so ma Awutu Bawjiase Oman',
    privacyPolicy: 'Kokoam Ho',
    termsOfUse: 'Nwuma Mmara',
  },
};

const extraTranslations = {
  en: {
    theBeginning: 'The Beginning',
    mobileNavigation: 'Mobile Navigation',
    leadership: 'Leadership',
    communityMessage: 'Community Message',
    featuredNotice: 'Featured Notice',
    nextCommunityEvent: 'Next Community Event',
    importantDocument: 'Important Document',
    documentOpenArchive: 'Open the archive center to view this public document.',
    featuredGallery: 'Featured Gallery',
    importantVisualMoments: 'Important visual moments from the archive',
    featuredVideosLabel: 'Featured Videos',
    featuredVideosTitle: 'Watch highlighted recordings and explainers',
    featured: 'Featured',
    allAlbums: 'All Albums',
    allTags: 'All Tags',
    featuredMoments: 'Featured Moments',
    highlightedImages: 'Highlighted images from the archive.',
    galleryFilterLabel: 'Filter The Gallery',
    browseAlbumTags: 'Browse by album and story tags.',
    galleryFeaturedDesc: 'Start with the most important images, then narrow the full collection by category, album, or tag.',
    general: 'General',
    openAttachment: 'Open Attachment',
    featuredEvent: 'Featured Event',
    venue: 'Venue',
    organizer: 'Organizer',
    dressCode: 'Dress code',
    communityVenue: 'Community venue',
    communityOffice: 'Community office',
    asAnnounced: 'As announced',
    seeContactPage: 'See contact page',
    featuredDocument: 'Featured Document',
    messageSent: 'Your message has been sent successfully.',
    email: 'Email',
    phone: 'Phone',
    address: 'Address',
    officeHours: 'Office Hours',
    visitingNotes: 'Visiting Notes',
    whoToContact: 'Who To Contact',
    emergencyContact: 'Emergency Contact',
    notProvidedYet: 'Not provided yet',
    checkBackOfficeHours: 'Please check back for office hours.',
    contactBeforeVisiting: 'Please contact the office before visiting.',
    visitTheArea: 'Visit The Area',
    mapIntro: 'We added a dedicated location block so visitors can immediately understand where the community is and open the full map when they need directions.',
    location: 'Location',
    mapCoordinates: 'Map Coordinates',
    openFullBingMap: 'Open Full Bing Map',
    liveMapView: 'Live Map View',
    publicMedia: 'Public Media',
    videoIntroTitle: "A calmer, clearer way to explore the community's video archive.",
    videoIntroDesc: 'Use the portal to browse ceremonial footage, heritage explainers, oral-history clips, and public recordings without digging through scattered links.',
    publishedVideos: 'Published Videos',
    categories: 'Categories',
    readyToWatch: 'Ready To Watch',
    featuredVideo: 'Featured Video',
    searchVideosPlaceholder: 'Search videos by title or description...',
    imageComments: 'Image Comments',
    videoComments: 'Video Comments',
    quickLinks: 'Quick Links',
    communityLinks: 'Community Links',
    funeralInformation: 'Funeral Information',
    visitorGuidance: 'Visitor Guidance',
  },
  twi: {
    theBeginning: 'Mfiase',
    mobileNavigation: 'Mobile Kwan',
    leadership: 'Akwankyerɛ',
    communityMessage: 'Oman Nkrato',
    featuredNotice: 'Nkrato Titiriw',
    nextCommunityEvent: 'Oman Nhyiam a Edi Ho',
    importantDocument: 'Nhoma Titiriw',
    documentOpenArchive: 'Bue archive no na hwɛ saa nhoma yi.',
    featuredGallery: 'Foto Titiriw',
    importantVisualMoments: 'Foto titiriw a ɛwɔ archive no mu',
    featuredVideosLabel: 'Video Titiriw',
    featuredVideosTitle: 'Hwɛ video ne nkyerɛkyerɛmu titiriw',
    featured: 'Titiriw',
    allAlbums: 'Album Nyinaa',
    allTags: 'Tag Nyinaa',
    featuredMoments: 'Bere Titiriw',
    highlightedImages: 'Foto titiriw a ɛwɔ archive no mu.',
    galleryFilterLabel: 'Hwehwɛ Foto No',
    browseAlbumTags: 'Fa album ne tags hwehwɛ.',
    galleryFeaturedDesc: 'Fi ase wɔ foto titiriw so, afei fa category, album anaa tag hwehwɛ.',
    general: 'Nyinaa',
    openAttachment: 'Bue File',
    featuredEvent: 'Nhyiam Titiriw',
    venue: 'Beae',
    organizer: 'Ɔyɛfo',
    dressCode: 'Atadeɛ',
    communityVenue: 'Oman beae',
    communityOffice: 'Oman office',
    asAnnounced: 'Sɛ wɔbɛka no',
    seeContactPage: 'Hwɛ contact page',
    featuredDocument: 'Nhoma Titiriw',
    messageSent: 'Wɔde wo nkrato no akɔ yie.',
    email: 'Email',
    phone: 'Fon',
    address: 'Address',
    officeHours: 'Office Bere',
    visitingNotes: 'Nsrahwɛ Ho Nsɛm',
    whoToContact: 'Onipa a Wobɛkasa Akyerɛ No',
    emergencyContact: 'Ntɛm Contact',
    notProvidedYet: 'Wonnya mfa mmae',
    checkBackOfficeHours: 'San bra bɛhwɛ office bere.',
    contactBeforeVisiting: 'Kasa kyerɛ office ansa na woakɔ.',
    visitTheArea: 'Kɔ Beae No',
    mapIntro: 'Yɛde map beae yi aka ho sɛnea ahɔho bɛte beae no ase na wɔabue map kɛseɛ no.',
    location: 'Beae',
    mapCoordinates: 'Map Coordinates',
    openFullBingMap: 'Bue Bing Map',
    liveMapView: 'Map a Ɛda So',
    publicMedia: 'Public Media',
    videoIntroTitle: 'Kwan a ɛyɛ mmerɛw de hwehwɛ oman video archive.',
    videoIntroDesc: 'Fa portal yi hwehwɛ afahyɛ video, amammerɛ nkyerɛkyerɛmu, abakɔsɛm clips, ne public recordings.',
    publishedVideos: 'Video a Wɔapublish',
    categories: 'Categories',
    readyToWatch: 'Ayɛ Krado',
    featuredVideo: 'Video Titiriw',
    searchVideosPlaceholder: 'Hwehwɛ video din anaa nkyerɛkyerɛmu...',
    imageComments: 'Foto Comments',
    videoComments: 'Video Comments',
    quickLinks: 'Links Ntɛm',
    communityLinks: 'Oman Links',
    funeralInformation: 'Ayie Ho Nsɛm',
    visitorGuidance: 'Ahɔho Akwankyerɛ',
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('lang') || 'en';
    return languages.some((language) => language.code === saved) ? saved : 'en';
  });

  const switchLang = (code) => {
    setLang(code);
    localStorage.setItem('lang', code);
  };

  const t = (key) =>
    extraTranslations[lang]?.[key] ??
    translations[lang]?.[key] ??
    extraTranslations.en?.[key] ??
    translations.en?.[key] ??
    key;

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
