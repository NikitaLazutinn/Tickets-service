import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ForbiddenException('Access denied');
    }

    try {
      const user = await this.authService.googleAuth({ email: token });

      if (!user) {
        throw new ForbiddenException('Invalid or expired Google token');
      }

      request.user = user;
      return true;
    } catch (error) {
      throw new ForbiddenException('Access denied');
    }
  }
}
