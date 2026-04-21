import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-100 p-8">
      <div class="max-w-7xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div class="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h1 class="text-2xl font-bold text-white">User Dashboard</h1>
          <button (click)="logout()" class="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors">
            Logout
          </button>
        </div>
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Welcome to your dashboard!</h2>
          <div class="bg-gray-50 border border-gray-200 rounded p-4 inline-block">
            <p class="text-gray-700"><span class="font-bold">Role:</span> {{ authService.getRole() }}</p>
          </div>
          <p class="mt-4 text-gray-600">This page is protected and only accessible to authenticated users.</p>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
