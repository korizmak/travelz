export interface AuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export interface AuthError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      reason: string;
    }>;
  };
}
