# Tool: modificarTurno (Agente PACIENTE)

Modifica la fecha u hora de un turno existente del paciente actual. Solo puede modificar sus propios turnos.

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**Llama a esta tool cuando necesites:**
- Cambiar la fecha u horario de un turno existente
- Reprogramar un turno a solicitud del paciente
- Actualizar los datos de fecha/hora en el sistema

**Requisito previo:**
- Debes haber consultado primero los turnos del paciente con `buscarTurnosPorDNI` para obtener el `id_turno`
- Verificar que el turno esté a más de 24hs de distancia (si es menos, derivar a secretaria)
- Consultar disponibilidad con `consultarDisponibilidadAgenda` para ofrecer opciones

**📖 Para más detalles** (parámetros, flujo completo de modificación, respuestas sugeridas, validaciones), consulta la sección "HERRAMIENTAS DISPONIBLES" en el prompt principal del agente paciente.
