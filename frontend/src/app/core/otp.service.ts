import { Injectable } from '@angular/core';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider
} from 'firebase/auth';
import { auth } from '../../firebase.config';

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  private confirmationResult: ConfirmationResult | null = null;
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  setupRecaptcha(containerId: string): void {
    if (this.recaptchaVerifier) return;
    
    try {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA solved', response);
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
          this.recaptchaVerifier?.render();
        }
      });
    } catch (error) {
      console.error('reCAPTCHA initialization failed', error);
    }
  }

  async sendOtp(phoneNumber: string): Promise<void> {
    if (!this.recaptchaVerifier) {
      throw new Error('reCAPTCHA not initialized');
    }

    try {
      this.confirmationResult = await signInWithPhoneNumber(
        auth, 
        phoneNumber, 
        this.recaptchaVerifier
      );
      console.log('OTP sent to', phoneNumber);
    } catch (error: any) {
      console.error('Error sending OTP', error);
      // Reset reCAPTCHA on error so it can be used again
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.render();
      }
      throw error;
    }
  }

  async verifyOtp(otpCode: string): Promise<boolean> {
    if (!this.confirmationResult) {
      throw new Error('No confirmation result found');
    }

    try {
      const result = await this.confirmationResult.confirm(otpCode);
      return !!result.user;
    } catch (error) {
      console.error('Error verifying OTP', error);
      throw error;
    }
  }

  async signInWithGoogle(): Promise<any> {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Google Sign-In failed', error);
      throw error;
    }
  }

  async signInWithApple(): Promise<any> {
    const provider = new OAuthProvider('apple.com');
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('Apple Sign-In failed', error);
      throw error;
    }
  }
}
