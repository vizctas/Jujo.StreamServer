# Consigna / Watchword — emparejamiento por palabras

**Fecha:** 2026-08-04
**Repos afectados:** Jujo.StreamServer, Jujo.StreamAdmin, Jujo.StreamClient
**Alcance de esta especificación:** solo emparejamiento local. La evolución a nube queda anotada pero no diseñada.

## Contexto

Emparejar por PIN obliga a teclear cuatro dígitos con un teclado en pantalla usando un D-pad. En Android TV y Chromecast eso es lento y frágil — en el Chromecast, además, el foco del teclado falla. Seleccionar palabras de una grilla es navegación nativa de control remoto: sin teclado, sin foco de texto, sin IME.

Este modo cambia *teclear un número* por *reconocer y ordenar palabras*, que es más rápido con control y más fácil de dictar en voz alta a alguien en otra habitación.

No reemplaza el emparejamiento por PIN ni el de nube: convive con ambos.

## Nombre

**Consigna** en español, **Watchword** en inglés. Ambos son el término para una palabra que prueba pertenencia. Identificador interno del protocolo: `watchword`.

## Parámetros

| Parámetro | Valor | Configurable |
|---|---|---|
| Palabras secretas (K) | 4 | 3–6 |
| Palabras mostradas (N) | 12 | `clamp(3K, 12, 15)` |
| Ventana por vuelta | 30 s | sí |
| Vueltas máximas | 3 | no |
| Combinaciones | 11.880 | — |

11.880 combinaciones (12×11×10×9) superan las 10.000 de un PIN de cuatro dígitos.

N nunca baja de 12 ni sube de 15: por debajo de 12 el espacio de búsqueda cae demasiado (con K=3 y N=9 serían 504 combinaciones, siete veces menos que un PIN), y por encima de 15 la grilla deja de ser cómoda con D-pad. Con K=4 quedan 8 señuelos.

| K | N | Combinaciones |
|---|---|---|
| 3 | 12 | 1.320 |
| 4 | 12 | 11.880 |
| 5 | 15 | 360.360 |
| 6 | 15 | 3.603.600 |

K=3 queda por debajo de un PIN y solo debe ofrecerse advirtiendo eso.

## Flujo

1. El usuario presiona *Consigna* en StreamAdmin.
2. El servidor genera 4 palabras secretas y 8 señuelos con CSPRNG, y llama a `request_otp(palabras_unidas, deviceName)`.
3. StreamAdmin muestra las 4 palabras numeradas y grandes, con anillo de cuenta regresiva de 30 s.
4. El usuario elige *Emparejar con Consigna* en el cliente. El cliente pide el desafío y recibe `{challengeId, 12 palabras barajadas}`.
5. El usuario selecciona 4 palabras en orden en una grilla 3×4. Cada selección se marca con su número.
6. Al completar la cuarta, el cliente calcula `hash(challengeId + salt + palabras_seleccionadas_unidas)` y lo envía como `otpauth`.
7. El servidor compara hashes. Coincidencia → dispositivo emparejado.

## Reutilización — lo que ya existe

El camino criptográfico está implementado y no requiere protocolo nuevo:

- `nvhttp::request_otp(passphrase, deviceName)` — [`src/nvhttp.cpp:3291`](../../../src/nvhttp.cpp) — genera el PIN, guarda la frase secreta y estampa el tiempo de creación.
- Validación `otpauth` — [`src/nvhttp.cpp:1767`](../../../src/nvhttp.cpp) — compara `hash(one_time_pin + salt + otp_passphrase)` y expira con `OTP_EXPIRE_DURATION`.
- `POST /api/otp` con parámetro `passphrase` — [`src/confighttp_auth.cpp:721`](../../../src/confighttp_auth.cpp).
- StreamAdmin ya consume ese endpoint: `PairingApi.generateOtp(passphrase, deviceName)` — `lib/core/api/services/pairing_api.dart:26`.

**Las cuatro palabras unidas son la `passphrase`.** El PIN de cuatro dígitos que ese flujo genera deja de ser secreto y pasa a ser el **identificador del desafío**: viaja abierto junto con las doce palabras. El secreto es *cuáles cuatro y en qué orden*.

Consecuencia importante: las palabras nunca viajan en claro, ni las secretas ni las seleccionadas. Solo viaja el hash con sal. Un fisgón en la LAN que capture todo el tráfico no obtiene las palabras.

`request_otp` exige `passphrase.size() >= 4`; cuatro palabras unidas lo cumplen con holgura.

## Trabajo nuevo

### Jujo.StreamServer

- Lista de palabras por idioma (~256 entradas), compilada en el binario.
- Selección de 4 secretas + 8 señuelos con CSPRNG. Existe `crypto::rand_alphabet`; hace falta un selector de índices equivalente. **No usar `rand()`.**
- Endpoint que entregue el conjunto barajado y el `challengeId`.
- Estado de penalización: contador de fallos, marca de bloqueo, número de vuelta, marca de congelado.
- Reglas de armado del desafío (ver *Lista de palabras*).

### Jujo.StreamAdmin

- Botón *Consigna* junto al emparejamiento por PIN existente.
- Panel con las 4 palabras numeradas, tipografía grande, anillo de cuenta regresiva.
- Aviso de intentos fallidos incluyendo la IP de origen.

