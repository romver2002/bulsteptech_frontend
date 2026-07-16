<template>
  <div class="stream-view">
    <section v-if="!streamActive" class="standby-card">
      <div class="standby-glow glow-one"></div>
      <div class="standby-glow glow-two"></div>
      <div class="standby-grid" aria-hidden="true"></div>

      <div class="standby-content">
        <div class="status-chip" :class="currentStream.status">
          <span></span>
          {{ standbyStatusLabel }}
        </div>
        <p class="standby-kicker">BulStep Live</p>
        <h2>{{ currentStream.title }}</h2>
        <p class="standby-description">
          {{ isTeacher ? currentStream.description : studentStandbyText }}
        </p>

        <div class="standby-meta">
          <div class="host-avatar">
            <span>{{ initials(currentStream.instructor.name) }}</span>
            <img
              v-if="currentStream.instructor.avatar"
              :src="currentStream.instructor.avatar"
              :alt="`Преподаватель: ${currentStream.instructor.name}`"
              @error="hideBrokenAvatar"
            />
          </div>
          <div>
            <span>Ведущий</span>
            <strong>{{ currentStream.instructor.name }}</strong>
          </div>
        </div>

        <button
          v-if="isTeacher"
          type="button"
          class="primary-live-button"
          @click="handleStartStream"
        >
          <span class="live-dot"></span>
          {{ currentStream.status === 'ended' ? 'Начать новый эфир' : 'Начать трансляцию' }}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M14 7l5 5-5 5" />
          </svg>
        </button>

        <button
          v-else-if="isLive"
          type="button"
          class="primary-live-button"
          @click="handleJoinStream"
        >
          Подключиться к эфиру
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5 12h14M14 7l5 5-5 5" />
          </svg>
        </button>

        <div v-else-if="currentStream.status !== 'ended'" class="waiting-pulse" aria-live="polite">
          <i></i><i></i><i></i>
          Ожидаем преподавателя
        </div>
      </div>

      <div class="standby-orb" aria-hidden="true">
        <div class="orb-ring ring-one"></div>
        <div class="orb-ring ring-two"></div>
        <div class="orb-core">
          <svg viewBox="0 0 24 24">
            <path d="m9 7 8 5-8 5V7Z" />
          </svg>
        </div>
        <div class="floating-card card-a"><span>LIVE</span><strong>{{ participants.length }}</strong> в аудитории</div>
        <div class="floating-card card-b"><i></i> HD-соединение</div>
      </div>
    </section>

    <div
      v-else
      class="broadcast-layout"
      :class="{
        'stage-only': !isChatOpen && !showParticipantsList,
        'chat-only': isChatOpen && !showParticipantsList,
        'participants-only': !isChatOpen && showParticipantsList,
        'dual-sidebars': isChatOpen && showParticipantsList
      }"
    >
      <main class="stage-column">
        <section class="main-stage" :class="{ sharing: isScreenSharing }">
          <div class="stage-aurora aurora-one" aria-hidden="true"></div>
          <div class="stage-aurora aurora-two" aria-hidden="true"></div>

          <header class="stage-topbar">
            <div class="live-badge"><span></span> Прямой эфир</div>
            <div class="stage-stats">
              <span>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
                {{ currentStream.viewerCount }}
              </span>
              <span class="duration">{{ formatDuration(streamDuration) }}</span>
              <span class="quality">HD</span>
            </div>
          </header>

          <div v-if="isScreenSharing" class="screen-share-scene">
            <div class="share-window">
              <div class="window-bar">
                <i></i><i></i><i></i>
                <span>composition-api.vue</span>
              </div>
              <div class="code-canvas" aria-label="Демонстрация экрана">
                <span class="line line-1"></span>
                <span class="line line-2"></span>
                <span class="line line-3"></span>
                <span class="line line-4"></span>
                <span class="line line-5"></span>
                <span class="line line-6"></span>
                <div class="code-card">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="13" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  <strong>Демонстрация экрана</strong>
                  <span>Видят все участники</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="speaker-scene">
            <div class="signal-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
            <div class="speaker-avatar" :class="{ speaking: featuredParticipant?.speaking }">
              <span>{{ initials(featuredParticipant?.name) }}</span>
              <img
                v-if="featuredParticipant?.videoOn && featuredParticipant?.avatar"
                :src="featuredParticipant.avatar"
                :alt="featuredParticipant.name"
                @error="hideBrokenAvatar"
              />
              <svg v-else class="camera-off" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 8.5 21 6v12l-5-2.5M4 4l16 16M15 15.5V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2.5" />
              </svg>
            </div>
            <div class="speaker-nameplate">
              <div>
                <span>{{ featuredParticipant?.role === 'teacher' ? 'Ведущий' : 'Участник' }}</span>
                <strong>{{ featuredParticipant?.name || currentStream.instructor.name }}</strong>
              </div>
              <div v-if="featuredParticipant?.speaking" class="voice-bars" aria-label="Говорит сейчас">
                <i></i><i></i><i></i><i></i>
              </div>
              <svg v-else-if="!featuredParticipant?.audioOn" class="muted-icon" viewBox="0 0 24 24" aria-label="Микрофон выключен">
                <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 5 2.2M15 9V6a3 3 0 0 0-4.2-2.75M5 10v1a7 7 0 0 0 11.8 5.1M19 10v1a7 7 0 0 1-.4 2.3M12 18v3M8 21h8M3 3l18 18" />
              </svg>
            </div>
            <div v-if="pinnedParticipantId" class="pinned-label">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m14 4 6 6-3 1-4 4-1 5-2-2-4 4-1-1 4-4-2-2 5-1 4-4 1-3Z" />
              </svg>
              Закреплено
            </div>
          </div>

          <footer class="stage-caption">
            <div>
              <p>Сейчас в эфире</p>
              <h1>{{ currentStream.title }}</h1>
            </div>
            <span class="secure-stream">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="10" width="14" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
              Защищённый эфир
            </span>
          </footer>
        </section>

        <section class="control-dock" aria-label="Управление трансляцией">
          <div class="control-cluster media-controls">
            <button
              type="button"
              class="dock-button"
              :class="{ off: !isMicrophoneOn }"
              :aria-pressed="isMicrophoneOn"
              :title="isMicrophoneOn ? 'Выключить микрофон' : 'Включить микрофон'"
              @click="toggleMicrophone"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 10v1a7 7 0 0 0 14 0v-1M12 18v3M8 21h8" />
                <path v-if="!isMicrophoneOn" d="M3 3l18 18" />
              </svg>
              <span>{{ isMicrophoneOn ? 'Микрофон' : 'Без звука' }}</span>
            </button>

            <button
              type="button"
              class="dock-button"
              :class="{ off: !isCameraOn }"
              :aria-pressed="isCameraOn"
              :title="isCameraOn ? 'Выключить камеру' : 'Включить камеру'"
              @click="toggleCamera"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="6" width="13" height="12" rx="2" />
                <path d="m16 10 5-3v10l-5-3M3 3l18 18" :class="{ hidden: isCameraOn }" />
              </svg>
              <span>{{ isCameraOn ? 'Камера' : 'Без видео' }}</span>
            </button>

            <button
              v-if="isTeacher"
              type="button"
              class="dock-button"
              :class="{ active: isScreenSharing }"
              :aria-pressed="isScreenSharing"
              :title="isScreenSharing ? 'Завершить демонстрацию' : 'Показать экран'"
              @click="toggleScreenSharing"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="4" width="18" height="13" rx="2" />
                <path d="M8 21h8M12 17v4M9 10l3-3 3 3M12 7v7" />
              </svg>
              <span>{{ isScreenSharing ? 'Экран открыт' : 'Показать экран' }}</span>
            </button>

            <button
              v-if="isStudent"
              type="button"
              class="dock-button"
              :class="{ warning: isHandRaised }"
              :aria-pressed="isHandRaised"
              :title="isHandRaised ? 'Опустить руку' : 'Поднять руку'"
              @click="toggleHandRaise"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 11V6a1.5 1.5 0 0 1 3 0v4-6a1.5 1.5 0 0 1 3 0v6-5a1.5 1.5 0 0 1 3 0v6-3a1.5 1.5 0 0 1 3 0v5c0 5-3 8-8 8h-1c-3 0-5-2-6-4l-2-4a1.7 1.7 0 0 1 3-1l2 3" />
              </svg>
              <span>{{ isHandRaised ? 'Рука поднята' : 'Поднять руку' }}</span>
            </button>
          </div>

          <div class="control-cluster view-controls">
            <div ref="reactionMenuRef" class="reaction-control">
              <button
                type="button"
                class="dock-button compact"
                :class="{ active: showReactions }"
                :aria-expanded="showReactions"
                title="Отправить реакцию"
                @click.stop="toggleReactions"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M8.5 14.5s1.2 2 3.5 2 3.5-2 3.5-2M9 9h.01M15 9h.01" />
                </svg>
                <span>Реакция</span>
              </button>
              <Transition name="popover">
                <div v-if="showReactions" class="reaction-popover" role="menu">
                  <button
                    v-for="reaction in availableReactions"
                    :key="reaction.name"
                    type="button"
                    role="menuitem"
                    :aria-label="`Отправить реакцию ${reaction.label}`"
                    :title="reaction.label"
                    @click.stop="sendReaction(reaction.emoji)"
                  >
                    {{ reaction.emoji }}
                  </button>
                </div>
              </Transition>
            </div>

            <button
              type="button"
              class="dock-button compact"
              :class="{ active: isChatOpen }"
              :aria-pressed="isChatOpen"
              :title="isChatOpen ? 'Закрыть чат' : 'Открыть чат'"
              @click="toggleChat"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-3a3 3 0 0 1-2-3V7a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v8Z" />
              </svg>
              <span>Чат</span>
            </button>

            <button
              type="button"
              class="dock-button compact"
              :class="{ active: showParticipantsList }"
              :aria-pressed="showParticipantsList"
              :title="showParticipantsList ? 'Закрыть список участников' : 'Открыть список участников'"
              @click="toggleParticipantsList"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-6A3.5 3.5 0 0 0 2 18.5V20M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM16 11a3 3 0 1 0 0-6M18 15a4 4 0 0 1 4 4v1" />
              </svg>
              <span>{{ participants.length }}</span>
            </button>

            <button
              v-if="isTeacher"
              type="button"
              class="end-button"
              @click="endStream"
            >
              <span></span>
              Завершить
            </button>
            <button v-else type="button" class="end-button" @click="leaveStream">
              Покинуть
            </button>
          </div>
        </section>
      </main>

      <aside v-if="isChatOpen" ref="chatPanelRef" class="chat-panel" aria-label="Чат трансляции">
        <header class="chat-header">
          <div>
            <p>Обсуждение</p>
            <h2>Чат эфира</h2>
          </div>
          <div class="chat-header-actions">
            <span class="online-count"><i></i>{{ participants.length }} онлайн</span>
            <button type="button" aria-label="Закрыть чат" title="Закрыть чат" @click="toggleChat">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
            </button>
          </div>
        </header>

        <div ref="messagesViewport" class="chat-messages" aria-live="polite">
          <div class="chat-day"><span>Сегодня</span></div>

          <article
            v-for="message in visibleMessages"
            :key="message.id"
            :data-message-id="message.id"
            class="chat-message"
            :class="{ system: message.role === 'system', own: isOwnMessage(message) }"
          >
            <template v-if="message.role === 'system'">
              <span class="system-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7l-8-4Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </span>
              <p>{{ message.content }}</p>
            </template>

            <template v-else>
              <div class="message-avatar">
                <span>{{ initials(message.username) }}</span>
                <img
                  v-if="message.avatar"
                  :src="message.avatar"
                  :alt="message.username"
                  @error="hideBrokenAvatar"
                />
              </div>

              <div class="message-body">
                <header>
                  <strong>{{ message.username }}</strong>
                  <span v-if="message.role === 'teacher'" class="teacher-mark">Ведущий</span>
                  <time :datetime="toIsoDate(message.timestamp)">{{ formatMessageTime(message.timestamp) }}</time>
                </header>

                <button
                  v-if="message.replyTo"
                  type="button"
                  class="quoted-message"
                  title="Показать исходное сообщение"
                  @click="scrollToMessage(message.replyTo.id)"
                >
                  <strong>{{ message.replyTo.username }}</strong>
                  <span>{{ message.replyTo.content || 'Вложение' }}</span>
                </button>

                <p v-if="message.content" class="message-text">{{ message.content }}</p>

                <div v-if="message.attachments?.length" class="message-attachments">
                  <a
                    v-for="attachment in message.attachments"
                    :key="`${message.id}-${attachment.name}`"
                    :href="attachment.url || undefined"
                    :download="attachment.name"
                    :class="{ disabled: !attachment.url }"
                    :aria-disabled="!attachment.url"
                    @click="guardAttachmentClick($event, attachment)"
                  >
                    <img
                      v-if="isImageAttachment(attachment) && attachment.url"
                      :src="attachment.url"
                      :alt="attachment.name"
                    />
                    <span v-else class="file-icon">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
                        <path d="M14 3v5h5" />
                      </svg>
                    </span>
                    <span><strong>{{ attachment.name }}</strong><small>{{ formatFileSize(attachment.size) }}</small></span>
                  </a>
                </div>

                <div v-if="groupedReactions(message).length" class="message-reactions">
                  <button
                    v-for="reaction in groupedReactions(message)"
                    :key="reaction.emoji"
                    type="button"
                    :class="{ selected: reaction.selected }"
                    :aria-pressed="reaction.selected"
                    :title="`Реакция ${reaction.emoji}`"
                    @click="toggleMessageReaction(message.id, reaction.emoji)"
                  >
                    {{ reaction.emoji }} <span>{{ reaction.count }}</span>
                  </button>
                </div>

                <div class="message-actions">
                  <button type="button" @click="startReply(message)">
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 8-5 4 5 4v-3h5a5 5 0 0 1 5 5v1-2a7 7 0 0 0-7-7H9V8Z" /></svg>
                    Ответить
                  </button>
                  <div class="reaction-tools">
                    <button
                      type="button"
                      :aria-expanded="activeReactionMessageId === message.id"
                      aria-label="Добавить реакцию"
                      title="Добавить реакцию"
                      @click.stop="toggleMessageReactionPicker(message.id)"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M8 13.5s1 1.5 3 1.5 3-1.5 3-1.5M8.5 9h.01M13.5 9h.01M19 5v6M16 8h6" />
                      </svg>
                    </button>
                    <Transition name="mini-popover">
                      <div v-if="activeReactionMessageId === message.id" class="message-reaction-menu">
                        <button
                          v-for="reaction in availableReactions"
                          :key="reaction.name"
                          type="button"
                          :title="reaction.label"
                          @click.stop="toggleMessageReaction(message.id, reaction.emoji, true)"
                        >{{ reaction.emoji }}</button>
                      </div>
                    </Transition>
                  </div>
                </div>
              </div>
            </template>
          </article>

          <div ref="messagesEnd" class="messages-end" aria-hidden="true"></div>
        </div>

        <footer class="chat-composer">
          <div v-if="replyTo" class="reply-preview">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 8-5 4 5 4v-3h5a5 5 0 0 1 5 5v1-2a7 7 0 0 0-7-7H9V8Z" /></svg>
            <div><span>Ответ для {{ replyTo.username }}</span><p>{{ replyTo.content || 'Вложение' }}</p></div>
            <button type="button" aria-label="Отменить ответ" title="Отменить ответ" @click="replyTo = null">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" /></svg>
            </button>
          </div>

          <div v-if="pendingAttachments.length" class="pending-files">
            <div v-for="(attachment, index) in pendingAttachments" :key="attachment.url">
              <span class="pending-file-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 12.5 13.5 7a3 3 0 0 1 4.2 4.2l-7 7a5 5 0 0 1-7.1-7.1L11 3.7" /></svg>
              </span>
              <span><strong>{{ attachment.name }}</strong><small>{{ formatFileSize(attachment.size) }}</small></span>
              <button type="button" :aria-label="`Удалить ${attachment.name}`" title="Удалить файл" @click="removePendingAttachment(index)">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7 7 17" /></svg>
              </button>
            </div>
          </div>

          <form class="composer-row" @submit.prevent="sendChatMessage">
            <input
              ref="fileInput"
              class="sr-only"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.txt,.zip"
              @change="handleFileSelection"
            />
            <button
              type="button"
              class="composer-button attach"
              aria-label="Прикрепить файл"
              title="Прикрепить файл"
              @click="openFilePicker"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 12.5 13.5 7a3 3 0 0 1 4.2 4.2l-7 7a5 5 0 0 1-7.1-7.1L11 3.7" /></svg>
            </button>
            <label class="sr-only" for="stream-message-input">Сообщение в чат</label>
            <textarea
              id="stream-message-input"
              ref="messageInputElement"
              v-model="messageInput"
              rows="1"
              maxlength="1000"
              placeholder="Написать в чат…"
              @keydown.enter.exact.prevent="sendChatMessage"
            ></textarea>
            <button
              type="submit"
              class="composer-button send"
              :disabled="!canSendMessage"
              aria-label="Отправить сообщение"
              title="Отправить"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14" /></svg>
            </button>
          </form>
          <p class="composer-hint"><kbd>Enter</kbd> отправить · <kbd>Shift + Enter</kbd> новая строка</p>
        </footer>
      </aside>

      <ParticipantsList
        v-if="showParticipantsList"
        class="participants-drawer"
        :participants="participants"
        :pinned-participant-id="pinnedParticipantId"
        @toggle-participants="toggleParticipantsList"
        @toggle-microphone="handleToggleParticipantMicrophone"
        @pin-participant="handlePinParticipant"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useUserStore } from '../../stores/user';
