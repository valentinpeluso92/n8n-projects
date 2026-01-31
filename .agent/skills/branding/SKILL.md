---
name: branding
description: Estándar de marca. Úsalo siempre que generes interfaz, componentes, copies textos de botones o cualquier contenido visible para el usuario.
---
# Skill: Estilo y Marca

## Cuándo usar este Skill
- Si vas a diseñar una UI o una pantalla o un componente
- Si vas a escribir textos: titulares, CTAs, botones, mensajes de error, descripciones
- Si vas a generar assets “de cara al usuario”

## Regla número 1
Utiliza las reglas css, selectores, colores, etc… definidas en los archivos css de branding dispuestos en la siguiente carpeta: .storybook/src/assets/eva. Antes de improvisar un estilo siempre trata de resolver la problemática apoyandote al 100% en los archivos css de branding. No improvises un estilo al menos que sea 100% necesario. Si falta un dato, pregunta o usa los valores definidos en los recursos.

## Regla número 2
Si necesitas improvisar un estilo, utiliza siempre scss. Respeta siempre las buenas practicas definidas por el preprocesador

## Regla número 3
Evita código duplicado y refactoriza los archivos involucrados en tus cambios siempre que puedas. 

## Regla número 4
Utiliza los textos de la carpeta libs/core/translate/lib/i18n. Si no existe el texto que necesitas, pregunta siempre.

## Dónde mirar o que hacer según el tipo de tarea
- Estilo visual (colores, tipografías, espaciado): .storybook/src/assets/eva/eva-core.min.css
- Forma de escribir (tono, estructura, vocabulario): .storybook/src/assets/eva/eva.min.css
- Textos (botones, titulares, descripciones): libs/core/translate/lib/i18n
- Decisiones técnicas (framework, estilos, librerías): consultar siempre

## Checklist antes de entregar
1) ¿Parece de la misma marca que lo anterior?
2) ¿Titulares y CTAs son concretos (no genéricos)?
3) ¿La jerarquía visual está clara (título, subtítulo, acciones)?
4) ¿El texto es corto y entendible a la primera?
5) ¿No se ha inventado colores/estilos fuera de la guía?

## Cómo mejorar este Skill
Si algo no cuadra, no “lo arregles en el prompt”: ajusta los recursos y vuelve a generar.
El objetivo es que el estándar se quede guardado.
