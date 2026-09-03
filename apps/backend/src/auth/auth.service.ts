import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
    staffType?: 'DIRECTOR_TECNICO' | 'ADMINISTRATIVO',
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (staffType && user.staffType !== staffType) {
      throw new UnauthorizedException(
        'El rol de staff seleccionado no coincide con la cuenta',
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return result;
  }

  login(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    staffType: string;
    squad?: string | null;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      staffType: user.staffType,
      squad: user.squad ?? null,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        staffType: user.staffType,
        squad: user.squad ?? null,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    role?: string;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
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
        staffType:
          data.role === 'ADMIN' ? 'ADMINISTRATIVO' : 'DIRECTOR_TECNICO',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = user;
    return this.login(result);
  }

  async createInitialAdmin() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@svc.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminName = process.env.ADMIN_NAME || 'Administrador SVC';

    const existingAdmin = await this.prisma.user.findUnique({
      where: { email: adminEmail },
    });
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
        staffType: 'ADMINISTRATIVO',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = admin;
    return { message: 'Admin creado exitosamente', user: result };
  }
}
