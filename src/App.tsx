import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Play, Calendar, Instagram, Twitter, MessageCircle, Twitch, Mail, MapPin, Star, Shield, Target, Users, Award, Zap, Settings, Sun, Moon, ChevronLeft, ChevronRight, Crown, Flame, Sword } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import AdminPanel from '@/components/AdminPanel';
import BackgroundMusic from '@/components/BackgroundMusic';

// ==========================================
// Página web profesional para jugador de VALORANT
// - Estructura moderna y responsive
// - Componentes reutilizables
// - Animaciones suaves con Framer Motion
// ==========================================

const Section: React.FC<React.PropsWithChildren<{ id?: string; title: string; subtitle?: string }>> = ({ id, title, subtitle, children }) => (
  <section id={id} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
      <div className="mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">{title}</h2>
        {subtitle && <p className="text-muted-foreground mt-2 max-w-2xl text-lg">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  </section>
);

const StatBox: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <Card className="h-full hover:shadow-lg transition-all duration-300 smooth-hover">
    <CardContent className="p-6">
      <p className="text-sm text-muted-foreground font-medium">{label}</p>
      <p className="text-3xl font-bold leading-tight mt-1 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">{value}</p>
      {hint && <p className="text-xs text-muted-foreground mt-2">{hint}</p>}
    </CardContent>
  </Card>
);

const AgentChip: React.FC<{ name: string; role: string }> = ({ name, role }) => (
  <Badge className="text-base py-2 px-4 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 transition-all duration-300">
    {name}<span className="text-xs opacity-80 ml-2">{role}</span>
  </Badge>
);

const ClipCard: React.FC<{ title: string; url: string }> = ({ title, url }) => (
  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 smooth-hover">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg font-semibold line-clamp-1">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <div className="w-full aspect-video rounded-b-xl overflow-hidden bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20">
        <iframe 
          className="w-full h-full" 
          src={url} 
          title={title} 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
        ></iframe>
      </div>
    </CardContent>
  </Card>
);

const MatchRow: React.FC<{ date: string; vs: string; event: string; map: string; result?: string }> = ({ date, vs, event, map, result }) => (
  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-center py-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors duration-200 rounded-lg px-2">
    <div className="flex items-center gap-2 text-sm font-medium"><Calendar className="w-4 h-4 text-red-500"/>{date}</div>
    <div className="text-sm font-semibold">vs {vs}</div>
    <div className="text-sm text-muted-foreground">{event}</div>
    <div className="text-sm text-muted-foreground font-medium">{map}</div>
    {result && (
      <div className={`text-sm font-bold ${
        result === 'W' ? 'text-green-600' : result === 'L' ? 'text-red-600' : 'text-yellow-600'
      }`}>
        {result === 'W' ? 'Victoria' : result === 'L' ? 'Derrota' : 'Empate'}
      </div>
    )}
  </div>
);

