import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/create-company.dto';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, token: string) {
    if (token['roleId'] === 3) {
      throw new ForbiddenException('Access denied to this company');
    }

    const company = await this.prisma.company.create({
      data: {
        ...createCompanyDto,
        createdBy: token['userId'],
        isVerified: false,
      },
    });

    const verifyToken = this.jwtService.sign({ companyId: company.id });
    const verifyUrl = `${process.env.LOCALHOST_URL}/company/email-confirmation-token/${verifyToken}`;

    try {
      await this.sendVerificationEmail(company.email, verifyUrl);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }

    return {
      message: 'Company created successfully. Please verify your email.',
    };
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
      subject: 'Email Verification for Your Company',
      text: `Thank you for registering your company. Please verify your email by clicking the link below:\n\n${verifyUrl}`,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }

  async findAll(token: string) {
    if (token['roleId'] === 1) {
      return this.prisma.company.findMany();
    }
    return this.prisma.company.findMany({
      where: { users: { some: { id: token['userId'] } } },
    });
  }

  async findOne(id: number, token: string) {
    const company = this.prisma.company.findUnique({
      where: { id },
      include: { users: true },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }

    if (
      company['roleId'] !== 1 &&
      !company.users((user) => user.id === token['userId'])
    ) {
      throw new ForbiddenException('Access denied.');
    }

    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto, token: string) {
    await this.findOne(id, token);

    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Only Admins can update companies.');
    }

    return this.prisma.company.update({
      where: { id },
      data: { ...updateCompanyDto },
    });
  }

  async delete(id: number, token: string) {
    await this.findOne(id, token);

    if (token['roleId'] !== 1) {
      throw new ForbiddenException('Only Admins can delete companies.');
    }

    return this.prisma.company.delete({ where: { id } });
  }

  async verifyCompanyEmail(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      const company = await this.prisma.company.findUnique({
        where: { id: decoded.companyId },
      });

      if (!company) {
        throw new NotFoundException('Company not found');
      }

      if (company.isVerified) {
        return { message: 'Email is already verified' };
      }

      await this.prisma.company.update({
        where: { id: company.id },
        data: { isVerified: true },
      });

      return { message: 'Company email verified successfully' };
    } catch (error) {
      throw new BadRequestException('Invalid or expired verification token');
    }
  }
}