import { useStreamStore } from '../../stores/stream';
import { useNotificationStore } from '../../stores/notification';
import ParticipantsList from './ParticipantsList.vue';

const userStore = useUserStore();
const streamStore = useStreamStore();
const notificationStore = useNotificationStore();

const showReactions = ref(false);
const showParticipantsList = ref(false);
const isChatOpen = ref(true);
const streamDuration = ref(0);
const activeReactionMessageId = ref(null);
const reactionMenuRef = ref(null);
const chatPanelRef = ref(null);
const messagesViewport = ref(null);
const messagesEnd = ref(null);
const messageInputElement = ref(null);
const fileInput = ref(null);
const messageInput = ref('');
const replyTo = ref(null);
const pendingAttachments = ref([]);

let durationTimer = null;
let speakerTimer = null;

const streamActive = computed(() => streamStore.streamActive);
const isLive = computed(() => streamStore.isLive);
const isScreenSharing = computed(() => streamStore.isScreenSharing);
const participants = computed(() => streamStore.participants);
const messages = computed(() => streamStore.messages);
const visibleMessages = computed(() => messages.value.slice(-200));
const currentStream = computed(() => streamStore.currentStream);
const pinnedParticipantId = computed(() => streamStore.pinnedParticipantId);
const isTeacher = computed(() => userStore.role === 'teacher');
const isStudent = computed(() => userStore.role === 'student');

