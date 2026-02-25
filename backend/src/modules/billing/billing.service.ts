import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../../core/database/prisma.service';
import { InvoicesService } from '../invoices/invoices.service';

@Injectable()
export class BillingService {
    private stripe: Stripe;

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
        private invoicesService: InvoicesService,
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

    // ─── Stripe Connect (Express Accounts) ───────────────────────────────────

    async connectStripeAccount(userId: string): Promise<{ url: string }> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

        let accountId = user.stripeConnectAccountId;

        // Create a new Express account if the user doesn't have one yet
        if (!accountId) {
            const account = await this.stripe.accounts.create({
                type: 'express',
                country: 'DE',
                email: user.email,
                metadata: { userId },
            });
            accountId = account.id;

            await this.prisma.user.update({
                where: { id: userId },
                data: { stripeConnectAccountId: accountId },
            });
        }

        // Create account link for onboarding (or re-onboarding)
        const accountLink = await this.stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${frontendUrl}/settings?stripe=refresh`,
            return_url: `${frontendUrl}/settings?stripe=connected`,
            type: 'account_onboarding',
        });

        return { url: accountLink.url };
    }

    async getConnectStatus(userId: string): Promise<{ connected: boolean; chargesEnabled: boolean; accountId: string | null; platformFeePct: number }> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        const platformFeePct = parseFloat(this.configService.get<string>('STRIPE_PLATFORM_FEE_PERCENT') ?? '2');

        if (!user.stripeConnectAccountId) {
            return { connected: false, chargesEnabled: false, accountId: null, platformFeePct };
        }

        try {
            const account = await this.stripe.accounts.retrieve(user.stripeConnectAccountId);
            const chargesEnabled = account.charges_enabled === true;

            // Sync stripeConnectEnabled to DB if it changed
            if (chargesEnabled !== user.stripeConnectEnabled) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: { stripeConnectEnabled: chargesEnabled },
                });
            }

            return {
                connected: true,
                chargesEnabled,
                accountId: user.stripeConnectAccountId,
                platformFeePct,
            };
        } catch (error) {
            // Account may have been deleted on Stripe side
            console.error('Stripe Connect status error:', error);
            return { connected: false, chargesEnabled: false, accountId: null, platformFeePct };
        }
    }

    async disconnectStripe(userId: string): Promise<{ success: boolean }> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new BadRequestException('User not found');

        if (user.stripeConnectAccountId) {
            try {
                await this.stripe.accounts.del(user.stripeConnectAccountId);
            } catch (error) {
                // If the account is already deleted or deauthorized, continue anyway
                console.error('Stripe account delete error (continuing):', error.message);
            }
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { stripeConnectAccountId: null, stripeConnectEnabled: false },
        });

        return { success: true };
    }

    private async updateConnectStatus(account: Stripe.Account) {
        if (!account.id) return;

        const user = await this.prisma.user.findUnique({
            where: { stripeConnectAccountId: account.id },
        });

        if (!user) return;

        const chargesEnabled = account.charges_enabled === true;
        if (chargesEnabled !== user.stripeConnectEnabled) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { stripeConnectEnabled: chargesEnabled },
            });
            console.log(`Updated stripeConnectEnabled=${chargesEnabled} for user ${user.id}`);
        }
    }

    async handleWebhook(signature: string, payload: any) {
        const endpointSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        let event: Stripe.Event;

        console.log(`[StripeWebhook] Received event. Signature present: ${!!signature}, Secret present: ${!!endpointSecret}`);

        try {
            if (endpointSecret && signature) {
                event = this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
            } else {
                // In development without a webhook secret, we trust the payload
                // stripe-signature verification is skipped.
                console.warn('[StripeWebhook] WARNING: Skipping signature verification (no secret or signature provided)');
                const json = typeof payload === 'string' ? payload : (payload as Buffer).toString('utf8');
                event = JSON.parse(json);
            }
        } catch (err) {
            console.error(`[StripeWebhook] Event construction failed: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        console.log(`[StripeWebhook] Processing event type: ${event.type} (${event.id})`);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log(`[StripeWebhook] Checkout session completed: ${session.id}`, session.metadata);
                if (session.metadata?.invoiceToken || session.metadata?.invoiceId) {
                    // Invoice payment via client portal
                    await this.fulfillInvoicePayment(session);
                } else if (session.metadata?.userId) {
                    // Subscription checkout
                    await this.fulfillSubscription(session);
                }
                break;
            }
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as any;
                console.log(`[StripeWebhook] Invoice payment succeeded: ${invoice.id}`, invoice.metadata);

                // If this invoice has our metadata, update our internal invoice status.
                // This can happen if Stripe generates an invoice for a customer.
                if (invoice.metadata?.invoiceId) {
                    await this.fulfillInvoicePayment(invoice);
                } else if (invoice.subscription) {
                    // Handle subscription renewal if needed
                    console.log(`[StripeWebhook] Subscription invoice paid for subscription: ${invoice.subscription}`);
                }
                break;
            }
            case 'invoice.paid': {
                const invoice = event.data.object as any;
                console.log(`[StripeWebhook] Invoice marked as paid: ${invoice.id}`);
                if (invoice.metadata?.invoiceId) {
                    await this.fulfillInvoicePayment(invoice);
                }
                break;
            }
            case 'account.updated': {
                const account = event.data.object as Stripe.Account;
                await this.updateConnectStatus(account);
                break;
            }
            default:
                console.log(`[StripeWebhook] Unhandled event type ${event.type}`);
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

    private async fulfillInvoicePayment(sessionOrInvoice: any) {
        const metadata = sessionOrInvoice.metadata;
        const invoiceId = metadata?.invoiceId;
        const ownerId = metadata?.ownerId;

        console.log(`[StripeWebhook] Fulfilling invoice payment for invoiceId: ${invoiceId}, ownerId: ${ownerId}`);

        if (!invoiceId) {
            console.error('[StripeWebhook] No invoiceId found in metadata');
            return;
        }

        // Handle both Checkout Session and Invoice objects
        const amountPaidCents = sessionOrInvoice.amount_total ?? sessionOrInvoice.amount_paid ?? 0;
        const amountPaid = amountPaidCents / 100;

        console.log(`[StripeWebhook] Amount paid: ${amountPaid}`);

        try {
            await this.invoicesService.recordStripePayment(invoiceId, amountPaid);
            console.log(`[StripeWebhook] Successfully recorded payment for invoice ${invoiceId}`);
        } catch (error) {
            console.error(`[StripeWebhook] Error recording payment for invoice ${invoiceId}:`, error);
        }

        // Auto-create expense for Stripe fees so profit/tax calculations stay accurate.
        // Platform fee: exact (from ENV). Stripe fee: ~1.4% + 0.25€ (EU cards estimate).
        if (ownerId && amountPaid > 0) {
            try {
                const feePct = parseFloat(this.configService.get<string>('STRIPE_PLATFORM_FEE_PERCENT') ?? '2');
                const platformFee = amountPaid * (feePct / 100);
                const stripeFee = amountPaid * 0.014 + 0.25;
                const totalFees = Math.round((platformFee + stripeFee) * 100) / 100;

                const invoice = await this.prisma.invoice.findUnique({ where: { id: invoiceId } });
                const label = invoice?.invoiceNumber ? `Rechnung ${invoice.invoiceNumber}` : `Rechnung (${invoiceId.slice(0, 8)})`;

                await this.prisma.expense.create({
                    data: {
                        ownerId,
                        amount: totalFees,
                        description: `Stripe-Transaktionsgebühren (${label})`,
                        category: 'OTHER',
                        date: new Date(),
                    },
                });
                console.log(`[StripeWebhook] Auto-created Stripe fee expense: ${totalFees} EUR for invoice ${invoiceId}`);
            } catch (feeError) {
                console.error('[StripeWebhook] Failed to create fee expense:', feeError);
            }
        }
    }
}
