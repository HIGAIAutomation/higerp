import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(tenantId: string, data: any) {
    const subtotal = data.subtotal;
    let cgst = 0, sgst = 0, igst = 0;

    // GST Logic (India)
    // Simplified: If same state (intra-state), CGST + SGST. If different (inter-state), IGST.
    if (data.isInterState) {
      igst = subtotal * 0.18; // 18% IGST
    } else {
      cgst = subtotal * 0.09; // 9% CGST
      sgst = subtotal * 0.09; // 9% SGST
    }

    const total = Number(subtotal) + Number(cgst) + Number(sgst) + Number(igst);

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        invoiceNumber: data.invoiceNumber,
        clientId: data.clientId,
        subtotal,
        cgst,
        sgst,
        igst,
        total,
        status: 'unpaid',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    // Create a transaction in the ledger
    await this.prisma.transaction.create({
      data: {
        tenantId,
        type: 'CREDIT',
        amount: total,
        description: `Invoice ${invoice.invoiceNumber} generated`,
      },
    });

    return invoice;
  }

  async createExpense(tenantId: string, data: any) {
    const expense = await this.prisma.expense.create({
      data: {
        tenantId,
        category: data.category,
        amount: data.amount,
        description: data.description,
        status: 'approved',
      },
    });

    // Create a transaction in the ledger
    await this.prisma.transaction.create({
      data: {
        tenantId,
        type: 'DEBIT',
        amount: data.amount,
        description: `Expense: ${data.category} - ${data.description}`,
      },
    });

    return expense;
  }

  async getFinancialSummary(tenantId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { tenantId },
    });

    const totalRevenue = transactions
      .filter((t: any) => t.type === 'CREDIT')
      .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t: any) => t.type === 'DEBIT')
      .reduce((acc: number, t: any) => acc + Number(t.amount), 0);

    return {
      revenue: totalRevenue,
      expenses: totalExpenses,
      netProfit: totalRevenue - totalExpenses,
    };
  }
}