const currentParticipant = computed(() => {
  const userId = Number(userStore.id);
  return participants.value.find(participant => participant.id === userId)
    || participants.value.find(participant => participant.role === userStore.role)
    || null;
});
const featuredParticipant = computed(() => participants.value.find(
  participant => participant.id === pinnedParticipantId.value
) || participants.value.find(participant => participant.role === 'teacher') || currentParticipant.value);
const isMicrophoneOn = computed(() => currentParticipant.value?.audioOn ?? streamStore.isMicrophoneOn);
const isCameraOn = computed(() => currentParticipant.value?.videoOn ?? streamStore.isCameraOn);
const isHandRaised = computed(() => currentParticipant.value?.handRaised ?? streamStore.isHandRaised);
const canSendMessage = computed(() => Boolean(messageInput.value.trim() || pendingAttachments.value.length));

const standbyStatusLabel = computed(() => {
  if (currentStream.value.status === 'ended') return 'Эфир завершён';
  if (isLive.value) return 'Эфир уже идёт';
  return isTeacher.value ? 'Студия готова' : 'Скоро в эфире';
});
const studentStandbyText = computed(() => {
  if (currentStream.value.status === 'ended') return 'Трансляция завершена. Запись появится в материалах после обработки.';
  if (isLive.value) return 'Трансляция уже началась — подключайтесь к аудитории.';
  return 'Преподаватель готовит эфир. Страница подключится, как только трансляция начнётся.';
});

const availableReactions = [
  { emoji: '👍', name: 'thumbs-up', label: 'Нравится' },
  { emoji: '👏', name: 'applause', label: 'Аплодисменты' },
  { emoji: '🔥', name: 'fire', label: 'Огонь' },
  { emoji: '💡', name: 'idea', label: 'Полезная идея' },
  { emoji: '❤️', name: 'heart', label: 'Сердце' },
  { emoji: '😂', name: 'laugh', label: 'Смешно' }
];

const initials = (name = '') => String(name || '')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map(part => part[0])
  .join('')
  .toUpperCase() || 'У';

const hideBrokenAvatar = (event) => {
  event.currentTarget.hidden = true;
};

const handleStartStream = () => {
  if (!isTeacher.value) return;
  if (streamStore.startStream()) {
    startDurationTimer();
    startSpeakerSimulation();
    streamStore.addSystemMessage(`${userStore.username || 'Преподаватель'} начал трансляцию`);
  }
};

const handleJoinStream = () => {
  if (streamStore.joinStream(currentParticipant.value?.id || userStore.id)) {
    startDurationTimer();
    startSpeakerSimulation();
  }
};

const endStream = () => {
  if (!isTeacher.value) return;
  if (!window.confirm('Завершить трансляцию для всех участников?')) return;

  streamStore.addSystemMessage(`${userStore.username || 'Преподаватель'} завершил трансляцию`);
  streamStore.stopStream();
  stopDurationTimer();
  stopSpeakerSimulation();
};

const leaveStream = () => {
  if (!window.confirm('Покинуть трансляцию? Вы сможете подключиться снова, пока эфир идёт.')) return;
  streamStore.leaveStream(currentParticipant.value?.id || userStore.id);
  stopDurationTimer();
  stopSpeakerSimulation();
};

const toggleMicrophone = () => {
  if (currentParticipant.value) streamStore.toggleMicrophone(currentParticipant.value.id);
};
const toggleCamera = () => {
  if (currentParticipant.value) streamStore.toggleCamera(currentParticipant.value.id);
};
const toggleScreenSharing = () => {
  if (isTeacher.value) streamStore.toggleScreenSharing();
};
const toggleHandRaise = () => {
  if (isStudent.value && currentParticipant.value) streamStore.toggleHandRaise(currentParticipant.value.id);
};

