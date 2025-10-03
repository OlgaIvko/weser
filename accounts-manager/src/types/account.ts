// src/types/account.ts
export interface AccountLabel {
  text: string;
}

export type AccountType = 'LDAP' | 'Локальная';

export interface Account {
  id: string;
  label: string;
  labels: AccountLabel[];
  type: AccountType;
  login: string;
  password: string | null;
}