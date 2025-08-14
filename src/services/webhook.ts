interface DiscordWebhookPayload {
  content?: string;
  embeds?: Array<{
    title?: string;
    description?: string;
    color?: number;
    fields?: Array<{
      name: string;
      value: string;
      inline?: boolean;
    }>;
    timestamp?: string;
  }>;
}

class WebhookService {
  private webhookUrl: string;
  private static readonly WEBHOOK_STORAGE_KEY = 'discord-webhook-url';
  private static readonly WEBHOOK_BACKUP_KEY = 'discord-webhook-backup';
  private static readonly RECOVERY_CODE_KEY = 'webhook-recovery-code';
  private static readonly CONFIG_EXPORT_KEY = 'webhook-config-export';

  constructor() {
    // URL del webhook de Discord - debe ser configurada por el usuario
    this.webhookUrl = localStorage.getItem(WebhookService.WEBHOOK_STORAGE_KEY) || '';
  }

  setWebhookUrl(url: string, createBackup: boolean = true) {
    this.webhookUrl = url;
    localStorage.setItem(WebhookService.WEBHOOK_STORAGE_KEY, url);
    
    // Crear backup automático si es la primera vez o si se solicita explícitamente
    if (createBackup && url) {
      this.createBackup(url);
    }
  }

  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  // Crear backup del webhook
  private createBackup(url: string) {
    const backupData = {
      url,
      timestamp: Date.now(),
      created: new Date().toISOString()
    };
    localStorage.setItem(WebhookService.WEBHOOK_BACKUP_KEY, JSON.stringify(backupData));
  }

  // Recuperar webhook desde backup
  recoverWebhookFromBackup(): string | null {
    const backup = localStorage.getItem(WebhookService.WEBHOOK_BACKUP_KEY);
    if (!backup) return null;

    try {
      const backupData = JSON.parse(backup);
      return backupData.url || null;
    } catch (error) {
      console.error('Error parsing webhook backup:', error);
      return null;
    }
  }

  // Obtener información del backup
  getBackupInfo(): { hasBackup: boolean; created?: string; url?: string } {
    const backup = localStorage.getItem(WebhookService.WEBHOOK_BACKUP_KEY);
    if (!backup) return { hasBackup: false };

    try {
      const backupData = JSON.parse(backup);
      return {
        hasBackup: true,
        created: backupData.created,
        url: backupData.url ? `${backupData.url.substring(0, 50)}...` : undefined
      };
    } catch (error) {
      return { hasBackup: false };
    }
  }

  // Verificar si el webhook está configurado
  isConfigured(): boolean {
    return this.webhookUrl.length > 0;
  }

  // Limpiar configuración del webhook
  clearWebhook() {
    this.webhookUrl = '';
    localStorage.removeItem(WebhookService.WEBHOOK_STORAGE_KEY);
  }

  // Generar código de recuperación de emergencia
  generateRecoveryCode(): string {
    const code = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const recoveryData = {
      code,
      webhookUrl: this.webhookUrl,
      created: new Date().toISOString(),
      timestamp: Date.now()
    };
    localStorage.setItem(WebhookService.RECOVERY_CODE_KEY, JSON.stringify(recoveryData));
    return code;
  }

  // Recuperar webhook usando código de emergencia
  recoverWithCode(code: string): boolean {
    const recoveryData = localStorage.getItem(WebhookService.RECOVERY_CODE_KEY);
    if (!recoveryData) return false;

    try {
      const data = JSON.parse(recoveryData);
      if (data.code === code && data.webhookUrl) {
        this.setWebhookUrl(data.webhookUrl, false);
        return true;
      }
    } catch (error) {
      console.error('Error recovering with code:', error);
    }
    return false;
  }

  // Exportar configuración completa
  exportConfiguration(): string {
    const config = {
      webhookUrl: this.webhookUrl,
      backup: localStorage.getItem(WebhookService.WEBHOOK_BACKUP_KEY),
      recoveryCode: localStorage.getItem(WebhookService.RECOVERY_CODE_KEY),
      exported: new Date().toISOString(),
      timestamp: Date.now()
    };
    const exportData = btoa(JSON.stringify(config));
    localStorage.setItem(WebhookService.CONFIG_EXPORT_KEY, exportData);
    return exportData;
  }

