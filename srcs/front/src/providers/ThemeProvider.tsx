import React, { createContext, ReactNode, useContext, useMemo, useState } from 'react'

interface ThemeContextData {
  theme: string
  changeTheme(theme: string): void
}

type Props = {
  children: ReactNode
}

export const ThemeContext = createContext<ThemeContextData>({
  theme: 'light',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  changeTheme: () => {},
})

export const ThemeProvider = ({ children }: Props) => {
  const [theme, setTheme] = useState<string>(localStorage.getItem('theme') || 'light')

  const changeTheme = (theme: string) => {
    setTheme(theme)
    localStorage.setItem('theme', theme)
  }

  const memoedValue = useMemo<ThemeContextData>(
    () => ({
      theme,
      changeTheme,
    }),
    [theme],
  )

  return <ThemeContext.Provider value={memoedValue}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
