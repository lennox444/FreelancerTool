import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { OwnershipGuard } from '../../core/guards/ownership.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard, OwnershipGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto, @Request() req) {
    const customer = await this.customersService.create(
      createCustomerDto,
      req.ownerId,
    );
    return {
      data: customer,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'asc' | 'desc',
  ) {
    const customers = await this.customersService.findAll(
      req.ownerId,
      search,
      sortBy,
      order,
    );
    return {
      data: customers,
      meta: {
        total: customers.length,
        timestamp: new Date().toISOString(),
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const customer = await this.customersService.findOne(id, req.ownerId);
    return {
      data: customer,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Request() req,
  ) {
    const customer = await this.customersService.update(
      id,
      updateCustomerDto,
      req.ownerId,
    );
    return {
      data: customer,
      meta: { timestamp: new Date().toISOString() },
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    const result = await this.customersService.remove(id, req.ownerId);
    return {
      data: result,
      meta: { timestamp: new Date().toISOString() },
    };
  }
}
