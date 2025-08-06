import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Account, InsertAccount } from "@shared/schema";
import { ACCOUNT_TYPE_OPTIONS } from "@shared/schema";

export default function Accounts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [formData, setFormData] = useState<InsertAccount>({
    name: "",
    type: "",
    owner: "",
    identifier: "",
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
  });

  const createMutation = useMutation({
    mutationFn: async (account: InsertAccount) => {
      return apiRequest("POST", "/api/accounts", account);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Account created",
        description: "Account has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Creation failed",
        description: "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InsertAccount> }) => {
      return apiRequest("PUT", `/api/accounts/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      setIsDialogOpen(false);
      setEditingAccount(null);
      resetForm();
      toast({
        title: "Account updated",
        description: "Account has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update account",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      toast({
        title: "Account deleted",
        description: "Account has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      owner: "",
      identifier: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccount) {
      updateMutation.mutate({ id: editingAccount.id, updates: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      name: account.name,
      type: account.type,
      owner: account.owner,
      identifier: account.identifier,
    });
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingAccount(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAccount ? "Edit Account" : "Create New Account"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Account Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter account name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Account Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACCOUNT_TYPE_OPTIONS.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="owner">Owner</Label>
                <Input
                  id="owner"
                  value={formData.owner}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  placeholder="Enter account owner"
                  required
                />
              </div>
              <div>
                <Label htmlFor="identifier">Account Identifier</Label>
                <Input
                  id="identifier"
                  value={formData.identifier}
                  onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                  placeholder="Enter account number or identifier"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingAccount ? "Update" : "Create"} Account
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <Card key={account.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{account.name}</span>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(account)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(account.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">Type:</span>
                  <span className="ml-2 text-sm text-gray-900">{account.type}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Owner:</span>
                  <span className="ml-2 text-sm text-gray-900">{account.owner}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Identifier:</span>
                  <span className="ml-2 text-sm text-gray-900">{account.identifier}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created:</span>
                  <span className="ml-2 text-sm text-gray-900">
                    {new Date(account.createdAt || '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first account.</p>
            <Button onClick={handleNew} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
