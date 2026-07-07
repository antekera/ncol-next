import ContactForm from '@components/ContactForm'
import { Metadata } from 'next'

const title = 'Contactos'

export const metadata: Metadata = {
  title,
  robots: {
    index: false,
    follow: true
  }
}

export default function Page() {
  return <ContactForm />
}
