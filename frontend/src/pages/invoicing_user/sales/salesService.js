// Sales Module Master Service & Accounting Automation
import { getChartOfAccounts } from "../accounts/ChartOfAccountsMaster";
import { getJournals } from "../journals/JournalMaster";
import { INITIAL_JOURNAL_ENTRIES } from "../journal_entries/JournalEntriesMaster";

export const STORAGE_KEY_SO = "urban_furniture_sales_orders_master";
export const STORAGE_KEY_INVOICES = "urban_furniture_customer_invoices_master";
export const STORAGE_KEY_PAYMENTS = "urban_furniture_invoice_payments_master";
export const STORAGE_KEY_BUDGETS = "urban_furniture_budget_analytics_master";

// Default Budget Analytics Projects
export const DEFAULT_BUDGET_PROJECTS = [
  { id: "ba-1", name: "Project 1", code: "PRJ-001", department: "Commercial" },
  { id: "ba-2", name: "Project 2", code: "PRJ-002", department: "Residential" },
  { id: "ba-3", name: "Executive Suite Setup", code: "PRJ-003", department: "Corporate" },
  { id: "ba-4", name: "Showroom Renovation", code: "PRJ-004", department: "Retail" },
];

// Initial Sales Orders matching wireframe
export const INITIAL_SALES_ORDERS = [
  {
    id: "so-1",
    soNumber: "SO00001",
    customerId: "cnt-rahul",
    customerName: "Mr. Rahul",
    soDate: "2026-09-01",
    status: "Confirmed", // Draft | Confirmed | Invoiced | Cancelled
    invoiceId: "inv-1",
    total: 6000,
    items: [
      {
        id: "so-item-1",
        productId: "prod-table",
        productName: "Table",
        budgetId: "ba-1",
        budgetName: "Project 1",
        quantity: 3,
        unitPrice: 2000,
        total: 6000,
      },
    ],
  },
];

// Initial Customer Invoices matching wireframe
export const INITIAL_CUSTOMER_INVOICES = [
  {
    id: "inv-1",
    invoiceNo: "INV/2026/00001",
    soId: "so-1",
    soNumber: "SO00001",
    customerId: "cnt-rahul",
    customerName: "Mr. Rahul",
    invoiceRef: "ABC-26-001",
    invoiceDate: "2026-09-01",
    dueDate: "2026-09-15",
    status: "Not Paid", // Not Paid | Partial | Paid
    confirmationStatus: "Confirmed", // Draft | Confirmed | Cancelled
    total: 6000,
    paidAmount: 0,
    outstandingAmount: 6000,
    items: [
      {
        id: "inv-item-1",
        productId: "prod-table",
        productName: "Table",
        accountId: "coa-5", // Sales Income A/c
        accountName: "Sales Income A/c",
        budgetId: "ba-1",
        budgetName: "Project 1",
        quantity: 3,
        unitPrice: 2000,
        total: 6000,
      },
    ],
  },
];

/**
 * Automatically generates the next SO Number in strict sequence:
 * SO00001, SO00002, SO00003...
 */
export const generateNextSONumber = (existingOrders = []) => {
  let maxSeq = 0;
  existingOrders.forEach((o) => {
    if (o?.soNumber) {
      const match = o.soNumber.match(/SO(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxSeq) {
          maxSeq = val;
        }
      }
    }
  });
  const nextSeq = maxSeq + 1;
  return `SO${String(nextSeq).padStart(5, "0")}`;
};

/**
 * Automatically generates the next Customer Invoice Number in strict sequence:
 * INV/2026/00001, INV/2026/00002...
 */
export const generateNextInvoiceNumber = (existingInvoices = []) => {
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;
  existingInvoices.forEach((inv) => {
    if (inv?.invoiceNo) {
      const match = inv.invoiceNo.match(/INV\/\d{4}\/(\d+)/i);
      if (match) {
        const val = parseInt(match[1], 10);
        if (!isNaN(val) && val > maxSeq) {
          maxSeq = val;
        }
      }
    }
  });
  const nextSeq = maxSeq + 1;
  return `INV/${currentYear}/${String(nextSeq).padStart(5, "0")}`;
};

// Helper to get Customer list from Contact Master
export const getCustomers = () => {
  let list = [];
  try {
    const saved = localStorage.getItem("urban_furniture_contacts_master");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load contacts:", e);
  }

  const defaults = [
    { id: "cnt-rahul", name: "Mr. Rahul", type: "Customer", email: "rahul@example.com" },
    { id: "cnt-raj", name: "Mr. Raj", type: "Customer", email: "raj@example.com" },
    { id: "cnt-1", name: "Open Wood", type: "Customer", email: "openwood21@example.com" },
    { id: "cnt-3", name: "Prestige Modern Lofts", type: "Customer", email: "procurements@prestigelofts.com" },
  ];

  defaults.forEach((d) => {
    if (!list.some((c) => c.name?.toLowerCase() === d.name.toLowerCase())) {
      list.push(d);
    }
  });

  // Filter contacts whose type supports Customer
  return list.filter((c) => !c.type || c.type.toLowerCase() === "customer" || c.type.toLowerCase() === "both");
};

