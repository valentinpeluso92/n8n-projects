# Tool: consultarDisponibilidadAgenda (Agente PACIENTE)

Consulta horarios disponibles en la agenda de Google Sheets filtrando por tipo de día específico. Solo accede a tipos de día para pacientes (PARTICULAR, PAMI_NUEVO, PAMI_VIEJO).

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**Llama a esta tool cuando necesites:**
- Mostrar al paciente los horarios disponibles para agendar un turno nuevo
- Verificar si hay disponibilidad antes de confirmar un turno
- Ofrecer opciones de fechas y horarios al paciente

**Requisitos previos:**
1. Debes conocer la obra social del paciente
2. **Si es PAMI:** PRIMERO llamar a `buscarPacientePorDNI` para determinar si es PAMI_NUEVO o PAMI_VIEJO según su última visita
3. Si es PARTICULAR u OSDE: usar `tipo_dia: "PARTICULAR"` directamente

**📖 Para más detalles** (parámetros, lógica de determinación de tipo_dia, ejemplos, validaciones), consulta la sección "HERRAMIENTAS DISPONIBLES" en el prompt principal del agente paciente.
