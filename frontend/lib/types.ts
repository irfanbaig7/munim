export type Owner = { name: string; phone: string };

export type Customer = {
  id: string;
  name: string;
  phone: string;
  location: string;
  createdAt: string;
  /** Baaki paisa (paise mein). Minus ho to customer ne zyada de diya (advance). */
  balancePaise: number;
};

/** amountPaise = us poori line ka total (quantity ka nahi, poore item ka) */
export type EntryItem = { name: string; quantity: number; unit: string; amountPaise: number };

export type Entry = {
  id: string;
  customerId: string;
  items: EntryItem[];
  totalPaise: number;
  dueDate: string | null;
  createdAt: string;
};

export type Payment = {
  id: string;
  customerId: string;
  amountPaise: number;
  note: string;
  createdAt: string;
};

export type Ledger = { customer: Customer; entries: Entry[]; payments: Payment[] };