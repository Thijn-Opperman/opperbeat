export type Language = 'nl' | 'en';

export interface Translations {
  // Navigation
  nav: {
    dashboard: string;
    overview: string;
    musicAnalysis: string;
    library: string;
    mixesSets: string;
    analytics: string;
    playlistBuilder: string;
    soundSettings: string;
    profileSettings: string;
    help: string;
    logout: string;
  };
  
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    close: string;
  };

  // Errors
  errors: {
    invalidFileType: string;
    fileTooLarge: string;
    analysisTimeout: string;
    analysisTimeoutLarge: string;
    noDataReceived: string;
    somethingWentWrong: string;
    loginFailed: string;
    registerFailed: string;
    passwordsDoNotMatch: string;
    passwordTooShort: string;
    invalidEmailOrPassword: string;
    emailAndPasswordRequired: string;
    couldNotFetchRailwayUrl: string;
    railwayUrlNotConfigured: string;
    connectionLost: string;
    analyzing: string;
  };

  // Home/Overview
  home: {
    title: string;
    subtitle: string;
    musicAnalysis: string;
    analyze: string;
    startAnalysis: string;
    noAnalyses: string;
    noAnalysesDescription: string;
    lastAnalysis: string;
    totalAnalyses: string;
    bpmDetection: string;
    keyDetection: string;
  };

  // Analyze Page
  analyze: {
    title: string;
    subtitle: string;
    uploadMusicFile: string;
    dragDropOrClick: string;
    selectFile: string;
    selectFiles: string;
    saveToDatabase: string;
    supportedFormats: string;
    analyzing: string;
    analyzingBatch: string;
    analyzingDescription: string;
    elapsedTime: string;
    analysisTimeout: string;
    audioWaveform: string;
    waveformPlaceholder: string;
    trackInfo: string;
    titleLabel: string;
    artist: string;
    album: string;
    genre: string;
    duration: string;
    bitrate: string;
    sampleRate: string;
    audioAnalysis: string;
    energy: string;
    danceability: string;
    valence: string;
    acousticness: string;
    veryAccurate: string;
    accurate: string;
    moderatelyAccurate: string;
    batchMode: string;
    batchModeDescription: string;
    filesSelected: string;
    analyzingProgress: string;
    completed: string;
    failed: string;
    viewResults: string;
  };

  // Mixes Page
  mixes: {
    title: string;
    subtitle: string;
    newMix: string;
    searchMixes: string;
    noMixes: string;
    noMixesDescription: string;
    tracks: string;
  };

  // Analytics Page
  analytics: {
    title: string;
    subtitle: string;
    totalTracks: string;
    totalMixes: string;
    avgDuration: string;
    activeUsers: string;
    genreDistribution: string;
    activity: string;
    activityChartPlaceholder: string;
  };

  // Playlists Page
  playlists: {
    title: string;
    subtitle: string;
    newPlaylist: string;
    searchPlaylists: string;
    noPlaylists: string;
    noPlaylistsDescription: string;
  };

  // Library Page
  library: {
    title: string;
    subtitle: string;
    searchMusic: string;
    filterByBpm: string;
    filterByKey: string;
    filterByGenre: string;
    noMusic: string;
    noMusicDescription: string;
    bpm: string;
    key: string;
    duration: string;
    artist: string;
    album: string;
    genre: string;
    viewDetails: string;
    clearFilters: string;
    loading: string;
    error: string;
    retry: string;
  };

  // Profile Page
  profile: {
    title: string;
    subtitle: string;
    fullName: string;
    email: string;
    bio: string;
    bioPlaceholder: string;
    accountInfo: string;
    memberSince: string;
    accountType: string;
    preferences: string;
    emailNotifications: string;
    emailNotificationsDescription: string;
    publicProfile: string;
    publicProfileDescription: string;
    saveChanges: string;
  };

  // Sound Settings Page
  sound: {
    title: string;
    subtitle: string;
    masterVolume: string;
    masterVolumeDescription: string;
    headphoneCue: string;
    headphoneCueDescription: string;
    speakerOutput: string;
    speakerOutputDescription: string;
    advancedSettings: string;
    advancedSettingsDescription: string;
    autoGainControl: string;
    autoGainControlDescription: string;
    lowLatencyMode: string;
    lowLatencyModeDescription: string;
  };

  // Login/Register
  auth: {
    welcome: string;
    welcomeBack: string;
    login: string;
    loggingIn: string;
    demoLogin: string;
    demoLoginDescription: string;
    register: string;
    registering: string;
    email: string;
    password: string;
    confirmPassword: string;
    rememberMe: string;
    forgotPassword: string;
    noAccount: string;
    createAccount: string;
    hasAccount: string;
    loginHere: string;
    accountCreated: string;
    loginNow: string;
    termsAgreement: string;
    termsOfService: string;
    privacyPolicy: string;
  };

  // Metadata
  metadata: {
    appName: string;
    dashboard: string;
    description: string;
    unknown: string;
  };

  // Help Page
  help: {
    title: string;
    subtitle: string;
    aboutTitle: string;
    aboutDescription: string;
    feature1Title: string;
    feature1Description: string;
    feature2Title: string;
    feature2Description: string;
    feature3Title: string;
    feature3Description: string;
    feature4Title: string;
    feature4Description: string;
    featuresTitle: string;
    featuresDescription: string;
    overviewDescription: string;
    overviewFeature1: string;
    overviewFeature2: string;
    overviewFeature3: string;
    analyzeDescription: string;
    analyzeFeature1: string;
    analyzeFeature2: string;
    analyzeFeature3: string;
    analyzeFeature4: string;
    analyzeFeature5: string;
    libraryDescription: string;
    libraryFeature1: string;
    libraryFeature2: string;
    libraryFeature3: string;
    mixesDescription: string;
    mixesFeature1: string;
    mixesFeature2: string;
    mixesFeature3: string;
    analyticsDescription: string;
    analyticsFeature1: string;
    analyticsFeature2: string;
    analyticsFeature3: string;
    playlistsDescription: string;
    playlistsFeature1: string;
    playlistsFeature2: string;
    playlistsFeature3: string;
    soundDescription: string;
    soundFeature1: string;
    soundFeature2: string;
    soundFeature3: string;
    profileDescription: string;
    profileFeature1: string;
    profileFeature2: string;
    profileFeature3: string;
    technicalTitle: string;
    technicalDescription: string;
    tech1Title: string;
    tech1Item1: string;
    tech1Item2: string;
    tech1Item3: string;
    tech1Item4: string;
    tech2Title: string;
    tech2Item1: string;
    tech2Item2: string;
    tech2Item3: string;
    tech3Title: string;
    tech3Item1: string;
    tech3Item2: string;
    tech3Item3: string;
  };
}

