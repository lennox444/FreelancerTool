import { Controller, Post, Body, Req, Res, UseGuards } from '@nestjs/common';
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

    @Post('/webhook')
    async handleWebhook(@Req() req: any, @Res() res: any) {
        const sig = req.headers['stripe-signature'];

        try {
            await this.billingService.handleWebhook(sig, req.body);
        } catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        res.json({ received: true });
    }
}