  // Importar configuración completa
  importConfiguration(exportData: string): boolean {
    try {
      const config = JSON.parse(atob(exportData));
      if (config.webhookUrl) {
        this.setWebhookUrl(config.webhookUrl, false);
        if (config.backup) {
          localStorage.setItem(WebhookService.WEBHOOK_BACKUP_KEY, config.backup);
        }
        if (config.recoveryCode) {
          localStorage.setItem(WebhookService.RECOVERY_CODE_KEY, config.recoveryCode);
        }
        return true;
      }
    } catch (error) {
      console.error('Error importing configuration:', error);
    }
    return false;
  }

  // Obtener información de recuperación disponible
  getRecoveryOptions(): {
    hasBackup: boolean;
    hasRecoveryCode: boolean;
    hasExportedConfig: boolean;
    backupDate?: string;
    recoveryCodeDate?: string;
    exportDate?: string;
  } {
    const backup = localStorage.getItem(WebhookService.WEBHOOK_BACKUP_KEY);
    const recoveryCode = localStorage.getItem(WebhookService.RECOVERY_CODE_KEY);
    const exportedConfig = localStorage.getItem(WebhookService.CONFIG_EXPORT_KEY);

    const result = {
      hasBackup: !!backup,
      hasRecoveryCode: !!recoveryCode,
      hasExportedConfig: !!exportedConfig
    } as any;

    try {
      if (backup) {
        const backupData = JSON.parse(backup);
        result.backupDate = backupData.created;
      }
      if (recoveryCode) {
        const codeData = JSON.parse(recoveryCode);
        result.recoveryCodeDate = codeData.created;
      }
      if (exportedConfig) {
        const configData = JSON.parse(atob(exportedConfig));
        result.exportDate = configData.exported;
      }
    } catch (error) {
      console.error('Error parsing recovery options:', error);
    }

    return result;
  }

  // Reset completo del sistema (último recurso)
  emergencyReset(): void {
    localStorage.removeItem(WebhookService.WEBHOOK_STORAGE_KEY);
    localStorage.removeItem(WebhookService.WEBHOOK_BACKUP_KEY);
    localStorage.removeItem(WebhookService.RECOVERY_CODE_KEY);
    localStorage.removeItem(WebhookService.CONFIG_EXPORT_KEY);
    this.webhookUrl = '';
  }

  async sendPasswordNotification(password: string): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('Discord webhook URL no configurada');
      return false;
    }

    const payload: DiscordWebhookPayload = {
      embeds: [
        {
          title: '🔐 Nueva Contraseña de Admin Panel',
          description: 'Se ha generado una nueva contraseña para el panel de administración.',
          color: 0xff4655, // Color rojo de Valorant
          fields: [
            {
              name: '🔑 Contraseña',
              value: `\`${password}\``,
              inline: false
            },
            {
              name: '⏰ Generada',
              value: new Date().toLocaleString('es-ES'),
              inline: true
            },
            {
              name: '⚠️ Importante',
              value: 'Esta contraseña expirará en 24 horas',
              inline: true
            }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('Contraseña enviada exitosamente por Discord webhook');
      return true;
    } catch (error) {
      console.error('Error enviando webhook a Discord:', error);
      return false;
    }
  }

  async sendTestMessage(): Promise<boolean> {
    if (!this.webhookUrl) {
      console.warn('Discord webhook URL no configurada');
      return false;
    }

    const payload: DiscordWebhookPayload = {
      embeds: [
        {
          title: '✅ Test de Webhook',
          description: 'El webhook de Discord está funcionando correctamente.',
          color: 0x00ff00,
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('Error enviando test webhook:', error);
      return false;
    }
  }
}

export const webhookService = new WebhookService();
export default webhookService;