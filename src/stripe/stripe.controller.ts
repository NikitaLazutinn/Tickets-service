import { Controller, Post, Body, Param } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-session/:ticketId')
  async createPaymentSession(
    @Param('ticketId') ticketId: string,
    @Body('userId') userId: number,
  ) {
    return this.stripeService.createPaymentSession(+ticketId, userId);
  }
}
