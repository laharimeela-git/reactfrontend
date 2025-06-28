import React, { useEffect, useState } from 'react';
import { GoogleLogin, googleLogout, CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

const LoginButton: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      setErrorMessage('No ID token received');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/auth/google-login', { idToken });
      setIsLoading(false);
      setErrorMessage(null);
      console.log('✅ Login successful:', response.data);
    } catch (error) {
      setIsLoading(false);
      setErrorMessage('Login failed. Please try again.');
      console.error('❌ Login error:', error);
    }
  };

  const handleError = () => {
    setErrorMessage('Google Sign-In failed');
  };

  return (
    <div className="login-container">
      {errorMessage && (
        <div className="error-message">
          <span className="material-icons error-icon">error</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
      />

      {isLoading && (
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
};

export default LoginButton;
