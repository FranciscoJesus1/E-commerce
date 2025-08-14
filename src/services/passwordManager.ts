import { webhookService } from './webhook';

interface PasswordData {
  password: string;
  expiresAt: number;
  createdAt: number;
}

class PasswordManager {
  private static readonly STORAGE_KEY = 'admin-password-data';
  private static readonly PASSWORD_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

  // Genera una contraseña aleatoria segura
  private generateSecurePassword(): string {
    const length = 12;
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    // Asegurar al menos un carácter de cada tipo
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Completar el resto de la contraseña
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mezclar los caracteres
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Obtiene la contraseña actual válida
  getCurrentPassword(): string | null {
    const stored = localStorage.getItem(PasswordManager.STORAGE_KEY);
    if (!stored) return null;

    try {
      const passwordData: PasswordData = JSON.parse(stored);
      const now = Date.now();

      // Verificar si la contraseña ha expirado
      if (now > passwordData.expiresAt) {
        localStorage.removeItem(PasswordManager.STORAGE_KEY);
        return null;
      }

      return passwordData.password;
    } catch (error) {
      console.error('Error parsing password data:', error);
      localStorage.removeItem(PasswordManager.STORAGE_KEY);
      return null;
    }
  }

  // Genera una nueva contraseña y la envía por webhook
  async generateNewPassword(): Promise<string> {
    const password = this.generateSecurePassword();
    const now = Date.now();
    const expiresAt = now + PasswordManager.PASSWORD_DURATION;

    const passwordData: PasswordData = {
      password,
      expiresAt,
      createdAt: now
    };

    // Guardar en localStorage
    localStorage.setItem(PasswordManager.STORAGE_KEY, JSON.stringify(passwordData));

    // Enviar por Discord webhook
    try {
      await webhookService.sendPasswordNotification(password);
    } catch (error) {
      console.error('Error enviando contraseña por webhook:', error);
    }

    return password;
  }

  // Verifica si una contraseña es válida
  validatePassword(inputPassword: string): boolean {
    const currentPassword = this.getCurrentPassword();
    return currentPassword === inputPassword;
  }

  // Obtiene información sobre la contraseña actual
  getPasswordInfo(): { hasPassword: boolean; expiresAt?: Date; timeRemaining?: string } {
    const stored = localStorage.getItem(PasswordManager.STORAGE_KEY);
    if (!stored) return { hasPassword: false };

    try {
      const passwordData: PasswordData = JSON.parse(stored);
      const now = Date.now();

      if (now > passwordData.expiresAt) {
        localStorage.removeItem(PasswordManager.STORAGE_KEY);
        return { hasPassword: false };
      }

      const timeRemaining = passwordData.expiresAt - now;
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

      return {
        hasPassword: true,
        expiresAt: new Date(passwordData.expiresAt),
        timeRemaining: `${hours}h ${minutes}m`
      };
    } catch (error) {
      console.error('Error getting password info:', error);
      localStorage.removeItem(PasswordManager.STORAGE_KEY);
      return { hasPassword: false };
    }
  }

  // Fuerza la expiración de la contraseña actual
  expireCurrentPassword(): void {
    localStorage.removeItem(PasswordManager.STORAGE_KEY);
  }

  // Verifica si necesita generar una nueva contraseña
  needsNewPassword(): boolean {
    return this.getCurrentPassword() === null;
  }
}

export const passwordManager = new PasswordManager();
export default passwordManager;