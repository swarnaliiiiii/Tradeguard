const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`

    try {
      const payload = await response.json()
      if (payload?.reason) {
        message = payload.reason
      } else if (payload?.error) {
        message = payload.error
      }
    } catch {
      // Keep the HTTP status fallback when the response body is not JSON.
    }

    throw new Error(message)
  }

  return response.json()
}

export async function fetchHealth() {
  return request('/api/health')
}

export async function fetchBalance(userId) {
  return request(`/api/balance/${userId}`)
}

export async function fetchDepth() {
  return request('/api/depth')
}

export async function fetchAudit(limit = 5) {
  return request(`/api/audit?limit=${limit}`)
}

export async function submitOrder(order) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order),
  })
}
