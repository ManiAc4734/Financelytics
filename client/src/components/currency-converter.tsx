import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCY_OPTIONS } from "@shared/schema";
import { convertCurrency, formatCurrencyWithSign } from "@/lib/currency-utils";

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("100");
  const [fromCurrency, setFromCurrency] = useState<string>("ZAR");
  const [toCurrency, setToCurrency] = useState<string>("GBP");
  
  const convertedAmount = amount ? convertCurrency(parseFloat(amount), fromCurrency, toCurrency) : 0;
  
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Currency Converter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-2">Amount</Label>
          <Input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCY_OPTIONS.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {amount && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-lg font-semibold text-blue-900">
              {formatCurrencyWithSign(parseFloat(amount), fromCurrency)} = {formatCurrencyWithSign(convertedAmount, toCurrency)}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              Exchange rate: 1 {fromCurrency} = {convertCurrency(1, fromCurrency, toCurrency).toFixed(4)} {toCurrency}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}