// Helper to get Product list from Product Master
export const getProducts = () => {
  let list = [];
  try {
    const saved = localStorage.getItem("urban_furniture_products_master");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load products:", e);
  }

  const defaults = [
    { id: "prod-table", productName: "Table", salesPrice: 2000, productType: "Goods", category: "Modular Furniture" },
    { id: "prod-chair", productName: "Chair", salesPrice: 1500, productType: "Goods", category: "Modular Furniture" },
    { id: "prod-1", productName: "Teak Hardwood Logs", salesPrice: 25000, productType: "Goods", category: "Raw Material" },
    { id: "prod-2", productName: "Solid Oak Round Dining Table", salesPrice: 32000, productType: "Goods", category: "Round Table" },
    { id: "prod-3", productName: "Modular Office Workstation 4-Pod", salesPrice: 48000, productType: "Goods", category: "Modular Furniture" },
    { id: "prod-4", productName: "King Size Storage Bed", salesPrice: 42000, productType: "Goods", category: "Beds" },
  ];

  defaults.forEach((d) => {
    if (!list.some((p) => p.productName?.toLowerCase() === d.productName.toLowerCase())) {
      list.push(d);
    }
  });

  return list;
};

// Helper to get Budget Projects (unifying both explicit projects and stored budgets)
export const getBudgetProjects = () => {
  const combined = [];
  const namesSeen = new Set();

  // 1. Saved budget projects
  try {
    const savedProjects = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects);
      if (Array.isArray(parsed)) {
        parsed.forEach((p) => {
          if (p.name && !namesSeen.has(p.name.toLowerCase())) {
            namesSeen.add(p.name.toLowerCase());
            combined.push(p);
          }
        });
      }
    }
  } catch (e) {
    console.error("Failed to load budget projects:", e);
  }

  // 2. Budgets from budget master
  try {
    const savedBudgets = localStorage.getItem("urbanFurniture_budgets");
    if (savedBudgets) {
      const parsed = JSON.parse(savedBudgets);
      if (Array.isArray(parsed)) {
        parsed.forEach((b) => {
          const label = b.analyticAccount || b.name;
          if (label && !namesSeen.has(label.toLowerCase())) {
            namesSeen.add(label.toLowerCase());
            combined.push({
              id: b.id,
              name: label,
              code: b.name,
              department: b.department || "Operations",
            });
          }
        });
      }
    }
  } catch (e) {
    console.error("Failed to load budgets master:", e);
  }

  // 3. Fallback defaults
  DEFAULT_BUDGET_PROJECTS.forEach((d) => {
    if (!namesSeen.has(d.name.toLowerCase())) {
      namesSeen.add(d.name.toLowerCase());
      combined.push(d);
    }
  });

  return combined;
};

// Helper to get Sales Orders
export const getSalesOrders = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SO);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load sales orders:", e);
  }
  return INITIAL_SALES_ORDERS;
};

// Helper to save Sales Orders
export const saveSalesOrders = (orders) => {
  try {
    localStorage.setItem(STORAGE_KEY_SO, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save sales orders:", e);
  }
};

// Helper to get Customer Invoices
export const getCustomerInvoices = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_INVOICES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load customer invoices:", e);
  }
  return INITIAL_CUSTOMER_INVOICES;
};

// Helper to save Customer Invoices
export const saveCustomerInvoices = (invoices) => {
  try {
    localStorage.setItem(STORAGE_KEY_INVOICES, JSON.stringify(invoices));
  } catch (e) {
    console.error("Failed to save customer invoices:", e);
  }
};

// Helper to get Payments
export const getInvoicePayments = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load invoice payments:", e);
  }
  return [];
};

// Helper to save Payments
export const saveInvoicePayments = (payments) => {
  try {
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error("Failed to save invoice payments:", e);
  }
};

// ================= AUTOMATIC JOURNAL ENTRY CREATION =================

/**
 * Automatically creates a balanced Journal Entry when Customer Invoice is Confirmed.
 * Debit: Debtors A/c (Asset)
 * Credit: Sales Income A/c (Income)
 * Total Debit === Total Credit
 */
