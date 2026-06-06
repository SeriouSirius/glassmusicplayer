const API = 'https://musicapi.acma.cc'

/**
 * Wrapper around fetch for the Netease music API.
 * Since v4.29.7, POST requests made while logged in must include a
 * `timestamp` query parameter, otherwise the server returns 405
 * "操作过于频繁". This helper appends it automatically for every POST.
 */
export async function api(path, options = {}) {
  try {
    let url = API + path

    // Auto-inject timestamp for POST requests (required by API v4.29.7+)
    const method = (options.method || 'GET').toUpperCase()
    if (method === 'POST') {
      const sep = url.includes('?') ? '&' : '?'
      url = url + sep + 'timestamp=' + Date.now()
    }

    const r = await fetch(url, {
      ...options,
      credentials: 'include'  // always send cookies for auth
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
