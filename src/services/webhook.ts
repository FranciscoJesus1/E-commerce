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
  private webhookId: string | null;
  private static readonly API_BASE_URL = 'http://localhost:3001/api';

  constructor() {
    this.webhookUrl = '';
    this.webhookId = null;
    this.loadWebhookFromDatabase();
  }

  private async loadWebhookFromDatabase() {
    try {
      const response = await fetch(`${WebhookService.API_BASE_URL}/webhook`);
      if (response.ok) {
        const webhook = await response.json();
        if (webhook.url) {
          this.webhookUrl = webhook.url;
          this.webhookId = webhook._id;
        }
      }
    } catch (error) {
      console.error('Error loading webhook from database:', error);
    }
  }

  async setWebhookUrl(url: string, createBackup: boolean = true): Promise<boolean> {
    try {
      const webhookData = {
        url,
        isActive: true,
        ...(createBackup && {
          backupData: {
            url,
            timestamp: Date.now(),
            created: new Date().toISOString()
          }
        })
      };

      const response = await fetch(`${WebhookService.API_BASE_URL}/webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        const savedWebhook = await response.json();
        this.webhookUrl = url;
        this.webhookId = savedWebhook._id;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error saving webhook to database:', error);
      return false;
    }
  }

  getWebhookUrl(): string {
    return this.webhookUrl;
  }

  // Recuperar webhook desde backup
  async recoverWebhookFromBackup(): Promise<string | null> {
    try {
      const response = await fetch(`${WebhookService.API_BASE_URL}/webhook`);
      if (response.ok) {
        const webhook = await response.json();
        if (webhook.backupData && webhook.backupData.url) {
          return webhook.backupData.url;
        }
      }
      return null;
    } catch (error) {
      console.error('Error recovering webhook from backup:', error);
      return null;
    }
  }

  // Obtener información del backup
  async getBackupInfo(): Promise<{ hasBackup: boolean; created?: string; url?: string }> {
    try {
      const response = await fetch(`${WebhookService.API_BASE_URL}/webhook`);
      if (response.ok) {
        const webhook = await response.json();
        if (webhook.backupData) {
          return {
            hasBackup: true,
            created: webhook.backupData.created,
            url: webhook.backupData.url ? `${webhook.backupData.url.substring(0, 50)}...` : undefined
          };
        }
      }
      return { hasBackup: false };
    } catch (error) {
      console.error('Error getting backup info:', error);
      return { hasBackup: false };
    }
  }

  // Verificar si el webhook está configurado
  isConfigured(): boolean {
    return this.webhookUrl.length > 0;
  }

  // Limpiar configuración del webhook
  async clearWebhook(): Promise<void> {
    try {
      if (this.webhookId) {
        await fetch(`${WebhookService.API_BASE_URL}/webhook/${this.webhookId}`, {
          method: 'DELETE'
        });
      }
      this.webhookUrl = '';
      this.webhookId = null;
    } catch (error) {
      console.error('Error clearing webhook:', error);
      throw error;
    }
  }

  // Generar código de recuperación de emergencia
  async generateRecoveryCode(): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Webhook no configurado');
    }

    const recoveryData = {
      url: this.webhookUrl,
      timestamp: Date.now(),
      created: new Date().toISOString()
    };

    const code = btoa(JSON.stringify(recoveryData)).replace(/[+/=]/g, (match) => {
      switch (match) {
        case '+': return '-';
        case '/': return '_';
        case '=': return '';
        default: return match;
      }
    });

    // Guardar código en la base de datos
    if (this.webhookId) {
      try {
        await fetch(`${WebhookService.API_BASE_URL}/webhook/${this.webhookId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ recoveryCode: code })
        });
      } catch (error) {
        console.error('Error saving recovery code:', error);
      }
    }

    return code;
  }

  // Recuperar webhook usando código de emergencia
  async recoverWithCode(code: string): Promise<boolean> {
    try {
      // Restaurar caracteres base64
      const base64Code = code.replace(/[-_]/g, (match) => {
        return match === '-' ? '+' : '/';
      });
      
      // Agregar padding si es necesario
      const paddedCode = base64Code + '='.repeat((4 - base64Code.length % 4) % 4);
      
      const recoveryData = JSON.parse(atob(paddedCode));
      
      if (recoveryData.url && typeof recoveryData.url === 'string') {
        const success = await this.setWebhookUrl(recoveryData.url, false);
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error recovering with code:', error);
      return false;
    }
  }

  // Exportar configuración completa
  async exportConfiguration(): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Webhook no configurado');
    }

    try {
      const response = await fetch(`${WebhookService.API_BASE_URL}/webhook`);
      if (response.ok) {
        const webhook = await response.json();
        const exportData = {
          webhookUrl: webhook.url,
          backupData: webhook.backupData,
          recoveryCode: webhook.recoveryCode,
          exported: new Date().toISOString(),
          version: '1.0'
        };

        const exportString = btoa(JSON.stringify(exportData));
        
        // Guardar configuración exportada en la base de datos
        if (this.webhookId) {
          await fetch(`${WebhookService.API_BASE_URL}/webhook/${this.webhookId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ configExport: exportString })
          });
        }
        
        return exportString;
      }
      throw new Error('No se pudo obtener la configuración del webhook');
    } catch (error) {
      console.error('Error exporting configuration:', error);
      throw error;
    }
  }

  // Importar configuración completa
  async importConfiguration(importData: string): Promise<boolean> {
    try {
      const configData = JSON.parse(atob(importData));
      
      if (configData.webhookUrl && configData.version) {
        const success = await this.setWebhookUrl(configData.webhookUrl, false);
        
        if (success && this.webhookId) {
          // Restaurar datos adicionales
          const updateData: any = {};
          
          if (configData.backupData) {
            updateData.backupData = configData.backupData;
          }
          
          if (configData.recoveryCode) {
            updateData.recoveryCode = configData.recoveryCode;
          }
          
          if (Object.keys(updateData).length > 0) {
            await fetch(`${WebhookService.API_BASE_URL}/webhook/${this.webhookId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(updateData)
            });
          }
        }
        
        return success;
      }
      return false;
    } catch (error) {
      console.error('Error importing configuration:', error);
      return false;
    }
  }

  // Obtener información de recuperación disponible
  async getRecoveryOptions(): Promise<{
    hasBackup: boolean;
    hasRecoveryCode: boolean;
    hasExportedConfig: boolean;
    backupDate?: string;
    recoveryCodeDate?: string;
    exportDate?: string;
  }> {
    try {
      const response = await fetch(`${WebhookService.API_BASE_URL}/webhook`);
      if (response.ok) {
        const webhook = await response.json();
        
        const result: any = {
          hasBackup: !!(webhook.backupData && webhook.backupData.url),
          hasRecoveryCode: !!webhook.recoveryCode,
          hasExportedConfig: !!webhook.configExport
        };

        if (webhook.backupData && webhook.backupData.created) {
          result.backupDate = webhook.backupData.created;
        }
        
        if (webhook.configExport) {
          try {
            const configData = JSON.parse(atob(webhook.configExport));
            result.exportDate = configData.exported;
          } catch (error) {
            console.error('Error parsing export date:', error);
          }
        }

        return result;
      }
    } catch (error) {
      console.error('Error getting recovery options:', error);
    }
    
    return {
      hasBackup: false,
      hasRecoveryCode: false,
      hasExportedConfig: false
    };
  }

  // Reset completo del sistema (último recurso)
  async emergencyReset(): Promise<void> {
    try {
      await fetch(`${WebhookService.API_BASE_URL}/webhook`, {
        method: 'DELETE'
      });
      this.webhookUrl = '';
      this.webhookId = null;
    } catch (error) {
      console.error('Error during emergency reset:', error);
      throw error;
    }
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
