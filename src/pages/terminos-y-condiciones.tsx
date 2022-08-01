import { NextPage } from 'next'

import { LegalPage } from '@components/index'

type LegalPageProps = {
  children: React.ReactNode
  title: string
}

const Index: NextPage<LegalPageProps> = () => {
  return (
    <LegalPage title='Términos y Condiciones'>
      <div className='text-sm'>
        <p>General</p>
        <br />
        <p>
          Si el usuario no acepta, de forma total, las Condiciones Generales de
          uso, las Políticas y los Términos Legales de esta página web, deberá
          abandonarla. En caso contrario, se entenderá que ha aceptado la
          aplicación de las mismas.
        </p>
        <br />
        <p>Cookies</p>
        <br />
        <p>
          Utilizamos cookies para almacenar y acceder a datos personales, como
          los datos de navegación, con fines tales como servir y personalizar el
          contenido y la publicidad y analizar el tráfico del sitio. Trabajamos
          en coordinación con un marco de la industria, señalando tus
          preferencias globalmente para todos los sitios web participantes.
        </p>
        <br />
        <p>Contenido</p>
        <br />
        <p>
          NOTICIASCOL.COM asegura suministrar servicio óptimo, a través de sus
          sistemas y empleados para mantener la integridad de los datos
          suministrados por el usuario de su página web. A tal efecto, ha
          contratado a expertos y servicios para la protección e integridad de
          los datos, sin que estos servicios estén bajo su control, los cuales
          son de la entera responsabilidad de las empresas que los prestan. Es
          responsabilidad del usuario solicitar la información que considere
          pertinente sobre los servicios de seguridad mencionados y sus
          proveedores.
        </p>
        <br />
        <p>
          NOTICIASCOL.COM no tiene control sobre información de seguridad del
          usuario, quien es en todo caso el único responsable por su pase, clave
          o contraseña y por cuenta de correrán cualesquiera consecuencias o
          efectos legales, derivados del uso de la máquina del usuario donde
          haya depositado su pase, clave o contraseña, quedando liberada
          NOTICIASCOL.COM de cualquier responsabilidad por el uso de la
          contraseña del usuario por cualquier tercero que tenga acceso a su
          máquina.
        </p>
        <br />
        <p>
          Limitación de Responsabilidad por Contenido («Servicios», «Secciones»
          y «Revistas»)
        </p>
        <br />
        <p>
          NOTICIASCOL.COM, suministra al usuario información variada a través de
          los diversos «Servicios», «Secciones» y Revistas», tal y como estas
          secciones son desplegadas en la pagina principal o de entrada
          («Homepage») de su Página web. Las informaciones aparecidas en estas
          secciones pueden ser suministradas por terceros por lo cual
          NOTICIASCOL.COM no se hace responsable por la exactitud o fidelidad de
          las mismas. Las declaraciones y conceptos emitidos en las entrevistas
          y artículos de opinión son de la exclusiva responsabilidad de sus
          autores, Los eventos o acontecimientos reseñados son solo una
          referencia sin que NOTICIASCOL.COM tenga responsabilidad alguna por
          decisiones que los usuarios adopten dependiendo de dicha información.
          Tampoco se hace responsable por la exactitud de horarios y lugares
          indicados en dichas secciones los cuales son de la exclusiva
          responsabilidad de sus proveedores.
        </p>
        <br />
        <p>Limitación de Responsabilidad por Virus</p>
        <br />
        <p>
          El usuario de esta página entiende y acepta que NOTICIASCOL.COM no
          garantiza en forma alguna que los archivos de textos o gráficos
          disponibles para descarga del usuario, según lo previsto en estos
          avisos, estarán libres de virus, caballos de Troya u códigos de
          carácter contaminante y destructivo; el usuario es responsable en
          adoptar las medidas y chequeos suficientes para garantizar la
          exactitud de la información descargada de esta página, así como es
          responsable por el mantenimiento de cualquier medio reconstructivo de
          información, en caso de perdida de la misma.
        </p>
        <br />
        <p>Derechos de Autor</p>
        <br />
        <p>
          Es la política de NOTICIASCOL.COM, el respeto de los derechos de
          autor. El usuario de esta página debe presumir y así lo acepta, que
          todas y cada una de las secciones, nombres, textos, frases, fotos,
          videos y grabaciones están protegidos por derechos de autor, a menos
          que se establezca lo contrario en estos mismos avisos o en la propia
          página web. Por lo tanto, el contenido de los mismos no podrá ser
          usado ni total ni parcialmente sin el consentimiento escrito dado por
          NOTICIASCOL.COM , o de los propietarios de dicho contenidos.
        </p>
        <br />
        <p>
          Todo el contenido de esta página principal o en las vinculadas de
          forma interna, incluyendo textos, logotipos, íconos, vídeo, audio y
          programas de computación son propiedad del NOTICIASCOL.COM, o esta
          última empresa ha sido debidamente licenciada para su uso.
        </p>
        <br />
        <p>
          Si usted considera que sus derechos de autor han sido lesionados de
          alguna forma por NOTICIASCOL.COM, sírvase enviar un mensaje al
          webmaster de la misma.
        </p>
        <br />
        <p>
          Las marcas comerciales que aparecen en esta página web pertenecen a
          NOTICIASCOL.COM, y los mismas han sido debidamente registradas por la
          misma, quedando estrictamente prohibido su uso no autorizado por parte
          de terceros usuarios. NOTICIASCOL.COM se reserva el derecho a intentar
          las acciones legales que considere convenientes para hacer valer sus
          derechos tanto en Venezuela como en el Extranjero.
        </p>
        <br />
        <p>Uso de Hipervinculos («Links»)</p>
        <br />
        <p>
          Como se menciona en las Condiciones de Uso, esta página web contiene o
          podrá contener vínculos o «links» a otras páginas web operadas por
          personas naturales o jurídicas distintas a NOTICIASCOL.COM. Se reitera
          que dichos vínculos han sido suministrados única y exclusivamente para
          la comodidad de sus usuarios.NOTICIASCOL.COM, no ha investigado ni
          está informada del contenido, origen u operación de las páginas a que
          refieren los vínculos y por tal razón está exenta de responsabilidad
          por el contenido y procedimientos usados en dichas páginas y el uso
          que terceros pueden hacer de las mismas, aún si han accedido a ellas a
          través de esta página web, siendo dicho uso por única y exclusiva
          cuenta y riesgo del usuario.
        </p>
        <br />
        <p>
          Queda terminantemente prohibido, dentro de esta página web, la
          publicación, transmisión o descarga o vínculo («link») de cualquier
          material de contenido vulgar, obsceno, ilegal u ofensivo en cualquier
          forma, so pena de ser removido del sistema y ser sometido a las
          acciones legales aplicables.
        </p>
        <br />
        <p>Artículos de Opinión</p>
        <br />
        <p>
          Los Artículos de Opinión son de la entera responsabilidad de sus
          autores. NOTICIASCOL.COM no respalda punto de vista alguno plasmado en
          dichos artículos.
        </p>
        <br />
        <p>Avisos Clasificados</p>
        <br />
        <p>
          El usuario coloca su aviso clasificado a su propio riesgo y
          responsabilidad, NOTICIASCOL.COM, no garantiza de forma alguna la
          veracidad de la información colocada por los usuarios en esta sección
          de clasificados, siendo de la entera responsabilidad de la parte
          interesada, hacer las averiguaciones correspondientes sobre el origen,
          la propiedad, las características, condición y buen funcionamiento de
          los artículos y/o servicios ofrecidos en los clasificados. En tal
          sentido,NOTICIASCOL.COM, no es responsable ni garantiza de forma
          alguna la titularidad, disponibilidad y/o legalidad de los bienes y/o
          servicios colocados en la sección, siendo de la responsabilidad del
          usuario, contactar al ofertante del bien/yo/servicio y verificar
          cualquier información El usuario declara estar de acuerdo con lo antes
          mencionado y exonera a NOTICIASCOL.COM de cualquier responsabilidad
          legal que pudiera derivarse de transacciones originadas e este sitio
          web.NOTICIASCOL.COM tampoco se hace responsable por las
          características de los bienes colocados para la venta por los
          usuarios. Dicha información es colocada en línea en la forma en que ha
          sido suministrada por el usuario y por lo tanto puede no coincidir con
          las características actuales del bien.
        </p>
        <br />
        <p>Notificaciones</p>
        <br />
        <p>
          NOTICIASCOL.COM podrá notificar válidamente a los usuarios de su
          página web sobre cualquier tema relacionado con el servicio que presta
          a través de cualquier sección de dicha página, por medio de email, en
          caso de ser disponible o a través de la dirección del usuario en poder
          de NOTICIASCOL.COM, a la libre elección de NOTICIASCOL.COM.
        </p>
        <br />
        <p>Ley Aplicable</p>
        <br />
        <p>
          Las condiciones de uso y políticas de esta página web se interpretaran
          en todas sus partes por las leyes de la República Bolivariana de
          Venezuela.
        </p>
        <br />
        <p>Domicilio Legal</p>
        <br />
        <p>
          Para todos los efectos legales derivados del uso de esta página web,
          se elige como domicilio a la Ciudad de Maracaibo, Venezuela, a la
          Jurisdicción de cuyos tribunales declaran las partes someterse.
        </p>
      </div>
    </LegalPage>
  )
}

export default Index
