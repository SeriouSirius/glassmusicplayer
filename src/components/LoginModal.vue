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
const qrStatus = ref('loading')  // loading | waiting | confirming | expired | success
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
    try {
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
    } catch (e) {
      // 網路錯誤保留下一輪重試，不中斷 polling
      console.warn('QR polling error, retrying...', e)
    }
  }, 2000)
}

async function handlePhoneLogin() {
  if (!phone.value.trim() || !password.value.trim()) {
    phoneError.value = '請填寫手機號和密碼'
    return
  }
  isPhoneLoading.value = true
  phoneError.value = ''
  try {
    // 統一透過 loginWithPhone() 處理，內部使用 md5_password，避免明文密碼出現在 URL
    const result = await loginWithPhone(phone.value.trim(), password.value)
    if (result.success) {
      emit('success')
    } else {
      phoneError.value = result.message || '登錄失敗，請檢查帳號密碼'
    }
  } catch (e) {
    phoneError.value = '網路錯誤，請稍後重試'
  }
  isPhoneLoading.value = false
}

watch(activeTab, (tab) => {
  if (tab === 'qr') initQr()
  else clearInterval(qrTimer)
})

if (activeTab.value === 'qr') initQr()

onUnmounted(() => clearInterval(qrTimer))
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <div class="modal">
      <button class="modal-close" @click="emit('close')" aria-label="關閉">✕</button>
      <h2 class="modal-title">登入</h2>

      <div class="login-tabs" v-if="!isMobileDevice()">
        <button :class="['tab-btn', activeTab === 'qr' && 'active']" @click="activeTab = 'qr'">
          二維碼
        </button>
        <button :class="['tab-btn', activeTab === 'phone' && 'active']" @click="activeTab = 'phone'">
          手機號
        </button>
      </div>

      <!-- 二維碼登入 -->
      <div v-if="activeTab === 'qr'" class="qr-panel">
        <div class="qr-wrap">
          <img v-if="qrImage && qrStatus !== 'expired'" :src="qrImage" class="qr-img" alt="登入二維碼" width="200" height="200" />
          <div v-if="qrStatus === 'loading'" class="qr-overlay">載入中...</div>
          <div v-if="qrStatus === 'expired'" class="qr-overlay expired">
            <span>二維碼已過期</span>
            <button class="refresh-btn" @click="initQr">刷新</button>
          </div>
          <div v-if="qrStatus === 'confirming'" class="qr-overlay confirming">
            ✅ 請在手機上確認登入
          </div>
        </div>
        <p class="qr-hint">
          <span v-if="qrStatus === 'waiting'">請使用網易雲音樂 App 掃碼登入</span>
          <span v-else-if="qrStatus === 'confirming'">請在 App 中點擊「確認登入」</span>
          <span v-else-if="qrStatus === 'success'">登入成功！</span>
        </p>
      </div>

      <!-- 手機號登入 -->
      <div v-if="activeTab === 'phone'" class="phone-panel">
        <div class="form-group">
          <label for="login-phone">手機號</label>
          <input
            id="login-phone"
            v-model="phone"
            type="tel"
            placeholder="請輸入手機號"
            class="form-input"
            @keyup.enter="handlePhoneLogin"
          />
        </div>
        <div class="form-group">
          <label for="login-password">密碼</label>
          <input
            id="login-password"
            v-model="password"
            type="password"
            placeholder="請輸入密碼"
            class="form-input"
            @keyup.enter="handlePhoneLogin"
          />
        </div>
        <p v-if="phoneError" class="form-error">{{ phoneError }}</p>
        <button class="login-btn" :disabled="isPhoneLoading" @click="handlePhoneLogin">
          {{ isPhoneLoading ? '登入中...' : '登入' }}
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
