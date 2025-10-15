import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'Brewery & PMS API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        swagger: '/api',
        auth: '/auth',
        recipes: '/recipes',
        batches: '/batches',
      },
    };
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}