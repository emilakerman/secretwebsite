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
      <div class="quiz-header">
        <span class="question-counter">Question {{ currentIndex + 1 }} of {{ totalQuestions }}</span>
        <div class="navigation-dots">
          <button
            v-for="(q, index) in quizQuestions"
            :key="q.id"
            :class="['dot', { active: index === currentIndex, answered: answers[index] !== undefined }]"
            @click="goToQuestion(index)"
            :aria-label="`Go to question ${index + 1}`"
          />
        </div>
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

.quiz-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.question-counter {
  font-size: 0.9rem;
  font-weight: 600;
  color: #555;
}

.navigation-dots {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  max-width: 300px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #ccc;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition: all 0.15s ease;
}

.dot:hover {
  border-color: #42b983;
}

.dot.active {
  background: #42b983;
  border-color: #42b983;
  transform: scale(1.2);
}

.dot.answered {
  background: #a5d6a7;
  border-color: #a5d6a7;
}

.dot.answered.active {
  background: #42b983;
  border-color: #42b983;
}

.quiz-navigation {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
}

.nav-btn {
  padding: 12px 24px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-btn:hover:not(:disabled) {
  border-color: #42b983;
  color: #42b983;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.nav-btn.primary {
  background: #42b983;
  border-color: #42b983;
  color: #fff;
}

.nav-btn.primary:hover:not(:disabled) {
  background: #3aa872;
  border-color: #3aa872;
  color: #fff;
}

.results-screen {
  max-width: 600px;
  margin: 40px auto;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 12px;
  text-align: center;
}

.results-screen h2 {
  color: #42b983;
  margin-bottom: 16px;
}

.results-screen p {
  font-size: 1.1rem;
  color: #555;
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
  background: #e8f5e9;
  color: #2e7d32;
}

.score-stat.incorrect {
  background: #ffebee;
  color: #c62828;
}

.score-stat.percentage {
  background: #e3f2fd;
  color: #1565c0;
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
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.restart-btn:hover {
  background: #3aa872;
}

.missed-section {
  margin-top: 40px;
  text-align: left;
}

.missed-section h3 {
  color: #c62828;
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
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.missed-question {
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
}

.missed-answers {
  display: flex;
  gap: 20px;
  font-size: 0.9rem;
}

.your-answer {
  color: #c62828;
}

.correct-answer {
  color: #2e7d32;
  font-weight: 500;
}
</style>