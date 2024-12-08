import { Controller, Get, Redirect } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API information' })
  getInfo(): string {
    return this.appService.getHello();
  }

  @Get('docs')
  @ApiOperation({ summary: 'Redirect to API documentation' })
  @Redirect('/api-docs')
  getDocs(): void {
    // This method is intentionally empty as the @Redirect decorator handles the redirection
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  healthCheck(): { status: string } {
    return { status: 'ok' };
  }
}
