<script setup>
import { ref, onUnmounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const emit = defineEmits(['close', 'success'])
const { getQrKey, getQrImage, checkQrStatus, loginWithPhone, isMobileDevice, fetchUserProfile } = useAuth()

const activeTab = ref(isMobileDevice() ? 'phone' : 'qr')
const phone = ref('')
const password = ref('')
const phoneError = ref('')
const isPhoneLoading = ref(false)

// QR state
const qrImage = ref('')
const qrStatus = ref('loading')  // loading | waiting | scanning | confirming | expired | success
const qrKey = ref('')
let qrTimer = null

async function initQr() {
  qrStatus.value = 'loading'
  qrImage.value = ''
  try {
    qrKey.value = await getQrKey()
    qrImage.value = await getQrImage(qrKey.value)
    qrStatus.value = 'waiting'
    startQrPolling()
  } catch (e) {
    qrStatus.value = 'expired'
  }
}

function startQrPolling() {
  clearInterval(qrTimer)
  qrTimer = setInterval(async () => {
    if (!qrKey.value) return
    const { code } = await checkQrStatus(qrKey.value)
    if (code === 800) {
      qrStatus.value = 'expired'
      clearInterval(qrTimer)
    } else if (code === 801) {
      qrStatus.value = 'waiting'
    } else if (code === 802) {
      qrStatus.value = 'confirming'
    } else if (code === 803) {
      qrStatus.value = 'success'
      clearInterval(qrTimer)
      await fetchUserProfile()
      emit('success')
    }
  }, 2000)
}

async function handlePhoneLogin() {
  if (!phone.value.trim() || !password.value.trim()) {
    phoneError.value = '请填写手机号和密码'
    return
  }
  isPhoneLoading.value = true
  phoneError.value = ''
  const API = 'https://musicapi.acma.cc'
  try {
    const r = await fetch(
      `${API}/login/cellphone?phone=${encodeURIComponent(phone.value)}&password=${encodeURIComponent(password.value)}`,
      { credentials: 'include' }
    )
    const d = await r.json()
    if (d.code === 200) {
      await fetchUserProfile()
      emit('success')
    } else {
      phoneError.value = d.message || '登录失败，请检查账号密码'
    }
  } catch (e) {
    phoneError.value = '网络错误，请稍后重试'
  }
  isPhoneLoading.value = false
}

// 切換到 QR tab 時初始化
watch(activeTab, (tab) => {
  if (tab === 'qr') initQr()
  else clearInterval(qrTimer)
})

// 若默認 tab 為 qr，立即初始化
if (activeTab.value === 'qr') initQr()

onUnmounted(() => clearInterval(qrTimer))
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <button class="modal-close" @click="emit('close')" aria-label="关闭">✕</button>
      <h2 class="modal-title">登录</h2>

      <!-- Tab 切換（手機端隱藏 QR tab） -->
      <div class="login-tabs" v-if="!isMobileDevice()">
        <button :class="['tab-btn', activeTab === 'qr' && 'active']" @click="activeTab = 'qr'">
          二维码
        </button>
        <button :class="['tab-btn', activeTab === 'phone' && 'active']" @click="activeTab = 'phone'">
          手机号
        </button>
      </div>

      <!-- 二維碼登入 -->
      <div v-if="activeTab === 'qr'" class="qr-panel">
        <div class="qr-wrap">
          <img v-if="qrImage && qrStatus !== 'expired'" :src="qrImage" class="qr-img" alt="登录二维码" width="200" height="200" />
          <div v-if="qrStatus === 'loading'" class="qr-overlay">载入中...</div>
          <div v-if="qrStatus === 'expired'" class="qr-overlay expired">
            <span>二维码已过期</span>
            <button class="refresh-btn" @click="initQr">刷新</button>
          </div>
          <div v-if="qrStatus === 'confirming'" class="qr-overlay confirming">
            ✅ 请在手机上确认登录
          </div>
        </div>
        <p class="qr-hint">
          <span v-if="qrStatus === 'waiting'">请使用网易云音乐 App 扫码登录</span>
          <span v-else-if="qrStatus === 'scanning'">扫码成功，请确认</span>
          <span v-else-if="qrStatus === 'confirming'">请在 App 中点击「确认登录」</span>
          <span v-else-if="qrStatus === 'success'">登录成功！</span>
        </p>
      </div>

      <!-- 手機號登入 -->
      <div v-if="activeTab === 'phone'" class="phone-panel">
        <div class="form-group">
          <label for="login-phone">手机号</label>
          <input
            id="login-phone"
            v-model="phone"
            type="tel"
            placeholder="请输入手机号"
            class="form-input"
            @keyup.enter="handlePhoneLogin"
          />
        </div>
        <div class="form-group">
          <label for="login-password">密码</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="请输入密码"
            class="form-input"
            @keyup.enter="handlePhoneLogin"
          />
        </div>
        <p v-if="phoneError" class="form-error">{{ phoneError }}</p>
        <button
          class="login-btn"
          :disabled="isPhoneLoading"
          @click="handlePhoneLogin"
        >
          {{ isPhoneLoading ? '登录中...' : '登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: var(--color-surface);
  border-radius: 12px;
  padding: 32px;
  width: 360px;
  position: relative;
  box-shadow: var(--shadow-lg);
}
.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 18px;
  line-height: 1;
  padding: 4px;
}
.modal-close:hover { color: var(--color-text); }
.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--color-text);
}
.login-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.tab-btn {
  flex: 1;
  padding: 8px;
  border-radius: 8px;
  background: var(--color-surface-offset);
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  transition: all 0.18s;
}
.tab-btn.active {
  background: var(--color-primary);
  color: #fff;
}
.qr-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.qr-wrap {
  position: relative;
  width: 200px;
  height: 200px;
}
.qr-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  display: block;
}
.qr-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  gap: 8px;
  font-size: 0.875rem;
}
.qr-overlay.expired { background: rgba(0, 0, 0, 0.75); }
.refresh-btn {
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 14px;
  cursor: pointer;
  font-size: 0.875rem;
}
.refresh-btn:hover { background: var(--color-primary-hover); }
.qr-hint {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  text-align: center;
}
.phone-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.form-input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.18s;
}
.form-input:focus { border-color: var(--color-primary); }
.form-error {
  font-size: 0.875rem;
  color: var(--color-error);
}
.login-btn {
  padding: 11px;
  border-radius: 8px;
  background: var(--color-primary);
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.18s;
}
.login-btn:hover { background: var(--color-primary-hover); }
.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
