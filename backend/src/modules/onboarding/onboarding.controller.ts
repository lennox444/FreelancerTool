import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { UpdateOnboardingStepDto } from './dto/update-onboarding-step.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * GET /onboarding/status
   * Get current onboarding status and progress
   */
  @Get('status')
  async getStatus(@Request() req) {
    const userId = req.user.id;
    const profile = await this.onboardingService.getStatus(userId);

    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  /**
   * GET /onboarding/profile
   * Get full onboarding profile
   */
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.id;
    const profile = await this.onboardingService.getProfile(userId);

    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  /**
   * PATCH /onboarding/step/:stepNumber
   * Update specific step
   */
  @Patch('step/:stepNumber')
  async updateStep(
    @Request() req,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
    @Body() body: Omit<UpdateOnboardingStepDto, 'stepNumber'>,
  ) {
    const userId = req.user.id;
    const dto: UpdateOnboardingStepDto = { stepNumber, ...body };
    const profile = await this.onboardingService.updateStep(userId, dto);

    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  /**
   * POST /onboarding/skip/:stepNumber
   * Skip specific step
   */
  @Post('skip/:stepNumber')
  async skipStep(
    @Request() req,
    @Param('stepNumber', ParseIntPipe) stepNumber: number,
  ) {
    const userId = req.user.id;
    const profile = await this.onboardingService.skipStep(userId, stepNumber);

    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  /**
   * POST /onboarding/complete
   * Mark onboarding as completed
   */
  @Post('complete')
  async complete(@Request() req) {
    const userId = req.user.id;
    const profile = await this.onboardingService.completeOnboarding(userId);

    return {
      data: profile,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
