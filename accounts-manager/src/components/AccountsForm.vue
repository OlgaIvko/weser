<!-- src/components/AccountsForm.vue -->
<template>
  <div class="accounts-form">
    <div class="form-header">
      <h1>Управление учетными записями</h1>
      <button @click="addAccount" class="add-button" type="button">
        <span class="plus">+</span>
        Добавить учетную запись
      </button>
    </div>

    <div class="hint">
      <p>В поле "Метка" вводите текстовые метки через знак ; (максимум 50 символов)</p>
      <p><strong>Требования к паролю:</strong></p>
      <ul class="password-requirements">
        <li>Не менее 8 и не более 20 символов</li>
        <li>Хотя бы одна заглавная буква</li>
        <li>Хотя бы одна строчная буква</li>
        <li>Хотя бы одна цифра</li>
        <li>Хотя бы один специальный символ (!@#$%^&*()_+-=[]{};':"|,.<>/? и др.)</li>
      </ul>
    </div>

    <div class="accounts-list">
      <div 
        v-for="account in accountsStore.accounts" 
        :key="account.id" 
        class="account-item"
        :class="{ 'has-errors': hasErrors(account.id) }"
      >
        <div class="form-row">
          <!-- Поле Метка -->
          <div class="form-field">
            <label class="field-label">Метка</label>
            <input
              :value="account.label"
              @input="updateField(account.id, 'label', $event)"
              @blur="validateAccount(account.id)"
              type="text"
              placeholder="метка1; метка2"
              :class="{ 'error': hasError(account.id, 'label') }"
              class="field-input"
            />
            <div v-if="hasError(account.id, 'label')" class="error-message">
              {{ getError(account.id, 'label') }}
            </div>
          </div>

          <!-- Поле Тип записи -->
          <div class="form-field">
            <label class="field-label">Тип записи</label>
            <select 
              :value="account.type"
              @change="updateField(account.id, 'type', $event)"
              class="field-select"
            >
              <option value="Локальная">Локальная</option>
              <option value="LDAP">LDAP</option>
            </select>
          </div>

          <!-- Поле Логин -->
          <div class="form-field">
            <label class="field-label">Логин *</label>
            <input
              :value="account.login"
              @input="updateField(account.id, 'login', $event)"
              @blur="validateAccount(account.id)"
              type="text"
              :class="{ 'error': hasError(account.id, 'login') }"
              class="field-input"
            />
            <div v-if="hasError(account.id, 'login')" class="error-message">
              {{ getError(account.id, 'login') }}
            </div>
          </div>

          <!-- Поле Пароль (только для Локальной записи) -->
          <div class="form-field" v-if="account.type === 'Локальная'">
            <label class="field-label">Пароль *</label>
            <input
              :value="account.password || ''"
              @input="updateField(account.id, 'password', $event)"
              @blur="validateAccount(account.id)"
              type="password"
              placeholder="Введите надежный пароль"
              :class="{ 'error': hasError(account.id, 'password') }"
              class="field-input"
            />
            <div v-if="hasError(account.id, 'password')" class="error-message">
              {{ getError(account.id, 'password') }}
            </div>
            <div v-else-if="account.password && account.password.length > 0" class="password-strength">
              <div class="strength-indicator">
                <div class="strength-bar" :class="getPasswordStrength(account.password).class"></div>
              </div>
              <div class="strength-text">
                {{ getPasswordStrength(account.password).text }}
              </div>
            </div>
          </div>

          <!-- Кнопка удаления -->
          <button 
            @click="removeAccount(account.id)" 
            class="delete-button"
            type="button"
          >
            Удалить
          </button>
        </div>

        <!-- Блок с ошибками валидации -->
        <div v-if="hasErrors(account.id)" class="validation-errors">
          <p class="errors-title">Исправьте следующие ошибки:</p>
          <ul class="errors-list">
            <li v-if="hasError(account.id, 'label')">
              <strong>Метка:</strong> {{ getError(account.id, 'label') }}
            </li>
            <li v-if="hasError(account.id, 'login')">
              <strong>Логин:</strong> {{ getError(account.id, 'login') }}
            </li>
            <li v-if="hasError(account.id, 'password')">
              <strong>Пароль:</strong> {{ getError(account.id, 'password') }}
            </li>
          </ul>
        </div>

        <!-- Статус валидации -->
        <div class="validation-status" :class="{ 'valid': isValid(account.id), 'invalid': !isValid(account.id) }">
          {{ getValidationStatus(account.id) }}
        </div>

        <!-- Отладочная информация о метках -->
        <div v-if="debugMode" class="debug-info">
          <small>Отладка: Метки = {{ account.labels }}</small>
        </div>
      </div>
    </div>

    <!-- Кнопка сохранения всех валидных записей -->
    <div class="form-footer">
      <button 
        @click="saveValidAccounts" 
        class="save-button"
        :disabled="!hasValidAccounts"
        type="button"
      >
        Сохранить валидные записи
      </button>
      <div class="summary">
        Всего записей: {{ accountsStore.accounts.length }} |
        Валидных: {{ validAccountsCount }} |
        С ошибками: {{ invalidAccountsCount }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAccountsStore } from '../stores/accounts';
import type { AccountType } from '../types/account';

const accountsStore = useAccountsStore();

// Хранилище ошибок
const errors = ref<Record<string, Record<string, string>>>({});

// Режим отладки (можно включить для проверки преобразования меток)
const debugMode = ref(false);

// Добавление учетной записи
const addAccount = () => {
  const newId = accountsStore.addAccount();
  // Инициализируем ошибки для новой записи
  errors.value[newId] = {};
};

// Удаление учетной записи
const removeAccount = (id: string) => {
  accountsStore.removeAccount(id);
  // Удаляем ошибки для удаленного аккаунта
  if (errors.value[id]) {
    delete errors.value[id];
  }
};

// Обновление поля
const updateField = (id: string, field: string, event: Event) => {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  const value = target.value;

  if (field === 'type') {
    const typeValue = value as AccountType;
    accountsStore.updateAccount(id, { type: typeValue });
    
    // Если тип изменился на LDAP, сбрасываем пароль
    if (typeValue === 'LDAP') {
      accountsStore.updateAccount(id, { password: null });
      // Очищаем ошибку пароля
      if (errors.value[id] && errors.value[id].password) {
        delete errors.value[id].password;
      }
    }
  } else {
    accountsStore.updateAccount(id, { [field]: value });
  }

  // Валидируем аккаунт после обновления
  validateAccount(id);
};

// Валидация аккаунта
const validateAccount = (id: string) => {
  const validation = accountsStore.validateAccount(id);
  
  // Инициализируем объект ошибок для аккаунта, если его нет
  if (!errors.value[id]) {
    errors.value[id] = {};
  }

  // Очищаем все ошибки для этого аккаунта
  errors.value[id] = {};

  // Заполняем ошибки на основе валидации
  validation.errors.forEach(error => {
    if (error.includes('Логин')) {
      errors.value[id].login = error;
    } else if (error.includes('Пароль') || error.includes('пароль')) {
      errors.value[id].password = error;
    } else if (error.includes('Метка')) {
      errors.value[id].label = error;
    }
  });
};

// Проверка наличия ошибки для поля
const hasError = (id: string, field: string): boolean => {
  return !!(errors.value[id] && errors.value[id][field]);
};

// Получение текста ошибки
const getError = (id: string, field: string): string => {
  return errors.value[id]?.[field] || '';
};

// Проверка наличия ошибок в аккаунте
const hasErrors = (id: string): boolean => {
  return !!(errors.value[id] && Object.keys(errors.value[id]).length > 0);
};

// Проверка валидности аккаунта
const isValid = (id: string): boolean => {
  return accountsStore.validateAccount(id).isValid;
};

// Получение статуса валидации
const getValidationStatus = (id: string): string => {
  return isValid(id) ? '✓ Валидна' : '✗ Требует исправлений';
};

// Оценка сложности пароля
const getPasswordStrength = (password: string): { class: string; text: string } => {
  if (!password) return { class: 'empty', text: '' };
  
  const validation = accountsStore.validatePassword(password);
  const errorCount = validation.errors.length;
  
  if (errorCount >= 4) return { class: 'very-weak', text: 'Очень слабый' };
  if (errorCount >= 3) return { class: 'weak', text: 'Слабый' };
  if (errorCount >= 2) return { class: 'medium', text: 'Средний' };
  if (errorCount >= 1) return { class: 'strong', text: 'Сильный' };
  
  return { class: 'very-strong', text: 'Очень сильный' };
};

// Подсчет валидных и невалидных аккаунтов
const validAccountsCount = computed(() => {
  return accountsStore.accounts.filter(account => 
    accountsStore.validateAccount(account.id).isValid
  ).length;
});

const invalidAccountsCount = computed(() => {
  return accountsStore.accounts.filter(account => 
    !accountsStore.validateAccount(account.id).isValid
  ).length;
});

const hasValidAccounts = computed(() => {
  return validAccountsCount.value > 0;
});

// Сохранение только валидных записей
const saveValidAccounts = () => {
  const validAccounts = accountsStore.accounts.filter(account => 
    accountsStore.validateAccount(account.id).isValid
  );
  
  if (validAccounts.length === 0) {
    alert('Нет валидных записей для сохранения');
    return;
  }

  // В реальном приложении здесь был бы вызов API
  console.log('Сохранены валидные записи:', validAccounts);
  alert(`Успешно сохранено ${validAccounts.length} валидных записей`);
};

// Инициализация при монтировании
onMounted(() => {
  if (accountsStore.accounts.length === 0) {
    addAccount();
  }
  
  // Валидируем все существующие аккаунты при загрузке
  accountsStore.accounts.forEach(account => {
    validateAccount(account.id);
  });
});
</script>

<style scoped>
.accounts-form {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e1e5e9;
}

.form-header h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 28px;
  font-weight: 600;
}

