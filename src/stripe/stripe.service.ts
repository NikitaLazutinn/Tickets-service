import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
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
      success_url: `${process.env.LOCALHOST_URL}/success?session_id={CHECKOUT_SESSION_ID}`, // Fixed string interpolation
      cancel_url: `${process.env.LOCALHOST_URL}/cancel`,
      metadata: {
        userId: userId.toString(),
        ticketId: ticketId.toString(),
      },
    });

    return session;
  }

  async handleStripeWebhook(event: Stripe.Event, token: string) {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const ticketId = parseInt(session.metadata.ticketId);
        const userId = parseInt(session.metadata.userId);

        if (session.payment_status !== 'paid') {
          throw new InternalServerErrorException('Payment was not successful');
        }

        try {
          await this.ticketService.generateTicketPdfAndUploadToDropbox(
            userId.toString(),
            ticketId,
          );
        } catch (error) {
          throw new InternalServerErrorException(
            'Error during post-payment processing',
          );
        }
        break;
      }
      case 'checkout.session.async_payment_failed': {
        const failedSession = event.data.object as Stripe.Checkout.Session;
        const failedTicketId = parseInt(failedSession.metadata.ticketId);
        await this.ticketService.remove(failedTicketId, token);
        break;
      }
      default:
        console.log(`Unknown event: ${event.type}`);
    }
  }
}
