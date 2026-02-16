import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return {
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshDto) {
    const result = await this.authService.refresh(refreshDto.refreshToken);
    return {
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return {
      data: req.user,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
