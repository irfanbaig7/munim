import { api } from "./api";
import type { Customer } from "./types";

export async function listCustomers(): Promise<Customer[]> {
  const { customers } = await api<{ customers: Customer[] }>("/customers");
  return customers;
}

export async function addCustomer(input: { name: string; phone: string; location: string }): Promise<Customer> {
  const { customer } = await api<{ customer: Customer }>("/customers", { method: "POST", body: input });
  return customer;
}