.add-button {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.add-button:hover {
  background: #2980b9;
}

.plus {
  font-size: 18px;
  font-weight: bold;
}

.hint {
  background: #e8f4fd;
  padding: 16px 20px;
  border-radius: 6px;
  margin-bottom: 24px;
  color: #2c3e50;
  border-left: 4px solid #3498db;
  font-size: 14px;
}

.hint p {
  margin: 8px 0;
}

.password-requirements {
  margin: 8px 0 0 20px;
  padding: 0;
}

.password-requirements li {
  margin-bottom: 4px;
  font-size: 13px;
}

.accounts-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.account-item {
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  padding: 24px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
}

.account-item.has-errors {
  border-color: #e74c3c;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.15);
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 1fr 2fr 1fr auto;
  gap: 16px;
  align-items: start;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  margin-bottom: 4px;
}

.field-input,
.field-select {
  padding: 10px 12px;
  border: 2px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s ease;
  background: white;
}

.field-input:focus,
.field-select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.field-input.error,
.field-select.error {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

.password-strength {
  margin-top: 8px;
}

.strength-indicator {
  height: 6px;
  background: #ecf0f1;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.strength-bar {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-bar.empty {
  width: 0%;
  background: #ecf0f1;
}

.strength-bar.very-weak {
  width: 20%;
  background: #e74c3c;
}

.strength-bar.weak {
  width: 40%;
  background: #e67e22;
}

.strength-bar.medium {
  width: 60%;
  background: #f1c40f;
}

.strength-bar.strong {
  width: 80%;
  background: #2ecc71;
}

.strength-bar.very-strong {
  width: 100%;
  background: #27ae60;
}

.strength-text {
  font-size: 11px;
  color: #7f8c8d;
  text-align: center;
}

.delete-button {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  align-self: center;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.delete-button:hover {
  background: #c0392b;
}

.validation-errors {
  margin-top: 16px;
  padding: 16px;
  background: #fdf2f2;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
}

.errors-title {
  margin: 0 0 8px 0;
  color: #721c24;
  font-weight: 600;
  font-size: 14px;
}

.errors-list {
  margin: 0;
  padding-left: 20px;
  color: #721c24;
}

.errors-list li {
  margin-bottom: 4px;
  font-size: 13px;
}

.validation-status {
  margin-top: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.validation-status.valid {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.validation-status.invalid {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.debug-info {
  margin-top: 8px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 11px;
  color: #6c757d;
}

.form-footer {
  margin-top: 32px;
  padding-top: 20px;
  border-top: 2px solid #e1e5e9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.save-button {
  background: #27ae60;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.save-button:hover:not(:disabled) {
  background: #219653;
}

.save-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.6;
}

.summary {
  color: #7f8c8d;
  font-size: 14px;
  font-weight: 500;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .form-row {
    grid-template-columns: 1fr 1fr 1fr auto;
  }
}

@media (max-width: 768px) {
  .form-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .accounts-form {
    padding: 16px;
  }
  
  .account-item {
    padding: 20px;
  }
  
  .delete-button {
    align-self: stretch;
  }
  
  .form-footer {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .form-header h1 {
    font-size: 24px;
  }
  
  .add-button {
    padding: 10px 16px;
    font-size: 13px;
  }
}
</style>