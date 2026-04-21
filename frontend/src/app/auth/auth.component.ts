import { Component, inject, HostListener, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { OtpService } from '../core/otp.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  template: `
    <!-- Animated Aurora Background -->
    <div class="animated-waves-bg">
      <div class="wave-element wave-1"></div>
      <div class="wave-element wave-2"></div>
      <div class="wave-element wave-3"></div>
      <div class="cursor-glow" [style.left.px]="mouseX" [style.top.px]="mouseY"></div>
    </div>

    <!-- Hidden Container for Firebase Recaptcha -->
    <div id="recaptcha-container" class="fixed bottom-0 right-0 z-50"></div>

    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 selection:bg-white/30">
      <div 
        class="max-w-md w-full glass-card p-8 rounded-[32px] sm:p-10 relative overflow-hidden transition-all duration-500 ease-in-out"
        [ngClass]="activeTab === 'signup' ? 'min-h-[700px]' : 'min-h-[550px]'"
      >
        <!-- Sliding Navigation Toggle -->
        <div class="relative flex items-center bg-[#151515] p-1.5 rounded-full w-[200px] mb-8 border border-white/5 shadow-inner">
          <div 
            class="absolute top-1.5 bottom-1.5 w-[90px] bg-[#222] rounded-full shadow-sm border border-white/5 transition-transform duration-300 ease-out"
            [style.transform]="activeTab === 'signup' ? 'translateX(0px)' : 'translateX(94px)'"
          ></div>
          
          <button (click)="switchTab('signup')" 
                  class="relative z-10 w-1/2 py-1.5 text-sm font-medium transition-colors"
                  [ngClass]="activeTab === 'signup' ? 'text-white' : 'text-gray-500 hover:text-gray-300'">
            Sign up
          </button>
          
          <button (click)="switchTab('login')" 
                  class="relative z-10 w-1/2 py-1.5 text-sm font-medium transition-colors"
                  [ngClass]="activeTab === 'login' ? 'text-white' : 'text-gray-500 hover:text-gray-300'">
            Sign in
          </button>
        </div>
        
        <!-- Headers -->
        <div class="mb-6" [ngClass]="activeTab !== 'login' ? 'hidden' : 'block'">
          <div class="flex justify-between items-end mb-2">
            <h2 class="text-3xl font-bold tracking-tight text-white">Login Now</h2>
            <button (click)="loginMode = loginMode === 'email' ? 'phone' : 'email'" class="text-[10px] text-blue-400 font-bold uppercase tracking-wider hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-1 rounded">
              Use {{ loginMode === 'email' ? 'Phone' : 'Email' }}
            </button>
          </div>
          <p class="text-gray-400 text-sm">Please sign in with your {{ loginMode }}.</p>
        </div>
        
        <div class="mb-6" [ngClass]="activeTab !== 'signup' ? 'hidden' : 'block'">
          <h2 class="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h2>
        </div>

        <form class="space-y-4" [formGroup]="authForm" (ngSubmit)="onSubmit()">
          
          <div *ngIf="errorMessage" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center backdrop-blur-sm animate-fade-in font-medium">
            {{ errorMessage }}
            <p *ngIf="errorMessage.includes('auth/unauthorized-domain')" class="text-[9px] mt-2 text-gray-500 italic">
              Pro tip: You must add this domain to "Authorized Domains" in Firebase Console Settings.
            </p>
          </div>
          <div *ngIf="successMessage" class="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm text-center backdrop-blur-sm animate-fade-in">
            {{ successMessage }}
          </div>

          <!-- SIGNUP SPECIFIC FIELDS -->
          <div class="grid grid-cols-2 gap-4" *ngIf="activeTab === 'signup'">
            <div>
              <input formControlName="firstName" type="text"
                class="glass-input block w-full px-4 py-3.5 rounded-xl text-sm placeholder-gray-500" 
                placeholder="John">
            </div>
            <div>
              <input formControlName="lastName" type="text"
                class="glass-input block w-full px-4 py-3.5 rounded-xl text-sm placeholder-gray-500" 
                placeholder="Last name">
            </div>
          </div>

          <!-- EMAIL FIELD (Hidden if Phone Login) -->
          <div class="relative" *ngIf="activeTab === 'signup' || loginMode === 'email'">
             <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
               </svg>
             </div>
             <input formControlName="email" type="email"
               class="glass-input block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm placeholder-gray-500" 
               placeholder="Enter your email">
          </div>

          <!-- PHONE SECTION (Signup OR Phone Login) -->
          <div *ngIf="activeTab === 'signup' || loginMode === 'phone'" class="space-y-3">
             <div class="flex space-x-2">
                <div class="relative flex items-center glass-input rounded-l-xl px-2">
                  <select formControlName="countryCode" class="appearance-none bg-transparent text-sm pr-4 pl-1 outline-none text-white cursor-pointer">
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+91">🇮🇳 +91</option>
                  </select>
                </div>
                <input formControlName="phone" type="text"
                  [readonly]="isOtpSent || isPhoneVerified"
                  class="glass-input flex-grow px-4 py-3.5 text-sm placeholder-gray-500" 
                  placeholder="351-6501">
                
                <button type="button" 
                  *ngIf="!isPhoneVerified"
                  (click)="sendOtp()"
                  [disabled]="isOtpSent || !authForm.get('phone')?.value"
                  class="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10 shadow-sm shadow-white/5">
                  {{ isOtpSent ? 'Sent' : 'Verify' }}
                </button>
             </div>

             <div *ngIf="isOtpSent && !isPhoneVerified" class="flex space-x-2 animate-in fade-in slide-in-from-top-2">
                <input type="text" [(ngModel)]="otpCode" [ngModelOptions]="{standalone: true}"
                  class="glass-input flex-grow px-4 py-3.5 rounded-xl text-sm placeholder-gray-500 font-mono tracking-widest text-center" 
                  placeholder="••••••">
                
                <button type="button" (click)="verifyOtp()"
                  class="px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-gray-200 transition-all active:scale-95 shadow-lg">
                  Confirm
                </button>
             </div>
             
             <div *ngIf="isPhoneVerified" class="text-xs text-green-400 flex items-center pl-2 font-medium">
                <svg class="h-4 w-4 mr-1 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Security check passed. Identity confirmed.
             </div>
          </div>

          <div class="relative" *ngIf="loginMode === 'email' || activeTab === 'signup'">
             <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
               </svg>
             </div>
             <input formControlName="password" [type]="showPassword ? 'text' : 'password'"
               class="glass-input block w-full pl-11 pr-12 py-3.5 rounded-xl text-sm placeholder-gray-500" 
               placeholder="Enter your password">
             <button type="button" (click)="togglePasswordVisibility()" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 transition-colors hover:text-white">
               <svg *ngIf="!showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
               <svg *ngIf="showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
             </button>
          </div>

          <div *ngIf="activeTab === 'login' && loginMode === 'email'" class="flex items-center justify-between pt-2">
            <div class="flex items-center">
              <input id="remember-me" formControlName="rememberMe" type="checkbox" class="h-4 w-4 text-white bg-[#111] border-gray-700 rounded focus:ring-0 focus:ring-offset-0 accent-white">
              <label for="remember-me" class="ml-2 block text-xs text-gray-400">Remember me</label>
            </div>
            <a routerLink="/forgot-password" class="text-xs font-medium text-gray-400 hover:text-white transition-colors">Forgot password?</a>
          </div>

          <div class="pt-2">
            <button type="submit" [disabled]="isLoading || ( (activeTab === 'signup' || loginMode === 'phone') && !isPhoneVerified)"
              class="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-50 transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20">
              {{ isLoading ? 'Processing...' : (activeTab === 'login' ? 'Sign in now' : 'Create an account') }}
            </button>
          </div>

          <div class="relative py-6">
            <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/5"></div></div>
            <div class="relative flex justify-center text-[10px] uppercase tracking-wider text-gray-500"><span class="bg-[#161616] px-2">Or continue with</span></div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <button type="button" (click)="socialLogin('google')" class="flex items-center justify-center w-full glass-input py-2.5 rounded-xl hover:bg-white/10 transition-colors group">
              <svg class="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button type="button" (click)="socialLogin('apple')" class="flex items-center justify-center w-full glass-input py-2.5 rounded-xl hover:bg-white/10 transition-colors group text-white">
              <svg class="h-4 w-4 fill-current" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AuthComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private otpService = inject(OtpService);
  private router = inject(Router);

  activeTab: 'login' | 'signup' = 'login';
  loginMode: 'email' | 'phone' = 'email';
  isLoading = false;
  isOtpSent = false;
  isPhoneVerified = false;
  otpCode = '';
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  mouseX = 0; mouseY = 0;

  authForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false],
    firstName: [''], lastName: [''],
    countryCode: ['+1'], phone: ['']
  });

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  ngOnInit() {
    if (window.location.pathname.includes('signup')) this.activeTab = 'signup';
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) this.authForm.patchValue({ email: savedEmail, rememberMe: true });
  }

  ngAfterViewInit() {
    this.otpService.setupRecaptcha('recaptcha-container');
  }

  async sendOtp() {
    const val = this.authForm.value;
    const fullPhone = val.countryCode + val.phone;
    
    if (!val.phone || val.phone.length < 8) {
      this.errorMessage = 'Please enter a valid phone number.';
      return;
    }

    try {
      this.errorMessage = '';
      this.isLoading = true;
      await this.otpService.sendOtp(fullPhone);
      this.isOtpSent = true;
      this.isLoading = false;
    } catch (e: any) {
      this.isLoading = false;
      // Show the real error message from Firebase for debugging
      this.errorMessage = `OTP Error: ${e.message || 'Check connection or phone format'}`;
      console.error('Firebase Auth Error:', e);
    }
  }

  async verifyOtp() {
    try {
      this.errorMessage = '';
      this.isLoading = true;
      const ok = await this.otpService.verifyOtp(this.otpCode);
      if (ok) {
        this.isPhoneVerified = true;
        this.isOtpSent = false;
        this.successMessage = 'Verified! Signing you in...';
        // Auto-submit for "Instant" experience
        setTimeout(() => this.onSubmit(), 800);
      }
    } catch (e) {
      this.isLoading = false;
      this.errorMessage = 'Invalid verification code.';
    }
  }

  async socialLogin(type: 'google' | 'apple') {
    this.errorMessage = '';
    this.isLoading = true;
    try {
      const user = type === 'google' 
        ? await this.otpService.signInWithGoogle() 
        : await this.otpService.signInWithApple();
      
      if (!user) throw new Error('Canceled or no user returned.');

      this.authService.login({ email: user.email, social: true }).subscribe({
        next: (res) => this.router.navigate([res.user.role === 'ADMIN' ? '/admin' : '/dashboard']),
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Account sync failed. Ensure this provider is enabled in Firebase.';
        }
      });
    } catch (e: any) {
      this.isLoading = false;
      console.error('Social Login Error:', e);
      if (e.code === 'auth/popup-closed-by-user') {
        this.errorMessage = 'Sign-in window was closed before completion.';
      } else {
        this.errorMessage = 'Login failed. Ensure Google/Apple is enabled in Firebase Console.';
      }
    }
  }

  switchTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  togglePasswordVisibility() { this.showPassword = !this.showPassword; }

  onSubmit() {
    if (this.authForm.invalid) return;
    this.isLoading = true;
    const val = this.authForm.value;

    if (this.activeTab === 'login') {
      const loginData: any = { social: false };
      if (this.loginMode === 'email') {
        loginData.email = val.email;
        loginData.password = val.password;
      } else {
        loginData.phone = val.countryCode + val.phone;
      }

      this.authService.login(loginData).subscribe({
        next: (res) => this.router.navigate([res.user.role === 'ADMIN' ? '/admin' : '/dashboard']),
        error: (err) => { this.isLoading = false; this.errorMessage = err.error?.error || 'Login failed'; }
      });
    } else {
      this.authService.signup({
        email: val.email, password: val.password,
        phone: val.countryCode + val.phone
      }).subscribe({
        next: () => { this.isLoading = false; this.switchTab('login'); this.successMessage = 'Success! Log in now.'; },
        error: (err) => { this.isLoading = false; this.errorMessage = err.error?.error || 'Signup failed'; }
      });
    }
  }
}
