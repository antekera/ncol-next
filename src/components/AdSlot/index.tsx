import { useDfpSlots } from '@lib/hooks/useDfpSlots'

interface GAdsScriptProps {
  id: string
}

const AdSlot = ({ id }: GAdsScriptProps) => {
  const tag = `div-gpt-ad-${id}`
  useDfpSlots(tag)

  return (
    <div
      id={tag}
      className='bloque-adv'
      style={{ width: '300px', height: '250px' }}
    ></div>
  )
}

export { AdSlot }
