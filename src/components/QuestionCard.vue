<script setup>
import { computed } from 'vue'

const props = defineProps({
  question: {
    type: Object,
    required: true
  },
  selectedIndex: {
    type: Number,
    default: null
  },
  isAnswered: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['select'])

const optionClasses = (index) => {
  const classes = ['answer-option']
  if (props.isAnswered) {
    if (index === props.question.correctIndex) {
      classes.push('correct')
    } else if (index === props.selectedIndex) {
      classes.push('incorrect')
    }
  } else if (index === props.selectedIndex) {
    classes.push('selected')
  }
  return classes
}

const handleSelect = (index) => {
  if (!props.isAnswered) {
    emit('select', index)
  }
}

const handleKeydown = (event, index) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleSelect(index)
  }
}
</script>

<template>
  <div class="question-card">
    <h2 class="question-text">{{ question.question }}</h2>
    <div class="options-list">
      <button
        v-for="(option, index) in question.options"
        :key="index"
        :class="optionClasses(index)"
        :aria-disabled="isAnswered"
        tabindex="0"
        @click="handleSelect(index)"
        @keydown="handleKeydown($event, index)"
      >
        <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
        <span class="option-text">{{ option }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.question-card {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
}

.question-text {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: var(--text-primary);
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.answer-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  cursor: pointer;
  font-size: 1rem;
  text-align: left;
  transition: all 0.15s ease;
  color: var(--text-primary);
}

.answer-option:hover:not([aria-disabled="true"]) {
  border-color: var(--accent-color);
  background: var(--accent-light);
}

.answer-option.selected {
  border-color: var(--accent-color);
  background: var(--accent-light);
}

.answer-option.correct {
  border-color: var(--correct-text);
  background: var(--correct-bg);
  color: var(--correct-text);
}

.answer-option.incorrect {
  border-color: var(--incorrect-text);
  background: var(--incorrect-bg);
  color: var(--incorrect-text);
}

.answer-option:disabled {
  cursor: default;
}

.option-letter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--letter-bg);
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
  transition: background 0.3s ease;
}

.option-text {
  flex: 1;
}
</style>