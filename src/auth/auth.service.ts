import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from '../users/users.service';
import { RoleService } from '../role/role.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { PrismaService } from 'prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly roleService: RoleService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findUserByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    const user = await this.usersService.createUser(createUserDto);
    const defaultRole = await this.roleService.findRoleByName();
    if (!defaultRole) {
      throw new InternalServerErrorException('Default role not found');
    }

    await this.usersService.updateByEmail(user.email, {
      roleId: defaultRole.id,
    });
    const verifyToken = this.jwtService.sign({ email: user.email });
    const verifyUrl = `${process.env.LOCALHOST_URL}/auth/email-confirmation-token/${verifyToken}`;

    try {
      await this.sendVerificationEmail(user.email, verifyUrl);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }

    return {
      message: 'User registered successfully. Please verify your email.',
    };
  }

  async verifyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findUserByEmail(decoded.email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isVerified) {
        return { message: 'Email is already verified' };
      }

      await this.usersService.updateByEmail(user.email, { isVerified: true });
      return { message: 'Email verified successfully' };
    } catch (error) {
      console.error('Verification error:', error);
      if (error instanceof JwtService) {
        throw new BadRequestException('Invalid or expired verification token');
      }
      throw new InternalServerErrorException('Error during email verification');
    }
  }

  async signIn(loginDto: LoginDto) {
    const user = await this.usersService.findUserByEmail(loginDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isVerified) {
      throw new BadRequestException(
        'Email is not verified. Please check your inbox.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, roleId: user.roleId, email: user.email };
    const token = this.jwtService.sign(payload);
    return { message: 'Login successful', token };
  }

  async requestPasswordReset(email: string, token: string) {
    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Access denied, user not Admin');
    }

    const user = await this.usersService.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = this.jwtService.sign(
      { email: user.email },
      { expiresIn: '1h' },
    );
    await this.usersService.updateByEmail(email, {
      resetToken,
      resetTokenExpires: new Date(Date.now() + 3600 * 1000),
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    try {
      await this.sendResetPasswordEmail(user.email, resetUrl);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send reset password email',
      );
    }

    return { message: 'Password reset email sent successfully' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, token: string) {
    try {
      if (token['roleId'] !== 1) {
        throw new ForbiddenException('Access denied, user not Admin');
      }

      const decoded = this.jwtService.verify(resetPasswordDto.token);
      const user = await this.usersService.findUserByEmail(decoded.email);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (new Date() > new Date(user.resetTokenExpires)) {
        throw new BadRequestException('Reset token has expired');
      }

      if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
        throw new BadRequestException('Passwords do not match');
      }

      await this.usersService.updatePassword(
        user.email,
        resetPasswordDto.newPassword,
      );
      await this.usersService.updateByEmail(user.email, {
        resetToken: null,
        resetTokenExpires: null,
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

  private async sendVerificationEmail(email: string, verifyUrl: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SENDER,
      to: email,
      subject: 'Email Verification',
      text: `Thank you for registering. Please verify your email by clicking the link below:\n\n${verifyUrl}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }

  private async sendResetPasswordEmail(email: string, resetUrl: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SENDER,
      to: email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send reset password email',
      );
    }
  }

  async googleAuth(user: any) {
    const existingUser = await this.usersService.findUserByEmail(user.email);
    if (existingUser) {
      const tokenParameters = {
        id: existingUser.id,
        roleId: existingUser.roleId,
      };
      const accessToken = this.jwtService.sign(tokenParameters);
      return {
        statusCode: 200,
        message: 'User logged in successfully',
        accessToken,
      };
    }

    const hashedPassword = await bcrypt.hash('', 10);
    const newUser = await this.usersService.createUser({
      email: user.email,
      name: user.firstName + ' ' + user.lastName,
      password: hashedPassword,
    });

    const tokenParameters = { id: newUser.id, roleId: newUser.roleId };
    const accessToken = this.jwtService.sign(tokenParameters);

    return {
      statusCode: 201,
      message: 'User created successfully',
      accessToken,
    };
  }
}
