import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from './App.vue'
import LoginScreen from './components/LoginScreen.vue'

describe('App', () => {
  it('renders without errors', () => {
    const wrapper = mount(App)
    expect(wrapper.findComponent(LoginScreen).exists()).toBe(true)
  })
})