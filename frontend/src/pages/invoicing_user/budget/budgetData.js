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

export const INITIAL_BUDGETS = [];

/**
 * Retrieve budgets from localStorage, or return empty array
 */
export const getStoredBudgets = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to read budgets from localStorage:", err);
    return [];
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
