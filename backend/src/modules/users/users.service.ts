import prisma from '../../config/prisma.js';
import { AuthRepository } from '../auth/auth.repository.js';
import { AuthService } from '../auth/auth.service.js';
import { UsersRepository } from './users.repository.js';
import { AuditService } from '../../core/audit.service.js';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../core/errors.js';
import type { CreateUserDto, RejectUserDto, UserTypeEnum } from './users.dto.js';
import type { User } from '@prisma/client';

type UserTypeValue = UserTypeEnum;

const USER_TYPE_TO_ROLE: Record<UserTypeValue, User['role']> = {
  ADMINISTRATOR: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  CUSTOMER: 'CONTACT',
  VENDOR: 'CONTACT',
};

export class UsersService {
  /**
   * Admin creates a user.
   *
   * userType determines role and whether a Contact record is created:
   *   ADMINISTRATOR → ADMIN, no contact
   *   ACCOUNTANT    → ACCOUNTANT, no contact
   *   CUSTOMER      → CONTACT + Contact(type: CUSTOMER)
   *   VENDOR        → CONTACT + Contact(type: VENDOR)
   *
   * A cryptographically random temp password is generated.
   * mustChangePassword = true.
   * The plaintext temp password is returned in the response EXACTLY ONCE
   * and is never stored, logged, or retrievable again.
   */
  static async createUser(
    dto: CreateUserDto,
    adminId: number,
    companyId: number,
    requestId?: string
  ): Promise<{ user: Omit<User, 'passwordHash'>; tempPassword: string }> {
    // Check uniqueness
    const [existingLogin, existingEmail] = await Promise.all([
      AuthRepository.findByLoginId(dto.loginId),
      AuthRepository.findByEmail(dto.email),
    ]);

    if (existingLogin) throw new ConflictError('Login ID is already taken');
    if (existingEmail) throw new ConflictError('Email is already in use');

    const role = USER_TYPE_TO_ROLE[dto.userType];
    const needsContact = dto.userType === 'CUSTOMER' || dto.userType === 'VENDOR';
    const contactType = dto.userType === 'CUSTOMER' ? 'CUSTOMER' : 'VENDOR';

    // Generate temp password BEFORE transaction (no await inside transaction if avoidable)
    const tempPassword = await AuthService.generateTempPasswordValue();

    const { passwordHash, user } = await prisma.$transaction(async (tx) => {
      const hash = await AuthService.hashPassword(tempPassword);

      const { user } = await UsersRepository.createWithContact(
        {
          companyId,
          name: dto.name,
          loginId: dto.loginId,
          email: dto.email.toLowerCase(),
          passwordHash: hash,
          role,
          status: 'ACTIVE',
          mustChangePassword: true,
        },
        needsContact
          ? { companyId, name: dto.name, email: dto.email.toLowerCase(), type: contactType }
          : undefined,
        tx
      );

      await AuthRepository.addPasswordHistory(user.id, hash, tx);

      return { passwordHash: hash, user };
    });

    await AuditService.log({
      companyId,
      userId: adminId,
      entity: 'User',
      entityId: String(user.id),
      action: 'ADMIN_CREATE_USER',
      after: {
        loginId: user.loginId,
        email: user.email,
        role: user.role,
        userType: dto.userType,
        credentialsIssued: true,
        // password NOT logged
      },
      requestId,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _hash, ...safeUser } = { ...user, passwordHash };

    return { user: safeUser as Omit<User, 'passwordHash'>, tempPassword };
  }

  static async listPending(companyId: number): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await UsersRepository.listPending(companyId);
    return users.map(({ passwordHash: _h, ...u }) => u as Omit<User, 'passwordHash'>);
  }

  /**
   * Approve a pending user — set ACTIVE, generate temp password.
   */
  static async approveUser(
    targetId: number,
    adminId: number,
    companyId: number,
    requestId?: string
  ): Promise<{ tempPassword: string }> {
    const target = await UsersRepository.findById(targetId, companyId);
    if (!target) throw new NotFoundError('User not found');
    if (target.status !== 'PENDING') {
      throw new ForbiddenError('Only PENDING users can be approved');
    }

    const tempPassword = await AuthService.generateAndSetTempPassword(
      targetId,
      companyId,
      requestId
    );

    await AuditService.log({
      companyId,
      userId: adminId,
      entity: 'User',
      entityId: String(targetId),
      action: 'APPROVE_USER',
      before: { status: 'PENDING' },
      after: { status: 'ACTIVE', credentialsIssued: true },
      requestId,
    });

    return { tempPassword };
  }

  /**
   * Reject a pending user — requires a reason.
   * An admin cannot reject themselves.
   */
  static async rejectUser(
    targetId: number,
    adminId: number,
    companyId: number,
    dto: RejectUserDto,
    requestId?: string
  ): Promise<void> {
    if (targetId === adminId) {
      throw new ForbiddenError('An admin cannot reject their own account');
    }

    const target = await UsersRepository.findById(targetId, companyId);
    if (!target) throw new NotFoundError('User not found');

    await UsersRepository.updateStatus(targetId, {
      status: 'REJECTED',
      rejectionReason: dto.reason,
    });

    await AuditService.log({
      companyId,
      userId: adminId,
      entity: 'User',
      entityId: String(targetId),
      action: 'REJECT_USER',
      before: { status: target.status },
      after: { status: 'REJECTED', reason: dto.reason },
      requestId,
    });
  }

  /**
   * Suspend a user. An admin cannot suspend themselves.
   */
  static async suspendUser(
    targetId: number,
    adminId: number,
    companyId: number,
    requestId?: string
  ): Promise<void> {
    if (targetId === adminId) {
      throw new ForbiddenError('An admin cannot suspend their own account');
    }

    const target = await UsersRepository.findById(targetId, companyId);
    if (!target) throw new NotFoundError('User not found');

    await UsersRepository.updateStatus(targetId, { status: 'SUSPENDED' });

    await AuditService.log({
      companyId,
      userId: adminId,
      entity: 'User',
      entityId: String(targetId),
      action: 'SUSPEND_USER',
      before: { status: target.status },
      after: { status: 'SUSPENDED' },
      requestId,
    });
  }

  /**
   * Reactivate a suspended or rejected user.
   */
  static async reactivateUser(
    targetId: number,
    adminId: number,
    companyId: number,
    requestId?: string
  ): Promise<void> {
    const target = await UsersRepository.findById(targetId, companyId);
    if (!target) throw new NotFoundError('User not found');

    await UsersRepository.updateStatus(targetId, {
      status: 'ACTIVE',
      rejectionReason: null,
    });

    await AuditService.log({
      companyId,
      userId: adminId,
      entity: 'User',
      entityId: String(targetId),
      action: 'REACTIVATE_USER',
      before: { status: target.status },
      after: { status: 'ACTIVE' },
      requestId,
    });
  }
}
