# Lote 2A: consultas de colas y eventos sin bloquear vídeo

Estado: implementado y compilado Release; 21 pruebas de concurrencia (20 repeticiones) y 30 regresiones pasan. Microbenchmark completado. Binario preparado, no instalado en el servicio. Continúa `butterpollo-adoption-2026-10-06.md`. Se conservan los cambios previos de pacing, input y audio.

Alcance: `safe::event_t`, `safe::queue_t` y consumo de controles/contextos en vídeo. No cambiar capacidad ni descarte de colas, API de red, codec, captura GPU, rumble ni servicio instalado. Métricas por etapas quedan como lote 2B.

Diseño adaptado de Butterpollo `f306a8fdf5e52140614021cd0c2b382eae60550b/src/thread_safe.h`:

- Publicar estado empty/ready/stopped en un único atómico; `peek/running` no acceden al payload mutable. El mutex sigue protegiendo construcción, copia y consumo.
- Añadir `try_pop()` y `try_view()` explícitos para declinar un mutex ocupado y reintentar en otro ciclo. No cambiar la adquisición de mutex de `pop(0)`/`view(0)`: RTSP usa esas operaciones para caducidad y reserva de sesión sin reintento periódico. Esta diferencia deliberada evita una regresión de una importación literal.
- Drenar controles hasta el primer intento no disponible; no girar sobre `peek=true`. Consumir IDR con un intento, conservándolo si hay contención.
- Conservar espera bloqueante, stop/reset, eventos booleanos y de puntero, FIFO, telemetría de overflow y acceso unsafe exclusivamente con propiedad externa (sus usos actuales son limpieza tras stop).

Alternativas: bloquear `peek` arreglaría la carrera pero introduciría espera en cada frame; cambiar todos los `pop(0)` simplificaría el código pero arriesga RTSP; un mailbox sin mutex sería un cambio de arquitectura. Se elige estado atómico y API de intento separada.

| Paso | Estado / aceptación |
|---|---|
| Reproducir contención | Completo: cinco tests fallan con la implementación anterior; otro reproduce spin en el drenado. Hilos liberados aun al fallar |
| Corregir publicación y consultas | Completo: estado consistente tras raise/pop/view/stop/reset; payload protegido; excepciones de construcción no dejan ready incorrecto |
| Integrar vídeo | Completo: RFI sale al declinar bloqueo; IDR se consume con intento en ambas rutas; admisión de contextos y vaciado de imágenes utilizan try_pop |
| Regresiones | Completo: 21 pruebas de concurrencia, repetidas 20 veces (420 ejecuciones), y 30 regresiones; bloqueantes, RTSP pop/view de cero, FIFO, bool/punteros y overflow |
| Evidencia de coste | Completo: tres comparaciones alternadas con GCC -O3; resultados y límites abajo. Sin medición de CPU del host durante streaming |
| Entrega | Completo: compilación Release, hashes, binario previo y plan actualizado; sin reiniciar servidor |

Fuentes: checkout fijado en `Jujo.StreamAdmin/.private/Butterpollo-review/`. No se ejecuta código del fork. Tests y logs de este lote en `.private/butterpollo-batch2-20261006/`.

Detalles de revisión:

- La prueba de drenado llama al mismo `video::drain_control_events` utilizado por producción; con `while(peek)` giraba durante toda la pausa del productor, con `while(try_pop)` regresa sin consumir la actualización pendiente. La siguiente llamada recibe el último valor, como exige el evento coalescente existente.
- Una prueba pausa al lector mientras copia el payload: el sondeo también debe declinar ese mutex. `try_view` evita esperar el mutex; la copia del payload, si consigue el bloqueo, conserva su coste propio.
- Las esperas temporizadas usan predicado para no reiniciar el plazo ante despertares espurios; los timeouts existentes siguen empezando después de adquirir el mutex. No se promete un límite de tiempo global para las APIs bloqueantes.
- `peek` es indicativo, nunca reserva un elemento. Acceder a payload o al vector sigue requiriendo mutex. Los usos de `unsafe()` actuales iteran durante limpieza tras stop y no se modifican.
- No se importan generaciones, registro de mailboxes, nuevos tamaños de cola ni política de backpressure de Butterpollo.

Validación reproducible (PATH incluye `C:\msys64\ucrt64\bin`):

