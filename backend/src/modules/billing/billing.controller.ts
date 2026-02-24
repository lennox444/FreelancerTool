import { Controller, Post, Get, Delete, Body, Req, Res, UseGuards } from '@nestjs/common';
import { BillingService } from './billing.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @UseGuards(JwtAuthGuard)
    @Post('/create-checkout-session')
    async createCheckoutSession(@Req() req: any) {
        try {
            console.log('[BillingController] Request received from IP:', req.ip);
            console.log('[BillingController] User object in request:', req.user); // Critical log

            if (!req.user) {
                console.error('[BillingController] No user attached to request! throwing error...');
                throw new Error('User not authenticated properly (req.user is undefined)');
            }

            const userId = req.user.id;
            const userEmail = req.user.email;
            console.log(`[BillingController] User ID: ${userId}, Email: ${userEmail}`);

            const result = await this.billingService.createCheckoutSession(userId, userEmail);
            console.log('[BillingController] Session created successfully:', result);
            return result;

        } catch (error) {
            const errorMsg = `[${new Date().toISOString()}] Error in createCheckoutSession: ${error.message}\nStack: ${error.stack}\n\n`;
            console.error('[BillingController] Caught error:', error);
            try {
                fs.appendFileSync(path.join(process.cwd(), 'error.log'), errorMsg);
            } catch (fsError) {
                console.error('Failed to write to error.log', fsError);
            }
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('/verify-session')
    async verifySession(@Body('sessionId') sessionId: string, @Req() req: any) {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }
        const userId = req.user.id;
        return this.billingService.verifyCheckoutSession(sessionId, userId);
    }

    // ─── Stripe Connect endpoints ─────────────────────────────────────────────

    @UseGuards(JwtAuthGuard)
    @Post('/connect/start')
    async connectStripeAccount(@Req() req: any) {
        return this.billingService.connectStripeAccount(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('/connect/status')
    async getConnectStatus(@Req() req: any) {
        return this.billingService.getConnectStatus(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/connect')
    async disconnectStripe(@Req() req: any) {
        return this.billingService.disconnectStripe(req.user.id);
    }

    // ─────────────────────────────────────────────────────────────────────────

    @Post('/webhook')
    async handleWebhook(@Req() req: any, @Res() res: any) {
        const sig = req.headers['stripe-signature'];
        // Use rawBody for signature validation; fallback to body for dev without webhook secret
        const payload = req.rawBody ?? req.body;

        try {
            await this.billingService.handleWebhook(sig, payload);
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        res.json({ received: true });
    }
}