const toggleReactions = () => {
  showReactions.value = !showReactions.value;
};
const sendReaction = (emoji) => {
  streamStore.addSystemMessage(`${userStore.username || 'Участник'} отправил реакцию ${emoji}`);
  showReactions.value = false;
};
const toggleParticipantsList = () => {
  showParticipantsList.value = !showParticipantsList.value;
};
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value;
  if (isChatOpen.value) nextTick(scrollChatToBottom);
};
const handleToggleParticipantMicrophone = (participantId) => {
  if (!isTeacher.value) return;
  streamStore.toggleParticipantMicrophone(participantId);
};
const handlePinParticipant = participantId => streamStore.pinParticipant(participantId);

const syncDuration = () => {
  const startedAt = currentStream.value.actualStartTime;
  if (!startedAt) {
    streamDuration.value = 0;
    return;
  }
  streamDuration.value = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
};
const stopDurationTimer = () => {
  if (durationTimer !== null) {
    clearInterval(durationTimer);
    durationTimer = null;
  }
};
const startDurationTimer = () => {
  stopDurationTimer();
  syncDuration();
  durationTimer = setInterval(syncDuration, 1000);
};
const formatDuration = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  return [hours, minutes, secs].map(value => String(value).padStart(2, '0')).join(':');
};

const stopSpeakerSimulation = () => {
  if (speakerTimer !== null) {
    clearInterval(speakerTimer);
    speakerTimer = null;
  }
  streamStore.setSpeakingParticipant(null);
};
const startSpeakerSimulation = () => {
  stopSpeakerSimulation();
  speakerTimer = setInterval(() => {
    if (!streamStore.isLive) return;
    const audibleParticipants = participants.value.filter(participant => participant.audioOn && participant.status !== 'away');
    if (!audibleParticipants.length) {
      streamStore.setSpeakingParticipant(null);
      return;
    }
    const speaker = audibleParticipants[Math.floor(Math.random() * audibleParticipants.length)];
    streamStore.setSpeakingParticipant(speaker.id);
  }, 5000);
};

const groupedReactions = (message) => {
  const groups = new Map();
  (message.reactions || []).forEach((reaction) => {
    const group = groups.get(reaction.emoji) || { emoji: reaction.emoji, count: 0, selected: false };
    group.count += 1;
    if (reaction.userId === Number(userStore.id)) group.selected = true;
    groups.set(reaction.emoji, group);
  });
  return [...groups.values()];
};
const isOwnMessage = message => message.userId === Number(userStore.id);
const toggleMessageReaction = (messageId, emoji, closePicker = false) => {
  streamStore.toggleMessageReaction({ messageId, emoji, userId: userStore.id });
  if (closePicker) activeReactionMessageId.value = null;
};
const toggleMessageReactionPicker = (messageId) => {
  activeReactionMessageId.value = activeReactionMessageId.value === messageId ? null : messageId;
};
const startReply = (message) => {
  replyTo.value = {
    id: message.id,
    username: message.username,
    content: message.content
  };
  nextTick(() => messageInputElement.value?.focus());
};

const sendChatMessage = () => {
  if (!canSendMessage.value) return;

  const attachments = pendingAttachments.value;
  const sentMessage = streamStore.addMessage({
    userId: currentParticipant.value?.id || userStore.id,
    username: userStore.username || currentParticipant.value?.name || 'Участник',
    avatar: currentParticipant.value?.avatar || '',
    role: isTeacher.value ? 'teacher' : 'student',
    content: messageInput.value,
    attachments,
    replyTo: replyTo.value ? { ...replyTo.value } : null
  });

  if (!sentMessage) return;
  messageInput.value = '';
  pendingAttachments.value = [];
  replyTo.value = null;
  nextTick(scrollChatToBottom);
};

