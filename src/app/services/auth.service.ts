import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, AuthError } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.authStateSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<{ email: string; localId: string } | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private readonly localStorageKeys = {
    idToken: 'auth_idToken',
    refreshToken: 'auth_refreshToken',
    localId: 'auth_localId',
    email: 'auth_email',
    expiresAt: 'auth_expiresAt'
  };

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  async register(email: string, password: string): Promise<void> {
    const url = `${environment.firebaseAuthUrl}:signUp?key=${environment.firebaseApiKey}`;
    const body = {
      email,
      password,
      returnSecureToken: true
    };

    const response = await firstValueFrom(
      this.http.post<AuthResponse>(url, body)
    );

    this.storeAuthData(response);
    this.setAuthState(true, response.email, response.localId);
  }

  async login(email: string, password: string): Promise<void> {
    const url = `${environment.firebaseAuthUrl}:signInWithPassword?key=${environment.firebaseApiKey}`;
    const body = {
      email,
      password,
      returnSecureToken: true
    };

    const response = await firstValueFrom(
      this.http.post<AuthResponse>(url, body)
    );

    this.storeAuthData(response);
    this.setAuthState(true, response.email, response.localId);
  }

  logout(): void {
    localStorage.removeItem(this.localStorageKeys.idToken);
    localStorage.removeItem(this.localStorageKeys.refreshToken);
    localStorage.removeItem(this.localStorageKeys.localId);
    localStorage.removeItem(this.localStorageKeys.email);
    localStorage.removeItem(this.localStorageKeys.expiresAt);
    this.setAuthState(false, null, null);
  }

  initializeAuth(): void {
    const idToken = localStorage.getItem(this.localStorageKeys.idToken);
    const expiresAt = localStorage.getItem(this.localStorageKeys.expiresAt);
    const email = localStorage.getItem(this.localStorageKeys.email);
    const localId = localStorage.getItem(this.localStorageKeys.localId);

    if (idToken && expiresAt) {
      const expirationTime = parseInt(expiresAt, 10);
      if (Date.now() < expirationTime) {
        this.setAuthState(true, email || '', localId || '');
      } else {
        this.logout();
      }
    } else {
      this.logout();
    }
  }

  getIdToken(): string | null {
    return localStorage.getItem(this.localStorageKeys.idToken);
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value;
  }

  private storeAuthData(response: AuthResponse): void {
    const expiresAt = Date.now() + Number(response.expiresIn) * 1000;
    localStorage.setItem(this.localStorageKeys.idToken, response.idToken);
    localStorage.setItem(this.localStorageKeys.refreshToken, response.refreshToken);
    localStorage.setItem(this.localStorageKeys.localId, response.localId);
    localStorage.setItem(this.localStorageKeys.email, response.email);
    localStorage.setItem(this.localStorageKeys.expiresAt, expiresAt.toString());
  }

  private setAuthState(isAuthenticated: boolean, email: string | null, localId: string | null): void {
    this.authStateSubject.next(isAuthenticated);
    if (isAuthenticated && email && localId) {
      this.currentUserSubject.next({ email, localId });
    } else {
      this.currentUserSubject.next(null);
    }
  }

  getErrorMessage(error: any): string {
    if (error.error?.error?.message) {
      const firebaseError = error.error.error.message;
      switch (firebaseError) {
        case 'EMAIL_EXISTS':
          return 'An account with this email already exists.';
        case 'INVALID_EMAIL':
          return 'Invalid email address.';
        case 'EMAIL_NOT_FOUND':
          return 'No account found with this email.';
        case 'INVALID_PASSWORD':
          return 'Invalid password.';
        case 'INVALID_LOGIN_CREDENTIALS':
          return 'Invalid email or password.';
        case 'WEAK_PASSWORD':
          return 'Password is too weak. It must be at least 6 characters.';
        case 'TOO_MANY_ATTEMPTS_TRY_LATER':
          return 'Too many failed attempts. Please try again later.';
        case 'OPERATION_NOT_ALLOWED':
          return 'Email/password login is not enabled.';
        default:
          return firebaseError;
      }
    }
    return 'An error occurred. Please try again.';
  }
}
