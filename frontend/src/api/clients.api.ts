import type { ListResponse } from "../types/api";
import type { Client, ClientInput, ClientWithCount } from "../types/client";
import { request } from "./http";

export const clientsApi = {
  list: (signal?: AbortSignal) => request<ListResponse<ClientWithCount>>("/clients", { signal }),

  create: (input: ClientInput) => request<Client>("/clients", { method: "POST", body: input }),

  update: (id: string, input: ClientInput) => request<Client>(`/clients/${id}`, { method: "PUT", body: input }),

  remove: (id: string) => request<void>(`/clients/${id}`, { method: "DELETE" }),
};
