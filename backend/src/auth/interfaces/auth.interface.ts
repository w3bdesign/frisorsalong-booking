import { User } from '../../users/entities/user.entity';

export type UserResponse = Omit<User, 'password' | 'hashPassword' | 'validatePassword'>;

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
