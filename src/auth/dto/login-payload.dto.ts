import { User } from 'users/entities/user.entity';

export class LoginPayload {
  id: number;
  role: string;

  constructor(user: User) {
    this.id = user.id;
    this.role = user.role;
  }
}
