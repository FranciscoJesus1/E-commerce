import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService } from '@/services/api';

interface PlayerData {
  name: string;
  gameId: string;
  team: string;
  city: string;
  role: string;
  rank: string;
  mvpTitle: string;
  kd: string;
  hs: string;
  acs: string;
  adr: string;
  clutchRate: string;
  bio: string;
  achievements: Array<{ icon: string; text: string }>;
  agents: Array<{ name: string; role: string }>;
  socialLinks: {
    twitch: string;
    discord: string;
    twitter: string;
    instagram: string;
    email: string;
  };
  teamLogo: string;
  showTeamSection: boolean;
  showDuoSection: boolean;
  showGallerySection: boolean;
  showVideosSection: boolean;
  showEventsSection: boolean;
  // Campos editables del perfil profesional
  profileTitle: string;
  profileSubtitle: string;
  profileDescription: string;
  profileSkills: string[];
}

interface DuoPartner {
  id: string;
  name: string;
  gameId: string;
  role: string;
  rank: string;
  photo: string;
}

interface TeamMember {
  id: string;
  name: string;
  gameId: string;
  role: string;
  rank: string;
  photo: string;
  socialLinks: {
    twitch: string;
    discord: string;
    twitter: string;
    instagram: string;
  };
}

interface MediaItem {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'video';
}

interface Event {
  id: string;
  date: string;
  vs: string;
  event: string;
  map: string;
  result?: string;
}

interface AdminContextType {
  // Admin state
  isAdminMode: boolean;
  setIsAdminMode: (value: boolean) => void;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Player data
  playerData: PlayerData;
  updatePlayerData: (data: Partial<PlayerData>) => void;
  
  // Duo and team
  duoPartner: DuoPartner | null;
  updateDuoPartner: (duo: DuoPartner | null) => void;
  
  teamMembers: TeamMember[];
  updateTeamMembers: (members: TeamMember[]) => void;
  
  // Media
  galleryImages: MediaItem[];
  updateGalleryImages: (images: MediaItem[]) => void;
  
  highlightVideos: MediaItem[];
  updateHighlightVideos: (videos: MediaItem[]) => void;
  
  // Background music
  backgroundMusic: {
    url: string;
    isPlaying: boolean;
    volume: number;
  };
  updateBackgroundMusic: (music: Partial<{ url: string; isPlaying: boolean; volume: number }>) => void;
  