export const createAutomaticInvoiceJournalEntry = (invoice) => {
  try {
    const STORAGE_KEY_JE = "urban_furniture_journal_entries_master";
    const accounts = getChartOfAccounts();
    const journals = getJournals();

    // Resolve Sales Journal
    const salesJournal = journals.find((j) => j.type === "SALES" || j.journalName?.toLowerCase().includes("sales")) || {
      id: "jour-1",
      journalName: "Sales",
    };

    // Resolve Debtors A/c and Sales Income A/c from Chart of Accounts
    const debtorsAcc = accounts.find((a) => a.accountName?.toLowerCase().includes("debtor")) || {
      id: "coa-3",
      accountName: "Debtors A/c",
    };
    const salesAcc = accounts.find((a) => a.accountName?.toLowerCase().includes("sales")) || {
      id: "coa-5",
      accountName: "Sales Income A/c",
    };

    const existingEntries = (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_JE);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
      return INITIAL_JOURNAL_ENTRIES || [];
    })();

    // Check if an entry for this invoice already exists to avoid duplication
    const alreadyExists = existingEntries.some(
      (e) => e.number === invoice.invoiceNo || e.invoiceId === invoice.id
    );
    if (alreadyExists) return;

    const total = Number(invoice.total) || 0;
    if (total <= 0) return;

    const dateStr = invoice.invoiceDate || new Date().toISOString().split("T")[0];
    const displayDate = new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const newJournalEntry = {
      id: "je-inv-" + Date.now(),
      invoiceId: invoice.id,
      number: invoice.invoiceNo,
      accountingDate: dateStr,
      dateDisplay: displayDate,
      partnerId: invoice.customerId,
      partnerName: invoice.customerName,
      journalId: salesJournal.id,
      journalName: salesJournal.journalName,
      total,
      status: "Posted",
      items: [
        {
          id: "je-line-1",
          accountId: debtorsAcc.id,
          accountName: debtorsAcc.accountName,
          partnerId: invoice.customerId,
          partnerName: invoice.customerName,
          debit: total,
          credit: 0,
        },
        {
          id: "je-line-2",
          accountId: salesAcc.id,
          accountName: salesAcc.accountName,
          partnerId: invoice.customerId,
          partnerName: invoice.customerName,
          debit: 0,
          credit: total,
        },
      ],
    };

    const updated = [newJournalEntry, ...existingEntries];
    localStorage.setItem(STORAGE_KEY_JE, JSON.stringify(updated));
    console.log("Automatically created balanced Journal Entry for Invoice:", invoice.invoiceNo);
  } catch (e) {
    console.error("Failed to create automatic journal entry for invoice:", e);
  }
};

/**
 * Automatically creates a balanced Journal Entry when Invoice Payment is Confirmed.
 * If Cash: Debit Cash A/c, Credit Debtors A/c
 * If Bank: Debit Bank A/c, Credit Debtors A/c
 * Total Debit === Total Credit
 */
export const createAutomaticPaymentJournalEntry = (payment, invoice) => {
  try {
    const STORAGE_KEY_JE = "urban_furniture_journal_entries_master";
    const accounts = getChartOfAccounts();
    const journals = getJournals();

    const isBank = String(payment.paymentVia || "").toLowerCase() === "bank";

    // Resolve Cash or Bank Journal
    const journalType = isBank ? "BANK" : "CASH";
    const paymentJournal = journals.find((j) => j.type === journalType || j.journalName?.toLowerCase().includes(journalType.toLowerCase())) || {
      id: isBank ? "jour-3" : "jour-4",
      journalName: isBank ? "Bank" : "Cash",
    };

    // Resolve Debit Account (Bank A/c or Cash A/c)
    const receiveAcc = accounts.find((a) =>
      isBank ? a.accountName?.toLowerCase().includes("bank") : a.accountName?.toLowerCase().includes("cash")
    ) || {
      id: isBank ? "coa-1" : "coa-6",
      accountName: isBank ? "Bank A/c" : "Cash A/c",
    };

    // Resolve Credit Account (Debtors A/c)
    const debtorsAcc = accounts.find((a) => a.accountName?.toLowerCase().includes("debtor")) || {
      id: "coa-3",
      accountName: "Debtors A/c",
    };

    const existingEntries = (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_JE);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
      return INITIAL_JOURNAL_ENTRIES || [];
    })();

    // Check if an entry for this payment already exists
    const alreadyExists = existingEntries.some(
      (e) => e.paymentId === payment.id
    );
    if (alreadyExists) return;

    const amount = Number(payment.amount) || 0;
    if (amount <= 0) return;

    const paymentNumber = "PAY/" + (invoice.invoiceNo || String(Date.now()).slice(-4)) + "/" + String(Date.now()).slice(-3);
    const dateStr = payment.date || new Date().toISOString().split("T")[0];
    const displayDate = new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const newJournalEntry = {
      id: "je-pay-" + Date.now(),
      paymentId: payment.id,
      invoiceId: invoice.id,
      number: paymentNumber,
      accountingDate: dateStr,
      dateDisplay: displayDate,
      partnerId: payment.partnerId || invoice.customerId,
      partnerName: payment.partnerName || invoice.customerName,
      journalId: paymentJournal.id,
      journalName: paymentJournal.journalName,
      total: amount,
      status: "Posted",
      items: [
        {
          id: "je-line-pay-1",
          accountId: receiveAcc.id,
          accountName: receiveAcc.accountName,
          partnerId: invoice.customerId,
          partnerName: invoice.customerName,
          debit: amount,
          credit: 0,
        },
        {
          id: "je-line-pay-2",
          accountId: debtorsAcc.id,
          accountName: debtorsAcc.accountName,
          partnerId: invoice.customerId,
          partnerName: invoice.customerName,
          debit: 0,
          credit: amount,
        },
      ],
    };

    const updated = [newJournalEntry, ...existingEntries];
    localStorage.setItem(STORAGE_KEY_JE, JSON.stringify(updated));
    console.log("Automatically created balanced Journal Entry for Payment:", paymentNumber);
  } catch (e) {
    console.error("Failed to create automatic journal entry for payment:", e);
  }
};
