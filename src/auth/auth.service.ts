import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginUserDto } from './dto/login-user.dto';
import { UserService } from 'users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'users/entities/user.entity';
import { validatePassword } from 'utils/password';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authData: LoginUserDto): Promise<{ user: User; token: string }> {
    const user = await this.usersService.findOneByEmail(authData.login);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.active) {
      throw new NotFoundException('Usuário excluído');
    }

    const isPasswordValid = await validatePassword(user, authData.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    const payload = { userId: user.id, username: user.email, role: user.role };

    const token = await this.jwtService.signAsync(payload);
    delete user.id;
    delete user.password;
    delete user.role;
    delete user.active;
    return { user, token };
  }

  async decodeToken(token: string) {
    const data = this.jwtService.decode(token);
    return data;
  }
}
