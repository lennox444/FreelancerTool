import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { UpdateOnboardingStepDto } from './dto/update-onboarding-step.dto';
import { SkipOnboardingStepDto } from './dto/skip-onboarding-step.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) { }

  @Get('status')
  async getStatus(@Request() req) {
    const profile = await this.onboardingService.getStatus(req.user.id);
    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Patch('step/:stepNumber')
  async updateStep(
    @Request() req,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Body() dto: UpdateOnboardingStepDto,
  ) {
    // Set stepNumber from param
    dto.stepNumber = stepNumber;

    const profile = await this.onboardingService.updateStep(
      req.user.id,
      dto,
    );
    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post('skip/:stepNumber')
  async skipStep(
    @Request() req,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
  ) {
    const profile = await this.onboardingService.skipStep(
      req.user.id,
      stepNumber,
    );
    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Post('complete')
  async complete(@Request() req) {
    const profile = await this.onboardingService.completeOnboarding(
      req.user.id,
    );
    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get('profile')
  async getProfile(@Request() req) {
    const profile = await this.onboardingService.getProfile(req.user.id);
    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
