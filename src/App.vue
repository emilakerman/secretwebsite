<script setup>
import { ref } from 'vue'
import QuizContainer from './components/QuizContainer.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import LoginScreen from './components/LoginScreen.vue'

const isAuthenticated = ref(false)
</script>

<template>
  <div id="app">
    <ThemeToggle />
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
</style>