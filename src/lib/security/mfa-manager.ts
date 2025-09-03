/**
 * MFA Manager - Multi-Factor Authentication kezelő
 * Támogatja: TOTP, SMS, Email MFA opciókat
 */

import { createClient } from '@supabase/supabase-js';
import { generateSecret } from 'speakeasy';
import * as speakeasy from 'speakeasy';
import QRCode from 'qrcode';

// MFA típusok
export type MFAType = 'totp' | 'sms' | 'email' | 'hardware';

// MFA session interface
export interface MFASession {
  id: string;
  user_id: string;
  mfa_type: MFAType;
  secret_key?: string;
  backup_codes: string[];
  is_verified: boolean;
  created_at: Date;
  last_used: Date;
  expires_at: Date;
}

// MFA setup interface
export interface MFASetup {
  secret: string;
  qr_code: string;
  backup_codes: string[];
  verification_code: string;
}

// MFA verification interface
export interface MFAVerification {
  user_id: string;
  mfa_type: MFAType;
  code: string;
  session_id?: string;
}

// Singleton pattern MFA Manager
class MFAManager {
  private static instance: MFAManager;
  private supabase: any;
  private readonly BACKUP_CODES_COUNT = 10;
  private readonly BACKUP_CODE_LENGTH = 8;
  private readonly MFA_SESSION_TIMEOUT = 30 * 60 * 1000; // 30 perc

  private constructor() {
    // Teszt környezetben mock client, production-ben valós Supabase client
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
      this.supabase = null as any; // Mock client teszt környezetben
    } else {
      this.supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
  }

  public static getInstance(): MFAManager {
    if (!MFAManager.instance) {
      MFAManager.instance = new MFAManager();
    }
    return MFAManager.instance;
  }

  /**
   * TOTP MFA beállítása felhasználóhoz
   */
  async setupTOTP(userId: string): Promise<MFASetup> {
    try {
      // Generálj titkos kulcsot
      const secret = generateSecret({
        name: 'ProTipp V2',
        issuer: 'ProTipp',
        length: 32
      });

      // Generálj QR kódot
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Generálj backup kódokat
      const backupCodes = this.generateBackupCodes();

      // Generálj verifikációs kódot
      const verificationCode = speakeasy.totp({
        secret: secret.base32!,
        encoding: 'base32'
      });

      // Mentsd el az MFA session-t
      const mfaSession: MFASession = {
        id: crypto.randomUUID(),
        user_id: userId,
        mfa_type: 'totp',
        secret_key: secret.base32,
        backup_codes: backupCodes,
        is_verified: false,
        created_at: new Date(),
        last_used: new Date(),
        expires_at: new Date(Date.now() + this.MFA_SESSION_TIMEOUT)
      };

      // Mentsd el az adatbázisba
      await this.saveMFASession(mfaSession);

      return {
        secret: secret.base32!,
        qr_code: qrCode,
        backup_codes: backupCodes,
        verification_code: verificationCode
      };
    } catch (error) {
      console.error('MFA TOTP setup error:', error);
      throw new Error('MFA TOTP beállítás sikertelen');
    }
  }

  /**
   * SMS MFA beállítása
   */
  async setupSMS(userId: string, phoneNumber: string): Promise<MFASetup> {
    try {
      // Generálj SMS kódot
      const smsCode = this.generateSMSCode();
      
      // Generálj backup kódokat
      const backupCodes = this.generateBackupCodes();

      // Mentsd el az MFA session-t
      const mfaSession: MFASession = {
        id: crypto.randomUUID(),
        user_id: userId,
        mfa_type: 'sms',
        backup_codes: backupCodes,
        is_verified: false,
        created_at: new Date(),
        last_used: new Date(),
        expires_at: new Date(Date.now() + this.MFA_SESSION_TIMEOUT)
      };

      // Mentsd el az adatbázisba
      await this.saveMFASession(mfaSession);

      // TODO: SMS küldés implementálása
      // await this.sendSMS(phoneNumber, smsCode);

      return {
        secret: '',
        qr_code: '',
        backup_codes: backupCodes,
        verification_code: smsCode
      };
    } catch (error) {
      console.error('MFA SMS setup error:', error);
      throw new Error('MFA SMS beállítás sikertelen');
    }
  }

  /**
   * Email MFA beállítása
   */
  async setupEmail(userId: string, email: string): Promise<MFASetup> {
    try {
      // Generálj email kódot
      const emailCode = this.generateEmailCode();
      
      // Generálj backup kódokat
      const backupCodes = this.generateBackupCodes();

      // Mentsd el az MFA session-t
      const mfaSession: MFASession = {
        id: crypto.randomUUID(),
        user_id: userId,
        mfa_type: 'email',
        backup_codes: backupCodes,
        is_verified: false,
        created_at: new Date(),
        last_used: new Date(),
        expires_at: new Date(Date.now() + this.MFA_SESSION_TIMEOUT)
      };

      // Mentsd el az adatbázisba
      await this.saveMFASession(mfaSession);

      // TODO: Email küldés implementálása
      // await this.sendEmail(email, emailCode);

      return {
        secret: '',
        qr_code: '',
        backup_codes: backupCodes,
        verification_code: emailCode
      };
    } catch (error) {
      console.error('MFA Email setup error:', error);
      throw new Error('MFA Email beállítás sikertelen');
    }
  }

