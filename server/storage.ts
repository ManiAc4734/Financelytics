import { type Account, type InsertAccount, type Transaction, type InsertTransaction, type UpdateTransaction, type Transactor, type InsertTransactor } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Account operations
  getAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;
  updateAccount(id: string, account: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: string): Promise<boolean>;

  // Transaction operations
  getTransactions(filters?: TransactionFilters): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: string, transaction: UpdateTransaction): Promise<Transaction | undefined>;
  deleteTransaction(id: string): Promise<boolean>;
  bulkUpdateTransactions(ids: string[], updates: UpdateTransaction): Promise<Transaction[]>;

  // Transactor operations
  getTransactors(): Promise<Transactor[]>;
  getTransactor(id: string): Promise<Transactor | undefined>;
  createTransactor(transactor: InsertTransactor): Promise<Transactor>;
  searchTransactors(query: string): Promise<Transactor[]>;

  // Analytics
  getTransactionSummary(filters?: TransactionFilters): Promise<TransactionSummary>;
}

export interface TransactionFilters {
  accountId?: string;
  classification?: string;
  paymentMedium?: string;
  processType?: string;
  schedule?: string;
  statutoryType?: string;
  transactor?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  showDeleted?: boolean;
  isActual?: boolean;
  isBudgetItem?: boolean;
  isInteraccount?: boolean;
  isIncomeStatement?: boolean;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  transactionCount: number;
  unclassifiedCount: number;
  accountBreakdown: { accountId: string; accountName: string; balance: number }[];
}

export class MemStorage implements IStorage {
  private accounts: Map<string, Account>;
  private transactions: Map<string, Transaction>;
  private transactors: Map<string, Transactor>;