const openFilePicker = () => fileInput.value?.click();
const handleFileSelection = (event) => {
  const files = Array.from(event.target.files || []);
  const remainingSlots = Math.max(0, 5 - pendingAttachments.value.length);

  if (files.length > remainingSlots) {
    notificationStore.warning('К одному сообщению можно прикрепить не больше 5 файлов');
  }

  files.slice(0, remainingSlots).forEach((file) => {
    if (file.size > 20 * 1024 * 1024) {
      notificationStore.error(`Файл «${file.name}» больше 20 МБ`);
      return;
    }
    pendingAttachments.value.push({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      url: URL.createObjectURL(file),
      isObjectUrl: true
    });
  });

  event.target.value = '';
};
const revokeAttachmentUrl = (attachment) => {
  if (attachment?.isObjectUrl && attachment.url) URL.revokeObjectURL(attachment.url);
};
const removePendingAttachment = (index) => {
  const [removed] = pendingAttachments.value.splice(index, 1);
  revokeAttachmentUrl(removed);
};
const isImageAttachment = attachment => String(attachment.type || '').startsWith('image/');
const formatFileSize = (bytes) => {
  const size = Number(bytes) || 0;
  if (size < 1024) return `${size} Б`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} КБ`;
  return `${(size / (1024 * 1024)).toFixed(1)} МБ`;
};
const guardAttachmentClick = (event, attachment) => {
  if (!attachment.url) event.preventDefault();
};

const formatMessageTime = (date) => new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date(date));
const toIsoDate = date => new Date(date).toISOString();
const scrollChatToBottom = () => {
  messagesEnd.value?.scrollIntoView({ block: 'end', behavior: 'smooth' });
};
const scrollToMessage = (messageId) => {
  const target = messagesViewport.value?.querySelector(`[data-message-id="${messageId}"]`);
  if (target) {
    target.scrollIntoView({ block: 'center', behavior: 'smooth' });
    return;
  }
  notificationStore.info('Исходное сообщение уже вне видимой истории');
};

const handleDocumentClick = (event) => {
  if (showReactions.value && !reactionMenuRef.value?.contains(event.target)) {
    showReactions.value = false;
  }
  if (activeReactionMessageId.value && !event.target.closest('.reaction-tools')) {
    activeReactionMessageId.value = null;
  }
};

watch(
  () => messages.value.length,
  () => nextTick(scrollChatToBottom)
);

onMounted(() => {
  document.addEventListener('click', handleDocumentClick);
  if (streamActive.value) {
    streamStore.resumeViewerCountTimer();
    startDurationTimer();
    startSpeakerSimulation();
  }
  nextTick(scrollChatToBottom);
});

onUnmounted(() => {
  stopDurationTimer();
  stopSpeakerSimulation();
  streamStore.stopViewerCountTimer();
  document.removeEventListener('click', handleDocumentClick);
  pendingAttachments.value.forEach(revokeAttachmentUrl);
  pendingAttachments.value = [];
});
</script>

<style scoped>
.stream-view {
  --stream-bg: #070b16;
  --stream-panel: rgba(15, 23, 42, 0.9);
  --stream-line: rgba(148, 163, 184, 0.14);
  --stream-muted: #8b9ab3;
  --stream-violet: #8b5cf6;
  --stream-cyan: #22d3ee;
  width: 100%;
  min-height: 520px;
  color: #f8fafc;
}

button,
textarea,
input {
  font: inherit;
}

button {
  -webkit-tap-highlight-color: transparent;
}

button:focus-visible,
textarea:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid #a78bfa;
  outline-offset: 2px;
}

.standby-card {
  position: relative;
  display: grid;
  min-height: min(680px, calc(100vh - 150px));
  grid-template-columns: minmax(0, 1.05fr) minmax(360px, 0.95fr);
  align-items: center;
  overflow: hidden;
  border: 1px solid rgba(139, 92, 246, 0.16);
  border-radius: 28px;
  background:
    linear-gradient(135deg, rgba(7, 11, 22, 0.98), rgba(15, 23, 42, 0.96)),
    #070b16;
  box-shadow: 0 32px 90px rgba(2, 6, 23, 0.38);
  isolation: isolate;
}

.standby-grid {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.18;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.16) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.16) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(to right, black, transparent 82%);
}

.standby-glow,
.stage-aurora {
  position: absolute;
  z-index: -1;
  border-radius: 999px;
  filter: blur(18px);
  pointer-events: none;
}

.glow-one {
  top: -180px;
  left: -120px;
  width: 480px;
  height: 480px;
  background: rgba(124, 58, 237, 0.22);
}

.glow-two {
  right: 10%;
  bottom: -220px;
  width: 520px;
  height: 520px;
  background: rgba(14, 165, 233, 0.13);
}

.standby-content {
  position: relative;
  z-index: 2;
  max-width: 720px;
  padding: clamp(42px, 6vw, 88px);
}

.status-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 30px;
  padding: 7px 11px;
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 999px;
  color: #a7f3d0;
  background: rgba(16, 185, 129, 0.08);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status-chip span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 0 5px rgba(52, 211, 153, 0.1);
}

.status-chip.live {
  border-color: rgba(244, 63, 94, 0.25);
  color: #fecdd3;
  background: rgba(244, 63, 94, 0.1);
}

.status-chip.live span {
  background: #fb7185;
  box-shadow: 0 0 0 5px rgba(244, 63, 94, 0.12);
  animation: status-pulse 1.8s ease-in-out infinite;
}

.status-chip.ended {
  border-color: rgba(148, 163, 184, 0.18);
  color: #cbd5e1;
  background: rgba(148, 163, 184, 0.08);
}

.status-chip.ended span {
  background: #94a3b8;
  box-shadow: none;
}

.standby-kicker {
  margin: 0 0 10px;
  color: #a78bfa;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.standby-content h2 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(34px, 4.4vw, 66px);
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 1.02;
  text-wrap: balance;
}

.standby-description {
  max-width: 640px;
  margin: 24px 0;
  color: #94a3b8;
  font-size: clamp(15px, 1.3vw, 18px);
  line-height: 1.7;
}

.standby-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 30px 0;
}

.host-avatar,
.message-avatar {
  position: relative;
  display: grid;
  place-items: center;
  overflow: hidden;
  color: #ede9fe;
  background: linear-gradient(135deg, #6d28d9, #2563eb);
  font-weight: 800;
}

.host-avatar {
  width: 46px;
  height: 46px;
  border: 2px solid rgba(167, 139, 250, 0.4);
  border-radius: 15px;
}

.host-avatar img,
.message-avatar img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.standby-meta div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.standby-meta span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.standby-meta strong {
  color: #e2e8f0;
  font-size: 14px;
}

.primary-live-button {
  display: inline-flex;
  min-height: 54px;
  align-items: center;
  justify-content: center;
  gap: 11px;
  padding: 0 22px;
  border: 0;
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(135deg, #7c3aed, #4f46e5);
  box-shadow: 0 16px 38px rgba(79, 70, 229, 0.3);
  cursor: pointer;
  font-weight: 800;
  transition: transform 180ms ease, box-shadow 180ms ease, filter 180ms ease;
}

.primary-live-button:hover {
  filter: brightness(1.08);
  transform: translateY(-2px);
  box-shadow: 0 20px 44px rgba(79, 70, 229, 0.38);
}

.primary-live-button:active {
  transform: translateY(0) scale(0.98);
}

.primary-live-button svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 180ms ease;
}

.primary-live-button:hover svg {
  transform: translateX(3px);
}

.live-dot {
  width: 9px;
  height: 9px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.12);
}

.waiting-pulse {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
  font-size: 13px;
}

.waiting-pulse i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #8b5cf6;
  animation: waiting-dot 1.2s ease-in-out infinite;
}

.waiting-pulse i:nth-child(2) { animation-delay: 120ms; }
.waiting-pulse i:nth-child(3) { animation-delay: 240ms; margin-right: 5px; }

.standby-orb {
  position: relative;
  z-index: 1;
  width: min(34vw, 470px);
  aspect-ratio: 1;
  justify-self: center;
}

.orb-ring {
  position: absolute;
  border: 1px solid rgba(167, 139, 250, 0.26);
  border-radius: 50%;
}

.ring-one {
  inset: 8%;
  animation: orbit-spin 20s linear infinite;
}

.ring-one::before,
.ring-two::after {
  position: absolute;
  width: 13px;
  height: 13px;
  border: 3px solid #0f172a;
  border-radius: 50%;
  background: #8b5cf6;
  content: '';
}

.ring-one::before { top: 8%; left: 22%; }

.ring-two {
  inset: 20%;
  border-style: dashed;
  border-color: rgba(34, 211, 238, 0.2);
  animation: orbit-spin 15s linear infinite reverse;
}

.ring-two::after { right: -7px; bottom: 30%; background: #22d3ee; }

.orb-core {
  position: absolute;
  inset: 31%;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 38%;
  background:
    radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.2), transparent 28%),
    linear-gradient(145deg, #7c3aed, #2563eb 58%, #0891b2);
  box-shadow:
    0 30px 80px rgba(79, 70, 229, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  transform: rotate(-8deg);
}

.orb-core::before {
  position: absolute;
  inset: -18px;
  border: 1px solid rgba(139, 92, 246, 0.16);
  border-radius: 42%;
  content: '';
}

.orb-core svg {
  width: 42%;
  fill: rgba(255, 255, 255, 0.96);
  filter: drop-shadow(0 8px 14px rgba(15, 23, 42, 0.28));
  transform: rotate(8deg);
}

.floating-card {
  position: absolute;
  padding: 12px 15px;
  border: 1px solid rgba(148, 163, 184, 0.17);
  border-radius: 14px;
  color: #94a3b8;
  background: rgba(15, 23, 42, 0.75);
  box-shadow: 0 18px 44px rgba(2, 6, 23, 0.3);
  backdrop-filter: blur(14px);
  font-size: 11px;
  animation: card-float 5s ease-in-out infinite;
}

.floating-card strong { display: block; margin-top: 3px; color: #fff; font-size: 20px; }
.floating-card span { color: #fb7185; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; }
.floating-card i { display: inline-block; width: 7px; height: 7px; margin-right: 6px; border-radius: 50%; background: #34d399; box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.1); }
.card-a { top: 12%; right: 3%; }
.card-b { bottom: 16%; left: -2%; animation-delay: -2.4s; }

.broadcast-layout {
  position: relative;
  display: grid;
  height: calc(100vh - 140px);
  min-height: 620px;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 350px);
  gap: 14px;
  overflow: hidden;
}

.broadcast-layout.stage-only { grid-template-columns: minmax(0, 1fr); }
.broadcast-layout.dual-sidebars { grid-template-columns: minmax(520px, 1fr) minmax(290px, 330px) minmax(290px, 330px); }

.stage-column {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  gap: 12px;
}

.main-stage {
  position: relative;
  min-height: 0;
  flex: 1;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 24px;
  background:
    radial-gradient(circle at 50% 45%, rgba(76, 29, 149, 0.34), transparent 36%),
    linear-gradient(145deg, #090d18, #111827 62%, #0b1220);
  box-shadow: 0 28px 70px rgba(2, 6, 23, 0.32);
  isolation: isolate;
}

.main-stage::before {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.12;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px);
  background-size: 52px 52px;
  content: '';
  mask-image: radial-gradient(circle at center, black, transparent 77%);
}

.aurora-one {
  top: -24%;
  left: 17%;
  width: 48%;
  height: 45%;
  background: rgba(124, 58, 237, 0.24);
}

.aurora-two {
  right: 5%;
  bottom: -25%;
  width: 46%;
  height: 48%;
  background: rgba(8, 145, 178, 0.17);
}

.stage-topbar,
.stage-caption {
  position: absolute;
  right: 0;
  left: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stage-topbar {
  top: 0;
  padding: 18px 20px;
  background: linear-gradient(to bottom, rgba(2, 6, 23, 0.72), transparent);
}

.live-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid rgba(251, 113, 133, 0.22);
  border-radius: 9px;
  color: #fecdd3;
  background: rgba(159, 18, 57, 0.24);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
}

.live-badge span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #fb7185;
  box-shadow: 0 0 0 4px rgba(251, 113, 133, 0.12);
  animation: status-pulse 1.8s ease-in-out infinite;
}

.stage-stats {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stage-stats > span {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  gap: 6px;
  padding: 0 9px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 9px;
  color: #cbd5e1;
  background: rgba(2, 6, 23, 0.42);
  backdrop-filter: blur(10px);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.stage-stats svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
}

.stage-stats .quality {
  color: #67e8f9;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.speaker-scene,
.screen-share-scene {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 78px 28px 92px;
}

.speaker-avatar {
  position: relative;
  display: grid;
  width: clamp(150px, 19vw, 260px);
  aspect-ratio: 1;
  place-items: center;
  overflow: hidden;
  border: 2px solid rgba(167, 139, 250, 0.4);
  border-radius: 38%;
  color: #ede9fe;
  background:
    radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.16), transparent 30%),
    linear-gradient(145deg, #5b21b6, #1d4ed8 60%, #0e7490);
  box-shadow:
    0 34px 90px rgba(49, 46, 129, 0.42),
    0 0 0 16px rgba(124, 58, 237, 0.05);
  font-size: clamp(40px, 6vw, 82px);
  font-weight: 900;
  letter-spacing: -0.08em;
  transform: rotate(-2deg);
  transition: border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
}

.speaker-avatar::after {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(140deg, rgba(255, 255, 255, 0.12), transparent 42%);
  content: '';
  pointer-events: none;
}

.speaker-avatar.speaking {
  border-color: #34d399;
  box-shadow:
    0 34px 90px rgba(5, 150, 105, 0.26),
    0 0 0 10px rgba(52, 211, 153, 0.07),
    0 0 0 20px rgba(52, 211, 153, 0.035);
  transform: rotate(0) scale(1.015);
}

.speaker-avatar img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-off {
  position: absolute;
  right: 17%;
  bottom: 16%;
  width: 20%;
  color: rgba(255, 255, 255, 0.86);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.signal-lines {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7%;
  opacity: 0.12;
  pointer-events: none;
}

.signal-lines i {
  width: 1px;
  height: 42%;
  background: linear-gradient(transparent, #a78bfa, transparent);
  transform: rotate(18deg);
}

.signal-lines i:nth-child(even) { height: 62%; transform: rotate(-18deg); }

.speaker-nameplate {
  position: absolute;
  bottom: 94px;
  left: 50%;
  display: flex;
  min-width: 220px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 11px 14px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  background: rgba(2, 6, 23, 0.62);
  box-shadow: 0 18px 45px rgba(2, 6, 23, 0.28);
  backdrop-filter: blur(16px);
  transform: translateX(-50%);
}

.speaker-nameplate div:first-child { display: flex; flex-direction: column; gap: 2px; }
.speaker-nameplate span { color: #8b9ab3; font-size: 9px; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; }
.speaker-nameplate strong { max-width: 210px; overflow: hidden; color: #f8fafc; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }

.voice-bars {
  display: flex;
  height: 22px;
  align-items: center;
  gap: 3px;
}

.voice-bars i {
  width: 3px;
  height: 8px;
  border-radius: 999px;
  background: #34d399;
  animation: voice-wave 900ms ease-in-out infinite alternate;
}

.voice-bars i:nth-child(2) { animation-delay: -300ms; }
.voice-bars i:nth-child(3) { animation-delay: -600ms; }
.voice-bars i:nth-child(4) { animation-delay: -150ms; }

.muted-icon {
  width: 18px;
  height: 18px;
  color: #fb7185;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.pinned-label {
  position: absolute;
  top: 78px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 9px;
  color: #ddd6fe;
  background: rgba(76, 29, 149, 0.25);
  font-size: 10px;
  font-weight: 700;
}

.pinned-label svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.stage-caption {
  bottom: 0;
  padding: 42px 20px 18px;
  background: linear-gradient(to top, rgba(2, 6, 23, 0.86), transparent);
}

.stage-caption p {
  margin: 0 0 3px;
  color: #8b9ab3;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.stage-caption h1 {
  max-width: 650px;
  margin: 0;
  overflow: hidden;
  color: #f8fafc;
  font-size: clamp(14px, 1.6vw, 20px);
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.secure-stream {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 10px;
}

.secure-stream svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: #34d399;
  stroke-width: 1.7;
}

.share-window {
  width: min(92%, 860px);
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 17px;
  background: #0b1020;
  box-shadow: 0 28px 80px rgba(2, 6, 23, 0.45);
}

.window-bar {
  display: flex;
  height: 38px;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  color: #64748b;
  background: #111827;
  font-size: 10px;
}

.window-bar i { width: 8px; height: 8px; border-radius: 50%; background: #fb7185; }
.window-bar i:nth-child(2) { background: #fbbf24; }
.window-bar i:nth-child(3) { margin-right: 8px; background: #34d399; }

.code-canvas {
  position: relative;
  display: flex;
  min-height: clamp(250px, 35vh, 430px);
  flex-direction: column;
  gap: 15px;
  padding: 34px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.88), rgba(2, 6, 23, 0.94));
}

.code-canvas .line {
  display: block;
  width: 72%;
  height: 9px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(139, 92, 246, 0.7) 0 13%, rgba(56, 189, 248, 0.42) 13% 42%, rgba(148, 163, 184, 0.14) 42%);
}

.code-canvas .line-2 { width: 54%; margin-left: 5%; }
.code-canvas .line-3 { width: 66%; margin-left: 5%; background: linear-gradient(90deg, rgba(52, 211, 153, 0.5) 0 22%, rgba(148, 163, 184, 0.14) 22%); }
.code-canvas .line-4 { width: 42%; margin-left: 10%; }
.code-canvas .line-5 { width: 58%; margin-left: 5%; }
.code-canvas .line-6 { width: 36%; }

.code-card {
  position: absolute;
  right: 28px;
  bottom: 24px;
  display: grid;
  grid-template-columns: 38px auto;
  gap: 1px 10px;
  align-items: center;
  padding: 12px 15px;
  border: 1px solid rgba(34, 211, 238, 0.18);
  border-radius: 13px;
  background: rgba(8, 47, 73, 0.66);
  backdrop-filter: blur(12px);
}

.code-card svg { width: 30px; height: 30px; grid-row: 1 / 3; fill: none; stroke: #67e8f9; stroke-width: 1.5; }
.code-card strong { font-size: 12px; }
.code-card span { color: #94a3b8; font-size: 9px; }

.control-dock {
  display: flex;
  min-height: 72px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid var(--stream-line);
  border-radius: 20px;
  background: rgba(15, 23, 42, 0.88);
  box-shadow: 0 18px 48px rgba(2, 6, 23, 0.22);
  backdrop-filter: blur(16px);
}

.control-cluster {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 7px;
}

.dock-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 13px;
  color: #cbd5e1;
  background: rgba(2, 6, 23, 0.34);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  transition: color 160ms ease, border-color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.dock-button:hover {
  color: #fff;
  border-color: rgba(167, 139, 250, 0.28);
  background: rgba(124, 58, 237, 0.13);
  transform: translateY(-1px);
}

.dock-button:active { transform: translateY(0) scale(0.97); }
.dock-button.off { color: #fecdd3; border-color: rgba(244, 63, 94, 0.18); background: rgba(159, 18, 57, 0.19); }
.dock-button.active { color: #ddd6fe; border-color: rgba(139, 92, 246, 0.34); background: rgba(109, 40, 217, 0.23); }
.dock-button.warning { color: #fde68a; border-color: rgba(245, 158, 11, 0.24); background: rgba(180, 83, 9, 0.18); }
.dock-button.compact { padding: 0 11px; }

.dock-button svg,
.end-button svg {
  width: 18px;
  height: 18px;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.dock-button svg .hidden { display: none; }

.end-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 1px solid rgba(251, 113, 133, 0.22);
  border-radius: 13px;
  color: #fecdd3;
  background: rgba(159, 18, 57, 0.22);
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
  transition: color 160ms ease, background-color 160ms ease, transform 160ms ease;
}

.end-button:hover { color: #fff; background: rgba(225, 29, 72, 0.38); transform: translateY(-1px); }
.end-button span { width: 8px; height: 8px; border-radius: 3px; background: #fb7185; }

.reaction-control,
.reaction-tools {
  position: relative;
}

.reaction-popover,
.message-reaction-menu {
  position: absolute;
  z-index: 30;
  display: flex;
  gap: 4px;
  padding: 7px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.96);
  box-shadow: 0 18px 48px rgba(2, 6, 23, 0.45);
  backdrop-filter: blur(16px);
}

.reaction-popover {
  right: 0;
  bottom: calc(100% + 9px);
}

.reaction-popover button,
.message-reaction-menu button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  transition: background-color 140ms ease, transform 140ms ease;
}

.reaction-popover button:hover,
.message-reaction-menu button:hover { background: rgba(139, 92, 246, 0.17); transform: translateY(-2px) scale(1.08); }

.chat-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--stream-line);
  border-radius: 20px;
  background:
    radial-gradient(circle at 100% 0, rgba(124, 58, 237, 0.12), transparent 28%),
    rgba(15, 23, 42, 0.9);
  box-shadow: 0 24px 60px rgba(2, 6, 23, 0.28);
  backdrop-filter: blur(18px);
}

.chat-header {
  display: flex;
  min-height: 68px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 13px 14px 12px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.chat-header p { margin: 0 0 2px; color: #a78bfa; font-size: 9px; font-weight: 900; letter-spacing: 0.12em; text-transform: uppercase; }
.chat-header h2 { margin: 0; font-size: 15px; font-weight: 800; }
.chat-header-actions { display: flex; align-items: center; gap: 8px; }

.online-count {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #64748b;
  font-size: 9px;
}

.online-count i { width: 6px; height: 6px; border-radius: 50%; background: #34d399; }

.chat-header-actions button,
.reply-preview > button,
.pending-files button {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 9px;
  color: #64748b;
  background: rgba(148, 163, 184, 0.07);
  cursor: pointer;
  transition: color 150ms ease, background-color 150ms ease;
}

.chat-header-actions button:hover,
.reply-preview > button:hover,
.pending-files button:hover { color: #fff; background: rgba(148, 163, 184, 0.14); }

.chat-header-actions svg,
.reply-preview svg,
.pending-files svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chat-messages {
  min-height: 0;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 12px 10px 18px;
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.28) transparent;
}

.chat-messages::-webkit-scrollbar { width: 6px; }
.chat-messages::-webkit-scrollbar-thumb { border-radius: 99px; background: rgba(148, 163, 184, 0.28); }

.chat-day {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 2px 5px 16px;
  color: #475569;
  font-size: 9px;
  text-transform: uppercase;
}

.chat-day::before,
.chat-day::after { height: 1px; flex: 1; background: rgba(148, 163, 184, 0.1); content: ''; }

.chat-message {
  position: relative;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 9px;
  padding: 8px 7px 11px;
  border-radius: 13px;
  transition: background-color 150ms ease;
}

.chat-message + .chat-message { margin-top: 5px; }
.chat-message:hover { background: rgba(148, 163, 184, 0.055); }
.chat-message.own { background: rgba(124, 58, 237, 0.055); }
.chat-message.system { display: flex; align-items: center; justify-content: center; gap: 7px; margin: 9px 3px; padding: 8px 10px; color: #8b9ab3; background: rgba(30, 41, 59, 0.42); font-size: 10px; text-align: center; }
.chat-message.system p { margin: 0; }

.system-icon { display: grid; width: 20px; height: 20px; flex: none; place-items: center; border-radius: 7px; color: #a78bfa; background: rgba(124, 58, 237, 0.13); }
.system-icon svg { width: 12px; height: 12px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

.message-avatar {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(167, 139, 250, 0.24);
  border-radius: 11px;
  font-size: 9px;
}

.message-body { min-width: 0; }
.message-body > header { display: flex; align-items: center; gap: 6px; min-height: 18px; }
.message-body > header strong { overflow: hidden; color: #dbe5f4; font-size: 11px; font-weight: 800; text-overflow: ellipsis; white-space: nowrap; }
.message-body > header time { margin-left: auto; color: #475569; font-size: 9px; font-variant-numeric: tabular-nums; }

.teacher-mark { padding: 2px 4px; border-radius: 5px; color: #c4b5fd; background: rgba(124, 58, 237, 0.18); font-size: 7px; font-weight: 900; letter-spacing: 0.04em; text-transform: uppercase; }

.message-text {
  margin: 4px 0 0;
  color: #aebbd0;
  font-size: 11px;
  line-height: 1.52;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.quoted-message {
  display: block;
  width: 100%;
  margin: 4px 0 5px;
  padding: 6px 8px;
  overflow: hidden;
  border: 0;
  border-left: 2px solid #7c3aed;
  border-radius: 0 7px 7px 0;
  color: #64748b;
  background: rgba(2, 6, 23, 0.26);
  cursor: pointer;
  text-align: left;
}

.quoted-message strong { display: block; color: #a78bfa; font-size: 9px; }
.quoted-message span { display: block; overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }

.message-attachments { display: grid; gap: 5px; margin-top: 7px; }
.message-attachments a { display: flex; min-width: 0; align-items: center; gap: 8px; padding: 7px; border: 1px solid rgba(148, 163, 184, 0.12); border-radius: 10px; color: #cbd5e1; background: rgba(2, 6, 23, 0.28); text-decoration: none; transition: border-color 150ms ease, background-color 150ms ease; }
.message-attachments a:hover { border-color: rgba(139, 92, 246, 0.3); background: rgba(124, 58, 237, 0.08); }
.message-attachments a.disabled { cursor: not-allowed; opacity: 0.55; }
.message-attachments img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
.message-attachments a > span:last-child { min-width: 0; }
.message-attachments strong,
.pending-files strong { display: block; overflow: hidden; font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.message-attachments small,
.pending-files small { color: #64748b; font-size: 8px; }
.file-icon,
.pending-file-icon { display: grid; width: 32px; height: 32px; flex: none; place-items: center; border-radius: 9px; color: #a78bfa; background: rgba(124, 58, 237, 0.13); }
.file-icon svg,
.pending-file-icon svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }

.message-reactions { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 7px; }
.message-reactions button { min-height: 24px; padding: 2px 7px; border: 1px solid rgba(148, 163, 184, 0.12); border-radius: 8px; color: #94a3b8; background: rgba(2, 6, 23, 0.25); cursor: pointer; font-size: 11px; }
.message-reactions button.selected { border-color: rgba(139, 92, 246, 0.36); color: #ddd6fe; background: rgba(124, 58, 237, 0.16); }
.message-reactions button span { margin-left: 2px; font-size: 8px; }

.message-actions {
  display: flex;
  min-height: 24px;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.message-actions > button,
.reaction-tools > button {
  display: inline-flex;
  min-height: 24px;
  align-items: center;
  gap: 4px;
  padding: 0 5px;
  border: 0;
  border-radius: 7px;
  color: #52617a;
  background: transparent;
  cursor: pointer;
  font-size: 8px;
  transition: color 140ms ease, background-color 140ms ease;
}

.message-actions > button:hover,
.reaction-tools > button:hover { color: #c4b5fd; background: rgba(124, 58, 237, 0.1); }
.message-actions svg { width: 13px; height: 13px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }

.message-reaction-menu { right: 0; bottom: calc(100% + 4px); }
.message-reaction-menu button { width: 29px; height: 29px; font-size: 15px; }
.messages-end { height: 1px; }

.chat-composer {
  padding: 10px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(2, 6, 23, 0.18);
}

.reply-preview {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) 30px;
  gap: 7px;
  align-items: center;
  margin-bottom: 7px;
  padding: 7px 8px;
  border-left: 2px solid #8b5cf6;
  border-radius: 0 10px 10px 0;
  color: #8b9ab3;
  background: rgba(124, 58, 237, 0.07);
}

.reply-preview > svg { width: 16px; height: 16px; color: #8b5cf6; }
.reply-preview span { display: block; color: #a78bfa; font-size: 8px; font-weight: 700; }
.reply-preview p { margin: 1px 0 0; overflow: hidden; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.reply-preview > button { width: 26px; height: 26px; }

.pending-files { display: grid; gap: 5px; margin-bottom: 7px; }
.pending-files > div { display: grid; min-width: 0; grid-template-columns: 30px minmax(0, 1fr) 27px; gap: 7px; align-items: center; padding: 6px 7px; border: 1px solid rgba(148, 163, 184, 0.1); border-radius: 9px; background: rgba(2, 6, 23, 0.25); }
.pending-file-icon { width: 28px; height: 28px; }
.pending-files button { width: 25px; height: 25px; }

.composer-row {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 34px;
  gap: 5px;
  align-items: end;
  padding: 5px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  border-radius: 13px;
  background: rgba(2, 6, 23, 0.38);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.composer-row:focus-within { border-color: rgba(139, 92, 246, 0.44); box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.08); }

.composer-row textarea {
  width: 100%;
  max-height: 96px;
  min-height: 34px;
  padding: 8px 4px;
  resize: none;
  overflow-y: auto;
  border: 0;
  outline: 0;
  color: #dbe5f4;
  background: transparent;
  font-size: 11px;
  line-height: 1.4;
}

.composer-row textarea::placeholder { color: #52617a; }

.composer-button {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition: color 150ms ease, background-color 150ms ease, transform 150ms ease, opacity 150ms ease;
}

.composer-button svg { width: 17px; height: 17px; fill: none; stroke: currentColor; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
.composer-button.attach { color: #64748b; background: transparent; }
.composer-button.attach:hover { color: #c4b5fd; background: rgba(124, 58, 237, 0.12); }
.composer-button.send { color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5); box-shadow: 0 7px 16px rgba(79, 70, 229, 0.24); }
.composer-button.send:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
.composer-button.send:disabled { cursor: not-allowed; opacity: 0.34; box-shadow: none; }

.composer-hint { margin: 6px 3px 0; color: #3f4d64; font-size: 8px; text-align: center; }
.composer-hint kbd { color: #64748b; font-family: inherit; }

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.popover-enter-active,
.popover-leave-active,
.mini-popover-enter-active,
.mini-popover-leave-active { transition: opacity 140ms ease, transform 140ms ease; }
.popover-enter-from,
.popover-leave-to { opacity: 0; transform: translateY(6px) scale(0.96); }
.mini-popover-enter-from,
.mini-popover-leave-to { opacity: 0; transform: translateY(4px) scale(0.96); }

@keyframes status-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.48; transform: scale(0.82); }
}

@keyframes waiting-dot {
  0%, 70%, 100% { opacity: 0.35; transform: translateY(0); }
  35% { opacity: 1; transform: translateY(-4px); }
}

@keyframes orbit-spin { to { transform: rotate(360deg); } }

@keyframes card-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-9px); }
}

@keyframes voice-wave {
  from { height: 6px; opacity: 0.55; }
  to { height: 20px; opacity: 1; }
}

@media (max-width: 1500px) {
  .broadcast-layout.dual-sidebars { grid-template-columns: minmax(0, 1fr) minmax(300px, 350px); }
  .broadcast-layout.dual-sidebars .participants-drawer {
    position: absolute;
    z-index: 25;
    top: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    box-shadow: -24px 0 70px rgba(2, 6, 23, 0.46);
  }
}

@media (max-width: 1180px) {
  .standby-card { grid-template-columns: minmax(0, 1fr) 340px; }
  .standby-content { padding: 48px; }
  .dock-button span { display: none; }
  .dock-button { width: 44px; padding: 0; }
  .dock-button.compact { padding: 0; }
}

@media (max-width: 900px) {
  .standby-card { min-height: 640px; grid-template-columns: 1fr; }
  .standby-content { z-index: 2; padding: 44px 34px; }
  .standby-orb { position: absolute; right: -80px; bottom: -90px; width: 410px; opacity: 0.45; }
  .floating-card { display: none; }

  .broadcast-layout,
  .broadcast-layout.chat-only,
  .broadcast-layout.participants-only,
  .broadcast-layout.dual-sidebars {
    height: auto;
    min-height: 0;
    grid-template-columns: minmax(0, 1fr);
    overflow: visible;
  }

  .main-stage { min-height: 520px; }
  .chat-panel { min-height: 520px; max-height: 650px; }
  .broadcast-layout.dual-sidebars .participants-drawer { position: static; height: auto; max-height: 520px; }
  .control-dock { align-items: stretch; flex-direction: column; }
  .control-cluster { justify-content: center; }
  .media-controls .dock-button { flex: 1; }
  .view-controls .dock-button { width: 44px; }
  .end-button { margin-left: auto; }
}

@media (max-width: 620px) {
  .standby-card { min-height: 590px; border-radius: 20px; }
  .standby-content { padding: 34px 22px; }
  .standby-content h2 { font-size: 36px; }
  .status-chip { margin-bottom: 22px; }
  .standby-orb { right: -150px; bottom: -120px; }
  .primary-live-button { width: 100%; }

  .main-stage { min-height: 440px; border-radius: 18px; }
  .speaker-avatar { width: 150px; }
  .speaker-nameplate { bottom: 90px; min-width: 190px; }
  .stage-topbar { padding: 12px; }
  .stage-caption { padding: 38px 12px 14px; }
  .stage-caption h1 { max-width: 230px; }
  .secure-stream { display: none; }
  .stage-stats .duration { display: none; }
  .control-dock { border-radius: 16px; }
  .media-controls,
  .view-controls { flex-wrap: wrap; }
  .media-controls .dock-button { min-width: 44px; flex: 1 1 44px; }
  .end-button { flex: 1; margin-left: 0; }
  .chat-panel { border-radius: 16px; }
  .composer-hint { display: none; }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
