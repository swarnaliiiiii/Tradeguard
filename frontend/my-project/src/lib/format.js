const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

export function formatCurrency(value) {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatNumber(value) {
  return numberFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatTimestamp(value) {
  if (!value) {
    return 'Pending'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Pending'
  }

  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function normalizeDepth(depth = {}) {
  const levels = Object.entries(depth).map(([priceKey, entry]) => ({
    type: entry.type,
    quantity: entry.quantity,
    price:
      typeof entry.price_usd === 'number'
        ? entry.price_usd
        : Number(priceKey) / 100,
  }))

  return {
    bids: levels
      .filter((entry) => entry.type === 'bid')
      .sort((left, right) => right.price - left.price),
    asks: levels
      .filter((entry) => entry.type === 'ask')
      .sort((left, right) => left.price - right.price),
  }
}
