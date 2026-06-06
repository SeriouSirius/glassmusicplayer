const API = 'https://musicapi.acma.cc'

export async function api(path, options = {}) {
  try {
    const r = await fetch(API + path, {
      credentials: 'include',
      ...options
    })
    if (!r.ok) throw new Error('HTTP ' + r.status)
    const d = await r.json()
    if (d.code !== 200 && d.code !== undefined) throw new Error(d.message || 'API error:' + d.code)
    return d
  } catch (e) {
    console.error('API error:', e)
    throw e
  }
}

export function getApiBase() {
  return API
}

export default { api, getApiBase }
