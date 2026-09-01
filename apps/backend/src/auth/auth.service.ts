import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...result } = user;
    return result;
  }

  async login(user: { id: string; email: string; name: string; role: string }) {
    const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(data: { email: string; password: string; name: string; role?: string }) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'COACH',
      },
    });

    const { password: _, ...result } = user;
    return this.login(result);
  }

  async createInitialAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@svc.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Administrador SVC';

    const existingAdmin = await this.prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingAdmin) {
      return { message: 'Admin ya existe', user: existingAdmin };
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const admin = await this.prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName,
        role: 'ADMIN',
      },
    });

    const { password: _, ...result } = admin;
    return { message: 'Admin creado exitosamente', user: result };
  }
}