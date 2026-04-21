import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <!-- Animated Aurora Background -->
    <div class="animated-waves-bg">
      <div class="wave-element wave-1"></div>
      <div class="wave-element wave-2"></div>
      <div class="wave-element wave-3"></div>
    </div>

    <!-- Main Container -->
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 selection:bg-white/30">
      
      <!-- Glassmorphic Card -->
      <div class="max-w-md w-full glass-card p-8 rounded-[32px] sm:p-10 relative">
        
        <!-- Close Button Top Right -->
        <button class="absolute top-6 right-6 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <!-- Top Navigation Toggle -->
        <div class="flex items-center space-x-1 bg-[#151515] p-1.5 rounded-full w-max mb-8 border border-white/5 shadow-inner">
          <a routerLink="/signup" class="px-5 py-1.5 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors">
            Sign up
          </a>
          <div class="px-5 py-1.5 rounded-full text-sm font-medium bg-[#222] text-white shadow-sm border border-white/5">
            Sign in
          </div>
        </div>
        
        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold tracking-tight text-white mb-2">Welcome back</h2>
          <p class="text-gray-400 text-sm">Please enter your details to sign in.</p>
        </div>

        <!-- Form -->
        <form class="space-y-4" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          
          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center backdrop-blur-sm">
            {{ errorMessage }}
          </div>

          <!-- Email Field -->
          <div class="relative">
             <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
               </svg>
             </div>
             <input formControlName="email" type="email" required
               class="glass-input block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm placeholder-gray-500 sm:text-sm" 
               placeholder="Enter your email">
             <div *ngIf="loginForm.get('email')?.touched && loginForm.get('email')?.invalid" class="text-xs text-red-400 mt-1.5 pl-1">
               Please enter a valid email address.
             </div>
          </div>

          <!-- Password Field -->
          <div class="relative mt-4">
             <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
               <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
               </svg>
             </div>
             <input formControlName="password" [type]="showPassword ? 'text' : 'password'" required
               class="glass-input block w-full pl-11 pr-12 py-3.5 rounded-xl text-sm placeholder-gray-500 sm:text-sm" 
               placeholder="Enter your password">
               
             <button type="button" (click)="togglePasswordVisibility()" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none transition-colors">
               <svg *ngIf="!showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
               </svg>
               <svg *ngIf="showPassword" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.978 9.978 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
               </svg>
             </button>
          </div>

          <!-- Secondary Actions -->
          <div class="flex items-center justify-between pt-2">
            <div class="flex items-center">
              <input id="remember-me" formControlName="rememberMe" type="checkbox" class="h-4 w-4 text-white bg-[#111] border-gray-700 rounded focus:ring-0 focus:ring-offset-0 accent-white">
              <label for="remember-me" class="ml-2 block text-xs text-gray-400">
                Remember me
              </label>
            </div>
            <a routerLink="/forgot-password" class="text-xs font-medium text-gray-400 hover:text-white transition-colors">
              Forgot password?
            </a>
          </div>

          <!-- Primary Submit -->
          <div class="pt-4">
            <button type="submit" [disabled]="loginForm.invalid || isLoading"
              class="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-semibold text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]">
              <span *ngIf="!isLoading">Sign in now</span>
              <span *ngIf="isLoading" class="flex items-center text-gray-600">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            </button>
          </div>

          <!-- Divider -->
          <div class="relative py-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-white/5"></div>
            </div>
            <div class="relative flex justify-center text-xs">
              <span class="bg-transparent px-2 text-gray-500 bg-[#161616] rounded-full uppercase tracking-wider text-[10px]">Or continue with</span>
            </div>
          </div>

          <!-- Social Buttons -->
          <div class="grid grid-cols-2 gap-4">
            <button type="button" class="flex items-center justify-center w-full glass-input py-2.5 rounded-xl hover:bg-white/10 transition-colors group">
              <!-- Google G Logo -->
              <svg class="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </button>
            <button type="button" class="flex items-center justify-center w-full glass-input py-2.5 rounded-xl hover:bg-white/10 transition-colors group">
              <!-- Apple Logo -->
              <svg class="h-4 w-4 text-white opacity-80 group-hover:opacity-100 transition-opacity fill-current" viewBox="0 0 384 512">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
            </button>
          </div>
          
          <div class="mt-6 text-center">
            <p class="text-[11px] text-gray-500 font-medium">By picking up an account, you agree to our Terms & Service</p>
          </div>

        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false]
  });

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  ngOnInit() {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      this.loginForm.patchValue({ email: savedEmail, rememberMe: true });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const formValue = this.loginForm.value;
      
      if (formValue.rememberMe) {
        localStorage.setItem('rememberedEmail', formValue.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      this.authService.login({ email: formValue.email, password: formValue.password }).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res.user.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 0) {
            this.errorMessage = 'Unable to connect to the server. Please check your internet connection or try again later.';
          } else {
            this.errorMessage = err.error?.error || 'Invalid email or password';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