  // Events
  events: Event[];
  updateEvents: (events: Event[]) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: 'PLAYERNAME',
    gameId: 'PLAYERNAME#TAG',
    team: 'Team FRAG',
    city: 'Monterrey, MX',
    role: 'Duelista / Flex',
    rank: 'Diamante 3',
    mvpTitle: 'S6 MVP',
    kd: '1.38',
    hs: '26%',
    acs: '262',
    adr: '145',
    clutchRate: '34%',
    bio: 'Jugador profesional de VALORANT especializado en entry frags y liderazgo táctico. Experiencia en torneos internacionales y disponible para colaboraciones profesionales.',
    achievements: [
      { icon: 'trophy', text: 'Campeón Torneo LATAM 2024' },
      { icon: 'star', text: 'MVP Liga Regional S6' },
      { icon: 'shield', text: 'Radiant Top 500 LATAM' },
      { icon: 'play', text: '+50 ACEs registrados' }
    ],
    agents: [
      { name: 'Jett', role: 'Duelista' },
      { name: 'Reyna', role: 'Duelista' },
      { name: 'Raze', role: 'Duelista' },
      { name: 'Phoenix', role: 'Duelista' },
      { name: 'Skye', role: 'Iniciador' }
    ],
    socialLinks: {
      twitch: '/playername',
      discord: 'abcd1234',
      twitter: '@playername',
      instagram: '@playername',
      email: 'contact@playername.com'
    },
    teamLogo: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200',
    showTeamSection: true,
    showDuoSection: true,
    showGallerySection: true,
    showVideosSection: true,
    showEventsSection: true,
    // Campos editables del perfil profesional
    profileTitle: 'Perfil Profesional',
    profileSubtitle: 'Conoce mi estilo de juego, fortalezas y experiencia competitiva.',
    profileDescription: 'Soy un duelista agresivo especializado en aperturas limpias y control de espacio. Mi experiencia abarca desde ranked hasta torneos profesionales, adaptándome a diferentes composiciones con Phoenix, Reyna, Jett y Raze según las necesidades del equipo.',
    profileSkills: [
      'Liderazgo táctico en situaciones de mid-round y lecturas de rotación',
      'Entrenamiento diario de aim con rutinas especializadas en Kovaak y Aimlabs',
      'Comunicación efectiva y mantener la calma en situaciones de clutch',
      'Análisis de demos y adaptación constante al meta competitivo'
    ]
  });
  
  const [duoPartner, setDuoPartner] = useState<DuoPartner | null>({
    id: '1',
    name: 'DuoPartner',
    gameId: 'DuoPartner#TAG',
    role: 'Controlador',
    rank: 'Radiant',
    photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'
  });
  
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { 
      id: '1', 
      name: 'Player1', 
      gameId: 'Player1#TAG', 
      role: 'Duelista', 
      rank: 'Immortal 3',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      socialLinks: { twitch: '/player1', discord: 'abcd1111', twitter: '@player1', instagram: '@player1' }
    },
    { 
      id: '2', 
      name: 'Player2', 
      gameId: 'Player2#TAG', 
      role: 'Controlador', 
      rank: 'Radiant',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      socialLinks: { twitch: '/player2', discord: 'abcd2222', twitter: '@player2', instagram: '@player2' }
    },
    { 
      id: '3', 
      name: 'Player3', 
      gameId: 'Player3#TAG', 
      role: 'Iniciador', 
      rank: 'Immortal 3',
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
      socialLinks: { twitch: '/player3', discord: 'abcd3333', twitter: '@player3', instagram: '@player3' }
    },
    { 
      id: '4', 
      name: 'Player4', 
      gameId: 'Player4#TAG', 
      role: 'Centinela', 
      rank: 'Immortal 2',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      socialLinks: { twitch: '/player4', discord: 'abcd4444', twitter: '@player4', instagram: '@player4' }
    }
  ]);
  
  const [galleryImages, setGalleryImages] = useState<MediaItem[]>([
    { id: '1', title: 'Torneo LATAM 2024', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', type: 'image' },
    { id: '2', title: 'Team Photo', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', type: 'image' },
    { id: '3', title: 'MVP Award', url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400', type: 'image' },
    { id: '4', title: 'Gaming Setup', url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=400', type: 'image' }
  ]);
  
  const [highlightVideos, setHighlightVideos] = useState<MediaItem[]>([
    { id: '1', title: 'ACE Perfecto en Ascent', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'video' },
    { id: '2', title: 'Clutch 1v4 en Bind', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'video' },
    { id: '3', title: 'Entry Explosivo en Split', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', type: 'video' }
  ]);
  
  const [backgroundMusic, setBackgroundMusic] = useState({
    url: '',
    isPlaying: false,
    volume: 0.3
  });
  
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      date: '15 Dic',
      vs: 'Team Liquid',
      event: 'VCT Champions',
      map: 'Ascent',
      result: 'W'
    },
    {
      id: '2',
      date: '12 Dic',
      vs: 'Fnatic',
      event: 'VCT Champions',
      map: 'Bind',
      result: 'L'
    },
    {
      id: '3',
      date: '10 Dic',
      vs: 'LOUD',
      event: 'VCT Champions',
      map: 'Haven',
      result: 'W'
    }
  ]);
  
  // Load data from MongoDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from API first, fallback to localStorage if API fails
        try {
          const [playerDataRes, duoPartnerRes, teamMembersRes, galleryImagesRes, highlightVideosRes, eventsRes, backgroundMusicRes, settingsRes] = await Promise.all([
            apiService.getPlayerData(),
            apiService.getDuoPartner(),
            apiService.getTeamMembers(),
            apiService.getGalleryImages(),
            apiService.getHighlightVideos(),
            apiService.getEvents(),
            apiService.getBackgroundMusic(),
            apiService.getSettings()
          ]);

          console.log('API Responses:', { playerDataRes, duoPartnerRes, backgroundMusicRes, settingsRes });
          
          if (playerDataRes && (playerDataRes.name || Object.keys(playerDataRes).length > 1)) {
            console.log('Loading player data from API:', playerDataRes);
            setPlayerData(playerDataRes);
          }
          if (duoPartnerRes && (duoPartnerRes.name || Object.keys(duoPartnerRes).length > 1)) {
            console.log('Loading duo partner from API:', duoPartnerRes);
            setDuoPartner(duoPartnerRes);
          }
          if (teamMembersRes && Array.isArray(teamMembersRes) && teamMembersRes.length > 0) setTeamMembers(teamMembersRes);
          if (galleryImagesRes && Array.isArray(galleryImagesRes) && galleryImagesRes.length > 0) setGalleryImages(galleryImagesRes);
          if (highlightVideosRes && Array.isArray(highlightVideosRes) && highlightVideosRes.length > 0) setHighlightVideos(highlightVideosRes);
          if (eventsRes && Array.isArray(eventsRes) && eventsRes.length > 0) setEvents(eventsRes);
          if (backgroundMusicRes && (backgroundMusicRes.url !== undefined || Object.keys(backgroundMusicRes).length > 1)) {
            console.log('Loading background music from API:', backgroundMusicRes);
            setBackgroundMusic(backgroundMusicRes);
          }
          if (settingsRes && (settingsRes.isDarkMode !== undefined || Object.keys(settingsRes).length > 1)) {
            console.log('Loading settings from API:', settingsRes);
            setIsDarkMode(settingsRes.isDarkMode);
          }
        } catch (apiError) {
          console.warn('API not available, falling back to localStorage:', apiError);
          // Fallback to localStorage
          const saved = localStorage.getItem('valorant-admin-data');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.playerData) setPlayerData(parsed.playerData);
            if (parsed.duoPartner) setDuoPartner(parsed.duoPartner);
            if (parsed.teamMembers) setTeamMembers(parsed.teamMembers);
            if (parsed.galleryImages) setGalleryImages(parsed.galleryImages);
            if (parsed.highlightVideos) setHighlightVideos(parsed.highlightVideos);
            if (parsed.backgroundMusic) setBackgroundMusic(parsed.backgroundMusic);
            if (parsed.events) setEvents(parsed.events);
            if (parsed.isDarkMode !== undefined) setIsDarkMode(parsed.isDarkMode);
          }
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);
  
  // Save data to MongoDB and localStorage whenever state changes
  useEffect(() => {
    // Don't save during initial loading
    if (isLoading) return;
    
    const saveData = async () => {
      try {
        // Save to API
        await Promise.all([
          apiService.savePlayerData(playerData),
          apiService.saveDuoPartner(duoPartner),
          apiService.saveTeamMembers(teamMembers),
          apiService.saveGalleryImages(galleryImages),
          apiService.saveHighlightVideos(highlightVideos),
          apiService.saveEvents(events),
          apiService.saveBackgroundMusic(backgroundMusic),
          apiService.saveSettings({ isDarkMode })
        ]);
      } catch (error) {
        console.warn('Failed to save to API, saving to localStorage only:', error);
      }
      
      // Always save to localStorage as backup
      const dataToSave = {
        playerData,
        duoPartner,
        teamMembers,
        galleryImages,
        highlightVideos,
        backgroundMusic,
        events,
        isDarkMode
      };
      localStorage.setItem('valorant-admin-data', JSON.stringify(dataToSave));
    };

    // Debounce the save operation
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [playerData, duoPartner, teamMembers, galleryImages, highlightVideos, backgroundMusic, events, isDarkMode, isLoading]);
  
  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const updatePlayerData = (data: Partial<PlayerData>) => {
    setPlayerData(prev => ({ ...prev, ...data }));
  };
  
  const updateDuoPartner = (duo: DuoPartner | null) => {
    setDuoPartner(duo);
  };
  
  const updateTeamMembers = (members: TeamMember[]) => {
    setTeamMembers(members);
  };
  
  const updateGalleryImages = (images: MediaItem[]) => {
    setGalleryImages(images);
  };
  
  const updateHighlightVideos = (videos: MediaItem[]) => {
    setHighlightVideos(videos);
  };
  
  const updateBackgroundMusic = (music: Partial<{ url: string; isPlaying: boolean; volume: number }>) => {
    setBackgroundMusic(prev => ({ ...prev, ...music }));
  };
  
  const updateEvents = (newEvents: Event[]) => {
    setEvents(newEvents);
  };
  
  const value: AdminContextType = {
    isAdminMode,
    setIsAdminMode,
    isDarkMode,
    toggleDarkMode,
    playerData,
    updatePlayerData,
    duoPartner,
    updateDuoPartner,
    teamMembers,
    updateTeamMembers,
    galleryImages,
    updateGalleryImages,
    highlightVideos,
    updateHighlightVideos,
    backgroundMusic,
    updateBackgroundMusic,
    events,
    updateEvents
  };
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};
