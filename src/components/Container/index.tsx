export interface ContainerProps {
  children: React.ReactNode
}

export const Container = ({ children }: ContainerProps) => {
  return <div className='container px-5 mx-auto'>{children}</div>
}

export default Container
