import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../core/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { SubscriptionStatus, SubscriptionPlan, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    // Calculate trial end date (14 days from now)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        subscriptionPlan: SubscriptionPlan.FREE_TRIAL,
        trialEndsAt: trialEndsAt,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        trialEndsAt: user.trialEndsAt,
        hasPassword: !!user.passwordHash,
      },
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Google-only accounts have no password
    if (!user.passwordHash) {
      throw new UnauthorizedException('Please use Google login for this account');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        trialEndsAt: user.trialEndsAt,
        hasPassword: !!user.passwordHash,
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      // Check user still exists
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('User no longer exists');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, role: user.role },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: '15m',
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      trialEndsAt: user.trialEndsAt,
      targetHourlyRate: user.targetHourlyRate
        ? Number(user.targetHourlyRate)
        : null,
      isKleinunternehmer: user.isKleinunternehmer,
      stripeConnectAccountId: user.stripeConnectAccountId,
      stripeConnectEnabled: user.stripeConnectEnabled,
      hasPassword: !!user.passwordHash,
    };
  }

  async updateProfile(
    userId: string,
    data: { firstName?: string; lastName?: string; targetHourlyRate?: number; isKleinunternehmer?: boolean },
  ) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.targetHourlyRate !== undefined && {
          targetHourlyRate: data.targetHourlyRate,
        }),
        ...(data.isKleinunternehmer !== undefined && {
          isKleinunternehmer: data.isKleinunternehmer,
        }),
      },
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      trialEndsAt: user.trialEndsAt,
      targetHourlyRate: user.targetHourlyRate
        ? Number(user.targetHourlyRate)
        : null,
      isKleinunternehmer: user.isKleinunternehmer,
      stripeConnectAccountId: user.stripeConnectAccountId,
      stripeConnectEnabled: user.stripeConnectEnabled,
      hasPassword: !!user.passwordHash,
    };
  }

  async setPassword(userId: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.passwordHash) throw new BadRequestException('Account hat bereits ein Passwort. Bitte "Passwort ändern" verwenden.');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.passwordHash) throw new BadRequestException('Kein Passwort gesetzt. Bitte "Passwort setzen" verwenden.');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) throw new UnauthorizedException('Aktuelles Passwort ist falsch');

    const isSame = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSame) throw new BadRequestException('Das neue Passwort muss sich vom aktuellen unterscheiden');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  }

  async deleteAccount(userId: string) {
    // 1. Get user data (to check for Stripe subscription)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        stripeCustomerId: true,
      },
    });

    // 2. Cancel Stripe subscription if exists
    if (user?.stripeCustomerId) {
      try {
        // Initialize Stripe (same as in BillingService)
        const Stripe = require('stripe');
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_PLACEHOLDER', {
          apiVersion: '2024-12-18.acacia',
        });

        // Retrieve active subscriptions for this customer and cancel them
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
        });

        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
          console.log(`✅ Stripe subscription ${subscription.id} cancelled for user ${userId}`);
        }
      } catch (error) {
        // Log error but continue with account deletion
        // We don't want a Stripe error to prevent account deletion
        console.error('⚠️ Failed to cancel Stripe subscription:', error);
      }
    }

    // 3. Delete user (cascade will handle all related data)
    // This will delete:
    // - All projects owned by the user
    // - All customers
    // - All invoices
    // - All time entries
    // - All other user-related data (due to onDelete: Cascade in schema)
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  }

  async findOrCreateGoogleUser(profile: any): Promise<{ user: any; isNew: boolean }> {
    const googleId: string = profile.id;
    const email: string = profile.emails?.[0]?.value;
    const firstName: string = profile.name?.givenName || profile.displayName?.split(' ')[0] || 'User';
    const lastName: string = profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || '';

    // 1. Try to find by googleId first
    let user = await this.prisma.user.findUnique({ where: { googleId } });
    if (user) {
      return { user, isNew: false };
    }

    // 2. Try to find by email (existing password account)
    if (email) {
      const existingByEmail = await this.prisma.user.findUnique({ where: { email } });
      if (existingByEmail) {
        // Link Google account to existing user
        user = await this.prisma.user.update({
          where: { id: existingByEmail.id },
          data: { googleId },
        });
        return { user, isNew: false };
      }
    }

    // 3. Create new user
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    user = await this.prisma.user.create({
      data: {
        email,
        googleId,
        firstName,
        lastName,
        subscriptionStatus: SubscriptionStatus.TRIAL,
        subscriptionPlan: SubscriptionPlan.FREE_TRIAL,
        trialEndsAt,
      },
    });

    return { user, isNew: true };
  }

  async generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
