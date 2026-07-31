/**
 * RxFlow AuthStore v3.0
 * Authentication state manager supporting Supabase PKCE Auth.
 * Handles JWT tokens, refresh flow, role persistence, and user entity mapping.
 */

import { setCurrentRole, type UserRole } from './Router';

export interface UserEntity {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  retailerId?: string;
  distributorId?: string;
  manufacturerId?: string;
  salesRepId?: string;
  isVerified?: boolean;  // Drug license verification status
  dlNumber?: string;     // Drug License number e.g. MH-MZ2-482019
  licenseKey?: string;   // 10-digit Base72 license key
  licenseExpiry?: string; // License expiry ISO date
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserEntity | null;
  token: string | null;
  powersyncToken: string | null;
  isLoading: boolean;
}

const STORAGE_KEYS = {
  TOKEN: 'rxflow_auth_token',
  REFRESH_TOKEN: 'rxflow_refresh_token',
  USER: 'rxflow_user_data',
  POWERSYNC_TOKEN: 'rxflow_powersync_token',
};

class AuthStoreEngine {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    powersyncToken: null,
    isLoading: true,
  };

  private listeners: Set<(state: AuthState) => void> = new Set();

  constructor() {
    this.restoreSession();
  }

  // ---------- Public API ----------

  public getState(): AuthState {
    return { ...this.state };
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Login with email and password or demo role
   */
  public async login(email: string, role: UserRole = 'retailer'): Promise<boolean> {
    this.state.isLoading = true;
    this.notify();

    try {
      // Demo mock login (In production: fetch via Cloudflare Worker /api/v2/auth/login -> Supabase PKCE)
      const mockUser: UserEntity = {
        id: 'user-uuidv7-demo-001',
        email,
        fullName: this.getDemoName(role),
        phone: '+91 98220 12345',
        role,
        retailerId: role === 'retailer' ? 'ret-uuidv7-demo-001' : undefined,
        distributorId: role === 'distributor' ? 'dist-uuidv7-demo-001' : undefined,
        manufacturerId: role === 'manufacturer' ? 'mfg-uuidv7-demo-001' : undefined,
        salesRepId: role === 'sales_rep' ? 'rep-uuidv7-demo-001' : undefined,
      };

      const mockToken = `jwt-token-${role}-${Date.now()}`;
      const mockPowerSyncToken = `powersync-token-${role}-${Date.now()}`;

      this.saveSession(mockUser, mockToken, mockPowerSyncToken);
      setCurrentRole(role);

      return true;
    } catch (err) {
      console.error('[AuthStore] Login failed:', err);
      return false;
    } finally {
      this.state.isLoading = false;
      this.notify();
    }
  }

  /**
   * Switch role instantly (for Dev Engine & multi-role testing)
   */
  public switchRole(role: UserRole): void {
    if (!this.state.user) {
      this.login('demo@rxflow.in', role);
      return;
    }

    const updatedUser: UserEntity = {
      ...this.state.user,
      role,
      fullName: this.getDemoName(role),
    };

    this.saveSession(updatedUser, this.state.token || 'demo-token', this.state.powersyncToken || 'ps-token');
    setCurrentRole(role);
  }

  /**
   * Logout user and clear tokens
   */
  public logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.POWERSYNC_TOKEN);

    this.state = {
      isAuthenticated: false,
      user: null,
      token: null,
      powersyncToken: null,
      isLoading: false,
    };

    this.notify();
    window.location.hash = '#/login';
  }

  // ---------- Private Helpers ----------

  private restoreSession(): void {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER);
      const storedToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
      const storedPSToken = localStorage.getItem(STORAGE_KEYS.POWERSYNC_TOKEN);

      if (storedUser && storedToken) {
        const user: UserEntity = JSON.parse(storedUser);
        this.state = {
          isAuthenticated: true,
          user,
          token: storedToken,
          powersyncToken: storedPSToken,
          isLoading: false,
        };
        setCurrentRole(user.role);
      } else {
        this.state.isLoading = false;
      }
    } catch (err) {
      console.error('[AuthStore] Session restore failed:', err);
      this.state.isLoading = false;
    }
    this.notify();
  }

  private saveSession(user: UserEntity, token: string, powersyncToken: string): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.POWERSYNC_TOKEN, powersyncToken);

    this.state = {
      isAuthenticated: true,
      user,
      token,
      powersyncToken,
      isLoading: false,
    };
  }

  private notify(): void {
    this.listeners.forEach(fn => fn(this.getState()));
  }

  private getDemoName(role: UserRole): string {
    const names: Record<UserRole, string> = {
      retailer: 'Rajesh Medical Store (Pune)',
      distributor: 'Shrine Pharma Stockist (Pune)',
      manufacturer: 'GSK Pharma Ltd (MH)',
      sales_rep: 'Vikram Joshi (MR — Pune East)',
      platform_admin: 'RxFlow Compliance Admin',
    };
    return names[role] || 'RxFlow User';
  }
}

export const AuthStore = new AuthStoreEngine();
