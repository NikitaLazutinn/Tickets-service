import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import Stripe from 'stripe';
import { AuthUserGuard } from 'src/guards';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(AuthUserGuard)
  @Post('create-session/:ticketId')
  async createPaymentSession(
    @Param('ticketId') ticketId: string,
    @Query('userId') userId: number,
    @Req() req,
  ) {
    const token = req.user;
    return await this.stripeService.createPaymentSession(
      +ticketId,
      userId,
      token,
    );
  }

  @UseGuards(AuthUserGuard)
  @Post('webhook')
  async handleStripeWebhook(@Body() payload: any, @Req() req) {
    const token = req.user;
    const sig = payload['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const event: Stripe.Event =
      this.stripeService.stripe.webhooks.constructEvent(
        payload,
        sig,
        endpointSecret,
      );

    if (!event) {
      throw new BadRequestException('Error verifying webhook signature');
    }

    return await this.stripeService.handleStripeWebhook(event, token);
  }
}
