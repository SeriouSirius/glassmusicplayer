<script setup>
import { inject, ref, computed } from 'vue'

const currentView = inject('currentView')
const navigate = inject('navigate')
const likedIds = inject('like').likedIds
const createdPlaylists = inject('createdPlaylists')
const subscribedPlaylists = inject('subscribedPlaylists')
const playlistDetail = inject('playlistDetail')
const openPlaylist = inject('openPlaylist')
const isLoggedIn = inject('isLoggedIn')
const userProfile = inject('userProfile')
const showLoginModal = inject('showLoginModal')
const logout = inject('logout')
const createPlaylist = inject('createPlaylist')

const COLLAPSE_LIMIT = 5
const createdExpanded = ref(false)
const subscribedExpanded = ref(false)

// Create playlist inline form
const showCreateInput = ref(false)
const newPlaylistName = ref('')
const isCreating = ref(false)

async function submitCreate() {
  const name = newPlaylistName.value.trim()
  if (!name || isCreating.value) return
  isCreating.value = true
  await createPlaylist(name)
  isCreating.value = false
  newPlaylistName.value = ''
  showCreateInput.value = false
}

function cancelCreate() {
  showCreateInput.value = false
  newPlaylistName.value = ''
}

const visibleCreated = computed(() =>
  createdExpanded.value ? createdPlaylists.value : createdPlaylists.value.slice(0, COLLAPSE_LIMIT)
)
const visibleSubscribed = computed(() =>
  subscribedExpanded.value ? subscribedPlaylists.value : subscribedPlaylists.value.slice(0, COLLAPSE_LIMIT)
)

const todayBadge = (() => {
  const now = new Date()
  return `${now.getMonth() + 1}/${now.getDate()}`
})()
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
      </div>
      <div class="logo-text"><span>Glass</span>Music</div>
    </div>

    <!-- 用戶區塊 -->
    <div class="user-section">
      <template v-if="isLoggedIn && userProfile">
        <div class="user-info">
          <img
            v-if="userProfile.avatarUrl"
            :src="userProfile.avatarUrl"
            class="user-avatar"
            :alt="userProfile.nickname"
            width="32" height="32"
            loading="lazy"
          />
          <div v-else class="user-avatar-fallback">{{ userProfile.nickname?.[0] }}</div>
          <span class="user-name">{{ userProfile.nickname }}</span>
        </div>
        <button class="logout-btn" @click="logout" title="登出">登出</button>
      </template>
      <template v-else>
        <button class="login-trigger-btn" @click="showLoginModal = true">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.33 0-10 1.67-10 5v2h20v-2c0-3.33-6.67-5-10-5z"/>
          </svg>
          登入帳號
        </button>
      </template>
    </div>

    <div class="nav-section">
      <div class="nav-label">发现</div>
      <div class="nav-item" :class="{active: currentView === 'discover'}" @click="navigate('discover')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>发现音樂</span>
      </div>
      <div class="nav-item" :class="{active: currentView === 'toplist'}" @click="navigate('toplist')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z"/></svg><span>榜单</span>
      </div>
      <div class="nav-item" :class="{active: currentView === 'search'}" @click="navigate('search')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg><span>搜索</span>
      </div>
      <div class="nav-item" :class="{active: currentView === 'fm'}" @click="navigate('fm')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg><span>私人FM</span>
      </div>
    </div>

    <div class="nav-section">
      <div class="nav-label">我的音樂</div>

      <div
        v-if="isLoggedIn"
        class="nav-item"
        :class="{active: currentView === 'daily'}"
        @click="navigate('daily')"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
        </svg>
        <span>每日推薦</span>
        <span class="nav-count">{{ todayBadge }}</span>
      </div>

      <div class="nav-item" :class="{active: currentView === 'liked'}" @click="navigate('liked')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <span>我喜歡</span>
        <span class="nav-count" v-if="likedIds.size">{{ likedIds.size }}</span>
      </div>
      <div class="nav-item" :class="{active: currentView === 'recent'}" @click="navigate('recent')">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/></svg><span>最近播放</span>
      </div>
    </div>

    <!-- 創建的歌單 -->
    <div class="nav-section">
      <div class="nav-label nav-label-with-action">
        <span>創建的歌單</span>
        <button
          v-if="isLoggedIn"
          class="create-playlist-btn"
          title="新建歌單"
          @click="showCreateInput = !showCreateInput"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
        </button>
      </div>

      <!-- Inline create form -->
      <div v-if="showCreateInput" class="create-playlist-form">
        <input
          v-model="newPlaylistName"
          class="create-playlist-input"
          placeholder="歌單名稱"
          maxlength="40"
          autofocus
          @keydown.enter="submitCreate"
          @keydown.esc="cancelCreate"
        />
        <div class="create-playlist-actions">
          <button class="btn-create-confirm" :disabled="isCreating || !newPlaylistName.trim()" @click="submitCreate">
            {{ isCreating ? '創建中…' : '確定' }}
          </button>
          <button class="btn-create-cancel" @click="cancelCreate">取消</button>
        </div>
      </div>

      <div
        class="nav-item playlist-nav-item"
        v-for="pl in visibleCreated"
        :key="pl.id"
        :class="{active: currentView === 'playlist' && playlistDetail?.id === pl.id}"
        @click="openPlaylist(pl.id)"
      >
        <img
          v-if="pl.coverImgUrl"
          :src="pl.coverImgUrl"
          class="playlist-thumb"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <svg v-else viewBox="0 0 24 24" fill="currentColor" class="playlist-thumb-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
        <span class="playlist-nav-name">{{ pl.name }}</span>
        <span class="nav-count" v-if="pl.trackCount">{{ pl.trackCount }}</span>
      </div>
      <div v-if="!isLoggedIn && !createdPlaylists.length" class="playlist-empty-hint">登入後顯示</div>
      <button
        v-if="createdPlaylists.length > COLLAPSE_LIMIT"
        class="expand-toggle"
        @click="createdExpanded = !createdExpanded"
      >
        {{ createdExpanded ? '收起' : `顯示全部 ${createdPlaylists.length} 個` }}
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:12px;height:12px" :style="{transform: createdExpanded ? 'rotate(180deg)' : 'none'}"><path d="M7 10l5 5 5-5z"/></svg>
      </button>
    </div>

    <!-- 收藏的歌單 -->
    <div class="nav-section" v-if="subscribedPlaylists.length">
      <div class="nav-label">收藏的歌單</div>
      <div
        class="nav-item playlist-nav-item"
        v-for="pl in visibleSubscribed"
        :key="pl.id"
        :class="{active: currentView === 'playlist' && playlistDetail?.id === pl.id}"
        @click="openPlaylist(pl.id)"
      >
        <img
          v-if="pl.coverImgUrl"
          :src="pl.coverImgUrl"
          class="playlist-thumb"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <svg v-else viewBox="0 0 24 24" fill="currentColor" class="playlist-thumb-icon"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
        <span class="playlist-nav-name">{{ pl.name }}</span>
        <span class="nav-count" v-if="pl.trackCount">{{ pl.trackCount }}</span>
      </div>
      <button
        v-if="subscribedPlaylists.length > COLLAPSE_LIMIT"
        class="expand-toggle"
        @click="subscribedExpanded = !subscribedExpanded"
      >
        {{ subscribedExpanded ? '收起' : `顯示全部 ${subscribedPlaylists.length} 個` }}
        <svg viewBox="0 0 24 24" fill="currentColor" style="width:12px;height:12px" :style="{transform: subscribedExpanded ? 'rotate(180deg)' : 'none'}"><path d="M7 10l5 5 5-5z"/></svg>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.user-section {
  padding: 8px 12px 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 48px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}
