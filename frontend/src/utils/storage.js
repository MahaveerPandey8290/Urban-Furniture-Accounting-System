/**
 * storage.js - Central Data Storage & Accounting Layer for Purchase Workflow
 * Urban Furniture Accounting System
 */

import { getChartOfAccounts } from "../pages/invoicing_user/accounts/ChartOfAccountsMaster";
import { getJournals } from "../pages/invoicing_user/journals/JournalMaster";

// Storage Keys
export const STORAGE_KEY_PO = "urban_furniture_purchase_orders_master";
export const STORAGE_KEY_BILLS = "urban_furniture_vendor_bills_master";
export const STORAGE_KEY_PAYMENTS = "urban_furniture_vendor_payments_master";
export const STORAGE_KEY_JE = "urban_furniture_journal_entries_master";
export const STORAGE_KEY_BUDGETS = "urban_furniture_budgets_master";
export const STORAGE_KEY_CONTACTS = "urban_furniture_contacts_master";
export const STORAGE_KEY_PRODUCTS = "urban_furniture_products_master";

// Default Budgets & Analytic Accounts
export const DEFAULT_BUDGETS = [
  {
    id: "bgt-1",
    budgetName: "Monthly Furniture Budget",
    analyticAccountId: "an-1",
    analyticAccountName: "Furniture Procurement",
    department: "Procurement",
    period: "Sep 2026 (01 Sep 2026 - 30 Sep 2026)",
    responsiblePerson: "Rahul Sharma",
    allocatedBudget: 50000,
    status: "Confirmed",
  },
  {
    id: "bgt-2",
    budgetName: "Project 1 - Commercial",
    analyticAccountId: "an-2",
    analyticAccountName: "Project 1",
    department: "Commercial",
    period: "FY 2026-27",
    responsiblePerson: "Studio Arch Interiors",
    allocatedBudget: 100000,
    status: "Confirmed",
  },
  {
    id: "bgt-3",
    budgetName: "Showroom Setup & Renovation",
    analyticAccountId: "an-3",
    analyticAccountName: "Showroom Setup",
    department: "Retail",
    period: "Q3 2026",
    responsiblePerson: "Joey Wills",
    allocatedBudget: 15000,
    status: "Confirmed",
  },
  {
    id: "bgt-4",
    budgetName: "Executive Suite Project",
    analyticAccountId: "an-4",
    analyticAccountName: "Executive Setup",
    department: "Corporate",
    period: "FY 2026-27",
    responsiblePerson: "Azure Furniture",
    allocatedBudget: 75000,
    status: "Confirmed",
  },
];

// Initial Purchase Orders
export const INITIAL_PURCHASE_ORDERS = [
  {
    id: "po-1",
    poNumber: "PO00001",
    vendorId: "cnt-rahul",
    vendorName: "Rahul Sharma",
    poDate: "2026-09-01",
    status: "Confirmed", // Draft | Confirmed | Cancelled
    billId: "bill-1",
    billNumber: "Bill/2026/0001",
    total: 6000,
    notes: "Initial timber batch for wooden tables",
    items: [
      {
        id: "po-item-1-1",
        productId: "prod-table",
        productName: "Wooden Table",
        budgetId: "bgt-1",
        budgetName: "Monthly Furniture Budget",
        analyticAccount: "Furniture Procurement",
        quantity: 3,
        unitPrice: 2000,
        total: 6000,
      },
    ],
  },
  {
    id: "po-2",
    poNumber: "PO00002",
    vendorId: "cnt-azure",
    vendorName: "Azure Furniture",
    poDate: "2026-09-02",
    status: "Draft",
    billId: null,
    billNumber: null,
    total: 12500,
    notes: "Ergonomic chair frames",
    items: [
      {
        id: "po-item-2-1",
        productId: "prod-chair",
        productName: "Office Chair",
        budgetId: "bgt-2",
        budgetName: "Project 1 - Commercial",
        analyticAccount: "Project 1",
        quantity: 5,
        unitPrice: 2500,
        total: 12500,
      },
    ],
  },
];

