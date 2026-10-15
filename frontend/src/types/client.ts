export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  company: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientWithCount extends Client {
  _count: { invoices: number };
}

export interface ClientInput {
  name: string;
  email: string;
  company: string;
}
