import React from 'react'

interface GAdsScriptProps {
  id: string
}

const GAdsScript = ({ id }: GAdsScriptProps) => {
  const tag = `div-gpt-ad-${id}`

  return <div id={tag} className='bloque-adv'></div>
}

export { GAdsScript }
