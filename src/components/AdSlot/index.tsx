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
      className='mb-4 bloque-adv bg-zinc-50'
      style={{ width: '300px', height: '250px' }}
    ></div>
  )
}

export { AdSlot }
