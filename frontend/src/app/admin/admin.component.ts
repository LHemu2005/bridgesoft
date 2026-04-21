import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animated-waves-bg">
      <div class="wave-element wave-1"></div>
      <div class="wave-element wave-2"></div>
      <div class="wave-element wave-3"></div>
    </div>

    <div class="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative z-10 container mx-auto">
      <div class="glass-card p-8 rounded-[32px] relative mb-8">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-3xl font-bold tracking-tight text-white mb-2">Admin Control Center</h2>
            <p class="text-gray-400 text-sm">Managing BridgeSoft relational database and security logs.</p>
          </div>
          <button (click)="logout()" class="px-6 py-2 rounded-xl text-sm font-semibold bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10">
            Logout
          </button>
        </div>

        <div class="flex space-x-4 mb-8">
          <button (click)="activeTab = 'users'" [class]="getTabClass('users')">Users Database</button>
          <button (click)="activeTab = 'logs'" [class]="getTabClass('logs')">Security Audit Logs</button>
        </div>

        <!-- Users Table -->
        <div *ngIf="activeTab === 'users'" class="overflow-x-auto animate-in fade-in slide-in-from-bottom-2">
          <table class="w-full text-left text-sm text-gray-300">
            <thead class="bg-white/5 text-gray-400 uppercase text-[10px] tracking-widest">
              <tr>
                <th class="px-4 py-4 rounded-tl-xl">User</th>
                <th class="px-4 py-4">Role</th>
                <th class="px-4 py-4">Phone</th>
                <th class="px-4 py-4">Status</th>
                <th class="px-4 py-4 rounded-tr-xl">Last Login</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let user of users" class="hover:bg-white/5 transition-colors">
                <td class="px-4 py-4">
                  <div class="font-medium text-white">{{ user.email }}</div>
                  <div class="text-[10px] text-gray-500 font-mono uppercase">{{ user.id.substring(0,8) }}</div>
                </td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-4 py-4 font-mono text-xs">{{ user.phone }}</td>
                <td class="px-4 py-4">
                  <span *ngIf="user.verified" class="text-green-400 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                    Verified
                  </span>
                  <span *ngIf="!user.verified" class="text-gray-500 flex items-center">Unverified</span>
                </td>
                <td class="px-4 py-4 text-xs text-gray-500">{{ user.lastLogin }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Audit Logs Table -->
        <div *ngIf="activeTab === 'logs'" class="overflow-x-auto animate-in fade-in slide-in-from-bottom-2">
          <table class="w-full text-left text-sm text-gray-300">
            <thead class="bg-white/5 text-gray-400 uppercase text-[10px] tracking-widest">
              <tr>
                <th class="px-4 py-4 rounded-tl-xl">Timestamp</th>
                <th class="px-4 py-4">Action</th>
                <th class="px-4 py-4">Entity</th>
                <th class="px-4 py-4">Status</th>
                <th class="px-4 py-4 rounded-tr-xl">IP Address</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              <tr *ngFor="let log of auditLogs" class="hover:bg-white/5 transition-colors">
                <td class="px-4 py-4 font-mono text-[10px] text-gray-500">{{ log.timestamp }}</td>
                <td class="px-4 py-4">
                  <span class="font-bold text-white">{{ log.action }}</span>
                </td>
                <td class="px-4 py-4 text-xs">{{ log.entityType }}</td>
                <td class="px-4 py-4">
                  <span [class]="log.status === 'success' ? 'text-green-400' : 'text-red-400'">{{ log.status }}</span>
                </td>
                <td class="px-4 py-4 font-mono text-[10px]">{{ log.ipAddress }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private router = inject(Router);

  activeTab: 'users' | 'logs' = 'users';
  users: any[] = [];
  auditLogs: any[] = [];
  
  // Use private URL since Admin sits on the same server
  private apiUrl = (this.authService as any).apiUrl.replace('/auth', '/admin');

  ngOnInit() {
    this.fetchUsers();
    this.fetchLogs();
  }

  fetchUsers() {
    this.http.get<any[]>(`${this.apiUrl}/users`).subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Failed to fetch users', err)
    });
  }

  fetchLogs() {
    this.http.get<any[]>(`${this.apiUrl}/audit-logs`).subscribe({
      next: (data) => this.auditLogs = data,
      error: (err) => console.error('Failed to fetch audit logs', err)
    });
  }

  getTabClass(tab: string) {
    const base = 'px-6 py-2 rounded-xl text-sm font-semibold transition-all ';
    return this.activeTab === tab 
      ? base + 'bg-white text-black shadow-lg transform scale-105'
      : base + 'text-gray-400 hover:text-white bg-white/5';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
