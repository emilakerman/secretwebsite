import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'
import QuizContainer from './components/QuizContainer.vue'

describe('App', () => {
  it('renders without errors', () => {
    const wrapper = mount(App)
    expect(wrapper.findComponent(QuizContainer).exists()).toBe(true)
  })
})