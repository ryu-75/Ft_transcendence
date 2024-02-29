import httpInstance from './httpClient'

export const twoFactorAuth = async (code: string) =>
  httpInstance().post('/api/2fa/authenticate', { code })

export const generateTwoFactorAuth = async () => {
  const { data } = await httpInstance({ responseType: 'blob' }).post('/api/2fa/generate')
  const blob = new Blob([data], { type: 'image/png' })
  return URL.createObjectURL(blob)
}

export const twoFactorAuthEnable = async (code: string) =>
  httpInstance().post('/api/2fa/enable', { code })
