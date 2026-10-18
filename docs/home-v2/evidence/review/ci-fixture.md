# Fixture publicitario independiente del entorno

La primera [ejecución de CI](https://github.com/antekera/ncol-next/actions/runs/39107603914) tuvo cuatro fallos en `useAds-loading`: sin las variables públicas del servicio, el hook devolvía correctamente cero anuncios y las pruebas nunca ejercían la carga que pretendían verificar. El entorno local con `.env` había ocultado esa dependencia. No era un fallo del servicio ni una razón para añadir credenciales a GitHub.

El fixture configura temporalmente una URL `.invalid` y una clave ficticia antes de evaluar el módulo real mediante `jest.requireActual`; restaura ambas variables inmediatamente. Todos los HTTP siguen simulados y el hook no se sustituye por una implementación falsa. La prueba de respuesta fallida exige además que la petición se haya realizado: un guard de configuración ya no puede hacerla pasar por accidente. No hay cambio de runtime, SDK, servicio, esquema, credencial o dependencia.

Con **ambas variables vacías**, pasan los cinco casos específicos y las 160 suites/789 pruebas/15 snapshots; lint y tipos pasan. La nueva ejecución remota se comprobará tras el push. No se repiten build o pruebas de navegador: solo cambia este fixture, manteniendo intacto el build de aplicación `6601bb1` medido por Lighthouse. [Resultados y hashes](ci-fixture.json).
