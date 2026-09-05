import prisma from '../../config/prisma.js';
import type { PrismaTransactionClient } from '../../types/index.js';
import type { User } from '@prisma/client';

export class UsersRepository {
  static async findById(id: number, companyId: number, tx?: PrismaTransactionClient): Promise<User | null> {
    return (tx ?? prisma).user.findFirst({ where: { id, companyId } });
  }

  static async listPending(companyId: number): Promise<User[]> {
    return prisma.user.findMany({
      where: { companyId, status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async updateStatus(
    id: number,
    data: Partial<Pick<User, 'status' | 'rejectionReason' | 'approvedById' | 'approvedAt'>>,
    tx?: PrismaTransactionClient
  ): Promise<User> {
    return (tx ?? prisma).user.update({ where: { id }, data });
  }

  static async createWithContact(
    userData: {
      companyId: number;
      name: string;
      loginId: string;
      email: string;
      passwordHash: string;
      role: User['role'];
      status: User['status'];
      mustChangePassword: boolean;
    },
    contactData?: {
      companyId: number;
      name: string;
      email: string;
      type: 'CUSTOMER' | 'VENDOR';
    },
    tx?: PrismaTransactionClient
  ): Promise<{ user: User; contactId?: number }> {
    const client = tx ?? prisma;

    let contactId: number | undefined;

    if (contactData) {
      const contact = await client.contact.create({
        data: {
          ...contactData,
          isArchived: false,
        },
      });
      contactId = contact.id;
    }

    const user = await client.user.create({
      data: {
        ...userData,
        ...(contactId ? { contactId } : {}),
      },
    });

    // If we created a contact, link it back to the user
    if (contactId) {
      await client.contact.update({
        where: { id: contactId },
        data: {},
      });
    }

    return { user, contactId };
  }
}
