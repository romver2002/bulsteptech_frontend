import { mount } from '@vue/test-utils'
import { describe, it, expect, vi } from 'vitest'
import NotificationToast from './NotificationToast.vue'

describe('NotificationToast', () => {
  it('показывает текст и role=alert для ошибки', () => {
    const wrapper = mount(NotificationToast, {
      props: { message: 'Что-то пошло не так', type: 'error', autoClose: false },
    })
    expect(wrapper.text()).toContain('Что-то пошло не так')
    expect(wrapper.get('.notification-toast').attributes('role')).toBe('alert')
  })

  it('клик по «закрыть» эмитит событие close', async () => {
    vi.useFakeTimers()
    const wrapper = mount(NotificationToast, {
      props: { message: 'Привет', autoClose: false },
    })
    await wrapper.get('button[aria-label="Закрыть уведомление"]').trigger('click')
    vi.advanceTimersByTime(300)
    expect(wrapper.emitted('close')).toBeTruthy()
    vi.useRealTimers()
  })
})
