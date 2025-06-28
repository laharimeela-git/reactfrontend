import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
  Button
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import ScheduleIcon from '@mui/icons-material/Schedule';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PersonIcon from '@mui/icons-material/Person';
import { AuthService } from '../../../auth/services/auth.service';
// Define the AuthUser interface here
interface AuthUser {
  displayName: string;
  email: string;
  photoUrl?: string;
  lastLoginAt?: string | number | Date;
  provider: string;
}


interface Props {
  authService: AuthService;
}

export const UserProfile: React.FC<Props> = ({ authService }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const sub = authService.authState$.subscribe((authState) => {
      setUser(authState.user);
      setIsLoading(authState.isLoading);
    });

    return () => sub.unsubscribe();
  }, [authService]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFormattedLastLogin = (): string => {
    if (!user?.lastLoginAt) return 'Unknown';
    return new Date(user.lastLoginAt).toLocaleString();
  };

  if (!user) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
      <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 2, boxShadow: 2 }}>
        <CardHeader
          avatar={
            user.photoUrl ? (
              <Avatar src={user.photoUrl} alt={user.displayName} />
            ) : (
              <Avatar>
                <PersonIcon />
              </Avatar>
            )
          }
          title={user.displayName}
          subheader={user.email}
        />

        <CardContent>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ScheduleIcon fontSize="small" />
            <Typography variant="body2">
              <strong>Last Login:</strong> {getFormattedLastLogin()}
            </Typography>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <VerifiedUserIcon fontSize="small" />
            <Typography variant="body2">
              <strong>Provider:</strong> {user.provider}
            </Typography>
          </div>
        </CardContent>

        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
            startIcon={isLoading ? <CircularProgress size={16} /> : <LogoutIcon />}
            disabled={isLoading}
          >
            {!isLoading && 'Sign Out'}
          </Button>
        </CardActions>
      </Card>
    </div>
  );
};