// Initial Vendor Bills
export const INITIAL_VENDOR_BILLS = [
  {
    id: "bill-1",
    billNumber: "Bill/2026/0001",
    poId: "po-1",
    poNumber: "PO00001",
    vendorId: "cnt-rahul",
    vendorName: "Rahul Sharma",
    billRef: "ABC-26-001",
    billDate: "2026-09-01",
    dueDate: "2026-09-15",
    status: "Paid", // Draft | Confirmed | Paid | Partial | Not Paid | Cancelled
    confirmationStatus: "Confirmed", // Draft | Confirmed
    total: 6000,
    paidAmount: 6000,
    amountDue: 0,
    paymentStatus: "Paid",
    items: [
      {
        id: "bill-item-1-1",
        productId: "prod-table",
        productName: "Wooden Table",
        accountId: "coa-2",
        accountName: "Purchases Expense A/c",
        budgetId: "bgt-1",
        budgetName: "Monthly Furniture Budget",
        analyticAccount: "Furniture Procurement",
        quantity: 3,
        unitPrice: 2000,
        total: 6000,
      },
    ],
  },
  {
    id: "bill-2",
    billNumber: "Bill/2026/0002",
    poId: "po-2",
    poNumber: "PO00002",
    vendorId: "cnt-azure",
    vendorName: "Azure Furniture",
    billRef: "AZ-26-002",
    billDate: "2026-09-03",
    dueDate: "2026-09-18",
    status: "Not Paid",
    confirmationStatus: "Confirmed",
    total: 12500,
    paidAmount: 0,
    amountDue: 12500,
    paymentStatus: "Not Paid",
    items: [
      {
        id: "bill-item-2-1",
        productId: "prod-chair",
        productName: "Office Chair",
        accountId: "coa-2",
        accountName: "Purchases Expense A/c",
        budgetId: "bgt-2",
        budgetName: "Project 1 - Commercial",
        analyticAccount: "Project 1",
        quantity: 5,
        unitPrice: 2500,
        total: 12500,
      },
    ],
  },
];

// Initial Vendor Payments
export const INITIAL_VENDOR_PAYMENTS = [
  {
    id: "pay-v-1",
    paymentNumber: "PAY/Bill/2026/0001",
    billId: "bill-1",
    billNumber: "Bill/2026/0001",
    partnerId: "cnt-rahul",
    partnerName: "Rahul Sharma",
    paymentType: "Send",
    amount: 6000,
    date: "2026-09-05",
    paymentVia: "Bank",
    note: "Settlement of Bill/2026/0001 via NEFT transfer",
    status: "Confirmed",
  },
];

// ================= MASTER DATA GETTERS =================

/**
 * Get Vendors from Contact Master
 */
export const getVendors = () => {
  let list = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY_CONTACTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load contacts from storage:", e);
  }

  // Pre-seed default vendors if absent
  const defaultVendors = [
    { id: "cnt-rahul", name: "Rahul Sharma", type: "Vendor", email: "rahul@vendor.local", phone: "+91 98765 43210", city: "Bengaluru" },
    { id: "cnt-azure", name: "Azure Furniture", type: "Vendor", email: "sales@azurefurniture.com", phone: "+91 98111 22334", city: "Mumbai" },
    { id: "cnt-2", name: "Joey Wills", type: "Vendor", email: "joey.wills@example.com", phone: "+91 80808 08080", city: "Mumbai" },
    { id: "cnt-4", name: "Studio Arch Interiors", type: "Vendor", email: "contact@studioarch.in", phone: "+91 97330 99881", city: "Pune" },
  ];

  defaultVendors.forEach((d) => {
    if (!list.some((c) => c.name?.toLowerCase() === d.name.toLowerCase())) {
      list.push(d);
    }
  });

  // Return contacts that are Vendors or Both (case-insensitive)
  return list.filter((c) => {
    const t = String(c.type || "").toLowerCase();
    return t === "vendor" || t === "both" || !c.type;
  });
};

/**
 * Get Products from Product Master with their purchase cost
 */