const ValorantPlayerPageContent = () => {
  const { 
    playerData, 
    duoPartner, 
    teamMembers, 
    galleryImages, 
    highlightVideos, 
    events,
    isDarkMode, 
    toggleDarkMode 
  } = useAdmin();
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Función para obtener el color del rango
  const getRankColor = (rank: string) => {
    const rankLower = rank.toLowerCase();
    if (rankLower.includes('hierro') || rankLower.includes('iron')) {
      return 'from-gray-600 to-gray-700';
    } else if (rankLower.includes('bronce') || rankLower.includes('bronze')) {
      return 'from-amber-600 to-amber-700';
    } else if (rankLower.includes('plata') || rankLower.includes('silver')) {
      return 'from-gray-300 to-gray-400';
    } else if (rankLower.includes('oro') || rankLower.includes('gold')) {
      return 'from-yellow-400 to-yellow-500';
    } else if (rankLower.includes('platino') || rankLower.includes('platinum')) {
      return 'from-cyan-400 to-cyan-500';
    } else if (rankLower.includes('diamante') || rankLower.includes('diamond')) {
      return 'from-purple-500 to-purple-600';
    } else if (rankLower.includes('ascendente') || rankLower.includes('ascendant')) {
      return 'from-green-400 to-green-500';
    } else if (rankLower.includes('inmortal') || rankLower.includes('immortal')) {
      return 'from-red-500 to-red-600';
    } else if (rankLower.includes('radiante') || rankLower.includes('radiant')) {
      return 'from-yellow-300 to-yellow-400';
    } else {
      return 'from-yellow-400 to-orange-500'; // Color por defecto
    }
  };
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  
  const itemsPerPage = 6;
  const videosPerPage = 2;
  
  const visibleGalleryImages = galleryImages.slice(galleryIndex, galleryIndex + itemsPerPage);
  const visibleVideos = highlightVideos.slice(videoIndex, videoIndex + videosPerPage);
  
  const nextGalleryPage = () => {
    if (galleryIndex + itemsPerPage < galleryImages.length) {
      setGalleryIndex(galleryIndex + itemsPerPage);
    }
  };
  
  const prevGalleryPage = () => {
    if (galleryIndex > 0) {
      setGalleryIndex(Math.max(0, galleryIndex - itemsPerPage));
    }
  };
  
  const nextVideoPage = () => {
    if (videoIndex + videosPerPage < highlightVideos.length) {
      setVideoIndex(videoIndex + videosPerPage);
    }
  };
  
  const prevVideoPage = () => {
    if (videoIndex > 0) {
      setVideoIndex(Math.max(0, videoIndex - videosPerPage));
    }
  };
  
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Keyboard shortcut to show admin button (Ctrl+Shift+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdminButton(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAVEGACIÓN */}
      <header className="sticky top-0 z-50 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg" />
            <div>
              <p className="leading-tight font-bold text-lg">{playerData.name.toUpperCase()}</p>
              <p className="text-xs text-muted-foreground -mt-1">VALORANT Pro Player</p>
            </div>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium">
            <a className="hover:text-red-500 transition-colors duration-200" href="#perfil">Perfil</a>
            <a className="hover:text-red-500 transition-colors duration-200" href="#estadisticas">Estadísticas</a>
            <a className="hover:text-red-500 transition-colors duration-200" href="#agentes">Agentes</a>
            <a className="hover:text-red-500 transition-colors duration-200" href="#clips">Clips</a>
            <a className="hover:text-red-500 transition-colors duration-200" href="#agenda">Agenda</a>
            <a className="hover:text-red-500 transition-colors duration-200" href="#contacto">Contacto</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" className="rounded-xl hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950">
              <Mail className="w-4 h-4 mr-2"/>Contactar
            </Button>
            <Button 
              size="sm" 
              className="rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
              onClick={() => {
                if (playerData.socialLinks.twitch) {
                  window.open(`https://twitch.tv${playerData.socialLinks.twitch.startsWith('/') ? '' : '/'}${playerData.socialLinks.twitch}`, '_blank');
                }
              }}
            >
              <Twitch className="w-4 h-4 mr-2"/>Seguir
            </Button>
            {showAdminButton && (
              <Button
                onClick={() => setIsAdminPanelOpen(true)}
                size="sm"
                variant="outline"
                className="rounded-xl hover:bg-red-50 hover:border-red-200 dark:hover:bg-red-950"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

       {/*HERO SECTION */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-50 via-pink-50 to-purple-50 dark:from-red-950/20 dark:via-pink-950/20 dark:to-purple-950/20"/>
        <div className="absolute inset-0 -z-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10"/>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="grid lg:grid-cols-[1.3fr,0.7fr] gap-12 items-end">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8 }} 
                className="text-5xl sm:text-6xl font-black tracking-tight"
              >
                <span className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {playerData.name.toUpperCase()}
                </span>
                <span className="block text-lg font-medium text-muted-foreground mt-3">
                  {playerData.gameId} • {playerData.role} • {playerData.city} • {playerData.team}
                </span>
              </motion.h1>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex flex-wrap items-center gap-3 mt-6"
              >
                <Badge className={`rounded-xl flex items-center gap-2 bg-gradient-to-r ${getRankColor(playerData.rank)} text-white`}>
                  <Shield className="w-4 h-4"/> {playerData.rank}
                </Badge>
                {/*<Badge variant="secondary" className="rounded-xl">Top 500 LATAM</Badge>*/}
                <Badge variant="outline" className="rounded-xl border-red-200 text-red-600">{playerData.mvpTitle}</Badge>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-6 max-w-2xl text-muted-foreground text-lg leading-relaxed"
              >
                {playerData.bio}
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex gap-4 mt-8"
              >
                <Button 
                  size="lg" 
                  className="rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg"
                  onClick={() => document.getElementById('clips')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Play className="w-5 h-5 mr-2"/> Ver Highlights
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="rounded-2xl hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={() => document.getElementById('perfil')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Portafolio de logros
                </Button>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 30 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Card className="border-border/50 shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Ubicación</p>
                      <p className="font-semibold flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-red-500"/> Veracruz, MX
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-medium">Rol Principal</p>
                      <p className="font-semibold mt-1">Duelista / Flex</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <StatBox label="K/D" value={playerData.kd} />
                    <StatBox label="HS%" value={playerData.hs} />
                    <StatBox label="ACS" value={playerData.acs} />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {playerData.socialLinks.twitch && (
                      <a href={`https://twitch.tv${playerData.socialLinks.twitch.startsWith('/') ? '' : '/'}${playerData.socialLinks.twitch}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-80 hover:opacity-100 hover:text-red-500 transition-all duration-200">
                        <Twitch className="w-4 h-4"/>{playerData.socialLinks.twitch}
                      </a>
                    )}
                    {playerData.socialLinks.discord && (
                      <a href={`https://discord.gg/${playerData.socialLinks.discord.replace('#', '').split('#')[0]}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-80 hover:opacity-100 hover:text-red-500 transition-all duration-200">
                        <MessageCircle className="w-4 h-4"/>{playerData.socialLinks.discord}
                      </a>
                    )}
                    {playerData.socialLinks.twitter && (
                      <a href={`https://twitter.com/${playerData.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-80 hover:opacity-100 hover:text-red-500 transition-all duration-200">
                        <Twitter className="w-4 h-4"/>{playerData.socialLinks.twitter}
                      </a>
                    )}
                    {playerData.socialLinks.instagram && (
                      <a href={`https://instagram.com/${playerData.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 opacity-80 hover:opacity-100 hover:text-red-500 transition-all duration-200">
                        <Instagram className="w-4 h-4"/>{playerData.socialLinks.instagram}
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* PERFIL */}
      <Section id="perfil" title={playerData.profileTitle || 'Perfil Profesional'} subtitle={playerData.profileSubtitle || 'Conoce mi estilo de juego, fortalezas y experiencia competitiva.'}>
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-8 space-y-4">
              <p className="text-lg leading-relaxed">
                {playerData.profileDescription || 'Soy un duelista agresivo especializado en aperturas limpias y control de espacio. Mi experiencia abarca desde ranked hasta torneos profesionales, adaptándome a diferentes composiciones con Phoenix, Reyna, Jett y Raze según las necesidades del equipo.'}
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                {playerData.profileSkills?.map((skill, index) => (
                  <li key={index}>{skill}</li>
                )) || [
                  <li key="default-1">Liderazgo táctico en situaciones de mid-round y lecturas de rotación</li>,
                  <li key="default-2">Entrenamiento diario de aim con rutinas especializadas en Kovaak y Aimlabs</li>,
                  <li key="default-3">Comunicación efectiva y mantener la calma en situaciones de clutch</li>,
                  <li key="default-4">Análisis de demos y adaptación constante al meta competitivo</li>
                ]}
              </ul>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500"/>
                Logros Destacados
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {playerData.achievements.map((achievement, index) => {
                const getIconComponent = (iconName: string) => {
                  switch(iconName) {
                    case 'trophy': return Trophy;
                    case 'star': return Star;
                    case 'award': return Award;
                    case 'medal': return Award;
                    case 'crown': return Crown;
                    case 'fire': return Flame;
                    case 'lightning': return Zap;
                    case 'target': return Target;
                    case 'shield': return Shield;
                    case 'sword': return Sword;
                    default: return Trophy;
                  }
                };
                const getIconColor = (iconName: string) => {
                  switch(iconName) {
                    case 'trophy': return 'text-yellow-500';
                    case 'star': return 'text-blue-500';
                    case 'award': return 'text-orange-500';
                    case 'medal': return 'text-amber-500';
                    case 'crown': return 'text-purple-500';
                    case 'fire': return 'text-red-500';
                    case 'lightning': return 'text-yellow-400';
                    case 'target': return 'text-green-500';
                    case 'shield': return 'text-indigo-500';
                    case 'sword': return 'text-gray-500';
                    default: return 'text-yellow-500';
                  }
                };
                const IconComponent = getIconComponent(achievement.icon);
                const iconColor = getIconColor(achievement.icon);
                return (
                  <motion.div 
                    key={`achievement-${index}-${achievement.text?.slice(0, 10) || index}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <IconComponent className={`w-5 h-5 ${iconColor}`} /> 
                    <span>{achievement.text}</span>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* ESTADÍSTICAS */}
      <Section id="estadisticas" title="Estadísticas Competitivas" subtitle="Métricas de rendimiento en partidos oficiales y ranked.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[{label: "K/D Promedio", value: playerData.kd, hint: "Últimos 90 días competitivos"}, 
            {label: "ADR (Daño)", value: playerData.adr, hint: "Daño promedio por ronda"}, 
            {label: "ACS", value: playerData.acs, hint: "Score promedio combinado"}, 
            {label: "Clutch Rate", value: playerData.clutchRate, hint: "Éxito en situaciones 1vX"}].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <StatBox label={stat.label} value={stat.value} hint={stat.hint}/>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* AGENTES */}
      <Section id="agentes" title="Pool de Agentes" subtitle="Especialización en duelistas con flexibilidad para otros roles.">
        <div className="flex flex-wrap gap-4">
          {playerData.agents.map((agent, index) => (
            <AgentChip key={`${agent.name}-${index}`} name={agent.name} role={agent.role}/>
          ))}
        </div>
      </Section>

      {/* DUO SECTION */}
      {playerData.showDuoSection && duoPartner && (
        <Section id="duo" title="Duo Actual" subtitle="Mi compañero de ranked y competitivo.">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-md mx-auto"
          >
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <CardContent className="p-6 text-center">
                {duoPartner.photo ? (
                  <img 
                    src={duoPartner.photo} 
                    alt={duoPartner.name}
                    className="w-20 h-20 mx-auto mb-4 rounded-full object-cover shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallbackElement = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                      if (fallbackElement) {
                        (fallbackElement as HTMLElement).style.display = 'flex';
                        (fallbackElement as HTMLElement).classList.add('flex');
                      }
                    }}
                  />
                ) : null}
                <div className="fallback-icon w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 items-center justify-center shadow-lg" style={{display: duoPartner.photo ? 'none' : 'flex'}}>
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{duoPartner.name}</h3>
                <p className="text-muted-foreground mb-2">{duoPartner.gameId}</p>
                <div className="flex justify-center gap-2 mb-4">
                  <Badge variant="secondary">{duoPartner.role}</Badge>
                  <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                    {duoPartner.rank}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Section>
      )}

      {/* TEAM PREMIER SECTION */}
      {playerData.showTeamSection && teamMembers.length > 0 && (
        <Section id="team" title="Team Premier" subtitle="Mi equipo competitivo actual.">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-6 text-center">
                    {member.photo ? (
                      <img 
                        src={member.photo} 
                        alt={member.name}
                        className="w-16 h-16 mx-auto mb-4 rounded-full object-cover shadow-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallbackElement = e.currentTarget.parentElement?.querySelector('.fallback-icon');
                          if (fallbackElement) {
                            (fallbackElement as HTMLElement).style.display = 'flex';
                            (fallbackElement as HTMLElement).classList.add('flex');
                          }
                        }}
                      />
                    ) : null}
                    <div className="fallback-icon w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-teal-600 items-center justify-center shadow-lg" style={{display: member.photo ? 'none' : 'flex'}}>
                      <Trophy className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{member.gameId}</p>
                    <div className="flex justify-center gap-2">
                      <Badge variant="outline">{member.role}</Badge>
                      <Badge className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
                        {member.rank}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* CLIPS */}
      {playerData.showVideosSection && (
        <Section id="clips" title="Highlights y Clips" subtitle="Las mejores jugadas y momentos destacados de mi carrera.">
        <div className="relative">
          {/* Navigation Buttons */}
          {highlightVideos.length > videosPerPage && (
            <div className="flex justify-between items-center mb-6">
              <Button
                onClick={prevVideoPage}
                variant="outline"
                disabled={videoIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                {Math.floor(videoIndex / videosPerPage) + 1} de {Math.ceil(highlightVideos.length / videosPerPage)}
              </span>
              <Button
                onClick={nextVideoPage}
                variant="outline"
                disabled={videoIndex + videosPerPage >= highlightVideos.length}
                className="flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-8">
            {visibleVideos.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <ClipCard 
                  title={video.title}
                  url={video.url}
                />
              </motion.div>
            ))}
          </div>
        </div>
        </Section>
      )}

      {/* AGENDA */}
      {playerData.showEventsSection && (
        <Section id="agenda" title="Próximos Eventos" subtitle="Calendario de partidos, streams y apariciones públicas.">
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardContent className="p-0">
            <div className="divide-y">
              {events.map((event) => (
                 <MatchRow 
                   key={event.id}
                   date={event.date} 
                   vs={event.vs} 
                   event={event.event} 
                   map={event.map}
                   result={event.result}
                 />
               ))}
            </div>
          </CardContent>
        </Card>
        </Section>
      )}

      {/* GALERÍA */}
      {playerData.showGallerySection && (
        <Section id="galeria" title="Galería y Colaboraciones" subtitle="Momentos destacados, sponsors y contenido visual.">
        <div className="relative">
          {/* Navigation Buttons */}
          {galleryImages.length > itemsPerPage && (
            <div className="flex justify-between items-center mb-6">
              <Button
                onClick={prevGalleryPage}
                variant="outline"
                disabled={galleryIndex === 0}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                {Math.floor(galleryIndex / itemsPerPage) + 1} de {Math.ceil(galleryImages.length / itemsPerPage)}
              </span>
              <Button
                onClick={nextGalleryPage}
                variant="outline"
                disabled={galleryIndex + itemsPerPage >= galleryImages.length}
                className="flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {visibleGalleryImages.length > 0 ? (
              visibleGalleryImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-[4/3] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <img 
                    src={image.url} 
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))
            ) : (
              [1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-dashed border-border flex items-center justify-center text-sm text-muted-foreground hover:border-red-300 transition-colors duration-200">
                  Imagen {i}
                </div>
              ))
            )}
          </div>
        </div>
        </Section>
      )}

      {/* CONTACTO */}
      <Section id="contacto" title="Contacto Profesional" subtitle="Abierto a oportunidades con equipos, patrocinadores y colaboraciones.">
        <Card className="hover:shadow-xl transition-all duration-300">
          <CardContent className="p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Para propuestas profesionales, colaboraciones o consultas sobre disponibilidad, 
                  no dudes en contactarme. Respondo todas las consultas serias en 24-48 horas.
                </p>
                <div className="flex flex-wrap gap-3">
                  {playerData.socialLinks.email && (
                    <Button className="rounded-xl bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600" onClick={() => window.location.href = `mailto:${playerData.socialLinks.email}`}>
                      <Mail className="w-4 h-4 mr-2"/> Enviar Email
                    </Button>
                  )}
                  {playerData.socialLinks.twitch && (
                    <Button variant="outline" className="rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950" onClick={() => window.open(`https://twitch.tv${playerData.socialLinks.twitch.startsWith('/') ? '' : '/'}${playerData.socialLinks.twitch}`, '_blank')}>
                      <Twitch className="w-4 h-4 mr-2"/> Twitch
                    </Button>
                  )}
                  {playerData.socialLinks.discord && (
                    <Button variant="outline" className="rounded-xl hover:bg-red-50 dark:hover:bg-red-950" onClick={() => window.open(`https://discord.gg/${playerData.socialLinks.discord.replace('#', '').split('#')[0]}`, '_blank')}>
                      <MessageCircle className="w-4 h-4 mr-2"/> Discord
                    </Button>
                  )}
                  {playerData.socialLinks.twitter && (
                    <Button variant="outline" className="rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => window.open(`https://twitter.com/${playerData.socialLinks.twitter.replace('@', '')}`, '_blank')}>
                      <Twitter className="w-4 h-4 mr-2"/> Twitter
                    </Button>
                  )}
                  {playerData.socialLinks.instagram && (
                    <Button variant="outline" className="rounded-xl hover:bg-pink-50 dark:hover:bg-pink-950" onClick={() => window.open(`https://instagram.com/${playerData.socialLinks.instagram.replace('@', '')}`, '_blank')}>
                      <Instagram className="w-4 h-4 mr-2"/> Instagram
                    </Button>
                  )}
                </div>
              </div>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200" 
                    placeholder="Nombre completo"
                  />
                  <input 
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200" 
                    placeholder="Email profesional"
                  />
                </div>
                <input 
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200" 
                  placeholder="Asunto del mensaje"
                />
                <textarea 
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 min-h-[140px] focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200 resize-none" 
                  placeholder="Describe tu propuesta o consulta..."
                />
                <Button className="rounded-xl w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 py-3">
                  Enviar Mensaje
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </Section>

      {/* FOOTER */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-600" />
              <div>
                <p className="font-bold">{playerData.name}</p>
                <p className="text-xs text-muted-foreground">Professional VALORANT Player</p>
              </div>
            </div>
            <p 
              className="text-sm text-muted-foreground cursor-default select-none"
              onClick={() => setIsAdminPanelOpen(true)}
            >
              © {new Date().getFullYear()} {playerData.name} — Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              {playerData.socialLinks.twitch && (
                <a href={`https://twitch.tv${playerData.socialLinks.twitch.startsWith('/') ? '' : '/'}${playerData.socialLinks.twitch}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 hover:text-red-500 transition-all duration-200">
                  <Twitch className="w-4 h-4"/>Twitch
                </a>
              )}
              {playerData.socialLinks.discord && (
                <a href={`https://discord.gg/${playerData.socialLinks.discord.replace('#', '').split('#')[0]}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 hover:text-red-500 transition-all duration-200">
                  <MessageCircle className="w-4 h-4"/>Discord
                </a>
              )}
              {playerData.socialLinks.twitter && (
                <a href={`https://twitter.com/${playerData.socialLinks.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 hover:text-red-500 transition-all duration-200">
                  <Twitter className="w-4 h-4"/>Twitter
                </a>
              )}
              {playerData.socialLinks.instagram && (
                <a href={`https://instagram.com/${playerData.socialLinks.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 hover:text-red-500 transition-all duration-200">
                  <Instagram className="w-4 h-4"/>Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
      
      {/* ADMIN PANEL */}
      <AdminPanel isOpen={isAdminPanelOpen} onClose={() => setIsAdminPanelOpen(false)} />
      

      
      {/* DARK MODE TOGGLE */}
      <Button
        onClick={toggleDarkMode}
        variant="outline"
        className="fixed bottom-4 right-20 z-40 rounded-full w-12 h-12 p-0"
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </Button>
      
      {/* BACKGROUND MUSIC */}
      <BackgroundMusic />
    </div>
  );
};

export default function ValorantPlayerPage() {
  return (
    <AdminProvider>
      <ValorantPlayerPageContent />
    </AdminProvider>
  );
}
