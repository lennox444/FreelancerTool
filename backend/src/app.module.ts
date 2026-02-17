import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { BillingModule } from './modules/billing/billing.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { TimeEntriesModule } from './modules/time-entries/time-entries.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { AdminModule } from './modules/admin/admin.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { TaxAssistantModule } from './modules/tax-assistant/tax-assistant.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    AuthModule,
    OnboardingModule,
    CustomersModule,
    ProjectsModule,
    InvoicesModule,
    PaymentsModule,
    BillingModule,
    DashboardModule,
    TimeEntriesModule,
    AppointmentsModule,
    AdminModule,
    QuotesModule,
    ExpensesModule,
    TaxAssistantModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
