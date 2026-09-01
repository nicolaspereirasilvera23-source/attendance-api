import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  console.log('🌱 Ejecutando seed de administrador inicial...');
  const result = await authService.createInitialAdmin();
  console.log('✅ Resultado:', result);

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('❌ Error en seed:', err);
  process.exit(1);
});
