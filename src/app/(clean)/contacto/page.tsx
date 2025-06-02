import ContactForm from '@components/ContactForm'
import { Metadata } from 'next'

const title = 'Contactos'

export const metadata: Metadata = {
  title
}

export default function Page() {
  return <ContactForm />
}
