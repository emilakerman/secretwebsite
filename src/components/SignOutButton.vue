<script setup>
import { ref, watch, nextTick } from 'vue'

const emit = defineEmits(['sign-out'])

const showConfirm = ref(false)
const cancelBtn = ref(null)

watch(showConfirm, (val) => {
  if (val) nextTick(() => cancelBtn.value?.focus())
})

function handleConfirmSignOut() {
  showConfirm.value = false
  emit('sign-out')
}
</script>

<template>
  <div class="sign-out-wrapper">
    <button class="sign-out-btn" aria-label="Sign out" @click="showConfirm = true">
      Sign out
    </button>

    <div
      v-if="showConfirm"
      class="confirm-overlay"
      @click.self="showConfirm = false"
      @keydown.esc="showConfirm = false"
    >
      <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <p id="confirm-title" class="confirm-message">Are you sure you want to sign out?</p>
        <div class="confirm-actions">
          <button ref="cancelBtn" class="confirm-btn confirm-btn--cancel" @click="showConfirm = false">Cancel</button>
          <button class="confirm-btn confirm-btn--signout" @click="handleConfirmSignOut">Sign out</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sign-out-btn {
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  border: 2px solid var(--border-color);
  background: var(--bg-secondary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 500;
  white-space: nowrap;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
}

.sign-out-btn:hover {
  border-color: var(--incorrect-text);
  color: var(--incorrect-text);
  background: transparent;
}

.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.confirm-dialog {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 32px 28px 24px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  text-align: center;
}

.confirm-message {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 24px;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.confirm-btn {
  flex: 1;
  padding: 10px 0;
  font-size: 0.9rem;
  font-family: inherit;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease, opacity 0.15s ease;
}

.confirm-btn--cancel {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
}

.confirm-btn--cancel:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.confirm-btn--signout {
  background: var(--incorrect-text);
  color: #ffffff;
  border: 2px solid transparent;
}

.confirm-btn--signout:hover {
  opacity: 0.85;
}
</style>
