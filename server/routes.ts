import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAccountSchema, insertTransactionSchema, updateTransactionSchema, insertTransactorSchema } from "@shared/schema";
import { z } from "zod";

const transactionFiltersSchema = z.object({
  accountId: z.string().optional(),
  classification: z.string().optional(),
  paymentMedium: z.string().optional(),
  processType: z.string().optional(),
  schedule: z.string().optional(),
  statutoryType: z.string().optional(),
  transactor: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  showDeleted: z.string().transform(val => val === 'true').optional(),
  isActual: z.string().transform(val => val === 'true').optional(),
  isBudgetItem: z.string().transform(val => val === 'true').optional(),
  isInteraccount: z.string().transform(val => val === 'true').optional(),
  isIncomeStatement: z.string().transform(val => val === 'true').optional(),
});

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()),
  updates: updateTransactionSchema,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Account routes
  app.get("/api/accounts", async (req, res) => {
    try {
      const accounts = await storage.getAccounts();
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch accounts" });
    }
  });

  app.get("/api/accounts/:id", async (req, res) => {
    try {
      const account = await storage.getAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch account" });
    }
  });

  app.post("/api/accounts", async (req, res) => {
    try {
      const accountData = insertAccountSchema.parse(req.body);
      const account = await storage.createAccount(accountData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.put("/api/accounts/:id", async (req, res) => {
    try {
      const updates = insertAccountSchema.partial().parse(req.body);
      const account = await storage.updateAccount(req.params.id, updates);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid account data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update account" });
    }
  });

  app.delete("/api/accounts/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAccount(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const filters = transactionFiltersSchema.parse(req.query);
      const transactions = await storage.getTransactions(filters);
      res.json(transactions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const transaction = await storage.getTransaction(req.params.id);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transaction" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const updates = updateTransactionSchema.parse(req.body);
      const transaction = await storage.updateTransaction(req.params.id, updates);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTransaction(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete transaction" });
    }
  });

  app.post("/api/transactions/bulk-update", async (req, res) => {
    try {
      const { ids, updates } = bulkUpdateSchema.parse(req.body);
      const updatedTransactions = await storage.bulkUpdateTransactions(ids, updates);
      res.json(updatedTransactions);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bulk update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to bulk update transactions" });
    }
  });

  // Transactor routes
  app.get("/api/transactors", async (req, res) => {
    try {
      const { search } = req.query;
      if (search && typeof search === 'string') {
        const transactors = await storage.searchTransactors(search);
        res.json(transactors);
      } else {
        const transactors = await storage.getTransactors();
        res.json(transactors);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactors" });
    }
  });

  app.post("/api/transactors", async (req, res) => {
    try {
      const transactorData = insertTransactorSchema.parse(req.body);
      const transactor = await storage.createTransactor(transactorData);
      res.status(201).json(transactor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transactor data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create transactor" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const filters = transactionFiltersSchema.parse(req.query);
      const summary = await storage.getTransactionSummary(filters);
      res.json(summary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid filter parameters", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  // CSV import route
  app.post("/api/transactions/import", async (req, res) => {
    try {
      const { transactions } = req.body;
      if (!Array.isArray(transactions)) {
        return res.status(400).json({ message: "Invalid data format" });
      }

      const importedTransactions = [];
      for (const transactionData of transactions) {
        try {
          const validatedData = insertTransactionSchema.parse(transactionData);
          const transaction = await storage.createTransaction(validatedData);
          importedTransactions.push(transaction);
        } catch (error) {
          console.error("Failed to import transaction:", error);
          // Continue with other transactions
        }
      }

      res.json({ 
        message: `Successfully imported ${importedTransactions.length} of ${transactions.length} transactions`,
        imported: importedTransactions 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to import transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
