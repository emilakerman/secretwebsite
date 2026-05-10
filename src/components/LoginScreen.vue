<script setup>
import { ref } from 'vue'

const emit = defineEmits(['login'])

// Simple client-side gate — not a security boundary
const QUIZ_PASSWORD = '123456'

const password = ref('')
const error = ref(false)

function handleSubmit() {
  if (password.value === QUIZ_PASSWORD) {
    emit('login')
  } else {
    error.value = true
    password.value = ''
  }
}

function handleInput() {
  error.value = false
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Geography Quiz</h1>
      <p class="login-subtitle">Enter the password to continue</p>
      <form class="login-form" @submit.prevent="handleSubmit">
        <input
          v-model="password"
          type="password"
          class="login-input"
          :class="{ 'login-input--error': error }"
          placeholder="Password"
          autocomplete="current-password"
          @input="handleInput"
        />
        <p v-if="error" class="login-error">Incorrect password. Please try again.</p>
        <button type="submit" class="login-button">Sign In</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
}

.login-card {
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 48px 40px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px;
}

.login-subtitle {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 0 32px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  font-family: inherit;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.login-input:focus {
  border-color: var(--accent-color);
}

.login-input--error {
  border-color: var(--incorrect-text);
}

.login-error {
  font-size: 0.85rem;
  color: var(--incorrect-text);
  margin: 0;
}

.login-button {
  padding: 12px;
  font-size: 1rem;
  font-family: inherit;
  font-weight: 600;
  background-color: var(--accent-color);
  color: #ffffff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  margin-top: 4px;
}

.login-button:hover {
  background-color: var(--accent-hover);
}
</style>
