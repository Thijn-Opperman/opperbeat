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
    saveToDatabase: string;
    supportedFormats: string;
    analyzing: string;
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
}

export const translations: Record<Language, Translations> = {
  nl: {
    nav: {
      dashboard: 'Dashboard',
      overview: 'Overzicht',
      musicAnalysis: 'Muziek Analyse',
      library: 'Bibliotheek',
      mixesSets: 'Mixes & Sets',
      analytics: 'Analyses',
      playlistBuilder: 'Playlist Bouwer',
      soundSettings: 'Geluidsinstellingen',
      profileSettings: 'Profiel & Instellingen',
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
      uploadMusicFile: 'Upload Muziekbestand',
      dragDropOrClick: 'Sleep een bestand hierheen of klik om te selecteren',
      selectFile: 'Bestand Selecteren',
      saveToDatabase: 'Opslaan in database na analyse',
      supportedFormats: 'Ondersteunde formaten: MP3, WAV, FLAC, M4A',
      analyzing: 'Bestand wordt geanalyseerd...',
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
    },
    mixes: {
      title: 'Mixes & Sets',
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
  },
  en: {
    nav: {
      dashboard: 'Dashboard',
      overview: 'Overview',
      musicAnalysis: 'Music Analysis',
      library: 'Library',
      mixesSets: 'Mixes & Sets',
      analytics: 'Analytics',
      playlistBuilder: 'Playlist Builder',
      soundSettings: 'Sound Settings',
      profileSettings: 'Profile & Settings',
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
      uploadMusicFile: 'Upload Music File',
      dragDropOrClick: 'Drag a file here or click to select',
      selectFile: 'Select File',
      saveToDatabase: 'Save to database after analysis',
      supportedFormats: 'Supported formats: MP3, WAV, FLAC, M4A',
      analyzing: 'File is being analyzed...',
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
    },
    mixes: {
      title: 'Mixes & Sets',
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
  },
};

