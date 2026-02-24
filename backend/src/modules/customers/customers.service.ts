import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(createCustomerDto: CreateCustomerDto, ownerId: string) {
    // Check if customer with this email already exists for this owner
    const existingCustomer = await this.prisma.customer.findFirst({
      where: {
        email: createCustomerDto.email,
        ownerId,
      },
    });

    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    return this.prisma.customer.create({
      data: {
        ...createCustomerDto,
        ownerId,
      },
    });
  }

  async findAll(ownerId: string, search?: string, sortBy = 'createdAt', order: 'asc' | 'desc' = 'desc') {
    const where: any = { ownerId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const customers = await this.prisma.customer.findMany({
      where,
      orderBy: sortBy === 'revenue' ? { createdAt: 'desc' } : { [sortBy]: order },
      include: {
        _count: {
          select: { invoices: true },
        },
        invoices: {
          where: { status: { in: ['PAID', 'PARTIALLY_PAID'] } },
          select: { totalPaid: true },
        },
      },
    });

    // Compute revenue per customer
    const withRevenue = customers.map((c) => {
      const revenue = c.invoices.reduce(
        (sum, inv) => sum + Number(inv.totalPaid),
        0,
      );
      const { invoices: _invoices, ...rest } = c;
      return { ...rest, revenue };
    });

    if (sortBy === 'revenue') {
      withRevenue.sort((a, b) =>
        order === 'desc' ? b.revenue - a.revenue : a.revenue - b.revenue,
      );
    }

    return withRevenue;
  }

  async findOne(id: string, ownerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, ownerId },
      include: {
        invoices: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found or access denied');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto, ownerId: string) {
    // Verify ownership
    await this.findOne(id, ownerId);

    // If email is being updated, check for conflicts
    if (updateCustomerDto.email) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: {
          email: updateCustomerDto.email,
          ownerId,
          NOT: { id },
        },
      });

      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerDto,
    });
  }

  async remove(id: string, ownerId: string) {
    // Verify ownership
    const customer = await this.findOne(id, ownerId);

    // Check if customer has invoices
    if (customer._count.invoices > 0) {
      throw new ConflictException('Cannot delete customer with existing invoices');
    }

    await this.prisma.customer.delete({
      where: { id },
    });

    return { message: 'Customer deleted successfully' };
  }
}
