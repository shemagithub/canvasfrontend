import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

/** All prices are stored and displayed in USD. */
export type StoredCurrency = "USD";
export type CurrencyCode = "USD";

export const CURRENCY_OPTIONS: CurrencyCode[] = ["USD"];

export function resolveStoredCurrency(_brandingCurrency?: string | null): StoredCurrency {
  return "USD";
}

export function convertMoney(amount: number, _from?: StoredCurrency, _to?: CurrencyCode): number {
  return Number.isFinite(amount) ? amount : 0;
}

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  storedCurrency: StoredCurrency;
  formatMoney: (amount: number, _source?: StoredCurrency) => string;
  formatRate: (amount?: number | null, suffix?: string, _source?: StoredCurrency) => string;
  currencyOptions: CurrencyCode[];
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => {},
  storedCurrency: "USD",
  formatMoney: () => "",
  formatRate: () => "—",
  currencyOptions: CURRENCY_OPTIONS,
});

function formatUsd(amount: number): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  const digits = amount >= 100 ? 0 : amount >= 1 ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(amount);
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const formatMoney = useCallback((amount: number) => formatUsd(amount), []);

  const formatRate = useCallback(
    (amount?: number | null, suffix = "") => {
      if (amount == null || Number.isNaN(amount)) return "—";
      const formatted = formatUsd(amount);
      return suffix ? `${formatted}${suffix}` : formatted;
    },
    [],
  );

  const value = useMemo(
    () => ({
      currency: "USD" as const,
      setCurrency: () => {},
      storedCurrency: "USD" as const,
      formatMoney,
      formatRate,
      currencyOptions: CURRENCY_OPTIONS,
    }),
    [formatMoney, formatRate],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function getCurrencyLabel(_code: CurrencyCode): string {
  return "USD";
}
