# Lote 2B: métricas de etapas e instalación

Estado: implementado e instalado el 2026-10-06. Verificados servidor y ambos clientes ADB conectados.

Diseño: correlación acotada por frame ID dentro de cada encoder. Solo registrar entrada real con timestamp de captura; consumir las marcas una vez al recibir ese frame, incluso si FFmpeg entrega otro PTS más tarde. Los frames repetidos, placeholders o sin correlación cuentan como no trazados, sin inventar latencia. No modificar timestamps del protocolo ni decisiones del encoder.

Etapas: captura→entrada a conversión (edad de origen, no tiempo de ejecución de captura), llamada de conversión, conversión→submit, submit→salida (incluye esperas del backend, no solo GPU), cola de salida, FEC acumulado por frame y envío con pacing. Total captura→fin del envío del host no incluye red remota, decoder ni pantalla.

Ventanas: últimas 512 muestras por etapa; máximo y cuenta de toda la ventana. Informe INFO como máximo cada 10 segundos por instancia de encoder, exclusivamente desde hilo de broadcast. Estado compartido mantiene su vida mientras queden paquetes; tracker solo se toca desde encoder. Percentiles exactos del subconjunto retenido; no etiquetarlos como percentiles de todos los frames del intervalo.

| Paso | Estado |
|---|---|
| Clientes conectados y firma APK | Completo: Fire TV ya tiene DirectFire actual; Chromecast actualizado con Play y hash instalado confirmado. Ambos 1.1.27 (28) |
| Correlación, percentiles y pruebas de casos límite | Completo: 11 pruebas nuevas, incluidas salidas tardías, duplicados, capacidad, aislamiento, orden temporal y reinicio de ventanas |
| Instrumentar rutas FFmpeg/NVENC y broadcast | Completo; conversión asíncrona/síncrona, PTS real de salida y consumo único de trazas |
| Tests, coste y compilación Release | Completo: 62 tests pasan, Release GCC 16.1 termina sin errores, manifiesto de fuentes y diff verificados |
| Copia del servidor instalado, reemplazo y verificación | Completo: elevación normal UAC, instalación exitosa, servicio Running, proceso nuevo, HTTP disponible y hash confirmado |

El instalador local existente también repara la biblioteca de juegos; esta entrega debe limitarse al ejecutable y conservar configuración. Preparar un reemplazo con backup, hash y rollback antes de elevar. No alterar permisos ni eludir UAC. Confirmar actividad de streaming y avisar del reinicio al instalar.

Coste local sintético: 1.000.000 frames, 348 ns medios por registro completo (tracker, nueve lecturas de reloj y acumuladores), cero trazas inválidas. Ocho resúmenes de 512 muestras: 25,33 microsegundos medios; se calculan como máximo cada 10 segundos. No incluye formato/escritura del log, contención real ni carga GPU. Estado fijo por encoder: 32.944 bytes de ventanas y 3.640 bytes de tracker en este compilador. Evidencia `.private/butterpollo-metrics-bench.cpp` y `.log`.

`send` abarca procesamiento del host desde dequeue hasta terminar los intentos de envío, incluido pacing y FEC. `fec` es un subconjunto y no debe sumarse de nuevo. No implica recepción por el cliente. Los percentiles son de las últimas 512 muestras válidas; `max` y `count` cubren todo el intervalo. Logs `Pipeline stages` en INFO, sin identificadores personales. La ruta de broadcast instrumentada es GameStream; no se presenta como medición de WebRTC.

Despliegue preparado en `scripts/install-verified-server-binary.ps1`: valida hashes, ruta exacta del servicio y servidor libre; conserva binario/configuración bajo Program Files; reemplaza solo `sunshine.exe`; comprueba HTTP y proceso; restaura el binario ante fallo. Validación sin cambios y análisis sintáctico pasan. Binario instalado previo SHA-256: `251C980ED06B690B736F5A547ACF4DB54ED98E354A4FCD972426D2C4C99E94A3`.

Clientes: DirectFire SHA-256 `38B9B813E0A300CF3AAE9F68EFDAC6C421E617E6251B3F569E4377C342556B84`; Play SHA-256 `2D79AE8D8E9D6E5A244852B16A131450D11BE7B0FE021FD3F8BDD2B0EA435FFE`. Chromecast conserva datos/primera instalación; backup APK en `Jujo.StreamClient/.private/butterpollo-deploy-20261006/chromecast-before.apk`. No se lanzaron aplicaciones. Precisión percibida, estabilidad prolongada y métricas en streaming real siguen pendientes de observación.

Artefacto final: `.private/butterpollo-batch2b-20261006/sunshine-pipeline.exe`, SHA-256 `9D36C1D15C9B7FE6FCA3F141338C5A6880AC5FE415F11570AFDBD0424CF70AC8`. Incluye los lotes anteriores de pacing, batching de input, temporización WASAPI y colas. Las importaciones PE son bibliotecas de Windows; no requiere reemplazar DLL adicionales. Los warnings de compilación pertenecen a TOML/display helper no modificados. Evidencia y manifiesto del código junto al ejecutable.

Instalación real: `C:\Program Files\Jujo.Stream Server\sunshine.exe` coincide con ese SHA-256; versión reportada 1.0.36. Servicio `Jujo.Server` reiniciado, proceso nuevo PID 20916, respuesta `SUNSHINE_SERVER_FREE` / juego 0. Backup real del binario anterior y configuración: `C:\Program Files\Jujo.Stream Server\rollback-20261006-233725-477`. Registro de instalación `installation.json` junto al artefacto: success=true, rolledBack=false. Hashes de `sunshine.conf`, `apps.toml` y `rbac_clients.json` idénticos al backup.

Arranque confirmado en `config/logs/sunshine-20261006-233731-760.log`: H.264/HEVC NVENC disponibles. Aparecen el 404 del comprobador GitHub y los intentos de AV1 no soportado; los mismos mensajes y fallo de limpieza NVENC ya estaban en el arranque previo del 2026-10-03. No se atribuyen a este lote ni se declara un arranque sin errores. No hay sesión real todavía para validar las métricas nuevas o prometer una mejora perceptual.

Siguiente paso: observar una sesión normal con los clientes actualizados y recoger `Pipeline stages` antes de decidir cambios GPU, FEC o política de encoder. No activar optimizaciones adicionales sin esa evidencia.
