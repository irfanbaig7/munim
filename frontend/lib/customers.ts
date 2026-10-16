import { api } from "./api";
import type { Customer, Ledger } from "./types";

export async function listCustomers(): Promise<Customer[]> {
  const { customers } = await api<{ customers: Customer[] }>("/customers");
  return customers;
}

export async function addCustomer(input: { name: string; phone: string; location: string }): Promise<Customer> {
  const { customer } = await api<{ customer: Customer }>("/customers", { method: "POST", body: input });
  return customer;
}

/** Ek customer ki saari entries, payments aur baaki paisa */
export const getLedger = (customerId: string) => api<Ledger>(`/customers/${customerId}/ledger`);