export const translations: Record<Language, Translations> = {
  nl: {
    nav: {
      dashboard: 'Dashboard',
      overview: 'Overzicht',
      musicAnalysis: 'Muziek Analyse',
      library: 'Bibliotheek',
      mixesSets: 'Set Builder',
      analytics: 'Analyses',
      playlistBuilder: 'Playlist Bouwer',
      soundSettings: 'Geluidsinstellingen',
      profileSettings: 'Profiel & Instellingen',
      help: 'Help & Info',
      logout: 'Uitloggen',
    },
    common: {
      save: 'Opslaan',
      cancel: 'Annuleren',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      search: 'Zoeken',
      loading: 'Laden...',
      error: 'Fout',
      success: 'Succes',
      close: 'Sluiten',
    },
    errors: {
      invalidFileType: 'Ongeldig bestandstype. Gebruik MP3, WAV, FLAC of M4A.',
      fileTooLarge: 'Bestand is te groot',
      analysisTimeout: 'Analyse timeout: De analyse duurt te lang. Probeer een kleiner bestand of korter nummer (max 2 minuten voor grote bestanden).',
      analysisTimeoutLarge: 'Analyse timeout: Het bestand is te groot of de analyse duurt te lang. Probeer een kleiner bestand of korter nummer.',
      noDataReceived: 'Geen data ontvangen van de server',
      somethingWentWrong: 'Er is een fout opgetreden',
      loginFailed: 'Er ging iets mis bij het inloggen',
      registerFailed: 'Er ging iets mis bij het aanmaken van je account',
      passwordsDoNotMatch: 'Wachtwoorden komen niet overeen',
      passwordTooShort: 'Wachtwoord moet minimaal 6 tekens lang zijn',
      invalidEmailOrPassword: 'Ongeldig e-mailadres of wachtwoord',
      emailAndPasswordRequired: 'E-mailadres en wachtwoord zijn verplicht',
      couldNotFetchRailwayUrl: 'Kon Railway API URL niet ophalen',
      railwayUrlNotConfigured: 'Railway API URL niet geconfigureerd',
      connectionLost: 'Verbinding met Railway verloren. Dit kan gebeuren bij zeer grote bestanden. Probeer een kleiner bestand of wacht even en probeer opnieuw.',
      analyzing: 'Analyseren...',
    },
    home: {
      title: 'Overzicht',
      subtitle: 'Bekijk je muziek analyses en inzichten',
      musicAnalysis: 'Muziek Analyse',
      analyze: 'Analyseren',
      startAnalysis: 'Start Analyse',
      noAnalyses: 'Nog geen analyses',
      noAnalysesDescription: 'Upload en analyseer je eerste muziekbestand om gedetailleerde inzichten te krijgen',
      lastAnalysis: 'Laatste analyse',
      totalAnalyses: 'Totale analyses',
      bpmDetection: 'BPM Detectie',
      keyDetection: 'Key Detectie',
    },
    analyze: {
      title: 'Muziek Analyse',
      subtitle: 'Upload en analyseer je muziekstukken voor gedetailleerde inzichten',
      uploadMusicFile: 'Upload Muziekbestand(en)',
      dragDropOrClick: 'Sleep bestanden hierheen of klik om te selecteren',
      selectFile: 'Bestand Selecteren',
      selectFiles: 'Bestanden Selecteren',
      saveToDatabase: 'Opslaan in database na analyse',
      supportedFormats: 'Ondersteunde formaten: MP3, WAV, FLAC, M4A',
      analyzing: 'Bestand wordt geanalyseerd...',
      analyzingBatch: 'Playlist wordt geanalyseerd...',
      analyzingDescription: 'Dit kan even duren, vooral voor BPM en key detectie',
      elapsedTime: 'Verstreken tijd',
      analysisTimeout: '⚠️ Analyse duurt langer dan verwacht. Voor grote bestanden wordt alleen het begin geanalyseerd.',
      audioWaveform: 'Audio Golfvorm',
      waveformPlaceholder: 'Golfvorm visualisatie verschijnt hier',
      trackInfo: 'Track Informatie',
      titleLabel: 'Titel',
      artist: 'Artiest',
      album: 'Album',
      genre: 'Genre',
      duration: 'Duur',
      bitrate: 'Bitsnelheid',
      sampleRate: 'Samplefrequentie',
      audioAnalysis: 'Audio Analyse',
      energy: 'Energie',
      danceability: 'Dansbaarheid',
      valence: 'Valentie',
      acousticness: 'Akoestiek',
      veryAccurate: 'Zeer accuraat',
      accurate: 'Accuraat',
      moderatelyAccurate: 'Matig accuraat',
      batchMode: 'Playlist Analyse',
      batchModeDescription: 'Selecteer meerdere bestanden om een hele playlist te analyseren',
      filesSelected: 'bestanden geselecteerd',
      analyzingProgress: 'Analyseer {current} van {total}',
      completed: 'Voltooid',
      failed: 'Gefaald',
      viewResults: 'Bekijk Resultaten',
    },
    mixes: {
      title: 'Set Builder',
      subtitle: 'Beheer en organiseer je DJ mixes en sets',
      newMix: 'Nieuwe Mix',
      searchMixes: 'Zoek mixes...',
      noMixes: 'Nog geen mixes',
      noMixesDescription: 'Maak je eerste mix aan om te beginnen',
      tracks: 'tracks',
    },
    analytics: {
      title: 'Analyses',
      subtitle: 'Inzichten en statistieken over je muziek collectie',
      totalTracks: 'Totaal Tracks',
      totalMixes: 'Totaal Mixes',
      avgDuration: 'Gem. Duur',
      activeUsers: 'Actieve Gebruikers',
      genreDistribution: 'Genre Verdeling',
      activity: 'Activiteit',
      activityChartPlaceholder: 'Activiteit grafiek komt hier',
    },
    playlists: {
      title: 'Playlist Bouwer',
      subtitle: 'Creëer en beheer je playlists',
      newPlaylist: 'Nieuwe Playlist',
      searchPlaylists: 'Zoek playlists...',
      noPlaylists: 'Nog geen playlists',
      noPlaylistsDescription: 'Maak je eerste playlist aan om te beginnen',
    },
    library: {
      title: 'Muziek Bibliotheek',
      subtitle: 'Bekijk al je geanalyseerde muziek',
      searchMusic: 'Zoek muziek...',
      filterByBpm: 'Filter op BPM',
      filterByKey: 'Filter op Key',
      filterByGenre: 'Filter op Genre',
      noMusic: 'Nog geen muziek',
      noMusicDescription: 'Upload en analyseer je eerste muziekbestand om te beginnen',
      bpm: 'BPM',
      key: 'Key',
      duration: 'Duur',
      artist: 'Artiest',
      album: 'Album',
      genre: 'Genre',
      viewDetails: 'Details bekijken',
      clearFilters: 'Filters wissen',
      loading: 'Laden...',
      error: 'Fout bij laden',
      retry: 'Opnieuw proberen',
    },
    profile: {
      title: 'Profiel & Instellingen',
      subtitle: 'Beheer je profiel en account instellingen',
      fullName: 'Volledige Naam',
      email: 'E-mailadres',
      bio: 'Bio',
      bioPlaceholder: 'Vertel iets over jezelf...',
      accountInfo: 'Account Informatie',
      memberSince: 'Lid sinds',
      accountType: 'Accounttype',
      preferences: 'Voorkeuren',
      emailNotifications: 'E-mail Notificaties',
      emailNotificationsDescription: 'Ontvang updates via e-mail',
      publicProfile: 'Openbaar Profiel',
      publicProfileDescription: 'Maak je profiel zichtbaar voor anderen',
      saveChanges: 'Wijzigingen Opslaan',
    },
    sound: {
      title: 'Geluidsinstellingen',
      subtitle: 'Configureer audio instellingen en geluidsniveaus',
      masterVolume: 'Hoofdvolume',
      masterVolumeDescription: 'Totale geluidsniveau',
      headphoneCue: 'Koptelefoon Cue',
      headphoneCueDescription: 'Volume voor koptelefoon preview',
      speakerOutput: 'Speaker Uitvoer',
      speakerOutputDescription: 'Volume voor speaker uitvoer',
      advancedSettings: 'Geavanceerde Instellingen',
      advancedSettingsDescription: 'Geavanceerde audio configuratie',
      autoGainControl: 'Automatische Gain Regeling',
      autoGainControlDescription: 'Automatisch geluidsniveau aanpassen',
      lowLatencyMode: 'Lage Latentie Modus',
      lowLatencyModeDescription: 'Minimaliseer audio vertraging',
    },
    auth: {
      welcome: 'Welkom terug! Log in om door te gaan',
      welcomeBack: 'Welkom terug! Log in om door te gaan',
      login: 'Inloggen',
      loggingIn: 'Inloggen...',
      demoLogin: 'Demo Login',
      demoLoginDescription: 'Log direct in met een demo account (voor testen/docenten)',
      register: 'Account Aanmaken',
      registering: 'Account aanmaken...',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      confirmPassword: 'Bevestig Wachtwoord',
      rememberMe: 'Onthoud mij',
      forgotPassword: 'Wachtwoord vergeten?',
      noAccount: 'Nog geen account?',
      createAccount: 'Maak een account aan',
      hasAccount: 'Al een account?',
      loginHere: 'Log hier in',
      accountCreated: 'Account succesvol aangemaakt! Je kunt nu inloggen.',
      loginNow: 'Je kunt nu inloggen',
      termsAgreement: 'Door in te loggen ga je akkoord met onze',
      termsOfService: 'Servicevoorwaarden',
      privacyPolicy: 'Privacybeleid',
    },
    metadata: {
      appName: 'Opperbeat',
      dashboard: 'Dashboard',
      description: 'DJ analyses en performance dashboard',
      unknown: 'Onbekend',
    },
    help: {
      title: 'Help & Documentatie',
      subtitle: 'Informatie over alle functionaliteit van Opperbeat voor gebruikers en docenten',
      aboutTitle: 'Over Opperbeat',
      aboutDescription: 'Opperbeat is een professioneel DJ-hulpprogramma voor het analyseren, organiseren en beheren van muziekcollecties.',
      feature1Title: 'Snelle Muziekanalyse',
      feature1Description: 'Automatische BPM- en key-detectie met hoge nauwkeurigheid voor snelle trackvoorbereiding.',
      feature2Title: 'DJ Workflow',
      feature2Description: 'Organiseer je tracks, maak sets en playlists, en houd overzicht tijdens live gebruik.',
      feature3Title: 'Database Integratie',
      feature3Description: 'Alle analyses worden opgeslagen in Supabase voor snelle toegang en synchronisatie.',
      feature4Title: 'Modern Tech Stack',
      feature4Description: 'Gebouwd met Next.js, TypeScript, Supabase en Python voor betrouwbare performance.',
      featuresTitle: 'Functionaliteiten per Pagina',
      featuresDescription: 'Overzicht van alle beschikbare functies en hoe ze werken',
      overviewDescription: 'Het dashboard geeft een overzicht van je laatste analyses en statistieken.',
      overviewFeature1: 'Laatste muziekanalyse resultaten',
      overviewFeature2: 'Totaal aantal analyses',
      overviewFeature3: 'Snelle toegang tot analyse functionaliteit',
      analyzeDescription: 'Upload en analyseer muziekbestanden voor gedetailleerde audio-informatie.',
      analyzeFeature1: 'Drag & drop of klik om bestanden te uploaden (MP3, WAV, FLAC, M4A)',
      analyzeFeature2: 'Automatische BPM-detectie met confidence score',
      analyzeFeature3: 'Key-detectie (toonsoort) met Krumhansl-Schmuckler algoritme',
      analyzeFeature4: 'Metadata extractie (titel, artiest, album, genre)',
      analyzeFeature5: 'Opslaan van analyses in database voor later gebruik',
      libraryDescription: 'Bekijk en doorzoek al je geanalyseerde muziek in één centrale bibliotheek.',
      libraryFeature1: 'Zoeken op titel, artiest of album',
      libraryFeature2: 'Filteren op BPM, key of genre',
      libraryFeature3: 'Bekijk gedetailleerde analyse-informatie per track',
      mixesDescription: 'Maak en beheer DJ-mixes en sets voor live gebruik.',
      mixesFeature1: 'Creëer nieuwe mixes met meerdere tracks',
      mixesFeature2: 'Bekijk duur en aantal tracks per mix',
      mixesFeature3: 'Organiseer sets voor verschillende gelegenheden',
      analyticsDescription: 'Statistieken en inzichten over je muziekcollectie.',
      analyticsFeature1: 'Totaal aantal tracks en mixes',
      analyticsFeature2: 'Gemiddelde trackduur',
      analyticsFeature3: 'Genreverdeling en activiteitsoverzichten',
      playlistsDescription: 'Bouw en beheer playlists voor verschillende doeleinden.',
      playlistsFeature1: 'Creëer aangepaste playlists',
      playlistsFeature2: 'Voeg tracks toe en verwijder ze',
      playlistsFeature3: 'Organiseer muziek op basis van stemming of gelegenheid',
      soundDescription: 'Configureer audio-instellingen voor optimale playback.',
      soundFeature1: 'Hoofdvolume regeling',
      soundFeature2: 'Koptelefoon cue-instellingen',
      soundFeature3: 'Geavanceerde audio-opties (gain control, latency)',
      profileDescription: 'Beheer je account en persoonlijke instellingen.',
      profileFeature1: 'Persoonlijke profielinformatie',
      profileFeature2: 'E-mail notificatie-instellingen',
      profileFeature3: 'Accountvoorkeuren en privacy-instellingen',
      technicalTitle: 'Technische Details (voor Docenten)',
      technicalDescription: 'Technische informatie over de architectuur en implementatie',
      tech1Title: 'Frontend Technologie',
      tech1Item1: 'Next.js 16 met App Router voor server-side rendering',
      tech1Item2: 'TypeScript voor type safety',
      tech1Item3: 'Tailwind CSS voor styling met custom design system',
      tech1Item4: 'React 19 met client-side state management',
      tech2Title: 'Backend & API',
      tech2Item1: 'Python API op Railway voor audio-analyse (BPM/key detectie)',
      tech2Item2: 'Next.js API routes voor serverless functies',
      tech2Item3: 'Supabase voor database, authenticatie en storage',
      tech3Title: 'Audio Analyse',
      tech3Item1: 'realtime-bpm-analyzer voor BPM-detectie',
      tech3Item2: 'Krumhansl-Schmuckler algoritme voor key-detectie',
      tech3Item3: 'music-metadata voor metadata-extractie uit audiofiles',
    },
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      overview: 'Overview',
      musicAnalysis: 'Music Analysis',
      library: 'Library',
      mixesSets: 'Set Builder',
      analytics: 'Analytics',
      playlistBuilder: 'Playlist Builder',
      soundSettings: 'Sound Settings',
      profileSettings: 'Profile & Settings',
      help: 'Help & Info',
      logout: 'Log out',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      close: 'Close',
    },
    errors: {
      invalidFileType: 'Invalid file type. Use MP3, WAV, FLAC or M4A.',
      fileTooLarge: 'File is too large',
      analysisTimeout: 'Analysis timeout: The analysis is taking too long. Try a smaller file or shorter track (max 2 minutes for large files).',
      analysisTimeoutLarge: 'Analysis timeout: The file is too large or the analysis is taking too long. Try a smaller file or shorter track.',
      noDataReceived: 'No data received from server',
      somethingWentWrong: 'An error occurred',
      loginFailed: 'Something went wrong while logging in',
      registerFailed: 'Something went wrong while creating your account',
      passwordsDoNotMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters long',
      invalidEmailOrPassword: 'Invalid email address or password',
      emailAndPasswordRequired: 'Email address and password are required',
      couldNotFetchRailwayUrl: 'Could not fetch Railway API URL',
      railwayUrlNotConfigured: 'Railway API URL not configured',
      connectionLost: 'Connection to Railway lost. This can happen with very large files. Try a smaller file or wait a moment and try again.',
      analyzing: 'Analyzing...',
    },
    home: {
      title: 'Overview',
      subtitle: 'View your music analyses and insights',
      musicAnalysis: 'Music Analysis',
      analyze: 'Analyze',
      startAnalysis: 'Start Analysis',
      noAnalyses: 'No analyses yet',
      noAnalysesDescription: 'Upload and analyze your first music file to get detailed insights',
      lastAnalysis: 'Last analysis',
      totalAnalyses: 'Total analyses',
      bpmDetection: 'BPM Detection',
      keyDetection: 'Key Detection',
    },
    analyze: {
      title: 'Music Analysis',
      subtitle: 'Upload and analyze your music tracks for detailed insights',
      uploadMusicFile: 'Upload Music File(s)',
      dragDropOrClick: 'Drag files here or click to select',
      selectFile: 'Select File',
      selectFiles: 'Select Files',
      saveToDatabase: 'Save to database after analysis',
      supportedFormats: 'Supported formats: MP3, WAV, FLAC, M4A',
      analyzing: 'File is being analyzed...',
      analyzingBatch: 'Playlist is being analyzed...',
      analyzingDescription: 'This may take a while, especially for BPM and key detection',
      elapsedTime: 'Elapsed time',
      analysisTimeout: '⚠️ Analysis is taking longer than expected. For large files, only the beginning is analyzed.',
      audioWaveform: 'Audio Waveform',
      waveformPlaceholder: 'Waveform visualization will appear here',
      trackInfo: 'Track Information',
      titleLabel: 'Title',
      artist: 'Artist',
      album: 'Album',
      genre: 'Genre',
      duration: 'Duration',
      bitrate: 'Bitrate',
      sampleRate: 'Sample Rate',
      audioAnalysis: 'Audio Analysis',
      energy: 'Energy',
      danceability: 'Danceability',
      valence: 'Valence',
      acousticness: 'Acousticness',
      veryAccurate: 'Very accurate',
      accurate: 'Accurate',
      moderatelyAccurate: 'Moderately accurate',
      batchMode: 'Playlist Analysis',
      batchModeDescription: 'Select multiple files to analyze an entire playlist',
      filesSelected: 'files selected',
      analyzingProgress: 'Analyzing {current} of {total}',
      completed: 'Completed',
      failed: 'Failed',
      viewResults: 'View Results',
    },
    mixes: {
      title: 'Set Builder',
      subtitle: 'Manage and organize your DJ mixes and sets',
      newMix: 'New Mix',
      searchMixes: 'Search mixes...',
      noMixes: 'No mixes yet',
      noMixesDescription: 'Create your first mix to get started',
      tracks: 'tracks',
    },
    analytics: {
      title: 'Analytics',
      subtitle: 'Insights and statistics about your music collection',
      totalTracks: 'Total Tracks',
      totalMixes: 'Total Mixes',
      avgDuration: 'Avg. Duration',
      activeUsers: 'Active Users',
      genreDistribution: 'Genre Distribution',
      activity: 'Activity',
      activityChartPlaceholder: 'Activity chart will appear here',
    },
    playlists: {
      title: 'Playlist Builder',
      subtitle: 'Create and manage your playlists',
      newPlaylist: 'New Playlist',
      searchPlaylists: 'Search playlists...',
      noPlaylists: 'No playlists yet',
      noPlaylistsDescription: 'Create your first playlist to get started',
    },
    library: {
      title: 'Music Library',
      subtitle: 'View all your analyzed music',
      searchMusic: 'Search music...',
      filterByBpm: 'Filter by BPM',
      filterByKey: 'Filter by Key',
      filterByGenre: 'Filter by Genre',
      noMusic: 'No music yet',
      noMusicDescription: 'Upload and analyze your first music file to get started',
      bpm: 'BPM',
      key: 'Key',
      duration: 'Duration',
      artist: 'Artist',
      album: 'Album',
      genre: 'Genre',
      viewDetails: 'View Details',
      clearFilters: 'Clear Filters',
      loading: 'Loading...',
      error: 'Error loading',
      retry: 'Retry',
    },
    profile: {
      title: 'Profile & Settings',
      subtitle: 'Manage your profile and account settings',
      fullName: 'Full Name',
      email: 'Email Address',
      bio: 'Bio',
      bioPlaceholder: 'Tell us about yourself...',
      accountInfo: 'Account Information',
      memberSince: 'Member since',
      accountType: 'Account Type',
      preferences: 'Preferences',
      emailNotifications: 'Email Notifications',
      emailNotificationsDescription: 'Receive updates via email',
      publicProfile: 'Public Profile',
      publicProfileDescription: 'Make your profile visible to others',
      saveChanges: 'Save Changes',
    },
    sound: {
      title: 'Sound Settings',
      subtitle: 'Configure audio settings and sound levels',
      masterVolume: 'Master Volume',
      masterVolumeDescription: 'Total sound level',
      headphoneCue: 'Headphone Cue',
      headphoneCueDescription: 'Volume for headphone preview',
      speakerOutput: 'Speaker Output',
      speakerOutputDescription: 'Volume for speaker output',
      advancedSettings: 'Advanced Settings',
      advancedSettingsDescription: 'Advanced audio configuration',
      autoGainControl: 'Auto Gain Control',
      autoGainControlDescription: 'Automatically adjust sound level',
      lowLatencyMode: 'Low Latency Mode',
      lowLatencyModeDescription: 'Minimize audio delay',
    },
    auth: {
      welcome: 'Welcome back! Log in to continue',
      welcomeBack: 'Welcome back! Log in to continue',
      login: 'Log In',
      loggingIn: 'Logging in...',
      demoLogin: 'Demo Login',
      demoLoginDescription: 'Log in instantly with a demo account (for testing/teachers)',
      register: 'Create Account',
      registering: 'Creating account...',
      email: 'Email Address',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      noAccount: "Don't have an account?",
      createAccount: 'Create an account',
      hasAccount: 'Already have an account?',
      loginHere: 'Log in here',
      accountCreated: 'Account successfully created! You can now log in.',
      loginNow: 'You can now log in',
      termsAgreement: 'By logging in, you agree to our',
      termsOfService: 'Terms of Service',
      privacyPolicy: 'Privacy Policy',
    },
    metadata: {
      appName: 'Opperbeat',
      dashboard: 'Dashboard',
      description: 'DJ analytics and performance dashboard',
      unknown: 'Unknown',
    },
    help: {
      title: 'Help & Documentation',
      subtitle: 'Information about all Opperbeat functionality for users and teachers',
      aboutTitle: 'About Opperbeat',
      aboutDescription: 'Opperbeat is a professional DJ tool for analyzing, organizing and managing music collections.',
      feature1Title: 'Fast Music Analysis',
      feature1Description: 'Automatic BPM and key detection with high accuracy for quick track preparation.',
      feature2Title: 'DJ Workflow',
      feature2Description: 'Organize your tracks, create sets and playlists, and maintain overview during live use.',
      feature3Title: 'Database Integration',
      feature3Description: 'All analyses are stored in Supabase for quick access and synchronization.',
      feature4Title: 'Modern Tech Stack',
      feature4Description: 'Built with Next.js, TypeScript, Supabase and Python for reliable performance.',
      featuresTitle: 'Features per Page',
      featuresDescription: 'Overview of all available functions and how they work',
      overviewDescription: 'The dashboard provides an overview of your latest analyses and statistics.',
      overviewFeature1: 'Latest music analysis results',
      overviewFeature2: 'Total number of analyses',
      overviewFeature3: 'Quick access to analysis functionality',
      analyzeDescription: 'Upload and analyze music files for detailed audio information.',
      analyzeFeature1: 'Drag & drop or click to upload files (MP3, WAV, FLAC, M4A)',
      analyzeFeature2: 'Automatic BPM detection with confidence score',
      analyzeFeature3: 'Key detection (musical key) using Krumhansl-Schmuckler algorithm',
      analyzeFeature4: 'Metadata extraction (title, artist, album, genre)',
      analyzeFeature5: 'Save analyses to database for later use',
      libraryDescription: 'View and search all your analyzed music in one central library.',
      libraryFeature1: 'Search by title, artist or album',
      libraryFeature2: 'Filter by BPM, key or genre',
      libraryFeature3: 'View detailed analysis information per track',
      mixesDescription: 'Create and manage DJ mixes and sets for live use.',
      mixesFeature1: 'Create new mixes with multiple tracks',
      mixesFeature2: 'View duration and number of tracks per mix',
      mixesFeature3: 'Organize sets for different occasions',
      analyticsDescription: 'Statistics and insights about your music collection.',
      analyticsFeature1: 'Total number of tracks and mixes',
      analyticsFeature2: 'Average track duration',
      analyticsFeature3: 'Genre distribution and activity overviews',
      playlistsDescription: 'Build and manage playlists for different purposes.',
      playlistsFeature1: 'Create custom playlists',
      playlistsFeature2: 'Add and remove tracks',
      playlistsFeature3: 'Organize music based on mood or occasion',
      soundDescription: 'Configure audio settings for optimal playback.',
      soundFeature1: 'Master volume control',
      soundFeature2: 'Headphone cue settings',
      soundFeature3: 'Advanced audio options (gain control, latency)',
      profileDescription: 'Manage your account and personal settings.',
      profileFeature1: 'Personal profile information',
      profileFeature2: 'Email notification settings',
      profileFeature3: 'Account preferences and privacy settings',
      technicalTitle: 'Technical Details (for Teachers)',
      technicalDescription: 'Technical information about the architecture and implementation',
      tech1Title: 'Frontend Technology',
      tech1Item1: 'Next.js 16 with App Router for server-side rendering',
      tech1Item2: 'TypeScript for type safety',
      tech1Item3: 'Tailwind CSS for styling with custom design system',
      tech1Item4: 'React 19 with client-side state management',
      tech2Title: 'Backend & API',
      tech2Item1: 'Python API on Railway for audio analysis (BPM/key detection)',
      tech2Item2: 'Next.js API routes for serverless functions',
      tech2Item3: 'Supabase for database, authentication and storage',
      tech3Title: 'Audio Analysis',
      tech3Item1: 'realtime-bpm-analyzer for BPM detection',
      tech3Item2: 'Krumhansl-Schmuckler algorithm for key detection',
      tech3Item3: 'music-metadata for metadata extraction from audio files',
    },
  },
};

