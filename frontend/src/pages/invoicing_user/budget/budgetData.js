/**
 * Budget Data Service & Calculations for Urban Furniture Accounting System
 * Manages localStorage persistence under "urbanFurniture_budgets"
 */

export const STORAGE_KEY = "urbanFurniture_budgets";

/**
 * Format currency in Indian format: ₹2,00,000
 */
export const formatINR = (val) => {
  const num = Number(val) || 0;
  return "₹" + num.toLocaleString("en-IN");
};

/**
 * Calculate Achieved Percentage with division-by-zero protection.
 * Formula: (Achieved Amount / Committed Amount) * 100
 */
export const calculateAchievedPercent = (achieved, committed) => {
  const comm = Number(committed) || 0;
  const ach = Number(achieved) || 0;
  if (comm <= 0) return 0;
  const pct = (ach / comm) * 100;
  return Math.round(pct * 10) / 10; // 1 decimal point precision
};

/**
 * Calculate Amount To Achieve.
 * Formula: Committed Amount - Achieved Amount
 */
export const calculateAmountToAchieve = (achieved, committed) => {
  const comm = Number(committed) || 0;
  const ach = Number(achieved) || 0;
  return Math.max(0, comm - ach);
};

export const INITIAL_BUDGETS = [
  {
    id: "bgt-001",
    name: "January 2026",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    committedAmount: 200000,
    achievedAmount: 10000,
    status: "Confirmed",
    analyticAccount: "Showroom Operations",
    responsiblePerson: "Rajesh Sharma",
    department: "Retail & Showroom",
    notes: "Monthly operational and inventory replenishment budget for Bangalore flagship showroom.",
    transactions: [
      { id: "tx-101", date: "2026-01-05", ref: "BILL-2026-004", description: "Display rack hardware & fixtures", vendor: "Apex Hardware Ltd", amount: 6500, type: "Bill", status: "Paid" },
      { id: "tx-102", date: "2026-01-18", ref: "EXP-2026-012", description: "Showroom lighting upgrades", vendor: "Philips Lighting Hub", amount: 3500, type: "Expense", status: "Paid" }
    ]
  },
  {
    id: "bgt-002",
    name: "February 2026",
    startDate: "2026-02-01",
    endDate: "2026-02-28",
    committedAmount: 250000,
    achievedAmount: 125000,
    status: "Draft",
    analyticAccount: "Store Operations",
    responsiblePerson: "Priya Desai",
    department: "Operations",
    notes: "Mid-quarter operational commitments, logistics and retail support.",
    transactions: [
      { id: "tx-201", date: "2026-02-04", ref: "BILL-2026-039", description: "Polishing and finishing compounds", vendor: "Asian Paints & Varnishes", amount: 48000, type: "Bill", status: "Paid" },
      { id: "tx-202", date: "2026-02-12", ref: "PO-2026-088", description: "Oak lumber bulk procurement", vendor: "Karnataka Timber Depot", amount: 52000, type: "Purchase Order", status: "Confirmed" },
      { id: "tx-203", date: "2026-02-20", ref: "EXP-2026-045", description: "Delivery fleet fuel & servicing", vendor: "Indian Oil Corp", amount: 25000, type: "Expense", status: "Paid" }
    ]
  },
  {
    id: "bgt-003",
    name: "March 2026",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    committedAmount: 300000,
    achievedAmount: 45000,
    status: "Draft",
    analyticAccount: "End-of-Year Overhauls",
    responsiblePerson: "Rajesh Sharma",
    department: "Finance & Admin",
    notes: "Fiscal year-end closing audits, inventory adjustments, and equipment safety reviews.",
    transactions: [
      { id: "tx-301", date: "2026-03-05", ref: "BILL-2026-092", description: "CCTV and security maintenance contract", vendor: "SecureTech Systems", amount: 20000, type: "Bill", status: "Paid" },
      { id: "tx-302", date: "2026-03-15", ref: "EXP-2026-078", description: "Statutory audit facilitation advance", vendor: "K.V. Mehta & Co", amount: 25000, type: "Expense", status: "Paid" }
    ]
  },
  {
    id: "bgt-004",
    name: "Q1 Raw Materials & Timber",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    committedAmount: 500000,
    achievedAmount: 385000,
    status: "Confirmed",
    analyticAccount: "Manufacturing Unit - Whitefield",
    responsiblePerson: "Vikram Sengupta",
    department: "Production",
    notes: "Teak, Sheesham, high-density MDF boards and brass fittings for primary furniture catalog.",
    transactions: [
      { id: "tx-401", date: "2026-01-10", ref: "BILL-2026-015", description: "Grade-A Seasoned Teak wood logs", vendor: "Evergreen Timber Mills", amount: 180000, type: "Bill", status: "Paid" },
      { id: "tx-402", date: "2026-02-02", ref: "BILL-2026-048", description: "Brass decorative handles & hinges", vendor: "Hettich India Hardware", amount: 95000, type: "Bill", status: "Paid" },
      { id: "tx-403", date: "2026-02-24", ref: "BILL-2026-077", description: "Polyurethane foam & upholstery fabric", vendor: "Sleepwell Industrial Ltd", amount: 110000, type: "Bill", status: "Paid" }
    ]
  },
  {
    id: "bgt-005",
    name: "Showroom Interior Refurbishment",
    startDate: "2026-01-15",
    endDate: "2026-02-28",
    committedAmount: 150000,
    achievedAmount: 135000,
    status: "Revised",
    analyticAccount: "Store Infrastructure",
    responsiblePerson: "Sunita Nambiar",
    department: "Marketing & Retail",
    notes: "Revamp of premium living room display zones and lighting tracks.",
    transactions: [
      { id: "tx-501", date: "2026-01-20", ref: "BILL-2026-028", description: "Architectural ceiling spotlights", vendor: "Havells Commercial", amount: 60000, type: "Bill", status: "Paid" },
      { id: "tx-502", date: "2026-02-10", ref: "BILL-2026-061", description: "Modular gypsum partition walls", vendor: "Modern Interior Contracts", amount: 75000, type: "Bill", status: "Paid" }
    ]
  },
  {
    id: "bgt-006",
    name: "Spring Marketing & Catalog Launch",
    startDate: "2026-02-01",
    endDate: "2026-04-30",
    committedAmount: 180000,
    achievedAmount: 72000,
    status: "Confirmed",
    analyticAccount: "Brand Marketing",
    responsiblePerson: "Priya Desai",
    department: "Marketing",
    notes: "Print catalogs, Instagram ad campaigns, and local lifestyle magazine features.",
    transactions: [
      { id: "tx-601", date: "2026-02-08", ref: "BILL-2026-052", description: "Catalog studio product photography", vendor: "Studio Lumina", amount: 42000, type: "Bill", status: "Paid" },
      { id: "tx-602", date: "2026-02-25", ref: "EXP-2026-063", description: "Digital ad spend (Meta / Google)", vendor: "Google Ads India", amount: 30000, type: "Expense", status: "Paid" }
    ]
  },
  {
    id: "bgt-007",
    name: "Warehouse Logistics & Freight",
    startDate: "2026-01-01",
    endDate: "2026-01-31",
    committedAmount: 80000,
    achievedAmount: 12000,
    status: "Cancelled",
    analyticAccount: "Logistics Hub - Peenya",
    responsiblePerson: "Vikram Sengupta",
    department: "Logistics",
    notes: "Project cancelled due to vendor contract renegotiation.",
    transactions: [
      { id: "tx-701", date: "2026-01-12", ref: "EXP-2026-019", description: "Emergency inter-depot pallet transfer", vendor: "Delhivery Express", amount: 12000, type: "Expense", status: "Paid" }
    ]
  }
];

/**
 * Retrieve budgets from localStorage, or initialize with mock data
 */
export const getStoredBudgets = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BUDGETS));
      return INITIAL_BUDGETS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BUDGETS));
      return INITIAL_BUDGETS;
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to read budgets from localStorage, using initial:", err);
    return INITIAL_BUDGETS;
  }
};

/**
 * Persist budgets to localStorage
 */
export const saveStoredBudgets = (budgets) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error("Failed to persist budgets to localStorage:", err);
  }
};

/**
 * Reset budgets to default mock list
 */
export const resetBudgetsToDefault = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BUDGETS));
    return INITIAL_BUDGETS;
  } catch (err) {
    console.error("Failed to reset budgets:", err);
    return INITIAL_BUDGETS;
  }
};
