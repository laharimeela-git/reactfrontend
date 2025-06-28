import { BehaviorSubject } from 'rxjs';
import { AuthUser } from '../models/auth-user.interface';

export class AuthService {
  authState$ = new BehaviorSubject<{ user: AuthUser | null; isLoading: boolean }>({
    user: null,
    isLoading: false,
  });

  async signOut(): Promise<void> {
    this.authState$.next({ user: null, isLoading: false });
  }

  // Example: call this when a user logs in
  simulateLogin(user: AuthUser) {
    this.authState$.next({ user, isLoading: false });
  }
}
