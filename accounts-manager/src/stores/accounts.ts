// src/stores/accounts.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Account, AccountLabel } from '../types/account';

export const useAccountsStore = defineStore('accounts', () => {
  const accounts = ref<Account[]>([]);

  const addAccount = () => {
    const newAccount: Account = {
      id: Date.now().toString(),
      label: '',
      labels: [],
      type: 'Локальная',
      login: '',
      password: '',
    };
    accounts.value.push(newAccount);
    return newAccount.id;
  };

  const removeAccount = (id: string) => {
    const index = accounts.value.findIndex(acc => acc.id === id);
    if (index !== -1) {
      accounts.value.splice(index, 1);
    }
  };

  const updateAccount = (id: string, updates: Partial<Omit<Account, 'id' | 'labels'>>) => {
    const account = accounts.value.find(acc => acc.id === id);
    if (account) {
      Object.assign(account, updates);
      
      // Преобразуем поле label в массив объектов labels
      if (updates.label !== undefined) {
        account.labels = updates.label
          .split(';')
          .filter(tag => tag.trim() !== '')
          .map(tag => ({ text: tag.trim() }));
          
        console.log('Метки преобразованы:', account.labels);
      }
    }
  };

  // Функция для валидации пароля
  const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!password) {
      return { isValid: false, errors: ['Пароль обязателен для заполнения'] };
    }

    // Проверка длины
    if (password.length < 8) {
      errors.push('Пароль должен содержать не менее 8 символов');
    }
    if (password.length > 20) {
      errors.push('Пароль должен содержать не более 20 символов');
    }

    // Проверка на заглавные буквы
    if (!/[A-ZА-Я]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну заглавную букву');
    }

    // Проверка на строчные буквы
    if (!/[a-zа-я]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну строчную букву');
    }

    // Проверка на цифры
    if (!/\d/.test(password)) {
      errors.push('Пароль должен содержать хотя бы одну цифру');
    }

    // Проверка на специальные символы
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Пароль должен содержать хотя бы один специальный символ');
    }

    return { isValid: errors.length === 0, errors };
  };

  // Валидация аккаунта
  const validateAccount = (id: string): { isValid: boolean; errors: string[] } => {
    const account = accounts.value.find(acc => acc.id === id);
    const errors: string[] = [];

    if (!account) {
      return { isValid: false, errors: ['Аккаунт не найден'] };
    }

    // Валидация логина
    if (!account.login.trim()) {
      errors.push('Логин обязателен для заполнения');
    } else if (account.login.length > 100) {
      errors.push('Логин не должен превышать 100 символов');
    }

    // Валидация пароля для локальных записей
    if (account.type === 'Локальная') {
      const passwordValidation = validatePassword(account.password || '');
      errors.push(...passwordValidation.errors);
    }

    // Валидация метки
    if (account.label.length > 50) {
      errors.push('Метка не должна превышать 50 символов');
    }

    return { isValid: errors.length === 0, errors };
  };

  return {
    accounts,
    addAccount,
    removeAccount,
    updateAccount,
    validateAccount,
    validatePassword,
  };
}, {
  persist: true
});