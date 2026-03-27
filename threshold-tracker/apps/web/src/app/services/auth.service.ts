import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthUser {
  userId: string;
  displayName: string;
  email: string;
}

interface AuthResponse {
  token: string;
  user_id: string;
  display_name: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private _currentUser = signal<AuthUser | null>(this.loadUserFromToken());
  currentUser = this._currentUser.asReadonly();
  isLoggedIn = computed(() => this._currentUser() !== null);

  private _aimlabsUsername = signal<string | null>(null);
  aimlabsUsername = this._aimlabsUsername.asReadonly();
  hasAimlabsUsername = computed(() => !!this._aimlabsUsername());

  private loadUserFromToken(): AuthUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('auth_token');
        return null;
      }
      return { userId: payload.sub, displayName: payload.displayName, email: payload.email };
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('auth_token');
  }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  register(displayName: string, email: string, password: string) {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { display_name: displayName, email, password }).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('auth_token');
    }
    this._currentUser.set(null);
    this._aimlabsUsername.set(null);
  }

  loadProfile(): Observable<string | null> {
    return this.http.get<{ aimlabs_username: string | null }>(`${environment.apiUrl}/profile`).pipe(
      tap(p => this._aimlabsUsername.set(p.aimlabs_username ?? null)),
      map(p => p.aimlabs_username ?? null)
    );
  }

  private handleAuthResponse(res: AuthResponse) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('auth_token', res.token);
    }
    this._currentUser.set({ userId: res.user_id, displayName: res.display_name, email: '' });
  }
}
