import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, Plus, Trash2, Edit3, Sun, Moon, Volume2, VolumeX, Play, Pause, Lock, Eye, EyeOff, Key, Clock, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdmin } from '@/contexts/AdminContext';
import { passwordManager } from '@/services/passwordManager';
import { webhookService } from '@/services/webhook';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose }) => {
  const {
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
    updateEvents,
    isDarkMode,
    toggleDarkMode
  } = useAdmin();
  
  const [activeTab, setActiveTab] = useState('player');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookTestResult, setWebhookTestResult] = useState<string | null>(null);
  const [isEditingWebhook, setIsEditingWebhook] = useState(true);
  const [tempWebhookUrl, setTempWebhookUrl] = useState('');
  const [showRecoveryOptions, setShowRecoveryOptions] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [importData, setImportData] = useState('');
  const [generatedRecoveryCode, setGeneratedRecoveryCode] = useState('');
  const [isWebhookConfigured, setIsWebhookConfigured] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{hasBackup: boolean; created?: string}>({hasBackup: false});

  const handleLogin = () => {
    if (passwordManager.validatePassword(loginPassword)) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Contraseña incorrecta o expirada');
    }
  };

  const generateNewPassword = async () => {
    const isConfigured = webhookService.isConfigured();
    if (!isConfigured) {
      setLoginError('Debe configurar el webhook de Discord primero');
      return;
    }

    setIsGeneratingPassword(true);
    try {
      await passwordManager.generateNewPassword();
      setLoginError('');
      alert('Nueva contraseña generada y enviada por Discord!');
    } catch (error) {
      setLoginError('Error generando nueva contraseña');
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const saveWebhookUrl = async () => {
    if (isEditingWebhook) {
      if (tempWebhookUrl.trim()) {
        try {
          const success = await webhookService.setWebhookUrl(tempWebhookUrl.trim(), true);
          if (success) {
            setWebhookUrl(tempWebhookUrl.trim());
            setIsEditingWebhook(false);
            setWebhookTestResult('✅ Webhook guardado correctamente en la base de datos');
          } else {
            setWebhookTestResult('❌ Error guardando el webhook en la base de datos');
          }
        } catch (error) {
          setWebhookTestResult('❌ Error de conexión con la base de datos');
        }
      } else {
        setWebhookTestResult('❌ Debe ingresar una URL de webhook válida');
      }
    } else {
      // Este caso no debería ocurrir normalmente, pero por seguridad
      if (webhookUrl.trim()) {
        try {
          const success = await webhookService.setWebhookUrl(webhookUrl.trim(), true);
          if (success) {
            setWebhookTestResult('✅ URL del webhook guardada exitosamente');
          } else {
            setWebhookTestResult('❌ Error guardando el webhook');
          }
        } catch (error) {
          setWebhookTestResult('❌ Error de conexión con la base de datos');
        }
      } else {
        setWebhookTestResult('❌ URL del webhook vacía');
      }
    }
    setTimeout(() => setWebhookTestResult(null), 3000);
  };

  const testWebhook = async () => {
    const urlToTest = isEditingWebhook ? tempWebhookUrl : webhookUrl;
    if (!urlToTest.trim()) {
      setWebhookTestResult('❌ Debe ingresar una URL de webhook');
      setTimeout(() => setWebhookTestResult(null), 3000);
      return;
    }

    try {
      // Temporalmente usar la URL para probar
      const originalUrl = webhookService.getWebhookUrl();
        await webhookService.setWebhookUrl(tempWebhookUrl, false);
      const success = await webhookService.sendTestMessage();
      
      // Restaurar URL original si estamos en modo edición
      if (isEditingWebhook) {
        await webhookService.setWebhookUrl(originalUrl, false);
      }
      
      setWebhookTestResult(success ? '✅ Webhook funcionando correctamente' : '❌ Error enviando mensaje de test');
    } catch (error) {
      setWebhookTestResult('❌ Error enviando mensaje de test');
    }
    setTimeout(() => setWebhookTestResult(null), 3000);
  };

  const handleEditWebhook = () => {
    setTempWebhookUrl(webhookUrl);
    setIsEditingWebhook(true);
  };

  const handleCancelEditWebhook = () => {
    setTempWebhookUrl(webhookUrl);
    setIsEditingWebhook(false);
  };

  const handleRecoverWebhook = async () => {
    try {
      const recoveredUrl = await webhookService.recoverWebhookFromBackup();
      if (recoveredUrl) {
        if (isEditingWebhook) {
          setTempWebhookUrl(recoveredUrl);
        } else {
          const success = await webhookService.setWebhookUrl(recoveredUrl, false);
          if (success) {
            setWebhookUrl(recoveredUrl);
          }
        }
        setWebhookTestResult('✅ Webhook recuperado desde backup');
      } else {
        setWebhookTestResult('❌ No se encontró backup del webhook');
      }
    } catch (error) {
      setWebhookTestResult('❌ Error recuperando el webhook desde backup');
    }
    setTimeout(() => setWebhookTestResult(null), 3000);
  };

  const handleGenerateRecoveryCode = async () => {
    const isConfigured = webhookService.isConfigured();
    if (!isConfigured) {
      setWebhookTestResult('❌ Debe configurar el webhook primero');
      setTimeout(() => setWebhookTestResult(null), 3000);
      return;
    }
    try {
      const code = await webhookService.generateRecoveryCode();
      setGeneratedRecoveryCode(code);
      setWebhookTestResult('✅ Código de recuperación generado y guardado');
    } catch (error) {
      setWebhookTestResult('❌ Error generando código de recuperación');
    }
    setTimeout(() => setWebhookTestResult(null), 3000);
  };

  const handleRecoverWithCode = async () => {
    if (!recoveryCode.trim()) {
      setWebhookTestResult('❌ Ingrese un código de recuperación');
      setTimeout(() => setWebhookTestResult(null), 3000);
      return;
    }
    
    try {
      const success = await webhookService.recoverWithCode(recoveryCode.trim());
      if (success) {
        const currentUrl = webhookService.getWebhookUrl();
        setWebhookUrl(currentUrl);
        setWebhookTestResult('✅ Webhook recuperado con código');
        setRecoveryCode('');
        setShowRecoveryOptions(false);
      } else {
        setWebhookTestResult('❌ Código de recuperación inválido');
      }
    } catch (error) {
      setWebhookTestResult('❌ Error recuperando con código');
    }
    setTimeout(() => setWebhookTestResult(null), 3000);
  };

  const handleExportConfig = async () => {
    const isConfigured = webhookService.isConfigured();
    if (!isConfigured) {
      setWebhookTestResult('❌ Debe configurar el webhook primero');
      setTimeout(() => setWebhookTestResult(null), 3000);
      return;
    }
    try {
      const exportData = await webhookService.exportConfiguration();
      navigator.clipboard.writeText(exportData).then(() => {
        setWebhookTestResult('✅ Configuración copiada al portapapeles');
      }).catch(() => {
        setWebhookTestResult('✅ Configuración exportada (revise la consola)');
        console.log('Configuración exportada:', exportData);
      });
    } catch (error) {
      setWebhookTestResult('❌ Error exportando configuración');
    }
    setTimeout(() => setWebhookTestResult(null), 3000);
  };

  const handleImportConfig = async () => {
    if (!importData.trim()) {
      setWebhookTestResult('❌ Ingrese los datos de configuración');
      setTimeout(() => setWebhookTestResult(null), 3000);
      return;
    }
    
    try {
      const success = await webhookService.importConfiguration(importData.trim());
      if (success) {
        const currentUrl = webhookService.getWebhookUrl();
        setWebhookUrl(currentUrl);
        setWebhookTestResult('✅ Configuración importada exitosamente');
        setImportData('');
        setShowRecoveryOptions(false);
      } else {
         setWebhookTestResult('❌ Datos de configuración inválidos');
       }
     } catch (error) {
       setWebhookTestResult('❌ Error importando configuración');
     }
     setTimeout(() => setWebhookTestResult(null), 3000);
  };

  const handleEmergencyReset = async () => {
    if (confirm('⚠️ ADVERTENCIA: Esto eliminará TODA la configuración del webhook y no se puede deshacer. ¿Está seguro?')) {
      try {
        await webhookService.emergencyReset();
        setWebhookUrl('');
        setTempWebhookUrl('');
        setIsEditingWebhook(false);
        setShowRecoveryOptions(false);
        setWebhookTestResult('✅ Configuración eliminada completamente');
      } catch (error) {
        setWebhookTestResult('❌ Error eliminando configuración');
      }
      setTimeout(() => setWebhookTestResult(null), 3000);
    }
  };
  const [editingPlayer, setEditingPlayer] = useState(playerData);
  const [editingDuo, setEditingDuo] = useState(duoPartner);
  const [editingTeam, setEditingTeam] = useState(teamMembers);
  const [editingGallery, setEditingGallery] = useState(galleryImages);
  const [editingVideos, setEditingVideos] = useState(highlightVideos);
  const [editingMusic, setEditingMusic] = useState(backgroundMusic);
  const [editingEvents, setEditingEvents] = useState(events);

  // Sync editing states with context data when it changes
  useEffect(() => {
    setEditingPlayer(playerData);
  }, [playerData]);

  useEffect(() => {
    setEditingDuo(duoPartner);
  }, [duoPartner]);

  useEffect(() => {
    setEditingTeam(teamMembers);
  }, [teamMembers]);

  useEffect(() => {
    setEditingGallery(galleryImages);
  }, [galleryImages]);

  useEffect(() => {
    setEditingVideos(highlightVideos);
  }, [highlightVideos]);

  useEffect(() => {
    setEditingMusic(backgroundMusic);
  }, [backgroundMusic]);

  useEffect(() => {
    setEditingEvents(events);
  }, [events]);

  // Load webhook from database on component mount
  useEffect(() => {
    const loadWebhook = async () => {
      try {
        // Get current webhook data
        const currentUrl = webhookService.getWebhookUrl();
        setWebhookUrl(currentUrl);
        setTempWebhookUrl(currentUrl);
        const isConfigured = webhookService.isConfigured();
        setIsWebhookConfigured(isConfigured);
        setIsEditingWebhook(!isConfigured);
        const backup = await webhookService.getBackupInfo();
        setBackupInfo(backup);
      } catch (error) {
        console.error('Error loading webhook data:', error);
      }
    };
    loadWebhook();
  }, []);
  
  const tabs = [
    { id: 'player', label: 'Datos del Jugador', icon: '👤' },
    { id: 'duo', label: 'Duo Actual', icon: '👥' },
    { id: 'team', label: 'Team Premier', icon: '🏆' },
    { id: 'gallery', label: 'Galería', icon: '🖼️' },
    { id: 'videos', label: 'Videos', icon: '🎬' },
    { id: 'events', label: 'Eventos', icon: '📅' },
    { id: 'music', label: 'Música', icon: '🎵' },
    { id: 'theme', label: 'Tema', icon: '🎨' },
    { id: 'security', label: 'Seguridad', icon: '🔐' }
  ];
  
  const saveChanges = () => {
    updatePlayerData(editingPlayer);
    updateDuoPartner(editingDuo);
    updateTeamMembers(editingTeam);
    updateGalleryImages(editingGallery);
    updateHighlightVideos(editingVideos);
    updateBackgroundMusic(editingMusic);
    updateEvents(editingEvents);
    
    // Show success message
    alert('¡Cambios guardados exitosamente!');
  };
  
  const addTeamMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: 'Nuevo Jugador',
      gameId: 'Player#TAG',
      role: 'Duelista',
      rank: 'Immortal',
      photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
      socialLinks: {
        twitch: '',
        discord: '',
        twitter: '',
        instagram: ''
      }
    };
    setEditingTeam([...editingTeam, newMember]);
  };
  
  const removeTeamMember = (id: string) => {
    setEditingTeam(editingTeam.filter(member => member.id !== id));
  };
  
  const addGalleryImage = () => {
    const newImage = {
      id: Date.now().toString(),
      title: 'Nueva Imagen',
      url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
      type: 'image' as const
    };
    setEditingGallery([...editingGallery, newImage]);
  };
  
  const removeGalleryImage = (id: string) => {
    setEditingGallery(editingGallery.filter(img => img.id !== id));
  };
  
  const addVideo = () => {
    const newVideo = {
      id: Date.now().toString(),
      title: 'Nuevo Video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      type: 'video' as const
    };
    setEditingVideos([...editingVideos, newVideo]);
  };
  
  const removeVideo = (id: string) => {
    setEditingVideos(editingVideos.filter(video => video.id !== id));
  };
  
  const addEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      vs: 'Nuevo Oponente',
      event: 'Nuevo Evento',
      map: 'Ascent',
      result: 'W'
    };
    setEditingEvents([...editingEvents, newEvent]);
  };
  
  const removeEvent = (id: string) => {
    setEditingEvents(editingEvents.filter(event => event.id !== id));
  };
  
  const addAgent = () => {
    const newAgent = { name: 'Nuevo Agente', role: 'Duelista' };
    setEditingPlayer({
      ...editingPlayer,
      agents: [...editingPlayer.agents, newAgent]
    });
  };
  
  const removeAgent = (index: number) => {
    const newAgents = editingPlayer.agents.filter((_, i) => i !== index);
    setEditingPlayer({ ...editingPlayer, agents: newAgents });
  };
  
  const addAchievement = () => {
    const newAchievement = { icon: 'trophy', text: 'Nuevo Logro' };
    setEditingPlayer({
      ...editingPlayer,
      achievements: [...editingPlayer.achievements, newAchievement]
    });
  };
  
  const removeAchievement = (index: number) => {
    const newAchievements = editingPlayer.achievements.filter((_, i) => i !== index);
    setEditingPlayer({ ...editingPlayer, achievements: newAchievements });
  };
  
  if (!isOpen) return null;

  // Login screen
  if (!isAuthenticated) {
    const passwordInfo = passwordManager.getPasswordInfo();
    const needsPassword = passwordManager.needsNewPassword();

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background border rounded-2xl shadow-2xl w-full max-w-md p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Panel de Administrador</h2>
              <p className="text-muted-foreground">Sistema de contraseñas dinámicas</p>
            </div>

            {/* Estado de la contraseña */}
            <div className="mb-6 p-4 rounded-lg bg-muted">
              {passwordInfo.hasPassword ? (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">Contraseña activa</span>
                  <span className="text-muted-foreground">- Expira en {passwordInfo.timeRemaining}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Key className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-600 font-medium">No hay contraseña activa</span>
                </div>
              )}
            </div>

            {/* Configuración del webhook (solo si no hay contraseña) */}
            {needsPassword && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Discord Webhook</h3>
                  {!isEditingWebhook && isWebhookConfigured && (
                    <Button onClick={handleEditWebhook} size="sm" variant="ghost" className="text-xs">
                      <Edit3 className="w-3 h-3 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>
                
                {isEditingWebhook ? (
                  <>
                    <input
                      type="url"
                      value={tempWebhookUrl}
                      onChange={(e) => setTempWebhookUrl(e.target.value)}
                      placeholder="https://discord.com/api/webhooks/..."
                      className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-background"
                    />
                    <div className="flex gap-2">
                      <Button onClick={saveWebhookUrl} size="sm" variant="outline" className="flex-1">
                        <Save className="w-3 h-3 mr-1" />
                        Guardar
                      </Button>
                      <Button onClick={testWebhook} size="sm" variant="outline" className="flex-1">
                        <Send className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleRecoverWebhook} size="sm" variant="ghost" className="flex-1 text-xs">
                        🔄 Recuperar
                      </Button>
                      <Button onClick={handleCancelEditWebhook} size="sm" variant="ghost" className="flex-1 text-xs">
                        Cancelar
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => setShowRecoveryOptions(!showRecoveryOptions)} 
                        size="sm" 
                        variant="ghost" 
                        className="flex-1 text-xs text-orange-600 hover:text-orange-700"
                      >
                        🆘 Opciones de Emergencia
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {isWebhookConfigured ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Webhook configurado</span>
                      </div>
                    ) : (
                      <span>Webhook no configurado</span>
                    )}
                  </div>
                )}
                
                {webhookTestResult && (
                  <p className="text-xs text-center p-2 rounded bg-muted">{webhookTestResult}</p>
                )}
                
                {/* Opciones de Recuperación en Login */}
                {showRecoveryOptions && (
                  <div className="mt-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 space-y-3">
                    <div className="text-center">
                      <h4 className="font-medium text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                        🆘 Opciones de Recuperación de Emergencia
                      </h4>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                        Use estas opciones solo si perdió completamente el acceso al webhook.
                      </p>
                    </div>
                    
                    {/* Recuperar con Código */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                        Código de Recuperación:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={recoveryCode}
                          onChange={(e) => setRecoveryCode(e.target.value)}
                          placeholder="Ingrese código de emergencia"
                          className="flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white dark:bg-gray-800"
                        />
                        <Button onClick={handleRecoverWithCode} size="sm" variant="outline" className="text-xs">
                          🔄
                        </Button>
                      </div>
                    </div>
                    
                    {/* Importar Configuración */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                        Importar Configuración:
                      </label>
                      <div className="space-y-2">
                        <textarea
                          value={importData}
                          onChange={(e) => setImportData(e.target.value)}
                          placeholder="Pegue datos de configuración exportados"
                          className="w-full px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white dark:bg-gray-800 h-16 resize-none"
                        />
                        <Button onClick={handleImportConfig} size="sm" variant="outline" className="w-full text-xs">
                          📥 Importar
                        </Button>
                      </div>
                    </div>
                    
                    {/* Reset de Emergencia */}
                    <div className="pt-2 border-t border-yellow-300 dark:border-yellow-700">
                      <Button 
                        onClick={handleEmergencyReset} 
                        size="sm" 
                        variant="destructive" 
                        className="w-full text-xs"
                      >
                        🚨 Reset Completo del Sistema
                      </Button>
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1 text-center">
                        ⚠️ Eliminará TODA la configuración permanentemente
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="space-y-4">
              {/* Campo de contraseña */}
              <div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Contraseña"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-background"
                  disabled={needsPassword}
                />
                {loginError && (
                  <p className="text-red-500 text-sm mt-2">{loginError}</p>
                )}
              </div>
              
              <div className="flex gap-2">
                {needsPassword ? (
                  <Button 
                    onClick={generateNewPassword} 
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={isGeneratingPassword || !isWebhookConfigured}
                  >
                    {isGeneratingPassword ? (
                      <>Generando...</>
                    ) : (
                      <><Key className="w-4 h-4 mr-2" />Generar Contraseña</>
                    )}
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleLogin} className="flex-1 bg-red-600 hover:bg-red-700">
                      Acceder
                    </Button>
                    <Button 
                      onClick={generateNewPassword} 
                      variant="outline" 
                      disabled={isGeneratingPassword || !webhookUrl}
                      title="Generar nueva contraseña"
                    >
                      <Key className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-background border rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Panel de Administrador</h2>
                <p className="text-sm text-muted-foreground">Personaliza tu página web</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={saveChanges} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex h-[calc(90vh-100px)]">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/30 p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Player Data Tab */}
              {activeTab === 'player' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold mb-4">Información del Jugador</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nombre del Jugador</label>
                      <input
                        type="text"
                        value={editingPlayer.name}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ID de VALORANT</label>
                      <input
                        type="text"
                        value={editingPlayer.gameId}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, gameId: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                        placeholder="Nombre#TAG"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Equipo</label>
                      <input
                        type="text"
                        value={editingPlayer.team}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, team: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Ciudad</label>
                      <input
                        type="text"
                        value={editingPlayer.city}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, city: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rol</label>
                      <input
                        type="text"
                        value={editingPlayer.role}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, role: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rango</label>
                      <input
                        type="text"
                        value={editingPlayer.rank}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, rank: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                        placeholder="Ej: Diamante 3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Título MVP</label>
                      <input
                        type="text"
                        value={editingPlayer.mvpTitle}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, mvpTitle: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                        placeholder="Ej: S6 MVP"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Biografía</label>
                    <textarea
                      value={editingPlayer.bio}
                      onChange={(e) => setEditingPlayer({ ...editingPlayer, bio: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  
                  {/* Perfil Profesional */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4">Perfil Profesional</h4>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Título del Perfil</label>
                        <input
                          type="text"
                          value={editingPlayer.profileTitle || ''}
                           onChange={(e) => setEditingPlayer({ ...editingPlayer, profileTitle: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          placeholder="Ej: Perfil Profesional"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subtítulo del Perfil</label>
                        <input
                          type="text"
                          value={editingPlayer.profileSubtitle || ''}
                           onChange={(e) => setEditingPlayer({ ...editingPlayer, profileSubtitle: e.target.value })}
                           className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                           placeholder="Ej: Conoce mi estilo de juego, fortalezas y experiencia competitiva."
                         />
                       </div>
                       
                       <div>
                         <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Descripción del Perfil</label>
                         <textarea
                           value={editingPlayer.profileDescription || ''}
                           onChange={(e) => setEditingPlayer({ ...editingPlayer, profileDescription: e.target.value })}
                           rows={4}
                           className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                           placeholder="Describe tu estilo de juego y experiencia..."
                         />
                       </div>
                       
                       <div>
                         <div className="flex items-center justify-between mb-4">
                           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Habilidades</label>
                           <Button
                             onClick={() => {
                               const newSkills = [...(editingPlayer.profileSkills || []), ''];
                               setEditingPlayer({ ...editingPlayer, profileSkills: newSkills });
                             }}
                             size="sm"
                             variant="outline"
                           >
                             <Plus className="w-4 h-4 mr-2" />
                             Agregar Habilidad
                           </Button>
                         </div>
                         <div className="space-y-2">
                           {(editingPlayer.profileSkills || []).map((skill, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={skill}
                                onChange={(e) => {
                                  const newSkills = [...editingPlayer.profileSkills];
                                  newSkills[index] = e.target.value;
                                  setEditingPlayer({ ...editingPlayer, profileSkills: newSkills });
                                }}
                                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                placeholder="Describe una habilidad o fortaleza..."
                              />
                              <Button
                                onClick={() => {
                                   const newSkills = (editingPlayer.profileSkills || []).filter((_, i) => i !== index);
                                   setEditingPlayer({ ...editingPlayer, profileSkills: newSkills });
                                 }}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">K/D</label>
                      <input
                        type="text"
                        value={editingPlayer.kd}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, kd: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">HS%</label>
                      <input
                        type="text"
                        value={editingPlayer.hs}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, hs: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ACS</label>
                      <input
                        type="text"
                        value={editingPlayer.acs}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, acs: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Clutch %</label>
                      <input
                        type="text"
                        value={editingPlayer.clutchRate}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, clutchRate: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                  </div>
                  
                  {/* Agents */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Agentes</h4>
                      <Button onClick={addAgent} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Agente
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {editingPlayer.agents.map((agent, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={agent.name}
                            onChange={(e) => {
                              const newAgents = [...editingPlayer.agents];
                              newAgents[index].name = e.target.value;
                              setEditingPlayer({ ...editingPlayer, agents: newAgents });
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            placeholder="Nombre del agente"
                          />
                          <input
                            type="text"
                            value={agent.role}
                            onChange={(e) => {
                              const newAgents = [...editingPlayer.agents];
                              newAgents[index].role = e.target.value;
                              setEditingPlayer({ ...editingPlayer, agents: newAgents });
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            placeholder="Rol"
                          />
                          <Button
                            onClick={() => removeAgent(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Achievements */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold">Logros</h4>
                      <Button onClick={addAchievement} size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Logro
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {editingPlayer.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <select
                            value={achievement.icon}
                            onChange={(e) => {
                              const newAchievements = [...editingPlayer.achievements];
                              newAchievements[index].icon = e.target.value;
                              setEditingPlayer({ ...editingPlayer, achievements: newAchievements });
                            }}
                            className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          >
                            <option value="trophy">🏆 Trofeo</option>
                            <option value="star">⭐ Estrella</option>
                            <option value="award">🥇 Premio</option>
                            <option value="medal">🏅 Medalla</option>
                            <option value="crown">👑 Corona</option>
                            <option value="fire">🔥 Fuego</option>
                            <option value="lightning">⚡ Rayo</option>
                            <option value="target">🎯 Diana</option>
                            <option value="shield">🛡️ Escudo</option>
                            <option value="sword">⚔️ Espada</option>
                          </select>
                          <input
                            type="text"
                            value={achievement.text}
                            onChange={(e) => {
                              const newAchievements = [...editingPlayer.achievements];
                              newAchievements[index].text = e.target.value;
                              setEditingPlayer({ ...editingPlayer, achievements: newAchievements });
                            }}
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            placeholder="Descripción del logro"
                          />
                          <Button
                            onClick={() => removeAchievement(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Team Logo and Settings */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Logo del Equipo (URL)</label>
                      <input
                        type="url"
                        value={editingPlayer.teamLogo}
                        onChange={(e) => setEditingPlayer({ ...editingPlayer, teamLogo: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                        placeholder="https://ejemplo.com/logo.png"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPlayer.showTeamSection}
                          onChange={(e) => setEditingPlayer({ ...editingPlayer, showTeamSection: e.target.checked })}
                          className="w-4 h-4 text-red-600 bg-gray-100 border-gray-300 rounded focus:ring-red-500 dark:focus:ring-red-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mostrar sección de equipo</span>
                      </label>
                    </div>
                  </div>

                  {/* Social Media Links */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Redes Sociales</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Twitch</label>
                        <input
                          type="text"
                          value={editingPlayer.socialLinks.twitch}
                          onChange={(e) => setEditingPlayer({ 
                            ...editingPlayer, 
                            socialLinks: { ...editingPlayer.socialLinks, twitch: e.target.value }
                          })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          placeholder="/tu_usuario_twitch"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Discord</label>
                        <input
                          type="text"
                          value={editingPlayer.socialLinks.discord}
                          onChange={(e) => setEditingPlayer({ 
                            ...editingPlayer, 
                            socialLinks: { ...editingPlayer.socialLinks, discord: e.target.value }
                          })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          placeholder="usuario#1234"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Twitter</label>
                        <input
                          type="text"
                          value={editingPlayer.socialLinks.twitter}
                          onChange={(e) => setEditingPlayer({ 
                            ...editingPlayer, 
                            socialLinks: { ...editingPlayer.socialLinks, twitter: e.target.value }
                          })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          placeholder="@tu_usuario_twitter"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Instagram</label>
                        <input
                          type="text"
                          value={editingPlayer.socialLinks.instagram}
                          onChange={(e) => setEditingPlayer({ 
                            ...editingPlayer, 
                            socialLinks: { ...editingPlayer.socialLinks, instagram: e.target.value }
                          })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          placeholder="@tu_usuario_instagram"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
                        <input
                          type="email"
                          value={editingPlayer.socialLinks.email}
                          onChange={(e) => setEditingPlayer({ 
                            ...editingPlayer, 
                            socialLinks: { ...editingPlayer.socialLinks, email: e.target.value }
                          })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Duo Tab */}
              {activeTab === 'duo' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Duo Actual</h3>
                    <Button
                      onClick={() => setEditingPlayer({ ...editingPlayer, showDuoSection: !editingPlayer.showDuoSection })}
                      variant="outline"
                      size="sm"
                    >
                      {editingPlayer.showDuoSection ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Ocultar Sección
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Mostrar Sección
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {editingDuo ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Foto (URL)</label>
                        <input
                          type="url"
                          value={editingDuo.photo}
                          onChange={(e) => setEditingDuo({ ...editingDuo, photo: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          placeholder="https://ejemplo.com/foto.jpg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nombre</label>
                          <input
                            type="text"
                            value={editingDuo.name}
                            onChange={(e) => setEditingDuo({ ...editingDuo, name: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ID del Juego</label>
                          <input
                            type="text"
                            value={editingDuo.gameId}
                            onChange={(e) => setEditingDuo({ ...editingDuo, gameId: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rol</label>
                          <input
                            type="text"
                            value={editingDuo.role}
                            onChange={(e) => setEditingDuo({ ...editingDuo, role: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rango</label>
                          <input
                            type="text"
                            value={editingDuo.rank}
                            onChange={(e) => setEditingDuo({ ...editingDuo, rank: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No tienes un duo configurado</p>
                      <Button
                        onClick={() => setEditingDuo({
                          id: '1',
                          name: 'Nuevo Duo',
                          gameId: 'Player#TAG',
                          role: 'Controlador',
                          rank: 'Immortal',
                          photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200'
                        })}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Duo
                      </Button>
                    </div>
                  )}
                  
                  {editingDuo && (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => setEditingDuo(null)}
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar Duo
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Team Tab */}
              {activeTab === 'team' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Team Premier</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setEditingPlayer({ ...editingPlayer, showTeamSection: !editingPlayer.showTeamSection })}
                        variant="outline"
                        size="sm"
                      >
                        {editingPlayer.showTeamSection ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Ocultar Sección
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Mostrar Sección
                          </>
                        )}
                      </Button>
                      <Button onClick={addTeamMember}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Miembro
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                      {editingTeam && editingTeam.length > 0 ? (
                        editingTeam.map((member, index) => (
                          <Card key={member.id}>
                            <CardContent className="p-4">
                              <div className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Foto (URL)</label>
                                <input
                                  type="url"
                                  value={member.photo}
                                  onChange={(e) => {
                                    const newTeam = [...editingTeam];
                                    newTeam[index].photo = e.target.value;
                                    setEditingTeam(newTeam);
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                  placeholder="https://ejemplo.com/foto.jpg"
                                />
                              </div>
                            <div className="grid grid-cols-4 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Nombre</label>
                                <input
                                  type="text"
                                  value={member.name}
                                  onChange={(e) => {
                                    const newTeam = [...editingTeam];
                                    newTeam[index].name = e.target.value;
                                    setEditingTeam(newTeam);
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">ID del Juego</label>
                                <input
                                  type="text"
                                  value={member.gameId}
                                  onChange={(e) => {
                                    const newTeam = [...editingTeam];
                                    newTeam[index].gameId = e.target.value;
                                    setEditingTeam(newTeam);
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rol</label>
                                <input
                                  type="text"
                                  value={member.role}
                                  onChange={(e) => {
                                    const newTeam = [...editingTeam];
                                    newTeam[index].role = e.target.value;
                                    setEditingTeam(newTeam);
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Rango</label>
                                <input
                                  type="text"
                                  value={member.rank}
                                  onChange={(e) => {
                                    const newTeam = [...editingTeam];
                                    newTeam[index].rank = e.target.value;
                                    setEditingTeam(newTeam);
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                />
                              </div>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Redes Sociales</h5>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Twitch</label>
                                  <input
                                    type="text"
                                    value={member.socialLinks?.twitch || ''}
                                    onChange={(e) => {
                                      const newTeam = [...editingTeam];
                                      if (!newTeam[index].socialLinks) {
                                        newTeam[index].socialLinks = { twitch: '', discord: '', twitter: '', instagram: '' };
                                      }
                                      newTeam[index].socialLinks.twitch = e.target.value;
                                      setEditingTeam(newTeam);
                                    }}
                                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                    placeholder="/usuario"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Discord</label>
                                  <input
                                    type="text"
                                    value={member.socialLinks?.discord || ''}
                                    onChange={(e) => {
                                      const newTeam = [...editingTeam];
                                      if (!newTeam[index].socialLinks) {
                                        newTeam[index].socialLinks = { twitch: '', discord: '', twitter: '', instagram: '' };
                                      }
                                      newTeam[index].socialLinks.discord = e.target.value;
                                      setEditingTeam(newTeam);
                                    }}
                                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                    placeholder="usuario#1234"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Twitter</label>
                                  <input
                                    type="text"
                                    value={member.socialLinks?.twitter || ''}
                                    onChange={(e) => {
                                      const newTeam = [...editingTeam];
                                      if (!newTeam[index].socialLinks) {
                                        newTeam[index].socialLinks = { twitch: '', discord: '', twitter: '', instagram: '' };
                                      }
                                      newTeam[index].socialLinks.twitter = e.target.value;
                                      setEditingTeam(newTeam);
                                    }}
                                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                    placeholder="@usuario"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">Instagram</label>
                                  <input
                                    type="text"
                                    value={member.socialLinks?.instagram || ''}
                                    onChange={(e) => {
                                      const newTeam = [...editingTeam];
                                      if (!newTeam[index].socialLinks) {
                                        newTeam[index].socialLinks = { twitch: '', discord: '', twitter: '', instagram: '' };
                                      }
                                      newTeam[index].socialLinks.instagram = e.target.value;
                                      setEditingTeam(newTeam);
                                    }}
                                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                    placeholder="@usuario"
                                  />
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                onClick={() => removeTeamMember(member.id)}
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No hay miembros en el equipo</p>
                      <Button onClick={addTeamMember}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Primer Miembro
                      </Button>
                    </div>
                  )}
                    </div>
                </div>
              )}
              
              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Galería de Imágenes</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setEditingPlayer({ 
                          ...editingPlayer, 
                          showGallerySection: !editingPlayer.showGallerySection 
                        })}
                        variant="outline"
                        size="sm"
                      >
                        {editingPlayer.showGallerySection ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Ocultar Sección
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Mostrar Sección
                          </>
                        )}
                      </Button>
                      <Button onClick={addGalleryImage}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Imagen
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {editingGallery.map((image, index) => (
                      <Card key={image.id}>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                              <img
                                src={image.url}
                                alt={image.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400';
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Título</label>
                              <input
                                type="text"
                                value={image.title}
                                onChange={(e) => {
                                  const newGallery = [...editingGallery];
                                  newGallery[index].title = e.target.value;
                                  setEditingGallery(newGallery);
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">URL de la Imagen</label>
                              <input
                                type="url"
                                value={image.url}
                                onChange={(e) => {
                                  const newGallery = [...editingGallery];
                                  newGallery[index].url = e.target.value;
                                  setEditingGallery(newGallery);
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              />
                            </div>
                            <Button
                              onClick={() => removeGalleryImage(image.id)}
                              variant="outline"
                              className="w-full text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Eliminar Imagen
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Videos y Highlights</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setEditingPlayer({ 
                          ...editingPlayer, 
                          showVideosSection: !editingPlayer.showVideosSection 
                        })}
                        variant="outline"
                        size="sm"
                      >
                        {editingPlayer.showVideosSection ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Ocultar Sección
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Mostrar Sección
                          </>
                        )}
                      </Button>
                      <Button onClick={addVideo}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Video
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {editingVideos.map((video, index) => (
                      <Card key={video.id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                              <iframe
                                src={video.url}
                                title={video.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                              ></iframe>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Título del Video</label>
                                <input
                                  type="text"
                                  value={video.title}
                                  onChange={(e) => {
                                    const newVideos = [...editingVideos];
                                    newVideos[index].title = e.target.value;
                                    setEditingVideos(newVideos);
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">URL del Video (YouTube Embed)</label>
                                <input
                                  type="url"
                                  value={video.url}
                                  onChange={(e) => {
                                    const newVideos = [...editingVideos];
                                    newVideos[index].url = e.target.value;
                                    setEditingVideos(newVideos);
                                  }}
                                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                  placeholder="https://www.youtube.com/embed/VIDEO_ID"
                                />
                              </div>
                              <Button
                                onClick={() => removeVideo(video.id)}
                                variant="outline"
                                className="w-full text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Eliminar Video
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Events Tab */}
              {activeTab === 'events' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Eventos y Partidas</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setEditingPlayer({ 
                          ...editingPlayer, 
                          showEventsSection: !editingPlayer.showEventsSection 
                        })}
                        variant="outline"
                        size="sm"
                      >
                        {editingPlayer.showEventsSection ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Ocultar Sección
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Mostrar Sección
                          </>
                        )}
                      </Button>
                      <Button onClick={addEvent}>
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Evento
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {editingEvents.map((event, index) => (
                      <Card key={event.id}>
                        <CardContent className="p-4">
                          <div className="grid grid-cols-5 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Fecha</label>
                              <input
                                type="date"
                                value={event.date}
                                onChange={(e) => {
                                  const newEvents = [...editingEvents];
                                  newEvents[index].date = e.target.value;
                                  setEditingEvents(newEvents);
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Oponente</label>
                              <input
                                type="text"
                                value={event.vs}
                                onChange={(e) => {
                                  const newEvents = [...editingEvents];
                                  newEvents[index].vs = e.target.value;
                                  setEditingEvents(newEvents);
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Evento</label>
                              <input
                                type="text"
                                value={event.event}
                                onChange={(e) => {
                                  const newEvents = [...editingEvents];
                                  newEvents[index].event = e.target.value;
                                  setEditingEvents(newEvents);
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Mapa</label>
                              <input
                                type="text"
                                value={event.map}
                                onChange={(e) => {
                                  const newEvents = [...editingEvents];
                                  newEvents[index].map = e.target.value;
                                  setEditingEvents(newEvents);
                                }}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Resultado</label>
                              <div className="flex gap-2">
                                <select
                                  value={event.result}
                                  onChange={(e) => {
                                    const newEvents = [...editingEvents];
                                    newEvents[index].result = e.target.value;
                                    setEditingEvents(newEvents);
                                  }}
                                  className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                >
                                  <option value="W">Victoria</option>
                                  <option value="L">Derrota</option>
                                  <option value="D">Empate</option>
                                </select>
                                <Button
                                  onClick={() => removeEvent(event.id)}
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Music Tab */}
              {activeTab === 'music' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold mb-4">Música de Fondo</h3>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">URL del Archivo de Audio (.mp3, .mp4, etc.)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingMusic.url}
                              onChange={(e) => setEditingMusic({ ...editingMusic, url: e.target.value })}
                              className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                              placeholder="/musica.mp3 (archivo local) o https://ejemplo.com/musica.mp3 (URL externa)"
                            />
                            <Button
                              onClick={() => setEditingMusic({ ...editingMusic, url: '/musica.mp3' })}
                              variant="outline"
                              size="sm"
                              className="whitespace-nowrap"
                            >
                              Usar Archivo Local
                            </Button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Volumen: {Math.round(editingMusic.volume * 100)}%</label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={editingMusic.volume}
                            onChange={(e) => setEditingMusic({ ...editingMusic, volume: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={() => setEditingMusic({ ...editingMusic, isPlaying: !editingMusic.isPlaying })}
                            variant={editingMusic.isPlaying ? "default" : "outline"}
                          >
                            {editingMusic.isPlaying ? (
                              <><Pause className="w-4 h-4 mr-2" /> Pausar</>
                            ) : (
                              <><Play className="w-4 h-4 mr-2" /> Reproducir</>
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => setEditingMusic({ ...editingMusic, volume: editingMusic.volume > 0 ? 0 : 0.3 })}
                            variant="outline"
                          >
                            {editingMusic.volume > 0 ? (
                              <><Volume2 className="w-4 h-4 mr-2" /> Silenciar</>
                            ) : (
                              <><VolumeX className="w-4 h-4 mr-2" /> Activar Sonido</>
                            )}
                          </Button>
                        </div>
                        
                        {editingMusic.url && (
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-2">Vista previa:</p>
                            <audio
                              controls
                              src={editingMusic.url}
                              className="w-full"
                            >
                              Tu navegador no soporta el elemento de audio.
                            </audio>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Theme Tab */}
              {activeTab === 'theme' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold mb-4">Configuración del Tema</h3>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold">Modo Oscuro</h4>
                          <p className="text-sm text-muted-foreground">Cambia entre tema claro y oscuro</p>
                        </div>
                        <Button
                          onClick={toggleDarkMode}
                          variant={isDarkMode ? "default" : "outline"}
                          size="lg"
                        >
                          {isDarkMode ? (
                            <><Moon className="w-5 h-5 mr-2" /> Modo Oscuro</>
                          ) : (
                            <><Sun className="w-5 h-5 mr-2" /> Modo Claro</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h4 className="text-lg font-semibold mb-4">Vista Previa del Tema</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border bg-background">
                          <h5 className="font-semibold mb-2">Tema Actual</h5>
                          <p className="text-sm text-muted-foreground mb-3">Así se ve tu página actualmente</p>
                          <div className="flex gap-2">
                            <Badge>Radiant</Badge>
                            <Badge variant="secondary">Top 500</Badge>
                          </div>
                        </div>
                        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>
                          <h5 className="font-semibold mb-2">Tema Alternativo</h5>
                          <p className="text-gray-500 mb-3 text-sm">Así se vería con el otro tema</p>
                          <div className="flex gap-2">
                            <span className="px-2 py-1 rounded-full bg-red-500 text-white text-xs">Radiant</span>
                            <span className="px-2 py-1 rounded-full bg-gray-500 text-white text-xs">Top 500</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold mb-4">Configuración de Seguridad</h3>
                  
                  {/* Estado actual de la contraseña */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Estado de la Contraseña
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const passwordInfo = passwordManager.getPasswordInfo();
                        return passwordInfo.hasPassword ? (
                          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-green-600" />
                              <span className="font-medium text-green-800 dark:text-green-200">Contraseña Activa</span>
                            </div>
                            <p className="text-sm text-green-700 dark:text-green-300">
                              Expira en: {passwordInfo.timeRemaining}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              Fecha de expiración: {passwordInfo.expiresAt?.toLocaleString('es-ES')}
                            </p>
                          </div>
                        ) : (
                          <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center gap-2 mb-2">
                              <Key className="w-4 h-4 text-orange-600" />
                              <span className="font-medium text-orange-800 dark:text-orange-200">Sin Contraseña Activa</span>
                            </div>
                            <p className="text-sm text-orange-700 dark:text-orange-300">
                              Necesitas generar una nueva contraseña para acceder al panel.
                            </p>
                          </div>
                        );
                      })()}
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={generateNewPassword}
                          disabled={isGeneratingPassword || !isWebhookConfigured}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isGeneratingPassword ? (
                            <>Generando...</>
                          ) : (
                            <><Key className="w-4 h-4 mr-2" />Generar Nueva Contraseña</>
                          )}
                        </Button>
                        <Button 
                          onClick={() => passwordManager.expireCurrentPassword()}
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          Expirar Contraseña Actual
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Configuración del Discord Webhook */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Discord Webhook
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">URL del Webhook</label>
                          {!isEditingWebhook && isWebhookConfigured && (
                            <Button onClick={handleEditWebhook} size="sm" variant="ghost">
                              <Edit3 className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          )}
                        </div>
                        
                        {isEditingWebhook ? (
                          <>
                            <input
                              type="url"
                              value={tempWebhookUrl}
                              onChange={(e) => setTempWebhookUrl(e.target.value)}
                              placeholder="https://discord.com/api/webhooks/..."
                              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Las contraseñas generadas se enviarán a este webhook de Discord
                            </p>
                          </>
                        ) : (
                          <div className="p-3 rounded-lg bg-muted">
                            {isWebhookConfigured ? (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm">Webhook configurado correctamente</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <span className="text-sm">Webhook no configurado</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {isEditingWebhook ? (
                        <>
                          <div className="flex gap-2">
                            <Button onClick={saveWebhookUrl} variant="outline" className="flex-1">
                              <Save className="w-4 h-4 mr-2" />
                              Guardar URL
                            </Button>
                            <Button onClick={testWebhook} variant="outline" className="flex-1">
                              <Send className="w-4 h-4 mr-2" />
                              Enviar Test
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleRecoverWebhook} variant="ghost" className="flex-1">
                              🔄 Recuperar desde Backup
                            </Button>
                            <Button onClick={handleCancelEditWebhook} variant="ghost" className="flex-1">
                              Cancelar
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex gap-2">
                          {!isWebhookConfigured && (
                            <Button onClick={handleEditWebhook} variant="outline" className="flex-1">
                              <Settings className="w-4 h-4 mr-2" />
                              Configurar Webhook
                            </Button>
                          )}
                          {(() => {
                             const [hasBackup, setHasBackup] = React.useState(false);
                             React.useEffect(() => {
                               webhookService.getBackupInfo().then(info => setHasBackup(info.hasBackup));
                             }, []);
                             return hasBackup;
                           })() && (
                            <Button onClick={handleRecoverWebhook} variant="outline" className="flex-1">
                              🔄 Recuperar Backup
                            </Button>
                          )}
                        </div>
                      )}
                      
                      {webhookTestResult && (
                        <div className={`p-3 rounded-lg text-sm ${
                          webhookTestResult.includes('✅') 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                        }`}>
                          {webhookTestResult}
                        </div>
                      )}
                      
                      <div className="p-4 rounded-lg bg-muted">
                        <h4 className="font-medium mb-2">¿Cómo configurar un Discord Webhook?</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Ve a tu servidor de Discord</li>
                          <li>Haz clic en Configuración del Servidor → Integraciones</li>
                          <li>Crea un nuevo Webhook</li>
                          <li>Copia la URL del webhook y pégala arriba</li>
                          <li>¡Listo! Recibirás las contraseñas en Discord</li>
                        </ol>
                      </div>
                      
                      {/* Opciones de Recuperación Avanzadas */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              🆘 Opciones de Recuperación
                            </span>
                            <Button 
                              onClick={() => setShowRecoveryOptions(!showRecoveryOptions)} 
                              size="sm" 
                              variant="ghost"
                            >
                              {showRecoveryOptions ? 'Ocultar' : 'Mostrar'}
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        {showRecoveryOptions && (
                          <CardContent className="space-y-4">
                            <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                ⚠️ <strong>Importante:</strong> Use estas opciones solo si perdió completamente el acceso al webhook.
                              </p>
                            </div>
                            
                            {/* Generar Código de Recuperación */}
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">1. Generar Código de Emergencia</h5>
                              <p className="text-xs text-muted-foreground">
                                Genere un código que le permitirá recuperar el webhook más tarde.
                              </p>
                              <Button 
                                onClick={handleGenerateRecoveryCode} 
                                variant="outline" 
                                size="sm"
                                disabled={!isWebhookConfigured}
                              >
                                🔑 Generar Código
                              </Button>
                              {generatedRecoveryCode && (
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Código generado:</p>
                                  <code className="text-sm bg-white dark:bg-gray-800 px-2 py-1 rounded border">
                                    {generatedRecoveryCode}
                                  </code>
                                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                    ⚠️ Guarde este código en un lugar seguro. Lo necesitará para recuperar el webhook.
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {/* Recuperar con Código */}
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">2. Recuperar con Código</h5>
                              <p className="text-xs text-muted-foreground">
                                Ingrese un código de recuperación previamente generado.
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={recoveryCode}
                                  onChange={(e) => setRecoveryCode(e.target.value)}
                                  placeholder="Ingrese código de recuperación"
                                  className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800"
                                />
                                <Button onClick={handleRecoverWithCode} variant="outline" size="sm">
                                  🔄 Recuperar
                                </Button>
                              </div>
                            </div>
                            
                            {/* Exportar Configuración */}
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">3. Exportar Configuración</h5>
                              <p className="text-xs text-muted-foreground">
                                Exporte toda la configuración para hacer un respaldo completo.
                              </p>
                              <Button 
                                onClick={handleExportConfig} 
                                variant="outline" 
                                size="sm"
                                disabled={!isWebhookConfigured}
                              >
                                📤 Exportar
                              </Button>
                            </div>
                            
                            {/* Importar Configuración */}
                            <div className="space-y-2">
                              <h5 className="font-medium text-sm">4. Importar Configuración</h5>
                              <p className="text-xs text-muted-foreground">
                                Restaure la configuración desde un respaldo exportado.
                              </p>
                              <div className="space-y-2">
                                <textarea
                                  value={importData}
                                  onChange={(e) => setImportData(e.target.value)}
                                  placeholder="Pegue aquí los datos de configuración exportados"
                                  className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-800 h-20 resize-none"
                                />
                                <Button onClick={handleImportConfig} variant="outline" size="sm">
                                  📥 Importar
                                </Button>
                              </div>
                            </div>
                            
                            {/* Reset de Emergencia */}
                            <div className="space-y-2 pt-4 border-t">
                              <h5 className="font-medium text-sm text-red-600 dark:text-red-400">5. Reset de Emergencia</h5>
                              <p className="text-xs text-muted-foreground">
                                ⚠️ <strong>PELIGRO:</strong> Esto eliminará TODA la configuración del webhook permanentemente.
                              </p>
                              <Button 
                                onClick={handleEmergencyReset} 
                                variant="destructive" 
                                size="sm"
                              >
                                🚨 Reset Completo
                              </Button>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </CardContent>
                  </Card>
                  
                  {/* Información de seguridad */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Información de Seguridad
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <p>Las contraseñas se generan automáticamente con 12 caracteres seguros</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <p>Cada contraseña expira automáticamente después de 24 horas</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <p>Las contraseñas se envían de forma segura por Discord webhook</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                          <p>Solo se puede tener una contraseña activa a la vez</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                          <p>El webhook se guarda automáticamente y se crea un backup de seguridad</p>
                        </div>
                        {backupInfo.hasBackup && (
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                            <p>Backup disponible desde: {new Date(backupInfo.created || '').toLocaleString('es-ES')}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdminPanel;
