# Plan de acción y condiciones de trabajo

**Para cualquier agente (Grok, Cursor, OpenCode, etc.): lee este archivo antes de editar.**

Idioma del equipo: español. Código e identificadores: inglés.

---

## 1. Clean Code

El código se escribe para humanos. Una persona ajena al repo debe entenderlo sin que le expliquen el contexto.

- Nombres descriptivos: `getUserById`, no `u`, `data`, `tmp`, `x`.
- Funciones cortas, un propósito. Si el nombre necesita “y”, parte la función.
- Sin magia: nada de números, URLs, keys o flags sueltos en el cuerpo. Van a constantes o config.
- Comentarios solo cuando el *por qué* no se ve en el código. Nunca narrar el *qué*.
- No dejes código muerto, TODOs eternos ni archivos “por si acaso”.

## 2. Clean Architecture

La estructura debe explicar el sistema. Si hay que adivinar “dónde va esto”, está mal.

- Capas o módulos con responsabilidad clara (UI, dominio, datos, infra). No mezclar.
- Dependencias hacia adentro: la UI no habla con la base/API cruda; pasa por una capa intermedia.
- Nada hardcodeado: rutas, endpoints, textos de negocio, límites y secrets viven en config o env.
- Un concepto = un lugar. Si dos archivos hacen lo mismo, unifica.
- Antes de crear un archivo o carpeta, que el nombre diga qué contiene.

## 3. Consultar antes de actuar

Si hay una idea, un supuesto o más de un camino: **pregunta. No implementes.**

Consulta cuando:

- El alcance no está cerrado.
- Hay que crear archivos, dependencias o cambiar estructura.
- Vas a refactorizar algo que no pediste.
- El requisito se puede interpretar de dos formas.

Formato de consulta (corto):

1. Qué viste / qué falta.
2. Opciones (máximo 2–3).
3. Recomendación en una línea.
4. Esperar confirmación.

Excepción: el usuario ya dijo “haz X” de forma explícita y no hay ambigüedad. Entonces haz X, nada más.

## 4. Respuestas cortas

Pensar y codear puede tardar. Escribirle al usuario, no.

- Ir al grano. Sin preámbulos, sin recapitulaciones, sin relleno.
- Listas > párrafos. Una idea por viñeta.
- No expliques lo obvio del diff. Explica solo decisiones no evidentes.
- Si algo falló: qué pasó, qué vas a hacer. Sin ensayo.

## 5. Fases, commits y revisión

Las features se arman por fases. El agente no avanza solo.

**Ciclo**

1. **Plantear.** Se describe qué se va a hacer y por qué. Sin código todavía.
2. **Dividir.** Se parte en fases pequeñas, cada una con un resultado comprobable. Se espera OK del desarrollador.
3. **Ejecutar una fase.** Solo esa. Nada de la siguiente.
4. **Commit.** Al terminar la fase, commit descriptivo (qué y por qué, no “wip” ni “fix”).
5. **Revisión humana.** El desarrollador lee el código, corrige o pide correcciones.
6. **Siguiente fase.** Solo después de ese OK.

**Reglas**

- Una fase = un objetivo. Si no cabe en un commit claro, está mal partida.
- El listado vivo de fases va en `.ai/fases.md` cuando exista. El agente se guía por ese archivo.
- No mezclar fases en el mismo commit.
- Si la revisión pide cambios: se corrige, se commitea, y recién ahí se sigue.
- El agente no empieza la fase N+1 aunque “quede poco”.

---

## Cómo se usa este archivo

- Este directorio (`.ai/`) es la fuente de verdad para agentes.
- Condiciones nuevas o cambios de flujo se agregan aquí, no en chats sueltos.
- El orden de implementación está en `.ai/fases.md` (cuando exista).
- Si una instrucción del chat choca con este plan, **consulta** antes de seguir.
