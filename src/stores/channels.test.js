import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'
import { useChannelStore } from './channels'

describe('channels store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  it('getChannelsForRole фильтрует каналы по роли', () => {
    const store = useChannelStore()
    const student = store.getChannelsForRole('student').map((c) => c.id)
    const teacher = store.getChannelsForRole('teacher').map((c) => c.id)
    expect(student).toContain('progress')
    expect(student).not.toContain('student-management')
    expect(teacher).toContain('student-management')
    expect(teacher).not.toContain('progress')
  })

  it('setCurrentChannel игнорирует несуществующий id', () => {
    const store = useChannelStore()
    store.setCurrentChannel('overview')
    store.setCurrentChannel('no-such-channel')
    expect(store.currentChannelId).toBe('overview')
  })

  it('ensureAccessibleChannel уводит на overview при недоступном канале', () => {
    const store = useChannelStore()
    store.setCurrentChannel('student-management') // преподавательский
    store.ensureAccessibleChannel('student')
    expect(store.currentChannelId).toBe('overview')
  })

  it('addMessage сохраняет сообщение в текущем канале', () => {
    const store = useChannelStore()
    store.setCurrentChannel('general')
    const before = store.channelMessages.length
    store.addMessage({ username: 'Тест', content: 'Привет' })
    expect(store.channelMessages.length).toBe(before + 1)
    expect(store.channelMessages.at(-1).content).toBe('Привет')
  })

  it('toggleReaction добавляет и снимает реакцию', () => {
    const store = useChannelStore()
    store.setCurrentChannel('general')
    const id = store.channelMessages[0].id
    store.toggleReaction({ messageId: id, emoji: '🎉', userId: 42 })
    expect(store.channelMessages[0].reactions.find((r) => r.emoji === '🎉').users).toContain(42)
    store.toggleReaction({ messageId: id, emoji: '🎉', userId: 42 })
    expect(store.channelMessages[0].reactions.find((r) => r.emoji === '🎉')).toBeUndefined()
  })
})
