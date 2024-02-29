import React, { ComponentType } from 'react'

import { Navbar } from '../components/Navbar'

const WithNavbar = <P extends object>(Component: ComponentType<P>) => {
  const displayName = Component.displayName || Component.name || 'Component'
  const ComponentWithNavbar: React.FC<P> = (props: P) => {
    return (
      <>
        <Navbar />
        <main>
          <Component {...props} />
        </main>
      </>
    )
  }
  ComponentWithNavbar.displayName = `WithNavbar(${displayName})`
  return React.memo(ComponentWithNavbar)
}

export { WithNavbar }
