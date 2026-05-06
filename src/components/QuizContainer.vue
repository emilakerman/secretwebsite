<script setup>
import { ref, computed } from 'vue'
import QuestionCard from './QuestionCard.vue'
import { quizQuestions } from '../data/quizQuestions.js'

const currentIndex = ref(0)
const selectedIndex = ref(null)
const isAnswered = ref(false)
const answers = ref({})

const currentQuestion = computed(() => quizQuestions[currentIndex.value])
const totalQuestions = computed(() => quizQuestions.length)
const isLastQuestion = computed(() => currentIndex.value === totalQuestions.value - 1)
const isFirstQuestion = computed(() => currentIndex.value === 0)
const showResults = ref(false)

const answeredCount = computed(() => Object.keys(answers.value).length)
const progressPercentage = computed(() => Math.round((answeredCount.value / totalQuestions.value) * 100))

const correctCount = computed(() => {
  let count = 0
  for (const [questionId, selectedIndex] of Object.entries(answers.value)) {
    const q = quizQuestions.find(q => q.id === Number(questionId))
    if (q && q.correctIndex === selectedIndex) {
      count++
    }
  }
  return count
})

const incorrectCount = computed(() => answeredCount.value - correctCount.value)

const scorePercentage = computed(() => {
  if (answeredCount.value === 0) return 0
  return Math.round((correctCount.value / answeredCount.value) * 100)
})

const missedQuestions = computed(() => {
  const missed = []
  for (const [questionId, selectedIndex] of Object.entries(answers.value)) {
    const q = quizQuestions.find(q => q.id === Number(questionId))
    if (q && q.correctIndex !== selectedIndex) {
      missed.push({
        id: q.id,
        question: q.question,
        yourAnswer: q.options[selectedIndex],
        correctAnswer: q.options[q.correctIndex]
      })
    }
  }
  return missed
})

const DOT_WINDOW_SIZE = 20
const dotWindowStart = ref(0)

const dotWindowQuestions = computed(() =>
  quizQuestions.slice(dotWindowStart.value, dotWindowStart.value + DOT_WINDOW_SIZE)
)

const canScrollDotsPrev = computed(() => dotWindowStart.value > 0)
const canScrollDotsNext = computed(() => dotWindowStart.value + DOT_WINDOW_SIZE < totalQuestions.value)

const scrollDotsPrev = () => {
  dotWindowStart.value = Math.max(dotWindowStart.value - DOT_WINDOW_SIZE, 0)
}

const scrollDotsNext = () => {
  dotWindowStart.value = Math.min(
    dotWindowStart.value + DOT_WINDOW_SIZE,
    totalQuestions.value - DOT_WINDOW_SIZE
  )
}

const ensureDotWindowVisible = (index) => {
  if (index < dotWindowStart.value || index >= dotWindowStart.value + DOT_WINDOW_SIZE) {
    const raw = Math.floor(index / DOT_WINDOW_SIZE) * DOT_WINDOW_SIZE
    dotWindowStart.value = Math.min(raw, totalQuestions.value - DOT_WINDOW_SIZE)
  }
}

const handleSelect = (index) => {
  selectedIndex.value = index
  isAnswered.value = true
  answers.value[currentIndex.value] = index
}

const goToNext = () => {
  if (isLastQuestion.value) {
    showResults.value = true
  } else {
    currentIndex.value++
    loadCurrentAnswerState()
    ensureDotWindowVisible(currentIndex.value)
  }
}

const emit = defineEmits(['complete'])

const handleComplete = () => {
  showResults.value = true
}

const goToPrev = () => {
  if (!isFirstQuestion.value) {
    currentIndex.value--
    loadCurrentAnswerState()
    ensureDotWindowVisible(currentIndex.value)
  }
}

const loadCurrentAnswerState = () => {
  if (answers.value[currentIndex.value] !== undefined) {
    selectedIndex.value = answers.value[currentIndex.value]
    isAnswered.value = true
  } else {
    selectedIndex.value = null
    isAnswered.value = false
  }
}

const goToQuestion = (index) => {
  currentIndex.value = index
  loadCurrentAnswerState()
}

const restartQuiz = () => {
  currentIndex.value = 0
  selectedIndex.value = null
  isAnswered.value = false
  answers.value = {}
  showResults.value = false
  dotWindowStart.value = 0
}
</script>