  constructor() {
    this.accounts = new Map();
    this.transactions = new Map();
    this.transactors = new Map();

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Create sample accounts
    const account1: Account = {
      id: randomUUID(),
      name: "Main Checking",
      type: "Checking",
      owner: "John Doe",
      identifier: "*1234",
      createdAt: new Date(),
    };

    const account2: Account = {
      id: randomUUID(),
      name: "Savings Account",
      type: "Savings",
      owner: "John Doe",
      identifier: "*5678",
      createdAt: new Date(),
    };

    const account3: Account = {
      id: randomUUID(),
      name: "Credit Card",
      type: "Credit Card",
      owner: "John Doe",
      identifier: "*9012",
      createdAt: new Date(),
    };

    this.accounts.set(account1.id, account1);
    this.accounts.set(account2.id, account2);
    this.accounts.set(account3.id, account3);

    // Create sample transactors
    const transactor1: Transactor = {
      id: randomUUID(),
      name: "ABC Corporation",
      category: "Employer",
      createdAt: new Date(),
    };

    const transactor2: Transactor = {
      id: randomUUID(),
      name: "SuperMarket Plus",
      category: "Retail",
      createdAt: new Date(),
    };

    this.transactors.set(transactor1.id, transactor1);
    this.transactors.set(transactor2.id, transactor2);

    // Create sample transactions
    const transaction1: Transaction = {
      id: randomUUID(),
      accountId: account1.id,
      date: new Date("2024-01-15"),
      amount: "4850.00",
      originalDescription: "PAYMENT FROM ACH TRANSFER",
      currentDescription: "Salary Payment - January",
      transactor: "ABC Corporation",
      classification: "Income",
      paymentMedium: "Bank Transfer",
      processType: "Automated",
      schedule: "Recurring",
      statutoryType: "Income",
      isDeleted: false,
      isActual: true,
      isBudgetItem: false,
      isInteraccount: false,
      isIncomeStatement: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const transaction2: Transaction = {
      id: randomUUID(),
      accountId: account1.id,
      date: new Date("2024-01-14"),
      amount: "-127.50",
      originalDescription: "GROCERY STORE POS",
      currentDescription: "Weekly Groceries",
      transactor: "SuperMarket Plus",
      classification: "Expense",
      paymentMedium: "Card Payment",
      processType: "Manual",
      schedule: "Ad Hoc",
      statutoryType: "Voluntary",
      isDeleted: false,
      isActual: true,
      isBudgetItem: false,
      isInteraccount: false,
      isIncomeStatement: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const transaction3: Transaction = {
      id: randomUUID(),
      accountId: account1.id,
      date: new Date("2024-01-13"),
      amount: "-500.00",
      originalDescription: "UNKNOWN TRANSFER",
      currentDescription: null,
      transactor: null,
      classification: null,
      paymentMedium: null,
      processType: null,
      schedule: null,
      statutoryType: null,
      isDeleted: false,
      isActual: true,
      isBudgetItem: false,
      isInteraccount: false,
      isIncomeStatement: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.transactions.set(transaction1.id, transaction1);
    this.transactions.set(transaction2.id, transaction2);
    this.transactions.set(transaction3.id, transaction3);
  }

  // Account operations
  async getAccounts(): Promise<Account[]> {
    return Array.from(this.accounts.values());
  }

  async getAccount(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const account: Account = {
      ...insertAccount,
      id,
      createdAt: new Date(),
    };
    this.accounts.set(id, account);
    return account;
  }

  async updateAccount(id: string, updates: Partial<InsertAccount>): Promise<Account | undefined> {
    const account = this.accounts.get(id);
    if (!account) return undefined;

    const updatedAccount = { ...account, ...updates };
    this.accounts.set(id, updatedAccount);
    return updatedAccount;
  }

  async deleteAccount(id: string): Promise<boolean> {
    return this.accounts.delete(id);
  }

  // Transaction operations
  async getTransactions(filters?: TransactionFilters): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values());

    if (filters) {
      transactions = transactions.filter(tx => {
        if (filters.accountId && tx.accountId !== filters.accountId) return false;
        if (filters.classification && tx.classification !== filters.classification) return false;
        if (filters.paymentMedium && tx.paymentMedium !== filters.paymentMedium) return false;
        if (filters.processType && tx.processType !== filters.processType) return false;
        if (filters.schedule && tx.schedule !== filters.schedule) return false;
        if (filters.statutoryType && tx.statutoryType !== filters.statutoryType) return false;
        if (filters.transactor && tx.transactor !== filters.transactor) return false;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          const matchesOriginal = tx.originalDescription.toLowerCase().includes(searchLower);
          const matchesCurrent = tx.currentDescription?.toLowerCase().includes(searchLower);
          const matchesTransactor = tx.transactor?.toLowerCase().includes(searchLower);
          if (!matchesOriginal && !matchesCurrent && !matchesTransactor) return false;
        }
        if (!filters.showDeleted && tx.isDeleted) return false;
        if (filters.isActual !== undefined && tx.isActual !== filters.isActual) return false;
        if (filters.isBudgetItem !== undefined && tx.isBudgetItem !== filters.isBudgetItem) return false;
        if (filters.isInteraccount !== undefined && tx.isInteraccount !== filters.isInteraccount) return false;
        if (filters.isIncomeStatement !== undefined && tx.isIncomeStatement !== filters.isIncomeStatement) return false;
        
        return true;
      });
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getTransaction(id: string): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = randomUUID();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      accountId: insertTransaction.accountId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: string, updates: UpdateTransaction): Promise<Transaction | undefined> {
    const transaction = this.transactions.get(id);
    if (!transaction) return undefined;

    const updatedTransaction = { 
      ...transaction, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: string): Promise<boolean> {
    return this.transactions.delete(id);
  }

  async bulkUpdateTransactions(ids: string[], updates: UpdateTransaction): Promise<Transaction[]> {
    const updatedTransactions: Transaction[] = [];
    
    for (const id of ids) {
      const updated = await this.updateTransaction(id, updates);
      if (updated) {
        updatedTransactions.push(updated);
      }
    }
    
    return updatedTransactions;
  }

  // Transactor operations
  async getTransactors(): Promise<Transactor[]> {
    return Array.from(this.transactors.values());
  }

  async getTransactor(id: string): Promise<Transactor | undefined> {
    return this.transactors.get(id);
  }

  async createTransactor(insertTransactor: InsertTransactor): Promise<Transactor> {
    const id = randomUUID();
    const transactor: Transactor = {
      ...insertTransactor,
      id,
      category: insertTransactor.category || null,
      createdAt: new Date(),
    };
    this.transactors.set(id, transactor);
    return transactor;
  }

  async searchTransactors(query: string): Promise<Transactor[]> {
    const queryLower = query.toLowerCase();
    return Array.from(this.transactors.values()).filter(t => 
      t.name.toLowerCase().includes(queryLower)
    );
  }

  // Analytics
  async getTransactionSummary(filters?: TransactionFilters): Promise<TransactionSummary> {
    const transactions = await this.getTransactions(filters);
    const activeTransactions = transactions.filter(tx => !tx.isDeleted);
    
    let totalIncome = 0;
    let totalExpenses = 0;
    let unclassifiedCount = 0;

    activeTransactions.forEach(tx => {
      const amount = parseFloat(tx.amount);
      if (tx.classification === "Income") {
        totalIncome += amount;
      } else if (tx.classification === "Expense") {
        totalExpenses += Math.abs(amount);
      } else {
        unclassifiedCount++;
      }
    });

    const accountBreakdown: { accountId: string; accountName: string; balance: number }[] = [];
    const accountBalances = new Map<string, number>();
    
    activeTransactions.forEach(tx => {
      if (tx.accountId) {
        const current = accountBalances.get(tx.accountId) || 0;
        accountBalances.set(tx.accountId, current + parseFloat(tx.amount));
      }
    });

    for (const [accountId, balance] of Array.from(accountBalances.entries())) {
      const account = await this.getAccount(accountId);
      if (account) {
        accountBreakdown.push({
          accountId,
          accountName: account.name,
          balance,
        });
      }
    }

    return {
      totalIncome,
      totalExpenses,
      transactionCount: activeTransactions.length,
      unclassifiedCount,
      accountBreakdown,
    };
  }
}

export const storage = new MemStorage();
