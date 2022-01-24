export interface ContainerProps {
  children: React.ReactNode
}

export const Container = ({ children }: ContainerProps) => {
  return (
    <div className='container px-5 mx-auto'>
      <div className='flex flex-row flex-wrap py-4'>
        <main role='main' className='w-full px-2 pt-1 sm:w-2/3 md:w-3/4'>
          {children}
        </main>
        <aside className='w-full px-2 sm:w-1/3 md:w-1/4'>Sidebar</aside>
      </div>
      {children}
    </div>
  )
}
