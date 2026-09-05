import React, { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  getStoredBudgets,
  saveStoredBudgets,
  resetBudgetsToDefault
} from "./budget/budgetData";
import BudgetReportHeader from "./budget/BudgetReportHeader";
import BudgetSummaryCards from "./budget/BudgetSummaryCards";
import BudgetReportFilters from "./budget/BudgetReportFilters";
import BudgetReportTable from "./budget/BudgetReportTable";
import BudgetReportKanban from "./budget/BudgetReportKanban";
import BudgetReportDetails from "./budget/BudgetReportDetails";
import CreateBudgetModal from "./budget/CreateBudgetModal";
import { Toast, useToast } from "../../components/common/Toast";

/**
 * BudgetReport - Main Invoicing User / Accountant Budget Reports Module
 * Route: /invoicing_user/budget-reports
 */
export function BudgetReport() {
  const location = useLocation();
  const [budgets, setBudgets] = useState(() => getStoredBudgets());
  const [currentView, setCurrentView] = useState("list"); // 'list' | 'kanban'
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { toastMessage, showToast } = useToast();

  // Extract unique categories / analytic accounts for the filter dropdown
  const categories = useMemo(() => {
    const set = new Set();
    budgets.forEach((b) => {
      if (b.analyticAccount) set.add(b.analyticAccount);
    });
    return Array.from(set).sort();
  }, [budgets]);

  // Support incoming navigation from Customer Invoice "Budget" button
  useEffect(() => {
    if (location.state?.budgetId) {
      const found = budgets.find(
        (b) =>
          b.id === location.state.budgetId ||
          b.name?.toLowerCase() === String(location.state.budgetId).toLowerCase() ||
          b.analyticAccount?.toLowerCase() === String(location.state.budgetId).toLowerCase()
      );
      if (found) {
        setSelectedBudget(found);
        return;
      }
    }
    if (location.state?.analyticAccount) {
      const matchCat = categories.find(
        (c) => c.toLowerCase() === String(location.state.analyticAccount).toLowerCase()
      );
      if (matchCat) {
        setSelectedCategory(matchCat);
      } else {
        setSearchTerm(location.state.analyticAccount);
      }
    } else if (location.state?.search) {
      setSearchTerm(location.state.search);
    }
  }, [location.state, budgets, categories]);

  // Keep localStorage updated whenever budgets changes
  useEffect(() => {
    saveStoredBudgets(budgets);
  }, [budgets]);

  // Determine if any filters are actively applied
  const hasActiveFilters = useMemo(() => {
    return (
      statusFilter !== "ALL" ||
      selectedCategory !== "ALL" ||
      Boolean(startDateFilter) ||
      Boolean(endDateFilter) ||
      Boolean(searchTerm.trim())
    );
  }, [statusFilter, selectedCategory, startDateFilter, endDateFilter, searchTerm]);

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter("ALL");
    setSelectedCategory("ALL");
    setStartDateFilter("");
    setEndDateFilter("");
    setSearchTerm("");
  };

  // Filter budgets based on user inputs
  const filteredBudgets = useMemo(() => {
    return budgets.filter((b) => {
      // 1. Status Filter
      if (statusFilter !== "ALL" && b.status !== statusFilter) {
        return false;
      }

      // 2. Analytic Account / Category Filter
      if (selectedCategory !== "ALL" && b.analyticAccount !== selectedCategory) {
        return false;
      }

      // 3. Date Range Filter
      if (startDateFilter && b.startDate < startDateFilter) {
        return false;
      }
      if (endDateFilter && b.endDate > endDateFilter) {
        return false;
      }

      // 4. Text Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = b.name?.toLowerCase().includes(query);
        const matchAnalytic = b.analyticAccount?.toLowerCase().includes(query);
        const matchPerson = b.responsiblePerson?.toLowerCase().includes(query);
        const matchDept = b.department?.toLowerCase().includes(query);
        const matchNotes = b.notes?.toLowerCase().includes(query);
        if (!matchName && !matchAnalytic && !matchPerson && !matchDept && !matchNotes) {
          return false;
        }
      }

      return true;
    });
  }, [budgets, statusFilter, selectedCategory, startDateFilter, endDateFilter, searchTerm]);

  // Create new budget handler
  const handleSaveNewBudget = (newBudget) => {
    setBudgets((prev) => [newBudget, ...prev]);
    showToast(`Budget "${newBudget.name}" created successfully!`);
  };

  // Reset demo data handler
  const handleResetData = () => {
    const initial = resetBudgetsToDefault();
    setBudgets(initial);
    setSelectedBudget(null);
    handleClearFilters();
    showToast("Sample demo budgets restored!");
  };

  // Delete budget handler
  const handleDeleteBudget = (budgetId) => {
    if (window.confirm("Are you sure you want to delete this budget report?")) {
      setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
      if (selectedBudget?.id === budgetId) {
        setSelectedBudget(null);
      }
      showToast("Budget report deleted successfully");
    }
  };

  // Update budget handler
  const handleUpdateBudget = (updated) => {
    setBudgets((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBudget(updated);
    showToast(`Budget "${updated.name}" updated successfully!`);
  };

  return (
    <div className="w-full min-w-0 space-y-6">
      <Toast message={toastMessage} />

      {/* If a budget is clicked, render the Detailed Report View */}
      {selectedBudget ? (
        <BudgetReportDetails
          budget={selectedBudget}
          allBudgets={budgets}
          onSelectBudget={setSelectedBudget}
          onUpdateBudget={handleUpdateBudget}
          onBack={() => setSelectedBudget(null)}
        />
      ) : (
        <>
          {/* Main Header with Actions, Search and View Toggle */}
          <BudgetReportHeader
            currentView={currentView}
            onViewChange={setCurrentView}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onOpenCreate={() => setIsCreateOpen(true)}
            onResetData={handleResetData}
          />

          {/* 4 Financial Performance KPI Metric Cards */}
          <BudgetSummaryCards budgets={filteredBudgets} />

          {/* Filter Bar */}
          <BudgetReportFilters
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            startDateFilter={startDateFilter}
            onStartDateChange={setStartDateFilter}
            endDateFilter={endDateFilter}
            onEndDateChange={setEndDateFilter}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            categories={categories}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Views: List View (Table) vs Kanban View */}
          {currentView === "list" ? (
            <BudgetReportTable
              budgets={filteredBudgets}
              totalBudgetsCount={budgets.length}
              onSelectBudget={setSelectedBudget}
              onEditBudget={setSelectedBudget}
              onDeleteBudget={handleDeleteBudget}
              onOpenCreate={() => setIsCreateOpen(true)}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <BudgetReportKanban
              budgets={filteredBudgets}
              totalBudgetsCount={budgets.length}
              onSelectBudget={setSelectedBudget}
              onEditBudget={setSelectedBudget}
              onDeleteBudget={handleDeleteBudget}
              onOpenCreate={() => setIsCreateOpen(true)}
              onClearFilters={handleClearFilters}
            />
          )}
        </>
      )}

      {/* Create Budget Modal */}
      <CreateBudgetModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveNewBudget}
      />
    </div>
  );
}

export default BudgetReport;
