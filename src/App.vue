<script setup>
import { ref } from 'vue'
import QuizContainer from './components/QuizContainer.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import LoginScreen from './components/LoginScreen.vue'
import SignOutButton from './components/SignOutButton.vue'

const isAuthenticated = ref(false)

function handleSignOut() {
  isAuthenticated.value = false
}
</script>

<template>
  <div id="app">
    <div class="top-bar">
      <ThemeToggle />
      <SignOutButton v-if="isAuthenticated" @sign-out="handleSignOut" />
    </div>
    <LoginScreen v-if="!isAuthenticated" @login="isAuthenticated = true" />
    <QuizContainer v-else />
  </div>
</template>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  min-height: 100vh;
  padding: 20px 0;
  color: var(--text-primary);
  background-color: var(--bg-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.top-bar {
  position: fixed;
  top: 16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 100;
}
</style>