import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { OtpService } from '../core/otp.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="animated-waves-bg">
      <div class="wave-element wave-1"></div>
      <div class="wave-element wave-2"></div>
      <div class="wave-element wave-3"></div>
    </div>

    <!-- Hidden Container for Firebase Recaptcha -->
    <div id="recaptcha-container"></div>

    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 selection:bg-white/30">
      <div class="max-w-md w-full glass-card p-8 rounded-[32px] sm:p-10 relative">
        
        <div class="flex items-center space-x-1 bg-[#151515] p-1.5 rounded-full w-max mb-8 border border-white/5 shadow-inner">
          <div class="px-5 py-1.5 rounded-full text-sm font-medium bg-[#222] text-white shadow-sm border border-white/5">
            Sign up
          </div>
          <a routerLink="/login" class="px-5 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Sign in
          </a>
        </div>
        
        <div class="mb-6">
          <h2 class="text-3xl font-bold tracking-tight text-white mb-2">Create an account</h2>
        </div>

        <form class="space-y-4" [formGroup]="signupForm" (ngSubmit)="onSubmit()">
          
          <div *ngIf="errorMessage" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center backdrop-blur-sm">
            {{ errorMessage }}
          </div>
          <div *ngIf="successMessage" class="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-sm text-center backdrop-blur-sm">
            {{ successMessage }}
            <p class="mt-2 text-xs"><a routerLink="/login" class="font-bold underline hover:text-white">Click here to log in</a></p>
          </div>

          <ng-container *ngIf="!successMessage">
            <div class="grid grid-cols-2 gap-4">
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

            <div class="relative">
               <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                 </svg>
               </div>
               <input formControlName="email" type="email" required
                 class="glass-input block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm placeholder-gray-500" 
                 placeholder="Enter your email">
            </div>

            <!-- Phone Verification Section -->
            <div class="space-y-3">
              <div class="flex space-x-2">
                <input formControlName="phone" type="text"
                  [readonly]="isOtpSent || isPhoneVerified"
                  class="glass-input flex-grow px-4 py-3.5 rounded-xl text-sm placeholder-gray-500" 
                  placeholder="+1234567890">
                
                <button type="button" 
                  *ngIf="!isPhoneVerified"
                  (click)="sendOtp()"
                  [disabled]="isOtpSent || !signupForm.get('phone')?.value"
                  class="px-4 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10 whitespace-nowrap">
                  {{ isOtpSent ? 'OTP Sent' : 'Verify' }}
                </button>

                <div *ngIf="isPhoneVerified" class="flex items-center px-4 py-2 rounded-xl bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Verified
                </div>
              </div>

              <!-- OTP Verification Code Input -->
              <div *ngIf="isOtpSent && !isPhoneVerified" class="flex space-x-2 animate-in fade-in slide-in-from-top-2">
                <input type="text" [(ngModel)]="otpCode" [ngModelOptions]="{standalone: true}"
                  class="glass-input flex-grow px-4 py-3.5 rounded-xl text-sm placeholder-gray-500" 
                  placeholder="Enter 6-digit code">
                
                <button type="button" (click)="verifyCode()"
                  class="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-gray-100 transition-colors">
                  Confirm
                </button>
              </div>
            </div>

            <div class="relative">
               <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                 </svg>
               </div>
               <input formControlName="password" type="password" required
                 class="glass-input block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm placeholder-gray-500" 
                 placeholder="Set your password">
            </div>

            <div class="relative">
               <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                 <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                 </svg>
               </div>
               <input formControlName="confirmPassword" type="password" required
                 class="glass-input block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm placeholder-gray-500" 
                 placeholder="Confirm password">
            </div>

            <div class="pt-4">
              <button type="submit" [disabled]="signupForm.invalid || isLoading || !isPhoneVerified"
                class="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]">
                <span *ngIf="!isLoading">Create an account</span>
                <span *ngIf="isLoading" class="flex items-center text-gray-600">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              </button>
            </div>
            
            <div class="mt-6 text-center">
              <p class="text-[11px] text-gray-500 font-medium">By creating an account, you agree to our Terms & Service</p>
            </div>
          </ng-container>

        </form>
      </div>
    </div>
  `
})
export class SignupComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private otpService = inject(OtpService);

  signupForm: FormGroup = this.fb.group({
    firstName: [''],
    lastName: [''],
    phone: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  isOtpSent = false;
  isPhoneVerified = false;
  otpCode = '';
  errorMessage = '';
  successMessage = '';

  ngAfterViewInit() {
    this.otpService.setupRecaptcha('recaptcha-container');
  }

  async sendOtp() {
    const phoneNumber = this.signupForm.get('phone')?.value;
    if (!phoneNumber) return;

    try {
      this.errorMessage = '';
      await this.otpService.sendOtp(phoneNumber);
      this.isOtpSent = true;
    } catch (error: any) {
      this.errorMessage = 'Failed to send OTP. Please check the number format (e.g. +1... )';
      console.error(error);
    }
  }

  async verifyCode() {
    if (!this.otpCode) return;

    try {
      this.errorMessage = '';
      const success = await this.otpService.verifyOtp(this.otpCode);
      if (success) {
        this.isPhoneVerified = true;
        this.isOtpSent = false;
      }
    } catch (error) {
      this.errorMessage = 'Invalid verification code.';
      console.error(error);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.signupForm.valid && this.isPhoneVerified) {
      this.isLoading = true;
      this.errorMessage = '';
      
      this.authService.signup({
        email: this.signupForm.value.email,
        password: this.signupForm.value.password,
        phone: this.signupForm.value.phone
      }).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Your account has been created successfully!';
          this.signupForm.reset();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Registration failed.';
        }
      });
    }
  }
}
