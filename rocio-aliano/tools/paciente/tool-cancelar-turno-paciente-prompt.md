# Tool: cancelarTurno (Agente PACIENTE)

Cancela un turno existente del paciente actual. Solo puede cancelar sus propios turnos.

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**Llama a esta tool cuando necesites:**
- Cancelar un turno existente del paciente
- Cambiar el estado de un turno a "Cancelado"
- Liberar un horario en la agenda

**Requisito previo:**
- Debes haber consultado primero los turnos del paciente con `buscarTurnosPorDNI` para obtener el `id_turno`
- Verificar que el turno esté a más de 24hs de distancia (si es menos, derivar a secretaria)

**📖 Para más detalles** (parámetros, flujo completo de cancelación, respuestas sugeridas, validaciones), consulta la sección "HERRAMIENTAS DISPONIBLES" en el prompt principal del agente paciente.
