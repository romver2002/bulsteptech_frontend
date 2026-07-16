import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'
import { useUserStore } from './user'

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('роль берётся из выбора, а не из строки логина', () => {
    const store = useUserStore()
    store.login('teacher', 'student') // логин "teacher", но выбрана роль student
    expect(store.role).toBe('student')
    expect(store.isStudent).toBe(true)
    expect(store.isTeacher).toBe(false)
  })

  it('вход преподавателя', () => {
    const store = useUserStore()
    store.login('Роман', 'teacher')
    expect(store.isTeacher).toBe(true)
    expect(store.username).toBe('Роман')
    expect(store.id).toBe(1)
  })

  it('пустое имя пользователя отклоняется', () => {
    const store = useUserStore()
    expect(() => store.login('   ', 'student')).toThrow()
  })

  it('logout очищает состояние и localStorage', () => {
    const store = useUserStore()
    store.login('Аня', 'student')
    store.logout()
    expect(store.role).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('userRole')).toBeNull()
  })
})
