/**
 * EMI Calculator — shared business logic for travel EMI calculations.
 * 
 * Business rules (indicative / illustration purposes):
 * - Interest-bearing: 1.25% flat per month on loan amount
 * - Processing fee: 2.5% one-time on loan amount
 * - No Cost EMI: 0% interest, 2.5% processing fee
 * 
 * Tenure defaults:
 * - 3 months: No Cost EMI
 * - 6 months: No Cost EMI
 * - 9, 12, 18, 24 months: Interest-bearing (Standard EMI)
 * 
 * Temporary provisional rules. Replace with final approved terms before launch.
 */

export type EmiType = "no_cost" | "standard";

export interface EmiResult {
  tenure: number;
  emiType: EmiType;
  monthlyEmi: number;
  processingFee: number;
  totalInterest: number;
  totalPayable: number;
  tripAmount: number;
}

export const TENURES = [3, 6, 9, 12, 18, 24] as const;

export const INTEREST_RATE_PER_MONTH = 0.0125; // 1.25% flat per month
export const PROCESSING_FEE_RATE = 0.025; // 2.5% one-time

/** Get default EMI type for a tenure */
export function defaultEmiType(tenure: number): EmiType {
  return tenure <= 6 ? "no_cost" : "standard";
}

/** Calculate EMI for a given amount, tenure, and type */
export function calculateEmi(amount: number, tenure: number, emiType: EmiType): EmiResult {
  const processingFee = Math.round(amount * PROCESSING_FEE_RATE);
  
  if (emiType === "no_cost") {
    const monthlyEmi = Math.round(amount / tenure);
    return {
      tenure,
      emiType,
      monthlyEmi,
      processingFee,
      totalInterest: 0,
      totalPayable: amount + processingFee,
      tripAmount: amount,
    };
  }

  // Standard / interest-bearing
  const totalInterest = Math.round(amount * INTEREST_RATE_PER_MONTH * tenure);
  const totalPayable = amount + totalInterest + processingFee;
  const monthlyEmi = Math.round(totalPayable / tenure);

  return {
    tenure,
    emiType,
    monthlyEmi,
    processingFee,
    totalInterest,
    totalPayable,
    tripAmount: amount,
  };
}

/** Calculate EMI across all tenures using default types */
export function calculateAllTenures(amount: number): EmiResult[] {
  return TENURES.map((t) => calculateEmi(amount, t, defaultEmiType(t)));
}

/** Format currency in INR */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
