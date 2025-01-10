import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from 'prisma/prisma.module';
import { ImgurModule } from './imgur/imgur.module';
import { TicketModule } from './ticket/ticket.module';
import { StripeModule } from './stripe/stripe.module';
import { NewsModule } from './news/news.module';
import { PromoCodeModule } from './promo-code/promo-code.module';
import { EventsModule } from './events_/events.module';
import { CompaniesModule } from './companies/companies.module';
import { EmailModule } from './email/email.module';
import { PdfModule } from './pdf/pdf.module';
import { RatingModule } from './rating/rating.module';
import { SavedEventsModule } from './saved-events/saved-events.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    RoleModule,
    UsersModule,
    PrismaModule,
    ImgurModule,
    NewsModule,
    TicketModule,
    StripeModule,
    EventsModule,
    CompaniesModule,
    PromoCodeModule,
    EmailModule,
    PdfModule,
    RatingModule,
    SavedEventsModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
