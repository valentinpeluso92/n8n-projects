Consulta horarios disponibles en la agenda de Google Sheets filtrando por tipo de día específico.
Herramienta administrativa con acceso completo a todos los tipos de día.

TIPOS DE DÍA VÁLIDOS:
- "PARTICULAR": Días para pacientes particulares, OSDE, bebés
- "PAMI_NUEVO": Días para pacientes PAMI primera vez
- "PAMI_VIEJO": Días para pacientes PAMI recurrentes
- "CIRUGIA": Días reservados exclusivamente para cirugías
- "CONTROL": Días de control post-operatorio
- "MEDICION": Días de estudios y mediciones especiales
- "DIA_LIBRE": Días que el consultorio está cerrado

PARÁMETROS:
- tipoDia (OBLIGATORIO): Tipo de día a consultar
- fechaDesde (OPCIONAL): Fecha desde la cual buscar (formato DD/MM/AAAA)
- fechaHasta (OPCIONAL): Fecha límite de búsqueda (solo para reportes)

RETORNA:
- status: "success" o "error"
- tipoDiaBuscado: El tipo consultado
- proximoTurno: { fecha, diaSemana, hora }
- disponibilidad: Array detallado con horarios libres por día
- totalDiasDisponibles: Cantidad de días encontrados
- totalHorariosDisponibles: Cantidad total de horarios libres
- mensaje: Descripción legible del resultado

USO ADMINISTRATIVO:

1. Consultar disponibilidad para registrar turno de paciente:
   Admin: "Buscar turno para paciente PAMI nuevo"
   → consultarDisponibilidadAgenda({ tipoDia: "PAMI_NUEVO" })

2. Ver disponibilidad de un tipo específico de día:
   Admin: "¿Qué días de cirugía hay libres?"
   → consultarDisponibilidadAgenda({ tipoDia: "CIRUGIA" })

3. Planificar agenda futura:
   Admin: "Disponibilidad PARTICULAR próxima semana"
   → consultarDisponibilidadAgenda({ tipoDia: "PARTICULAR", fechaDesde: "06/01/2025" })

4. Verificar carga de trabajo:
   Admin: "¿Cuántos horarios libres hay para PAMI Nuevo?"
   → consultarDisponibilidadAgenda({ tipoDia: "PAMI_NUEVO" })

VENTAJAS:
• Acceso a todos los tipos de día (incluyendo administrativos)
• Puede consultar cualquier tipo para planificación
• Retorna información detallada para toma de decisiones
• Útil para reportes y estadísticas

DIFERENCIA CON AGENTE PACIENTE:
• Agente Paciente: Solo usa PARTICULAR, PAMI_NUEVO, PAMI_VIEJO
• Agente Admin: Acceso completo a todos los 7 tipos
