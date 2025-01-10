import {
  Controller,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
  Req,
  UseGuards,
  Get,
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
  @Get('payment-success')
  async handlePaymentSuccess(
    @Query('session_id') sessionId: string,
    @Req() req,
  ) {
    const token = req.user;

    await this.stripeService.handleSuccessfulPayment(sessionId, token);
    return { message: 'Payment was successful' };
  }

  // @UseGuards(AuthUserGuard)
  // @Get('payment-cancelled')
  // async handlePaymentCancelled(
  //   @Query('session_id') sessionId: string,
  //   @Req() req,
  // ) {
  //   const token = req.user;
  //   if (!sessionId) {
  //     throw new BadRequestException('Session ID is required');
  //   }

  //   await this.stripeService.handleCancelledPayment(sessionId, token);
  //   return { message: 'Payment was cancelled' };
  // }
}
