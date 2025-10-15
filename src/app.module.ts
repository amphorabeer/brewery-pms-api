import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RecipesModule } from './recipes/recipes.module';
import { BatchesModule } from './batches/batches.module';
import { AppController } from './app.controller';
import { LocationsModule } from './locations/locations.module';  // ← Fix this path

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    RecipesModule,
    BatchesModule,
    LocationsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}