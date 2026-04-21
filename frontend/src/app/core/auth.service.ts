import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, Observable } from 'rxjs';

interface AuthResponse {
  status: string;
  user: { email: string; role: string };
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  // Live Backend URL from Cloud Run
  private apiUrl = 'https://bridgesoft-backend-527571910717.us-central1.run.app/api/auth';
  
  private userSubject = new BehaviorSubject<{email: string, role: string} | null>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    const token = localStorage.getItem('jwt');
    const role = localStorage.getItem('role');
    const email = localStorage.getItem('email');
    if (token && role && email) {
      this.userSubject.next({ email, role });
    }
  }

  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.status === 'success') {
          localStorage.setItem('jwt', res.token);
          localStorage.setItem('role', res.user.role);
          localStorage.setItem('email', res.user.email);
          this.userSubject.next(res.user);
        }
      })
    );
  }

  signup(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, credentials);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  getRole(): string | null {
    return localStorage.getItem('role');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
