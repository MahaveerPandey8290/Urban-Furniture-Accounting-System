import { PrismaClient, Prisma, Contact } from '@prisma/client';

export class ContactRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: Prisma.ContactUncheckedCreateInput): Promise<Contact> {
    return this.prisma.contact.create({ data });
  }

  async findMany(args: Prisma.ContactFindManyArgs, user: any): Promise<Contact[]> {
    const where: any = { ...args.where };
    if (user.role === 'CONTACT' && user.contactId) {
      where.id = user.contactId;
    }
    return this.prisma.contact.findMany({ ...args, where });
  }

  async findUnique(id: number, user: any): Promise<Contact | null> {
    const where: any = { id };
    if (user.role === 'CONTACT' && user.contactId) {
      where.id = user.contactId;
    }
    return this.prisma.contact.findFirst({ where });
  }

  async update(id: number, data: Prisma.ContactUpdateInput): Promise<Contact> {
    return this.prisma.contact.update({ where: { id }, data });
  }

  async delete(id: number): Promise<Contact> {
    return this.prisma.contact.delete({ where: { id } });
  }
}
