import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { Prisma, User } from '../../generated/prisma/client.js';
import { UserRT } from './users.types.js';
import { PaystackClient } from '../../infra/payments/paystack.client.js';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackClient,
  ) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<UserRT | null> {
    const user = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      omit: { passwordHash: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async userOrNull(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<UserRT[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      omit: { passwordHash: true },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<UserRT> {
    try {
      return await this.prisma.user.create({
        data,
        omit: { passwordHash: true },
      });
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      )
        throw new ConflictException('Email already in use', {
          errorCode: 'EMAIL_ALREADY_EXIST',
        });

      throw err;
    }
  }

  async update(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    try {
      const user = await this.prisma.user.update({
        where: userWhereUniqueInput,
        data,
      });

      if (!user) throw new NotFoundException('User not found');
      return user;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      )
        throw new NotFoundException('User not found', {
          errorCode: 'UPDATE_FAILED',
        });
      throw err;
    }
  }

  async delete(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<UserRT> {
    return await this.prisma.user.delete({
      where: userWhereUniqueInput,
      omit: { passwordHash: true },
    });
  }

  async testPay() {
    return await this.paystack.initialize({
      email: 'olakunle@test.com',
      amountKobo: 10000,
      reference: 'test-ref-1234567891',
    });
  }

  async testVer(reference: string) {
    return await this.paystack.verify({
      reference,
    });
  }
}
