import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <!-- Animated Aurora Background -->
    <div class="animated-waves-bg">
      <div class="wave-element wave-1"></div>
      <div class="wave-element wave-2"></div>
      <div class="wave-element wave-3"></div>
      <!-- Interactive Cursor Glow -->
      <div class="cursor-glow" [style.left.px]="mouseX" [style.top.px]="mouseY"></div>
    </div>

    <!-- Main Container -->
    <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10 selection:bg-white/30">
      
      <!-- Glassmorphic Card -->
      <div class="max-w-md w-full glass-card p-8 rounded-[32px] sm:p-10 relative overflow-hidden">
        
        
        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-3xl font-bold tracking-tight text-white mb-2 text-center">Reset Password</h2>
          <p class="text-gray-400 text-sm text-center">Enter your email and we'll reset your password.</p>
        </div>

        <form class="space-y-6" [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
          <!-- Error Alert -->
          <div *ngIf="errorMessage" class="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm text-center backdrop-blur-sm animate-fade-in">
            {{ errorMessage }}
          </div>
          
          <!-- Success State -->
          <div *ngIf="successMessage" class="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-2xl text-sm text-center backdrop-blur-sm animate-fade-in shadow-xl">
            <p class="font-bold mb-3 text-lg">Reset Successful (MVP Mock)!</p>
            <p class="mb-3 opacity-80">Your new temporary password is:</p>
            <div class="bg-white/10 px-4 py-2 rounded-xl text-xl font-mono text-white tracking-widest border border-white/10 mb-6 group cursor-copy active:scale-95 transition-transform" title="Click to copy (Mocked)">
              {{ successMessage }}
            </div>
            <p><a routerLink="/login" class="text-white underline font-semibold hover:opacity-80 transition-opacity">Return to login</a></p>
          </div>
          
          <!-- Input Field -->
          <div class="space-y-4" *ngIf="!successMessage">
            <div class="relative">
              <label for="email-address" class="block text-xs font-medium text-gray-500 mb-1.5 ml-1 uppercase tracking-wider">Email address</label>
              <div class="relative">
                 <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <svg class="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                   </svg>
                 </div>
                 <input formControlName="email" id="email-address" type="email" required
                   class="glass-input block w-full pl-11 pr-4 py-3.5 rounded-xl text-sm placeholder-gray-500 sm:text-sm" 
                   placeholder="you@email.com">
              </div>
              <div *ngIf="forgotForm.get('email')?.touched && forgotForm.get('email')?.invalid" class="text-[11px] text-red-500 mt-1.5 pl-1 font-medium">
                 Please enter a valid email.
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div *ngIf="!successMessage">
            <button type="submit" [disabled]="forgotForm.invalid || isLoading"
              class="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-[#3b82f6] disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/20">
              <span *ngIf="!isLoading">Reset Password</span>
              <span *ngIf="isLoading" class="flex items-center text-gray-600">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            </button>
          </div>
          
          <div class="text-sm text-center mt-4">
            <p class="text-gray-500 text-xs font-medium">
              Remember your password? 
              <a routerLink="/login" class="text-white hover:underline transition-all">Log in</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  // Cursor Tracking
  mouseX = 0;
  mouseY = 0;

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.clientX;
    this.mouseY = event.clientY;
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      this.authService.forgotPassword(this.forgotForm.value.email).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = res.tempPassword;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.error || 'Failed to reset password. Verify your email address.';
        }
      });
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }
}