export const getProducts = () => {
  let list = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load products from storage:", e);
  }

  const defaults = [
    { id: "prod-table", productName: "Wooden Table", cost: 2000, salesPrice: 3500, category: "Modular Furniture" },
    { id: "prod-chair", productName: "Office Chair", cost: 2500, salesPrice: 4200, category: "Modular Furniture" },
    { id: "prod-1", productName: "Teak Hardwood Logs", cost: 15000, salesPrice: 25000, category: "Raw Material" },
    { id: "prod-2", productName: "Solid Oak Round Dining Table", cost: 19000, salesPrice: 32000, category: "Round Table" },
    { id: "prod-3", productName: "Modular Office Workstation 4-Pod", cost: 28000, salesPrice: 48000, category: "Modular Furniture" },
    { id: "prod-4", productName: "King Size Storage Bed", cost: 26000, salesPrice: 42000, category: "Beds" },
  ];

  defaults.forEach((d) => {
    if (!list.some((p) => p.productName?.toLowerCase() === d.productName.toLowerCase())) {
      list.push(d);
    }
  });

  return list;
};

/**
 * Get Chart of Accounts configured
 */
export const getAccounts = () => {
  return getChartOfAccounts();
};

/**
 * Get Budgets & Analytic Accounts
 */
export const getBudgets = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load budgets from storage:", e);
  }
  return DEFAULT_BUDGETS;
};

export const saveBudgets = (budgets) => {
  try {
    localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
  } catch (e) {
    console.error("Failed to save budgets to storage:", e);
  }
};

// ================= PURCHASE ORDERS STORAGE =================

export const getPurchaseOrders = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PO);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load purchase orders from storage:", e);
  }
  return INITIAL_PURCHASE_ORDERS;
};