.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.user-avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  flex-shrink: 0;
}
.user-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.logout-btn {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 3px 8px;
  cursor: pointer;
  transition: all 0.18s;
}
.logout-btn:hover {
  color: var(--color-error);
  border-color: var(--color-error);
}
.login-trigger-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: var(--color-surface-offset);
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  transition: all 0.18s;
}
.login-trigger-btn:hover {
  background: var(--color-primary-highlight);
  color: var(--color-primary);
}
.nav-badge,
.nav-count {
  margin-left: auto;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1;
  flex-shrink: 0;
}
.nav-badge {
  background: var(--color-primary);
  color: #fff;
  padding: 2px 6px;
  border-radius: 9999px;
  font-size: 0.625rem;
}
.nav-count {
  color: var(--color-text-faint);
}

/* Section label with action button */
.nav-label-with-action {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.create-playlist-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: background 0.15s, color 0.15s;
}
.create-playlist-btn:hover {
  background: var(--color-surface-offset);
  color: var(--color-primary);
}

/* Inline create form */
.create-playlist-form {
  padding: 6px 8px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.create-playlist-input {
  width: 100%;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-2);
  color: var(--color-text);
  font-size: 0.8125rem;
  outline: none;
  transition: border-color 0.15s;
}
.create-playlist-input:focus {
  border-color: var(--color-primary);
}
.create-playlist-actions {
  display: flex;
  gap: 6px;
}
.btn-create-confirm {
  flex: 1;
  padding: 4px 0;
  border-radius: 6px;
  border: none;
  background: var(--color-primary);
  color: #fff;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-create-confirm:hover:not(:disabled) {
  background: var(--color-primary-hover);
}
.btn-create-confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-create-cancel {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: none;
  color: var(--color-text-muted);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-create-cancel:hover {
  background: var(--color-surface-offset);
}

/* Playlist nav items */
.playlist-nav-item {
  padding-top: 5px;
  padding-bottom: 5px;
}
.playlist-thumb {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}
.playlist-thumb-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  opacity: 0.45;
}
.playlist-nav-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
}
.playlist-empty-hint {
  padding: 4px 12px;
  font-size: 0.75rem;
  color: var(--color-text-faint);
}

/* Expand/collapse toggle */
.expand-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 5px 12px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s, color 0.15s;
}
.expand-toggle:hover {
  background: var(--color-surface-offset);
  color: var(--color-text);
}
.expand-toggle svg {
  transition: transform 0.2s;
}
</style>