```powershell
cmake --build build-ninja-tests --target test_thread_safe test_bounded_queue test_abr_network_health test_input_batch test_audio_capture_timing test_stream_pacing -j 4
ctest --test-dir build-ninja-tests/tests --output-on-failure
.\build-ninja-tests\tests\test_bounded_queue.exe
.\build-ninja-tests\tests\test_abr_network_health.exe
.\build-ninja-tests\tests\test_thread_safe.exe --gtest_repeat=20
cmake --build build-ninja --target sunshine -j 4
```

Son pruebas Windows de contratos y contención. No se ejecutó ThreadSanitizer ni una sesión de juego; la ausencia de accesos sin sincronizar en `peek/running` se revisó en código. Las pruebas de cierre verifican tanto hilos que esperan como llamadas que encuentran el estado ya detenido, según el orden del scheduler.

## Microbenchmark y límites

Proceso aislado, sin iniciar servidor ni temporización de sesión; `g++ -std=c++23 -O3`, mismo ejecutable fuente para ambos headers. Baseline: header anterior con un wrapper `try_pop -> pop(0)`; nuevo: intento explícito. Tres rondas, orden before/after, after/before, before/after. 200 muestras de evento vacío (20 warmup), 20000 por los otros escenarios (100 warmup). La construcción de un dato listo está fuera del intervalo medido. Checksums iguales. Fuente y seis CSV quedan junto a los logs.

| Consulta | p50 anterior | p99 anterior | p50 nuevo | p99 nuevo |
|---|---|---|---|---|
| Evento vacío | 15,5361–15,7132 ms | 30,6375–31,4378 ms | Bajo resolución | 100 ns |
| Cola vacía | Bajo resolución | 100 ns | Bajo resolución | 100 ns |
| Evento con dato | Bajo resolución | 100 ns | Bajo resolución | 100 ns |
| Cola con dato | Bajo resolución | 100 ns | Bajo resolución | 100 ns |

El reloj cuantiza en pasos de 100 ns; p50 registrado como cero **no significa coste cero**. La prueba detecta la cesión del scheduler por `event.pop(0)` vacío, no una mejora de 15 ms en cada frame: el host puede tener otra resolución de temporizador y la ruta anterior normalmente comprobaba `peek` antes. El cambio evita esa espera cuando hay carreras y evita adquirir un mutex ocupado. No aparece penalización de p99 resoluble en consultas listas dentro de este ensayo; no se extrapola a CPU total, GPU o input-to-photon. El primer piloto, demasiado largo en la ruta antigua, fue detenido y sustituido por el muestreo acotado descrito; no se utilizan resultados parciales.

Compilar benchmark desde la raíz (el `-iquote src` evita que `src/process.h` sustituya el header del sistema):

```powershell
g++ -std=c++23 -O3 -DNOMINMAX -DBASELINE -I. -iquote src .private/butterpollo-batch2-20261006/mailbox_bench.cpp -o .private/butterpollo-batch2-20261006/bench-before.exe
g++ -std=c++23 -O3 -DNOMINMAX -I. -iquote src .private/butterpollo-batch2-20261006/mailbox_bench.cpp -o .private/butterpollo-batch2-20261006/bench-after.exe
```

## Artefacto y siguiente paso

| Artefacto | SHA-256 |
|---|---|
| `.private/butterpollo-batch2-20261006/sunshine-queues.exe` | `0CC52D2A4FE5A78A725B4DF0D31F138200A7E5A84A39451C0B068E424CB27E1D` |
| `.private/butterpollo-batch2-20261006/sunshine-before.exe` (lote 1 preparado) | `99D3B011EB640C94986C734BFAF7C6CFA58410F996518E5336DC237129863423` |

El manifiesto de fuentes coincide con lo compilado. `git diff --check` pasa. El build mantiene warnings en código no modificado de TOML/display helper, sin errores. No se cambió cliente ni se instaló/reinició servidor; el binario incorpora también los lotes anteriores pendientes. La copia anterior es un artefacto preparado, no un backup del servicio instalado.

Próximo lote 2B: ventanas acotadas de tiempos por etapa y edad del frame, con sobrecoste medido. Antes de activar cambios GPU/FEC, medir una sesión real; comparar CPU, p99 de etapas, frames únicos, recuperación y estabilidad, sin mezclar latencia del host con presentación en el cliente.
