# Tool: consultarDisponibilidadAgenda (Agente PACIENTE)

Consulta horarios disponibles en la agenda de Google Sheets filtrando por tipo de día específico. Solo accede a tipos de día para pacientes (PARTICULAR, PAMI).

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**Llama a esta tool cuando necesites:**
- Mostrar al paciente los horarios disponibles para agendar un turno nuevo
- Verificar si hay disponibilidad antes de confirmar un turno
- Ofrecer opciones de fechas y horarios al paciente

**Requisitos previos:**
1. Debes conocer la obra social del paciente
2. Determinar el `tipo_dia` según la obra social:
   - PARTICULAR u OSDE → `tipo_dia: "PARTICULAR"`
   - PAMI → `tipo_dia: "PAMI"`

**📖 Para más detalles** (parámetros, lógica de determinación de tipo_dia, ejemplos, validaciones), consulta la sección "HERRAMIENTAS DISPONIBLES" en el prompt principal del agente paciente.
