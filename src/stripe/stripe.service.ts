import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { TicketService } from 'src/ticket/ticket.service';

@Injectable()
export class StripeService {
  stripe: Stripe;

  constructor(private ticketService: TicketService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: null,
    });
  }

  async createPaymentSession(ticketId: number, userId: number, token: string) {
    const ticket = await this.ticketService.findOne(ticketId, token);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (!userId) {
      throw new NotFoundException('User ID is required');
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Ticket for event ${ticket.eventId}`,
              description: `Seat: ${ticket.seatNumber}`,
            },
            unit_amount: ticket.price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.LOCALHOST_URL}/stripe/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.LOCALHOST_URL}/stripe/payment-cancelled?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        userId: userId.toString(),
        ticketId: ticketId.toString(),
      },
    });

    return session;
  }

  async handleSuccessfulPayment(sessionId: string, token: string) {
    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    const session = await this.stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      throw new BadRequestException('Invalid session');
    }

    if (session.payment_status !== 'paid') {
      throw new BadRequestException('Payment was not successful');
    }

    const ticketId = parseInt(session.metadata.ticketId);

    try {
      await this.ticketService.generateTicketPdfAndUploadToDropbox(
        token,
        ticketId,
      );
    } catch (error) {
      console.error('Error during post-payment processing:', error);
      throw new InternalServerErrorException(
        'Error during post-payment processing',
      );
    }
  }

  // async handleCancelledPayment(sessionId: string, token: string) {
  //   if (!sessionId) {
  //     throw new BadRequestException('Session ID is required');
  //   }

  //   const session = await this.stripe.checkout.sessions.retrieve(sessionId);

  //   if (!session) {
  //     throw new BadRequestException('Invalid session');
  //   }

  //   if (
  //     session.payment_status === 'unpaid' ||
  //     session.payment_status === 'no_payment_required'
  //   ) {
  //     const ticketId = parseInt(session.metadata.ticketId);
  //     try {
  //       await this.ticketService.remove(ticketId, token);
  //     } catch (error) {
  //       throw new InternalServerErrorException(
  //         'Error during ticket cancellation',
  //       );
  //     }

  //     return { message: 'Payment was cancelled and ticket has been removed' };
  //   }

  //   throw new BadRequestException('Payment was not cancelled');
  // }
}
