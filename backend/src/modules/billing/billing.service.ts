import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../core/database/prisma.service';

@Injectable()
export class BillingService {
    private stripe: Stripe;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');

        // Initialize Stripe (User needs to provide Key)
        this.stripe = new Stripe(stripeKey || 'sk_test_PLACEHOLDER', {
            apiVersion: '2024-12-18.acacia' as any, // Bypass TS check for new API version
        });
    }

    async createCheckoutSession(userId: string, userEmail: string) {
        // 1. Check if user already has a Stripe Customer ID
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) throw new BadRequestException('User not found');

        let customerId = user.stripeCustomerId;

        // 2. Create customer if not exists
        if (!customerId) {
            const customer = await this.stripe.customers.create({
                email: userEmail,
                name: `${user.firstName} ${user.lastName}`,
                metadata: {
                    userId: userId,
                }
            });
            customerId = customer.id;

            // Save customer ID to user
            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeCustomerId: customerId },
            });
        }

        // 3. Create Checkout Session
        const priceId = this.configService.get<string>('STRIPE_PRICE_ID_PRO');

        if (!priceId) {
            throw new BadRequestException('Stripe Price ID not configured (STRIPE_PRICE_ID_PRO)');
        }

        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            // Force immediate payment (no trial)
            subscription_data: {
                trial_period_days: undefined, // Ensure no trial is applied
            },
            success_url: `${this.configService.get('FRONTEND_URL')}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${this.configService.get('FRONTEND_URL')}/settings/billing?canceled=true`,
            metadata: {
                userId: userId,
            },
        });

        return { url: session.url };
    }

    // Verify session and activate subscription (Polling fallback for local dev)
    async verifyCheckoutSession(sessionId: string, userId: string) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);

            if (!session) {
                throw new BadRequestException('Session not found');
            }

            // Check if paid
            if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
                // Activate PRO
                await this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        subscriptionStatus: 'ACTIVE',
                        subscriptionPlan: 'PRO',
                        trialEndsAt: null, // End trial immediately
                    }
                });
                return { success: true, status: 'PRO' };
            }

            return { success: false, status: 'PENDING' };
        } catch (error) {
            console.error('Verify Session Error:', error);
            throw new BadRequestException('Verification failed');
        }
    }

    async handleWebhook(signature: string, payload: Buffer) {
        const endpointSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        let event;

        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
        } catch (err) {
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                await this.fulfillSubscription(session);
                break;
            case 'invoice.payment_succeeded':
                // Renew subscription logic if needed
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return { received: true };
    }

    private async fulfillSubscription(session: any) {
        const userId = session.metadata.userId;
        if (userId) {
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    subscriptionStatus: 'ACTIVE',
                    subscriptionPlan: 'PRO',
                    trialEndsAt: null,
                }
            });
            console.log(`User ${userId} upgraded to PRO via Stripe.`);
        }
    }
}