### Jujo.StreamClient

Es el grueso del trabajo: **el cliente no tiene camino `otpauth` en absoluto** (`lib/services/pairing/pairing_service.dart` no menciona OTP).

- Nueva opción de modo en el diálogo de emparejamiento.
- Pantalla de grilla 3×4 navegable con D-pad, palabras grandes, marca numerada al seleccionar.
- B / atrás deselecciona la última palabra.
- Estados visibles: esperando, bloqueado con cuenta regresiva, palabras rotadas, éxito, error.
- Cálculo del hash y envío por el camino `otpauth`.

## Seguridad

Reglas en orden de importancia. Las tres primeras son las que sostienen el modo:

1. **Un solo desafío activo por servidor.** El diseño OTP actual ya lo impone: `one_time_pin`, `otp_passphrase` y `otp_device_name` son estáticos globales.
2. **El contador de fallos persiste entre rotaciones.** Si se reinicia al rotar, un atacante espera la rotación y sigue probando sin costo. Es el error más fácil de cometer aquí.
3. **Todo el conteo y bloqueo ocurre en el servidor.** Una penalización del lado del cliente la ignora cualquier cliente modificado, que es exactamente lo que usaría un atacante.
4. **El reloj se congela al primer toque del cliente**, con tope. Rotar a mitad de una selección legítima pierde el trabajo del usuario sin ganar seguridad, pero el congelado no puede ser indefinido: el cliente avisa al servidor que empezó a seleccionar, y un atacante podría usar ese aviso para mantener vivo el desafío para siempre. Reglas: solo el primer cliente que avisa congela, el congelado extiende la ventana **como máximo 60 s adicionales**, y agotado ese margen la vuelta expira igual que si nadie hubiera tocado.
5. Selección de palabras con CSPRNG.
6. El desafío queda ligado al certificado del cliente por el handshake de emparejamiento existente.

### Penalización

| Fallo | Consecuencia |
|---|---|
| 1º | Espera de 3 s |
| 2º | Espera de 10 s |
| 3º | Se descartan las palabras, StreamAdmin muestra un juego nuevo, se consume una vuelta |
| Vueltas agotadas | El desafío muere; hay que volver a StreamAdmin |

Rotar en vez de bloquear tiene una propiedad útil: el atacante pierde todo lo que había aprendido del conjunto anterior, mientras que el usuario legítimo recibe palabras frescas sin tener que caminar hasta la PC.

## Lista de palabras

Es lo que decide si el modo se siente pulido o molesto.

Criterios por palabra: dos o tres sílabas, legible a tres metros, sin ambigüedad de acentuación, sin carga ofensiva.

Reglas al armar un desafío:

- Ningún par confundible en el mismo conjunto (`CASA`/`CAZA`, `TORRE`/`TORRO`).
- Ninguna pareja que comparta las tres primeras letras.
- Los señuelos salen de la misma lista que las secretas, para que sean indistinguibles.

El servidor elige el idioma según su configuración y envía los **strings literales**. Así un StreamAdmin en español y un cliente en inglés muestran exactamente las mismas palabras; traducirlas rompería el emparejamiento.

El tamaño de la lista casi no afecta la seguridad, porque el atacante elige entre las doce visibles. Sirve para que nadie reconozca patrones entre sesiones.

## Riesgos asumidos

- **Shoulder surfing:** quien vea la pantalla de StreamAdmin puede emparejarse. Idéntico al PIN, ni mejor ni peor.
- **El conjunto de candidatos es público en la LAN:** cualquiera puede pedirlo. Es inherente al modo — el secreto es el orden, no la lista.
- **11.880 < emparejamiento por certificado.** Es un modo de conveniencia bien protegido, no el más fuerte del sistema. No debe presentarse como el más seguro.

## Puerta a la nube (fase 2, no incluida)

Basta con que la entrada del dispositivo registre con qué método se emparejó. El flag `cloud_paired` de `crypto::named_cert_t` ([`src/crypto.h`](../../../src/crypto.h)) es el lugar natural para extender esto.

Cuando se diseñe la fase dos: un dispositivo emparejado por Consigna contra un servidor que tiene cuenta podría ofrecerse para adopción desde StreamAdmin, convirtiendo el emparejamiento local en uno de nube sin repetir el proceso.

## Verificación

- Emparejar con las cuatro palabras correctas en orden → éxito.
- Palabras correctas en orden equivocado → fallo, y la espera correspondiente.
- Fallar tres veces → las palabras rotan en StreamAdmin y se consume una vuelta.
- Fallar tres veces, esperar la rotación, fallar otra vez → **la espera debe seguir escalando, no reiniciarse**. Es la regla más fácil de romper.
- Empezar a seleccionar y esperar más de 30 s → las palabras no rotan.
- Agotar las tres vueltas → el desafío muere y StreamAdmin lo indica.
- Pedir el desafío desde un segundo cliente mientras hay uno activo → rechazado.
- Capturar el tráfico durante un emparejamiento exitoso → las palabras no aparecen en claro.
- StreamAdmin en español con cliente en inglés → mismas palabras en ambos.
