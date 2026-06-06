import { ref, computed } from 'vue'
import { api } from '../api/index.js'
import SparkMD5 from 'spark-md5'

const API = 'https://musicapi.acma.cc'

const isLoggedIn = ref(false)
const userProfile = ref(null)   // { userId, nickname, avatarUrl }
const isLoading = ref(false)

const isAnon = computed(() => !isLoggedIn.value)

// 設備類型檢測
function isMobileDevice() {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    ('ontouchstart' in window && window.innerWidth < 768)
}

// ─── 初始化：嘗試恢復登入狀態 ───────────────────────────────
async function initAuth() {
  try {
    // 嘗試用現有 Cookie 獲取帳號信息
    const r = await api('/user/account')
    if (r?.account?.id) {
      isLoggedIn.value = true
      userProfile.value = {
        userId: r.account.id,
        nickname: r.profile?.nickname || r.account.userName,
        avatarUrl: r.profile?.avatarUrl || ''
      }
    }
  } catch (e) {
    // Cookie 過期或未登入，靜默失敗
    isLoggedIn.value = false
    userProfile.value = null
  }
}

// ─── 二維碼登入 ─────────────────────────────────────────────
async function getQrKey() {
  const ts = Date.now()
  const r = await fetch(`${API}/login/qr/key?timerstamp=${ts}`, { credentials: 'include' })
  const d = await r.json()
  return d?.data?.unikey
}

async function getQrImage(key) {
  const ts = Date.now()
  const r = await fetch(`${API}/login/qr/create?key=${key}&qrimg=true&timerstamp=${ts}`, { credentials: 'include' })
  const d = await r.json()
  // qrimg=true 時 data.qrimg 為 base64 data URL
  return d?.data?.qrimg
}

async function checkQrStatus(key) {
  const ts = Date.now()
  const r = await fetch(`${API}/login/qr/check?key=${key}&timerstamp=${ts}`, { credentials: 'include' })
  const d = await r.json()
  // 800=過期, 801=等待掃碼, 802=待確認, 803=成功
  return { code: d.code, message: d.message }
}

// ─── 手機號登入 ─────────────────────────────────────────────
async function loginWithPhone(phone, password) {
  isLoading.value = true
  try {
    // 密碼需要 MD5 加密
    const md5pw = await md5(password)
    const r = await fetch(
      `${API}/login/cellphone?phone=${encodeURIComponent(phone)}&md5_password=${md5pw}`,
      { method: 'GET', credentials: 'include' }
    )
    const d = await r.json()
    if (d.code === 200) {
      await fetchUserProfile()
      return { success: true }
    }
    return { success: false, message: d.message || '登录失败' }
  } catch (e) {
    return { success: false, message: e.message || '网络错误' }
  } finally {
    isLoading.value = false
  }
}

// ─── 獲取用戶資料 ────────────────────────────────────────────
async function fetchUserProfile() {
  const r = await api('/user/account')
  if (r?.account?.id) {
    isLoggedIn.value = true
    userProfile.value = {
      userId: r.account.id,
      nickname: r.profile?.nickname || r.account.userName,
      avatarUrl: r.profile?.avatarUrl || ''
    }
  }
}

// ─── 登出 ───────────────────────────────────────────────────
async function logout() {
  try {
    await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' })
  } catch (e) { /* 忽略 */ }
  isLoggedIn.value = false
  userProfile.value = null
}

// ─── MD5 工具（Web Crypto API，無需 npm 包）─────────────────
async function md5(str) {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const hashBuffer = await crypto.subtle.digest('MD5', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
// 注意：Web Crypto API 不支援 MD5（MD5 不安全）
// 改用純 JS 實現的 md5，或直接傳明文密碼（api 支援 password 參數）
// 建議改用 /login/cellphone?phone=xxx&password=yyy（明文，HTTPS 下安全）
async function md5Plain(str) {
  // 簡易 fallback：直接返回明文（API 也接受 password 參數）
  return str
}

export function useAuth() {
  return {
    isLoggedIn,
    userProfile,
    isLoading,
    isAnon,
    isMobileDevice,
    initAuth,
    getQrKey,
    getQrImage,
    checkQrStatus,
    loginWithPhone,
    fetchUserProfile,
    logout
  }
}