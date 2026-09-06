import { ContactRepository } from './repository.js';
import { CreateContactDTO, UpdateContactDTO, QueryContactDTO } from './dto.js';
import { PrismaClient } from '@prisma/client';
import { NotFoundError, ConflictError } from '../../core/errors.js';
import { AuthService } from '../auth/auth.service.js';
import { AuthRepository } from '../auth/auth.repository.js';

export class ContactService {
  constructor(private repo: ContactRepository, private prisma: PrismaClient) {}

  async create(data: CreateContactDTO, companyId: number) {
    const { createPortalCredentials, loginId, portalPassword, ...contactFields } = data;

    let receivableAccountId: number | undefined = undefined;
    let payableAccountId: number | undefined = undefined;

    const receivableAccount = await this.prisma.account.findFirst({
      where: { companyId, type: 'ASSET', isArchived: false },
    });
    if (receivableAccount) receivableAccountId = receivableAccount.id;

    const payableAccount = await this.prisma.account.findFirst({
      where: { companyId, type: 'LIABILITY', isArchived: false },
    });
    if (payableAccount) payableAccountId = payableAccount.id;

    const contact = await this.repo.create({
      ...contactFields,
      companyId,
      receivableAccountId,
      payableAccountId,
    });

    let tempPassword: string | undefined = undefined;
    let userRecord: any = null;

    if (createPortalCredentials) {
      const email = contact.email || `${contact.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${contact.id}@urbanfurniture.local`;
      const finalLoginId = loginId || `user_${contact.id}_${Date.now().toString().slice(-4)}`;

      // Check for uniqueness
      const [existingLogin, existingEmail] = await Promise.all([
        AuthRepository.findByLoginId(finalLoginId),
        AuthRepository.findByEmail(email),
      ]);

      if (existingLogin) throw new ConflictError(`Login ID '${finalLoginId}' is already taken`);
      if (existingEmail && existingEmail.contactId !== contact.id) {
        throw new ConflictError(`Email '${email}' is already associated with an account`);
      }

      tempPassword = portalPassword || AuthService.generateTempPasswordValue();
      const hash = await AuthService.hashPassword(tempPassword);

      userRecord = await this.prisma.user.create({
        data: {
          companyId,
          name: contact.name,
          loginId: finalLoginId,
          email: email.toLowerCase(),
          passwordHash: hash,
          role: 'CONTACT',
          status: 'ACTIVE',
          mustChangePassword: true,
          contactId: contact.id,
        },
      });

      await AuthRepository.addPasswordHistory(userRecord.id, hash);
    }

    return {
      ...contact,
      user: userRecord ? {
        id: userRecord.id,
        loginId: userRecord.loginId,
        email: userRecord.email,
        role: userRecord.role,
        tempPassword,
      } : undefined,
      tempPassword,
    };
  }

  async findAll(query: QueryContactDTO, user: any) {
    const { cursor, limit = 20, search, type, isArchived } = query;
    const where: any = { companyId: user.companyId };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (isArchived !== undefined) where.isArchived = isArchived;

    const args: any = {
      where,
      take: limit + 1,
      orderBy: { id: 'asc' },
    };
    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const items = await this.repo.findMany(args, user);
    let nextCursor: number | null = null;
    if (items.length > limit) {
      const nextItem = items.pop();
      nextCursor = nextItem ? nextItem.id : null;
    }
    return { items, nextCursor };
  }

  async findOne(id: number, user: any) {
    const contact = await this.repo.findUnique(id, user);
    if (!contact) throw new NotFoundError('Contact not found');
    return contact;
  }

  async update(id: number, data: UpdateContactDTO, user: any) {
    const contact = await this.repo.findUnique(id, user);
    if (!contact) throw new NotFoundError('Contact not found');
    return this.repo.update(id, data);
  }

  async delete(id: number) {
    return this.repo.delete(id);
  }
}
