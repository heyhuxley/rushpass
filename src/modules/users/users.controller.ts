import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service.js';
import { RoleGuard } from '../../guards/role.guard.js';
import { ResponseMessage } from '../../common/decorators/response-message.decorator.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { UserRT } from './users.types.js';
import { CurrentUser } from '@nestjs/authentication';
import type { AuthUser } from '../auth/auth-user.js';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateUserDto } from './dto/update-user.dto.js';

@SkipThrottle()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('all')
  @Roles(['admin'])
  @UseGuards(RoleGuard)
  @ResponseMessage('All users retrieved')
  users(): Promise<UserRT[]> {
    return this.usersService.users({});
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return user ?? [];
  }

  @Patch('me')
  async update(
    @CurrentUser('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserRT | null> {
    const { firstName, lastName } = updateUserDto;
    return this.usersService.update({ id }, { firstName, lastName });
  }

  @Delete('me')
  delete(@CurrentUser('id', new ParseUUIDPipe()) id: string): Promise<UserRT> {
    return this.usersService.delete({ id });
  }

  @Get(':id')
  @Roles(['admin'])
  @UseGuards(RoleGuard)
  getSingle(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserRT | null> {
    return this.usersService.user({ id });
  }

  @Patch(':id')
  @Roles(['admin'])
  @UseGuards(RoleGuard)
  async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserRT | null> {
    const { firstName, lastName } = updateUserDto;
    return this.usersService.update({ id }, { firstName, lastName });
  }

  @Delete(':id')
  deleteUser(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserRT> {
    return this.usersService.delete({ id });
  }
}