<template>
  <div class="quiz-container">
    <template v-if="showResults">
      <div class="results-screen">
        <h2>Quiz Complete!</h2>
        <div class="score-summary">
          <div class="score-stat correct">
            <span class="score-value">{{ correctCount }}</span>
            <span class="score-label">Correct</span>
          </div>
          <div class="score-stat incorrect">
            <span class="score-value">{{ incorrectCount }}</span>
            <span class="score-label">Incorrect</span>
          </div>
          <div class="score-stat percentage">
            <span class="score-value">{{ scorePercentage }}%</span>
            <span class="score-label">Score</span>
          </div>
        </div>

        <button class="restart-btn" @click="restartQuiz">Take Quiz Again</button>

        <div v-if="missedQuestions.length > 0" class="missed-section">
          <h3>Review Missed Questions ({{ missedQuestions.length }})</h3>
          <div class="missed-list">
            <div v-for="item in missedQuestions" :key="item.id" class="missed-item">
              <p class="missed-question">{{ item.id }}. {{ item.question }}</p>
              <p class="missed-answers">
                <span class="your-answer">Your answer: {{ item.yourAnswer }}</span>
                <span class="correct-answer">Correct: {{ item.correctAnswer }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="quiz-progress-container">
        <div class="progress-info">
          <span class="question-counter">Question {{ currentIndex + 1 }} of {{ totalQuestions }}</span>
          <span class="progress-text">{{ answeredCount }} / {{ totalQuestions }} answered ({{ progressPercentage }}%)</span>
        </div>
        <div class="progress-bar-wrapper" role="progressbar" :aria-valuenow="progressPercentage" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar" :style="{ width: progressPercentage + '%' }"></div>
        </div>
      </div>

      <div class="quiz-header">
        <div class="navigation-dots-container">
          <button
            class="dots-nav-btn"
            :disabled="!canScrollDotsPrev"
            @click="scrollDotsPrev"
            aria-label="Previous questions"
          >&#8249;</button>
          <div class="navigation-dots">
            <button
              v-for="(q, i) in dotWindowQuestions"
              :key="q.id"
              :class="['dot', { active: (dotWindowStart + i) === currentIndex, answered: answers[dotWindowStart + i] !== undefined }]"
              @click="goToQuestion(dotWindowStart + i)"
              :aria-label="`Go to question ${dotWindowStart + i + 1}`"
            />
          </div>
          <button
            class="dots-nav-btn"
            :disabled="!canScrollDotsNext"
            @click="scrollDotsNext"
            aria-label="Next questions"
          >&#8250;</button>
        </div>
        <span class="dots-range-label">{{ dotWindowStart + 1 }}–{{ Math.min(dotWindowStart + DOT_WINDOW_SIZE, totalQuestions) }} of {{ totalQuestions }}</span>
      </div>

      <QuestionCard
        :question="currentQuestion"
        :selected-index="selectedIndex"
        :is-answered="isAnswered"
        @select="handleSelect"
      />

      <div class="quiz-navigation">
        <button
          class="nav-btn"
          :disabled="isFirstQuestion"
          @click="goToPrev"
        >
          Previous
        </button>
        <button
          class="nav-btn primary"
          :disabled="!isAnswered"
          @click="goToNext"
        >
          {{ isLastQuestion ? 'See Results' : 'Next' }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.quiz-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.quiz-progress-container {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: background 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.question-counter {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.progress-text {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.progress-bar-wrapper {
  height: 8px;
  background: var(--progress-bar-bg);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-hover));
  border-radius: 4px;
  transition: width 0.3s ease;
}

.quiz-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: var(--bg-secondary);
  border-radius: 8px;
  transition: background 0.3s ease;
}

.navigation-dots-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.navigation-dots {
  display: flex;
  gap: 6px;
  flex-wrap: nowrap;
  flex: 1;
  justify-content: center;
}

.dots-nav-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  padding: 0;
  line-height: 1;
}

.dots-nav-btn:hover:not(:disabled) {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.dots-nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.dots-range-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--dot-border);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;
}

.dot:hover {
  border-color: var(--accent-color);
}

.dot.active {
  background: var(--dot-active-bg);
  border-color: var(--dot-active-bg);
  transform: scale(1.2);
}

.dot.answered {
  background: var(--accent-light);
  border-color: var(--accent-color);
}

.dot.answered.active {
  background: var(--dot-active-bg);
  border-color: var(--dot-active-bg);
}

.quiz-navigation {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
}

.nav-btn {
  padding: 12px 24px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-card);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  color: var(--text-primary);
}

.nav-btn:hover:not(:disabled) {
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-btn.primary {
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
}

.nav-btn.primary:hover:not(:disabled) {
  background: var(--accent-hover);
  border-color: var(--accent-hover);
  color: #fff;
}

.results-screen {
  max-width: 600px;
  margin: 40px auto;
  padding: 40px;
  background: var(--bg-secondary);
  border-radius: 12px;
  text-align: center;
  transition: background 0.3s ease;
}

.results-screen h2 {
  color: var(--accent-color);
  margin-bottom: 16px;
}

.results-screen p {
  font-size: 1.1rem;
  color: var(--text-secondary);
}

.score-summary {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 30px 0;
}

.score-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 30px;
  border-radius: 12px;
  min-width: 100px;
}

.score-stat.correct {
  background: var(--correct-bg);
  color: var(--correct-text);
}

.score-stat.incorrect {
  background: var(--incorrect-bg);
  color: var(--incorrect-text);
}

.score-stat.percentage {
  background: var(--accent-light);
  color: var(--accent-color);
}

.score-value {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 0.85rem;
  margin-top: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.restart-btn {
  padding: 14px 32px;
  background: var(--accent-color);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.restart-btn:hover {
  background: var(--accent-hover);
}

.missed-section {
  margin-top: 40px;
  text-align: left;
}

.missed-section h3 {
  color: var(--incorrect-text);
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.missed-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.missed-item {
  padding: 16px;
  background: var(--missed-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.missed-question {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.missed-answers {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
}

.your-answer {
  color: var(--incorrect-text);
}

.correct-answer {
  color: var(--correct-text);
  font-weight: 500;
}
</style>