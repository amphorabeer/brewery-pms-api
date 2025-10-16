import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RecipesModule } from './recipes/recipes.module';
import { BatchesModule } from './batches/batches.module';
import { LocationsModule } from './locations/locations.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { AppController } from './app.controller';

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
    IngredientsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}