export const savePurchaseOrders = (orders) => {
  try {
    localStorage.setItem(STORAGE_KEY_PO, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save purchase orders to storage:", e);
  }
};

/**
 * Generate Next Sequential PO Number: PO00001, PO00002, etc.
 */
export const getNextPONumber = () => {
  const orders = getPurchaseOrders();
  let maxSeq = 0;
  orders.forEach((o) => {
    const match = String(o.poNumber || "").match(/PO(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  const nextNum = maxSeq + 1;
  return `PO${String(nextNum).padStart(5, "0")}`;
};

// ================= VENDOR BILLS STORAGE =================

export const getVendorBills = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BILLS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load vendor bills from storage:", e);
  }
  return INITIAL_VENDOR_BILLS;
};

export const saveVendorBills = (bills) => {
  try {
    localStorage.setItem(STORAGE_KEY_BILLS, JSON.stringify(bills));
  } catch (e) {
    console.error("Failed to save vendor bills to storage:", e);
  }
};

/**
 * Generate Next Sequential Bill Number: Bill/2026/0001, Bill/2026/0002...
 */
export const getNextBillNumber = () => {
  const bills = getVendorBills();
  const currentYear = new Date().getFullYear();
  let maxSeq = 0;
  bills.forEach((b) => {
    const match = String(b.billNumber || "").match(/Bill\/\d+\/(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });
  const nextNum = maxSeq + 1;
  return `Bill/${currentYear}/${String(nextNum).padStart(4, "0")}`;
};

// ================= VENDOR PAYMENTS STORAGE =================

export const getVendorPayments = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PAYMENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load vendor payments from storage:", e);
  }
  return INITIAL_VENDOR_PAYMENTS;
};

export const saveVendorPayments = (payments) => {
  try {
    localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error("Failed to save vendor payments to storage:", e);
  }
};

// ================= AUTOMATIC JOURNAL ENTRY CREATION =================

/**
 * Resolves the configured account from Chart of Accounts or falls back to known defaults
 */
const resolveAccount = (keyword, fallback) => {
  const accounts = getChartOfAccounts();
  const found = accounts.find((a) =>
    a.accountName?.toLowerCase().includes(keyword.toLowerCase())
  );
  return found || fallback;
};

/**
 * Automatically creates a balanced Journal Entry when Vendor Bill is Confirmed.
 *
 * For a credit purchase:
 * Debit: Purchases Expense A/c (Debit = Total)
 * Credit: Creditors A/c (Credit = Total)
 */
export const createVendorBillJournalEntry = (bill) => {
  try {
    const accounts = getChartOfAccounts();
    const journals = getJournals();

    // 1. Resolve Purchase Journal
    const purchaseJournal = journals.find(
      (j) => j.type === "PURCHASE" || j.journalName?.toLowerCase().includes("purchase")
    ) || { id: "jour-2", journalName: "Purchases" };

    // 2. Resolve Accounts
    // Debit: Purchases Expense A/c
    const purchaseExpAcc = resolveAccount("purchase", {
      id: "coa-2",
      accountName: "Purchases Expense A/c",
    });
    // Credit: Creditors A/c
    const creditorsAcc = resolveAccount("creditor", {
      id: "coa-4",
      accountName: "Creditors A/c",
    });

    const total = Number(bill.total) || 0;

    // Double-entry validation
    if (total <= 0) {
      throw new Error("Bill total must be greater than zero to post journal entry.");
    }

    const existingEntries = (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_JE);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    })();

    // Check if an entry for this bill already exists
    const alreadyExists = existingEntries.some(
      (e) => e.number === bill.billNumber || e.billId === bill.id
    );
    if (alreadyExists) return;

    const newJournalEntry = {
      id: "je-bill-" + Date.now(),
      billId: bill.id,
      number: bill.billNumber,
      accountingDate: bill.billDate || new Date().toISOString().split("T")[0],
      dateDisplay: new Date(bill.billDate || Date.now()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      partnerId: bill.vendorId,
      partnerName: bill.vendorName,
      journalId: purchaseJournal.id,
      journalName: purchaseJournal.journalName,
      total,
      status: "Posted",
      reference: bill.billRef || bill.poNumber || bill.billNumber,
      items: [
        {
          id: "je-line-bill-1",
          accountId: purchaseExpAcc.id,
          accountName: purchaseExpAcc.accountName,
          partnerId: bill.vendorId,
          partnerName: bill.vendorName,
          debit: total,
          credit: 0,
        },
        {
          id: "je-line-bill-2",
          accountId: creditorsAcc.id,
          accountName: creditorsAcc.accountName,
          partnerId: bill.vendorId,
          partnerName: bill.vendorName,
          debit: 0,
          credit: total,
        },
      ],
    };

    // Double check balance: Debit must equal Credit
    const totalDebit = newJournalEntry.items.reduce((s, i) => s + (Number(i.debit) || 0), 0);
    const totalCredit = newJournalEntry.items.reduce((s, i) => s + (Number(i.credit) || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error("Journal entry is not balanced. Debit and Credit totals must match.");
    }

    const updated = [newJournalEntry, ...existingEntries];
    localStorage.setItem(STORAGE_KEY_JE, JSON.stringify(updated));
    console.log("Automatically created balanced Journal Entry for Vendor Bill:", bill.billNumber);
  } catch (e) {
    console.error("Failed to create automatic journal entry for vendor bill:", e);
    throw e;
  }
};

/**
 * Automatically creates a balanced Journal Entry when Vendor Payment is confirmed.
 *
 * For vendor payment:
 * Debit: Creditors A/c (Debit = Amount)
 * Credit: Cash A/c OR Bank A/c (Credit = Amount, based on paymentVia)
 */
export const createVendorPaymentJournalEntry = (payment, bill) => {
  try {
    const journals = getJournals();
    const isBank = String(payment.paymentVia || "").toLowerCase() === "bank";

    // 1. Resolve Journal: Bank or Cash
    const journalType = isBank ? "BANK" : "CASH";
    const paymentJournal = journals.find((j) => j.type === journalType) || {
      id: isBank ? "jour-3" : "jour-4",
      journalName: isBank ? "Bank" : "Cash",
    };

    // 2. Resolve Accounts
    // Debit: Creditors A/c
    const creditorsAcc = resolveAccount("creditor", {
      id: "coa-4",
      accountName: "Creditors A/c",
    });
    // Credit: Bank A/c or Cash A/c
    const payAcc = resolveAccount(isBank ? "bank" : "cash", {
      id: isBank ? "coa-1" : "coa-6",
      accountName: isBank ? "Bank A/c" : "Cash A/c",
    });

    const amount = Number(payment.amount) || 0;
    if (amount <= 0) {
      throw new Error("Payment amount must be greater than zero.");
    }

    const existingEntries = (() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_JE);
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    })();

    const paymentNumber = payment.paymentNumber || `PAY/${bill.billNumber || String(Date.now()).slice(-4)}`;

    const newJournalEntry = {
      id: "je-pay-v-" + Date.now(),
      paymentId: payment.id,
      billId: bill.id,
      number: paymentNumber,
      accountingDate: payment.date || new Date().toISOString().split("T")[0],
      dateDisplay: new Date(payment.date || Date.now()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      partnerId: payment.partnerId || bill.vendorId,
      partnerName: payment.partnerName || bill.vendorName,
      journalId: paymentJournal.id,
      journalName: paymentJournal.journalName,
      total: amount,
      status: "Posted",
      reference: `Payment against ${bill.billNumber}`,
      items: [
        {
          id: "je-line-vpay-1",
          accountId: creditorsAcc.id,
          accountName: creditorsAcc.accountName,
          partnerId: bill.vendorId,
          partnerName: bill.vendorName,
          debit: amount,
          credit: 0,
        },
        {
          id: "je-line-vpay-2",
          accountId: payAcc.id,
          accountName: payAcc.accountName,
          partnerId: bill.vendorId,
          partnerName: bill.vendorName,
          debit: 0,
          credit: amount,
        },
      ],
    };

    // Double-entry validation
    const totalDebit = newJournalEntry.items.reduce((s, i) => s + (Number(i.debit) || 0), 0);
    const totalCredit = newJournalEntry.items.reduce((s, i) => s + (Number(i.credit) || 0), 0);
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error("Journal entry is not balanced. Debit and Credit totals must match.");
    }

    const updated = [newJournalEntry, ...existingEntries];
    localStorage.setItem(STORAGE_KEY_JE, JSON.stringify(updated));
    console.log("Automatically created balanced Journal Entry for Payment:", paymentNumber);
  } catch (e) {
    console.error("Failed to create automatic journal entry for vendor payment:", e);
    throw e;
  }
};

// ================= BUDGET CALCULATION UTILITIES =================

/**
 * Calculate committed spend and remaining budget for a given budget line.
 * Aggregates all confirmed Purchase Orders and confirmed Vendor Bills under this budget.
 */
export const calculateBudgetUtilization = (budgetId) => {
  const budgets = getBudgets();
  const targetBudget = budgets.find((b) => b.id === budgetId);
  if (!targetBudget) return { allocated: 0, spent: 0, remaining: 0, percent: 0 };

  const allocated = Number(targetBudget.allocatedBudget) || 0;

  // Calculate actual confirmed spend from Bills first, or Confirmed POs
  const bills = getVendorBills();
  const poList = getPurchaseOrders();

  let spent = 0;

  // Spend from confirmed bills
  bills.forEach((bill) => {
    if (bill.status !== "Cancelled") {
      (bill.items || []).forEach((item) => {
        if (item.budgetId === budgetId) {
          spent += Number(item.total) || 0;
        }
      });
    }
  });

  // Spend from confirmed POs that have not yet been billed
  poList.forEach((po) => {
    if (po.status === "Confirmed" && !po.billId) {
      (po.items || []).forEach((item) => {
        if (item.budgetId === budgetId) {
          spent += Number(item.total) || 0;
        }
      });
    }
  });

  const remaining = Math.max(0, allocated - spent);
  const percent = allocated > 0 ? Math.min(100, Math.round((spent / allocated) * 100)) : 0;

  return { allocated, spent, remaining, percent };
};
