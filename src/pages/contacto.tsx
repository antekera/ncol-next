import { NextPage } from 'next'

import { LegalPage } from 'components'

type LegalPageProps = {
  children: React.ReactNode
  title: string
}

const Index: NextPage<LegalPageProps> = () => {
  return (
    <LegalPage title='Contactos'>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
        finibus nisi diam, tristique fringilla lacus molestie eu. Praesent
        tristique condimentum dui, eu bibendum dolor fringilla ac. Morbi
        tristique mauris odio, in commodo libero aliquam vitae. Vestibulum
        tincidunt commodo nibh, ultricies porttitor neque finibus eget. Donec
        sed condimentum libero. Fusce accumsan mattis velit, eget blandit elit
        iaculis a. Vestibulum mauris est, elementum non elit vel, rhoncus
        laoreet urna. Sed at nibh ex. Nunc viverra purus et lorem scelerisque, a
        porttitor urna blandit. Nam convallis rutrum dictum. Phasellus in
        viverra tortor. Curabitur ornare libero eget felis condimentum, vel
        faucibus metus efficitur.
      </p>
      <h2>Terms and Conditions</h2>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque
        finibus nisi diam, tristique fringilla lacus molestie eu. Praesent
        tristique condimentum dui, eu bibendum dolor fringilla ac. Morbi
        tristique mauris odio, in commodo libero aliquam vitae. Vestibulum
        tincidunt commodo nibh, ultricies porttitor neque finibus eget. Donec
        sed condimentum libero. Fusce accumsan mattis velit, eget blandit elit
        iaculis a. Vestibulum mauris est, elementum non elit vel, rhoncus
        laoreet urna. Sed at nibh ex. Nunc viverra purus et lorem scelerisque, a
        porttitor urna blandit. Nam convallis rutrum dictum. Phasellus in
        viverra tortor. Curabitur ornare libero eget felis condimentum, vel
        faucibus metus efficitur.
      </p>
    </LegalPage>
  )
}

export default Index
