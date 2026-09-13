const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify env vars, then redeploy.',
  )
}

const BASE = supabaseUrl.replace(/\/$/, '') + '/rest/v1'

const headers = {
  apikey: supabaseKey,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

async function request<T = any>(
  method: string,
  table: string,
  query: string = '',
  body?: any,
): Promise<T> {
  const url = `${BASE}/${table}${query ? '?' + query : ''}`
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const errBody = await res.text()
    let parsed: any = {}
    try { parsed = JSON.parse(errBody) } catch {}
    throw new Error(parsed.message || `HTTP ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : ([] as any)
}

export const db = {
  async select(table: string, query: string = '') {
    return request('GET', table, query)
  },

  async insert(table: string, data: any) {
    return request('POST', table, '', data)
  },

  async upsert(table: string, data: any, onConflict?: string) {
    const q = onConflict ? `on_conflict=${encodeURIComponent(onConflict)}` : ''
    return request('POST', table, q, data)
  },

  async update(table: string, data: any, filter: string) {
    return request('PATCH', table, filter, data)
  },

  async delete(table: string, filter: string) {
    return request('DELETE', table, filter)
  },

  async count(table: string, filter: string = '') {
    const url = `${BASE}/${table}?select=*&limit=0${filter ? '&' + filter : ''}`
    const res = await fetch(url, {
      method: 'GET',
      headers: { ...headers, Prefer: 'count=exact' },
    })
    const range = res.headers.get('content-range') ?? ''
    const match = range.match(/\/(\d+)$/)
    return match ? parseInt(match[1], 10) : 0
  },
}
