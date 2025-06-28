export interface AuthUser {
  displayName: string;
  email: string;
  photoUrl?: string;
  provider: string;
  lastLoginAt?: number | string;
}
