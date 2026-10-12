# Butterpollo: revisión y adopción incremental

Estado: análisis completo; lotes 1 y 2A implementados y compilados Release, 51 pruebas verdes (concurrencia repetida 20 veces). Ejecutable más reciente en el informe 2A; no desplegado al servicio.

Referencia fijada: [Butterpollo f306a8fdf5e52140614021cd0c2b382eae60550b](https://github.com/RamazanKara/Butterpollo/tree/f306a8fdf5e52140614021cd0c2b382eae60550b), main, notas 2.0.0-rc.14. Jujo parte de `d3cf4fa9`, con correcciones de pacing/FEC pendientes en el árbol. Se conservan. El README servido por la web aún describía rc.10: prevalecen checkout y SHA, no el índice web.

Diseño: adaptar políticas pequeñas al C++ existente, con pruebas independientes y contratos de protocolo intactos. Alternativas descartadas para este lote: importar todo el C++ histórico (incluye eliminaciones de funciones que usamos) o sustituir el host por Rust (reescritura, incompatible con el alcance). No importar instalador, servicio, consola Svelte ni control de cuentas.

## Mapa de módulos y orden

| Prioridad / estado | Origen Butterpollo | Destino Jujo y adaptación | Criterio para activar |
|---|---|---|---|
| 1 — implementado | `src/input_batch.{h,cpp}`, batching de `src/input.cpp` | Extraer nuestras funciones existentes a módulo comprobable; corregir overflow de ratón y scroll; mover primer paquete y leer candidatos por referencia | 13 tests verdes: límites signed16, sin cambios parciales, barreras de clic, mando/touch y conservación de ráfagas |
| 1 — implementado | `src/platform/windows/audio.cpp`, GetDevicePeriod | Corregir unidades 100 ns → ms, redondear arriba, espera mínima 1 ms, comprobar HRESULT; añadir límite finito al convertir a DWORD | 4 tests verdes: 0, negativos, fracciones, período típico, INT64_MAX; compilación Windows Release completa |
| 2A — implementado y compilado | `src/thread_safe.h`, controles en `src/video.cpp` | Estado atómico; `try_pop/try_view` explícitos; drenado que cede ante contención. Preservar adquisición de mutex en `pop(0)/view(0)` para RTSP | 21 tests pasan, repetidos 20 veces; regresiones y microbenchmark completos. CPU/p99 de streaming quedan para sesión real. [Detalle y entrega](butterpollo-batch2-queues-2026-10-06.md) |
| 2B — siguiente lote | Estadísticas de etapas en C++ y `rust/core/src/performance.rs` | Edad de captura, conversión, submit, encode y entrega; histogramas acotados, reporte por ventana | Sobrecoste medido, timestamps monotónicos, sin confundir render-to-decode con input-to-photon |
| 3 — condicionado | `src/platform/windows/display_wgc.cpp`, helper WGC; `rust/core/src/capture_policy.rs` | Primero sacar consultas de display de la ruta crítica si existen; luego medir copias y probar publicación alineada mediante opción | WGC/DDX, 30/60/120 FPS, fuente estática/irregular, HDR, cambio de monitor, UAC; propiedad de textura y fence antes de eliminar copias |
| 3 — condicionado | Packetización/FEC de `rust/core/src/packet.rs`, `network_pacing.rs` | Evaluar buffers finales directos y caché de coeficientes; conservar nuestro pacing 2× y piso con FEC | Paridad byte a byte, tamaños extremos, cifrado, pérdida, multicliente; benchmark Release contra nanors actual |
| 4 — experimental AMD | AMF nativo C++ histórico y `rust/windows/src/amf.rs` | Backend opcional junto a FFmpeg; extraer salida lista antes de esperar siguiente frame; conservar fallback | Host AMD real, RDNA2/3/4, AVC/HEVC/AV1, HDR/rango, IDR con cabeceras, reconexión; no forzar cola=1 |
| 5 — investigación AMD | `rust/windows/src/compute.rs`, `amf_gpu.rs`, `capture.rs` | Prototipo D3D12 copy/compute con texturas propias, fences por frame y fallback D3D11 | Ganancia A/B bajo carga; sin liberar texturas en vuelo; timeout/recovery; no elevar prioridad GPU a realtime |
| Fuera del lote | PyroWave, reescritura Rust, instalador/updater | No incorporar ahora: nuevo codec/decoder y gran ancho de banda o reemplazo del producto | Proyecto explícito aparte; nuestro cliente Android/TV actual no tiene ese decoder |

Hardware local detectado: RTX 3070 y SudoMaker Virtual Display Adapter. No hay AMD para validar sus rutas. Los cambios genéricos de input y audio benefician al host independientemente de GPU.

La tabla ordena incorporación: lotes 1 y 2A incluidos en código; métricas 2B y prioridades 3–5 son trabajo posterior con puertas de validación, no funcionalidades ya entregadas.

## Lo que ya tenemos y lo que no conviene copiar

- Jujo ya entrega la textura compartida del helper a la ruta WGC VRAM (`display_wgc_ipc_vram_t::snapshot/acquire_next_frame`), con handles estables. No trasladar la afirmación histórica de «tres copias» a nuestra ruta: el `CopyResource` visible al final del archivo corresponde a la ruta RAM. Revisar fences/vida útil y medir antes de eliminar otra copia.
- Nuestro helper configura `MinUpdateInterval=1 ms` cuando la propiedad existe. Butterpollo usa cero y una predicción de cadencia con guardas; estudiar como opción independiente. Su predictor solo aplica con historia estable y se retira ante fuente lenta/irregular/estática. No introducir una espera fija para todos los frames.
- El control Jujo espera con `enet_host_service`, que despierta al llegar tráfico. El cambio Rust «Handle input the moment it arrives» elimina su propio sleep fijo de 1 ms: no demuestra que nuestro input espere esos 1 ms. Nuestro intervalo idle de 150 ms sí merece revisar latencia de feedback/rumble, separadamente de la recepción de input y de la protección rumble del cliente.
- Jujo ya desactiva key repeat si el delay es cero; la corrección Rust rc.12 de teclas duplicadas no se porta aquí. Tampoco se reemplaza ViGEm/VHF, Steam, Playnite ni recuperación de displays por lo que eliminó el fork C++.
- Nuestro pacer ya usa 2× bitrate y contempla bytes/paridad. Conservarlo: no adoptar indiscriminadamente un límite alto pensado para LAN ni atribuirle las ganancias de otro escenario.
- FEC Rust sí presenta una idea independiente del lenguaje: tablas GF por nibbles y procesamiento AVX2 de cuatro filas de paridad reutilizando las cargas, con fallback SSSE3/escalar. Evaluar contra nuestro `rswrapper.c`/nanors; la publicación compara contra una revisión concreta y no basta para dar por ganada nuestra CPU. La packetización directa es otra optimización, verificable por separado.

Mejoras sobre una copia literal: pruebas a través de la cola real extraída (`take_batch`), conservación de movimiento antes/después de clics, overflow sin pérdida del paquete pendiente y conversión de audio saturada por debajo de `INFINITE`. No se cambia la política de botones, el envío al SO, los permisos ni la planificación del worker.

## Evidencia y cautelas

El host publicado actualmente es Rust; `src/` C++ es referencia histórica. Las correcciones recientes de input duplicado y recuperación de encoder en Rust no prueban que Jujo tenga los mismos fallos. Revisar cada ruta antes de portar.

Butterpollo publica 96,4 → 42,4 ms de edad render-to-decode frente a Vibepollo 2.0 bajo carga y 41,0 → 33,5 ms al alternar compute dentro del mismo host; RX 7900 XT, DDX, 1080p60 HEVC HDR y loopback. Son mediciones del autor, no nuestras ni input-to-photon. La segunda comparación aísla compute; no atribuir todo el 56% a D3D12. Sus pruebas WGC utilizan otro escenario. Ver [registro de rendimiento](https://github.com/RamazanKara/Butterpollo/blob/f306a8fdf5e52140614021cd0c2b382eae60550b/rust/PERFORMANCE.md).

Las notas rc.14 corrigen precisamente vida útil de texturas, errores AMF y prioridad realtime introducidos en esa evolución. No adoptar las versiones antiguas inseguras ni generalizar resultados AMD a NVIDIA/Intel.

Defectos confirmados por inspección en Jujo: cuatro condiciones `!__builtin_add_overflow` invertidas; copia del vector de cada candidato dentro del lock; `GetDevicePeriod` sin revisar HRESULT y división por 1000 en lugar de 10000. La espera de audio es un timeout: el evento puede despertar antes. Corregirla no equivale a reducir diez veces la latencia audible.

## Validación y entrega

Esta sección conserva la entrega del lote 1. La más reciente está en [lote 2B e instalación](butterpollo-batch2b-delivery-2026-10-06.md); conserva también las mejoras del [lote 2A](butterpollo-batch2-queues-2026-10-06.md#artefacto-y-siguiente-paso).

1. Completo: extracción inicial conserva comportamiento. Tests de input y audio fallan antes de corregir; evidencia `tests-red.log`.
2. Completo: 13 tests de input (9 de mensajes y 4 de cola). Una ráfaga de 1000 mensajes `(1,-1)` termina en `(1000,-1000)` sin copiar el almacenamiento del primer paquete. Es prueba funcional, no benchmark input-to-photon.
3. Completo: 4 tests de audio. 100000 unidades equivalen a 10 ms, antes 100 ms; el evento sigue despertando antes del timeout. HRESULT de dispositivo inválido retorna error de inicialización; ese camino se verifica por compilación/revisión, no por un dispositivo WASAPI simulado.
4. Completo: ocho tests de pacing, tres ABR y dos de colas. Total 30 tests pasan. CTest agrupa input/audio/pacing en tres ejecutables; ABR/colas se ejecutan directamente. Cobertura vieja de gcov emitió un aviso al cambiar las pruebas; ejecución verde usa directorio de cobertura separado.
5. Completo: compilación Release y copia del artefacto final; manifiesto de fuentes verificado antes y después. Binario previo guardado en `.private/butterpollo-20261006/sunshine-before.exe`. No se sustituyó el servicio activo. El build muestra warnings en código existente de TOML y display helper, sin errores; `git diff --check` pasa.

| Artefacto | SHA-256 |
|---|---|
| `build-ninja/sunshine.exe` y `.private/butterpollo-20261006/sunshine-input-audio.exe` | `99D3B011EB640C94986C734BFAF7C6CFA58410F996518E5336DC237129863423` |
| `.private/butterpollo-20261006/sunshine-before.exe` (lote pacing previo preparado) | `6CE1F0C29F16AD74CF32CC63C1532F1EBAA9B60F1515C3D2C0418AD113A21AE0` |

El nuevo ejecutable incluye las correcciones de pacing que ya estaban pendientes al iniciar esta revisión. No es un instalador autónomo ni una copia del ejecutable actualmente instalado. Para la siguiente entrega del servidor: confirmar sesión inactiva, conservar binario/configuración instalados y verificar compatibilidad de los componentes acompañantes. Falta validación de streaming real, cambio de dispositivo de audio y precisión percibida; no se afirma una reducción medida de input-to-photon.

Revisión de extracción: comparación automática contra `HEAD:src/input.cpp` confirma que las funciones movidas son idénticas, excepto las cuatro negaciones eliminadas. El resto del cambio separa el vaciado de la cola para ejercitar exactamente la función utilizada por producción.

Reproducir con los árboles CMake existentes y `C:\msys64\ucrt64\bin` en PATH:

```powershell
cmake --build build-ninja-tests --target test_input_batch test_audio_capture_timing test_stream_pacing test_abr_network_health test_bounded_queue -j 4
ctest --test-dir build-ninja-tests/tests -R '^(input_batch|audio_capture_timing|stream_pacing)$' --output-on-failure
.\build-ninja-tests\tests\test_abr_network_health.exe
.\build-ninja-tests\tests\test_bounded_queue.exe
cmake --build build-ninja --target sunshine -j 4
```

Logs, copia previa, manifiesto SHA-256 del código y artefacto final: `.private/butterpollo-20261006/`. No se ejecuta Butterpollo ni su instalador; checkout de referencia separado en `Jujo.StreamAdmin/.private/Butterpollo-review/`. La política rumble del cliente mantiene SHA-256 `542D8857E7612AB7337E64834D20F79079705FE79AFC987D3FFEFFA721344AE0`.

Fuentes de API: [GCC overflow](https://gcc.gnu.org/onlinedocs/gcc/Integer-Overflow-Builtins.html), [Microsoft GetDevicePeriod](https://learn.microsoft.com/en-us/windows/win32/api/audioclient/nf-audioclient-iaudioclient-getdeviceperiod). Context7 no está disponible en esta sesión; se consultó documentación primaria directamente.

Procedencia: Sunshine/Apollo/Vibepollo/Butterpollo y Jujo usan GPL-3.0. Las funciones de batching ya existen en Jujo; la corrección y extracción siguen el patrón de Butterpollo, conservando atribución aquí. No se ha importado código de sus SDK o dependencias de terceros.
