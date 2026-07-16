import { setActivePinia, createPinia } from 'pinia'
import { beforeEach, describe, it, expect } from 'vitest'
import { useStreamStore } from './stream'

describe('stream store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('mute участника не сбрасывает свой (преподавательский) микрофон', () => {
    const store = useStreamStore()
    const myMic = store.isMicrophoneOn
    const student = store.participants.find((p) => p.role === 'student')
    store.toggleParticipantMicrophone(student.id)
    expect(store.isMicrophoneOn).toBe(myMic) // свой флаг не тронут (регресс-тест)
    expect(student.audioOn).toBe(false)       // у студента выключился
  })

  it('свой микрофон переключается через toggleMicrophone', () => {
    const store = useStreamStore()
    const before = store.isMicrophoneOn
    store.toggleMicrophone()
    expect(store.isMicrophoneOn).toBe(!before)
  })
})