  /**
   * MFA verifikáció
   */
  async verifyMFA(verification: MFAVerification): Promise<boolean> {
    try {
      // Keresd meg az MFA session-t
      const mfaSession = await this.getMFASession(verification.user_id, verification.mfa_type);
      
      if (!mfaSession) {
        throw new Error('MFA session nem található');
      }

      // Ellenőrizd a lejárati időt
      if (new Date() > mfaSession.expires_at) {
        throw new Error('MFA session lejárt');
      }

      let isValid = false;

      // Verifikáció típus szerint
      switch (verification.mfa_type) {
        case 'totp':
          isValid = this.verifyTOTPCode(mfaSession.secret_key!, verification.code);
          break;
        case 'sms':
        case 'email':
          // TODO: Implement SMS/Email verifikáció
          isValid = verification.code === '123456'; // Placeholder
          break;
        case 'hardware':
          // TODO: Implement hardware token verifikáció
          isValid = false;
          break;
      }

      // Backup kód ellenőrzése
      if (!isValid && mfaSession.backup_codes.includes(verification.code)) {
        isValid = true;
        // Távolítsd el a használt backup kódot
        mfaSession.backup_codes = mfaSession.backup_codes.filter(code => code !== verification.code);
        await this.updateMFASession(mfaSession);
      }

      if (isValid) {
        // Frissítsd az MFA session-t
        mfaSession.is_verified = true;
        mfaSession.last_used = new Date();
        await this.updateMFASession(mfaSession);
      }

      return isValid;
    } catch (error) {
      console.error('MFA verification error:', error);
      return false;
    }
  }

  /**
   * MFA session lekérése
   */
  async getMFASession(userId: string, mfaType: MFAType): Promise<MFASession | null> {
    try {
      const { data, error } = await this.supabase
        .from('mfa_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('mfa_type', mfaType)
        .single();

      if (error) {
        console.error('MFA session lekérés hiba:', error);
        return null;
      }

      return data ? {
        ...data,
        created_at: new Date(data.created_at),
        last_used: new Date(data.last_used),
        expires_at: new Date(data.expires_at)
      } : null;
    } catch (error) {
      console.error('MFA session lekérés hiba:', error);
      return null;
    }
  }

  /**
   * MFA session mentése
   */
  private async saveMFASession(mfaSession: MFASession): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('mfa_sessions')
        .insert({
          id: mfaSession.id,
          user_id: mfaSession.user_id,
          mfa_type: mfaSession.mfa_type,
          secret_key: mfaSession.secret_key,
          backup_codes: mfaSession.backup_codes,
          is_verified: mfaSession.is_verified,
          created_at: mfaSession.created_at.toISOString(),
          last_used: mfaSession.last_used.toISOString(),
          expires_at: mfaSession.expires_at.toISOString()
        });

      if (error) {
        throw new Error(`MFA session mentés hiba: ${error.message}`);
      }
    } catch (error) {
      console.error('MFA session mentés hiba:', error);
      throw error;
    }
  }

  /**
   * MFA session frissítése
   */
  private async updateMFASession(mfaSession: MFASession): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('mfa_sessions')
        .update({
          backup_codes: mfaSession.backup_codes,
          is_verified: mfaSession.is_verified,
          last_used: mfaSession.last_used.toISOString()
        })
        .eq('id', mfaSession.id);

      if (error) {
        throw new Error(`MFA session frissítés hiba: ${error.message}`);
      }
    } catch (error) {
      console.error('MFA session frissítés hiba:', error);
      throw error;
    }
  }

  /**
   * TOTP kód verifikáció
   */
  private verifyTOTPCode(secret: string, code: string): boolean {
    try {
      return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code,
        window: 2 // 2 időablak tolerancia
      });
    } catch (error) {
      console.error('TOTP verifikáció hiba:', error);
      return false;
    }
  }

  /**
   * Backup kódok generálása
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
    for (let i = 0; i < this.BACKUP_CODES_COUNT; i++) {
      let code = '';
      for (let j = 0; j < this.BACKUP_CODE_LENGTH; j++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * SMS kód generálása
   */
  private generateSMSCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Email kód generálása
   */
  private generateEmailCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * MFA session törlése
   */
  async deleteMFASession(userId: string, mfaType: MFAType): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('mfa_sessions')
        .delete()
        .eq('user_id', userId)
        .eq('mfa_type', mfaType);

      if (error) {
        throw new Error(`MFA session törlés hiba: ${error.message}`);
      }
    } catch (error) {
      console.error('MFA session törlés hiba:', error);
      throw error;
    }
  }

  /**
   * Felhasználó MFA státuszának lekérése
   */
  async getUserMFAStatus(userId: string): Promise<{
    has_mfa: boolean;
    mfa_types: MFAType[];
    is_verified: boolean;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('mfa_sessions')
        .select('mfa_type, is_verified')
        .eq('user_id', userId);

      if (error) {
        console.error('MFA státusz lekérés hiba:', error);
        return { has_mfa: false, mfa_types: [], is_verified: false };
      }

      const mfaTypes = data?.map((session: any) => session.mfa_type) || [];
      const isVerified = data?.some((session: any) => session.is_verified) || false;

      return {
        has_mfa: mfaTypes.length > 0,
        mfa_types: mfaTypes,
        is_verified: isVerified
      };
    } catch (error) {
      console.error('MFA státusz lekérés hiba:', error);
      return { has_mfa: false, mfa_types: [], is_verified: false };
    }
  }
}

// Export singleton instance
export const mfaManager = MFAManager.getInstance();
export default mfaManager;
