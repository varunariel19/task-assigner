import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

@Injectable({ providedIn: "root" })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem("access_token");
  }

  setToken(token: string): void {
    if (!this.isBrowser) return;
    localStorage.setItem("access_token", token);
  }

  clearToken(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem("access_token");
  }

  getParsedToken(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(token);
    } catch {
      return null;
    }
  }

  isAdmin() {
     
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return !!this.getToken();
  }
}