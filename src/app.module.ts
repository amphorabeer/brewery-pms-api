import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RecipesModule } from './recipes/recipes.module';
import { BatchesModule } from './batches/batches.module';
import { LocationsModule } from './locations/locations.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { TanksModule } from './tanks/tanks.module';
import { QcModule } from './qc/qc.module';
import { PackagingModule } from './packaging/packaging.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { InventoryModule } from './inventory/inventory.module';

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
    TanksModule,
    QcModule,
    PackagingModule,
    SuppliersModule, // ← Add this
    PurchaseOrdersModule, // 👈 Add this
    StockMovementsModule, // 👈 Add this
    InventoryModule, // 👈 Add this


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}