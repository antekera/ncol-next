import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Header } from '@components/Header'
import { Container } from '@components/Container'

export const metadata: Metadata = {
  title: 'Quiénes Somos',
  description:
    'Conoce la historia y el equipo de NoticiasCol, pioneros del periodismo digital desde Cabimas, Zulia para el mundo.'
}

export default function QuienesSomosPage() {
  const currentYear = new Date().getFullYear()

  return (
    <>
      <Header />

      <Container className='py-12'>
        <article className='mx-auto max-w-3xl font-sans text-neutral-800 dark:text-neutral-200'>
          <h1 className='mb-8 font-serif text-3xl font-bold text-neutral-900 sm:text-4xl dark:text-white'>
            Quiénes Somos
          </h1>

          <div className='space-y-6 text-lg leading-relaxed font-light'>
            <h2 className='mb-4 text-2xl font-bold text-neutral-900 dark:text-white'>
              Nuestra Historia: El compromiso de informar
            </h2>
            <p>
              <strong>NoticiasCol (NCOL)</strong> surgió en 2012 en Cabimas,
              estado Zulia, en un momento crucial para el ecosistema
              comunicacional venezolano. Ante el cierre progresivo de medios
              tradicionales y la creciente restricción informativa,
              identificamos la necesidad de construir una alternativa robusta y
              veraz. En aquel entonces, fuimos pioneros en la transición hacia
              el periodismo digital en la Costa Oriental del Lago, desafiando la
              incertidumbre con la convicción de que la información es un
              derecho fundamental que debe prevalecer.
            </p>

            <p>
              Lo que comenzó como una respuesta ante la adversidad, evolucionó
              rápidamente hasta consolidarse como un referente de innovación en
              el periodismo regional. Con los años, hemos trascendido nuestras
              fronteras geográficas para convertirnos en una brújula informativa
              para la diáspora zuliana y venezolana, manteniendo siempre el
              compromiso de ofrecer un contenido riguroso, ágil y profundamente
              arraigado a nuestra identidad.
            </p>

            <h2 className='mt-10 mb-4 text-2xl font-bold text-neutral-900 dark:text-white'>
              Nuestra esencia y visión
            </h2>
            <p>
              Hoy, en {currentYear}, NoticiasCol reafirma su propósito: ser un
              medio de alcance global que, desde la esencia local, documenta la
              realidad con honestidad y profesionalismo. Nuestra evolución
              constante se sustenta en la apuesta por el talento humano y la
              implementación de herramientas tecnológicas que nos permiten
              conectar a nuestra comunidad, sin importar la distancia, con el
              pulso de los acontecimientos.
            </p>
          </div>

          <figure className='relative my-10 h-[300px] w-full overflow-hidden rounded-xl border border-neutral-200 shadow-lg sm:h-[450px] dark:border-neutral-800'>
            <Image
              src='/images/sala.jpg'
              alt='Sala de redacción de NoticiasCol'
              fill
              className='object-cover'
              sizes='(max-width: 768px) 100vw, 800px'
            />
          </figure>

          <div className='mb-12 space-y-6 text-lg leading-relaxed font-light'>
            <h2 className='mb-4 text-2xl font-bold text-neutral-900 dark:text-white'>
              El origen de un proyecto colectivo
            </h2>
            <p>
              La solidez de nuestro medio es el resultado de una visión
              compartida entre tres perfiles fundamentales que unieron sus
              fortalezas para dar vida a este proyecto:
            </p>
            <ul className='list-disc space-y-4 pl-6'>
              <li>
                <strong>El rigor periodístico:</strong> Una trayectoria dedicada
                a la ética y la veracidad, garantizando que cada noticia esté
                respaldada por la credibilidad.
              </li>
              <li>
                <strong>La narrativa y el alcance:</strong> Una voz
                experimentada en la locución que ha dotado a nuestra línea
                editorial de ritmo, cercanía y calidez humana.
              </li>
              <li>
                <strong>La innovación tecnológica:</strong> La capacidad técnica
                para diseñar y sostener una plataforma capaz de transformar la
                manera en que consumimos información en el estado Zulia.
              </li>
            </ul>
            <p className='mt-6'>
              NoticiasCol es, en esencia, la suma de estas visiones al servicio
              de la audiencia. Somos el testimonio de que la información, cuando
              se gestiona con integridad y visión de futuro, no tiene fronteras.
            </p>
          </div>

          <div className='mt-8 rounded-2xl border border-neutral-100 bg-neutral-50 p-8 text-center shadow-sm sm:p-10 dark:border-neutral-800 dark:bg-neutral-800/50'>
            <h2 className='mb-4 text-2xl font-bold text-neutral-900 dark:text-white'>
              ¿Quieres comunicarte con nosotros?
            </h2>
            <p className='mx-auto mb-8 max-w-xl text-neutral-600 dark:text-neutral-400'>
              Ya sea para reportar una noticia, enviar una nota de prensa o
              conocer nuestras opciones de publicidad, nuestra sala de redacción
              está disponible para ti.
            </p>
            <Link
              href='/contacto'
              className='inline-flex items-center justify-center rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 hover:shadow-lg'
            >
              Contáctanos aquí
            </Link>
          </div>
        </article>
      </Container>
    </>
  )
}
