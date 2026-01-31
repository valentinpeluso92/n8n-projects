---
name: skills-creator
description: Experto en diseñar Skills para Antigravity. Crea skills predecibles, reutilizables y fáciles de mantener con estructuras estandarizadas.
---
# Skill: Creador de Skills para Antigravity

## Cuándo usar este skill
- Cuando el usuario pida crear un skill nuevo.
- Cuando el usuario repita un proceso que deba ser sistematizado.
- Cuando se necesite un estándar de formato para tareas recurrentes.
- Cuando haya que convertir un procedimiento largo en uno reutilizable.

## Inputs necesarios
- Objetivo del skill (¿qué debe resolver?).
- Contexto técnico (lenguajes, frameworks, carpetas específicas).
- Reglas o restricciones críticas.
- Ejemplos de éxito (opcional).

## Workflow
1) **Analizar**: Identificar el trigger y el nivel de libertad necesario (Alta/Media/Baja).
2) **Estructurar**: Definir la ruta en `agent/skills/<nombre-del-skill>/`.
3) **Redactar**: Escribir el `SKILL.md` con frontmatter YAML claro y operativo.
4) **Documentar**: Crear carpetas de `recursos/`, `scripts/` o `ejemplos/` solo si aportan valor.
5) **Validar**: Pasar la checklist de calidad antes de entregar.

## Instrucciones

### 1. Estructura de Carpetas
Cada Skill se crea dentro de `agent/skills/<nombre-del-skill>/`.
- `SKILL.md`: (Obligatorio) Lógica, reglas y triggers.
- `recursos/`: (Opcional) Guías, tokens, plantillas.
- `scripts/`: (Opcional) Utilidades ejecutables.
- `ejemplos/`: (Opcional) Implementaciones de referencia.

### 2. Reglas de Escritura (SKILL.md)
- **YAML Frontmatter**: `name` (kebab-case, max 40 carac.) y `description` (español, 3ra persona, max 220 carac.).
- **Claridad**: Reglas pocas pero claras. Sin relleno tipo blog.
- **Niveles de Libertad**:
    - **Alta**: Para brainstorming/ideas.
    - **Media**: Para plantillas/estructuras.
    - **Baja**: Para operaciones críticas/técnicas (pasos exactos).

### 3. Manejo de Errores
- Si el output no cumple el formato: volver al paso 2, ajustar restricciones y re-generar.
- Si hay ambigüedad: preguntar al usuario antes de asumir.

## Checklist de Calidad
- [ ] ¿Entendí el objetivo final?
- [ ] ¿Tengo los inputs necesarios?
- [ ] ¿Ruta de carpeta correcta?
- [ ] ¿YAML frontmatter bien formateado?
- [ ] ¿Triggers concretos y fáciles de reconocer?
- [ ] ¿Output exacto definido?
- [ ] ¿Revisé coherencia y errores?

## Output (formato exacto)
Siempre responde con:
1. **Carpeta**: `agent/skills/<nombre-del-skill>/`
2. **SKILL.md**: (Contenido completo con YAML)
3. **Recursos opcionales**: (Lista de archivos adicionales creados)
