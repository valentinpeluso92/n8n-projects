# Tool: derivarASecretaria

Deriva el caso a la secretaria humana cuando el agente no puede resolver la consulta o hay una situación que requiere intervención humana.

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `nombre_completo` (string): Nombre del paciente/persona
  - Ejemplo: `"María González"`

- `telefono` (string): Teléfono de contacto
  - Formato: `"2342-567890"`

- `motivo` (string): Categoría de derivación
  - Valores: 
    - `"urgencia"` - Situación médica urgente
    - `"receta"` - Solicitud de receta
    - `"presupuesto"` - Consulta de presupuestos
    - `"obra_social"` - Consulta sobre obra social no soportada
    - `"error_tecnico"` - Problema técnico del sistema
    - `"consulta_compleja"` - Consulta que excede capacidad del bot
    - `"modificacion_urgente"` - Cambio < 24hs que requiere autorización
    - `"otro"` - Otro motivo

**OPCIONALES:**
- `dni` (string): DNI del paciente (si está disponible)
  
- `observaciones` (string): Detalles adicionales del caso
  - Ejemplo: `"Paciente reporta ojo rojo con dolor intenso"`
  - Útil para priorización
  
- `turno_relacionado` (string): ID de turno si la derivación está relacionada
  - Ejemplo: `"turno_06012025_1703952341234"`
  
- `prioridad` (string): Nivel de urgencia
  - Valores: `"alta"`, `"media"`, `"baja"`
  - Default: `"media"`

## 📤 RETORNA

### Caso 1: Derivación registrada exitosamente
```json
{
  "status": "success",
  "derivacion": {
    "id": "deriv_1703952341234",
    "nombre_completo": "María González",
    "dni": "35123456",
    "telefono": "2342-567890",
    "motivo": "urgencia",
    "observaciones": "Ojo rojo con dolor intenso",
    "prioridad": "alta",
    "fecha_hora": "31/12/2024 16:30",
    "estado": "Pendiente"
  },
  "mensaje": "✅ Su caso fue derivado a la secretaria. Lo contactarán a la brevedad.",
  "tiempo_estimado": "30 minutos"
}
```

### Caso 2: Error al registrar derivación
```json
{
  "status": "error",
  "codigo": "ERROR_REGISTRO",
  "mensaje": "No se pudo registrar la derivación. Por favor llame al [TELÉFONO]"
}
```

## 🎯 CUÁNDO USAR

### Agente PACIENTE debe derivar en:

1. **Urgencias médicas:**
   - "Me molesta el ojo", "Ojo rojo", "Veo mosquitas", "No veo", "Clavé algo en el ojo"
   
2. **Solicitud de recetas:**
   - "Necesito que me hagas la receta", "Renovar receta de anteojos"
   
3. **Consultas de presupuestos:**
   - "Cuánto cuestan los estudios", "Precio de [estudio]"
   
4. **Obras sociales no soportadas:**
   - "Trabajan con Swiss Medical?", "Aceptan [obra social]?"
   
5. **Problemas técnicos:**
   - Error de conexión a Google Sheets
   - Timeout en herramientas
   - Sistema no responde
   
6. **Modificación/cancelación urgente (< 24hs):**
   - Paciente solicita cambiar turno de mañana
   - Necesita cancelar con urgencia justificada
   
7. **Consultas fuera de alcance:**
   - Preguntas médicas específicas
   - Consultas sobre diagnósticos
   - Casos complejos que el bot no puede manejar

### Agente ADMINISTRADOR deriva en:

1. **Casos que requieren autorización superior:**
   - Exenciones de cobro especiales
   - Sobreturnos en días completos
   
2. **Situaciones médicas delicadas:**
   - Consultas sobre complicaciones post-cirugía
   
3. **Errores técnicos críticos:**
   - Sistema completamente caído
   - Datos inconsistentes que requieren revisión manual

## 📊 ESTRUCTURA DE DERIVACIÓN

### Hoja: Derivaciones (o notificación directa)

**Columnas sugeridas:**
- `id`: string generado automáticamente
- `fecha_hora`: timestamp de derivación
- `nombre_completo`: nombre del paciente
- `dni`: DNI (si disponible)
- `telefono`: teléfono de contacto
- `motivo`: categoría de derivación
- `observaciones`: detalles del caso
- `prioridad`: alta/media/baja
- `estado`: Pendiente/En proceso/Resuelta
- `turno_relacionado`: ID de turno si aplica

**O enviar notificación directa:**
- WhatsApp a número de secretaria
- Email al consultorio
- Sistema de tickets interno

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Urgencia médica
```
Usuario: "Me duele mucho el ojo y está muy rojo"

[Detectar: urgencia médica]

Agente: "Entiendo que tiene molestia en el ojo. 
         Por su seguridad, necesito que hable con la secretaria.
         
         ¿Me confirma su nombre y teléfono para que la contacten urgente?"

Usuario: "María González, 2342-567890"

[Llama: derivarASecretaria({
  nombre_completo: "María González",
  telefono: "2342-567890",
  motivo: "urgencia",
  observaciones: "Dolor intenso y ojo muy rojo",
  prioridad: "alta"
})]

→ Retorna: { 
    status: "success",
    tiempo_estimado: "30 minutos"
}

Agente: "✅ Su caso fue derivado como URGENCIA.
         La secretaria lo contactará en los próximos 30 minutos.
         
         Si el dolor empeora, vaya a guardia médica.
         
         📍 Consultorio: Lavalle 241, Bragado
         🗺️ Google Maps: https://www.google.com/maps/search/?api=1&query=calle+lavalle+241+bragado
         📞 Teléfono directo: [TELÉFONO]"
```

### Ejemplo 2: Solicitud de receta
```
Usuario: "Necesito que me hagan la receta de mis anteojos"

[Detectar: solicitud de receta]

Agente: "Para recetas necesito derivarlo/a con la secretaria.
         
         ¿Me dice su nombre y teléfono?"

Usuario: "José Pérez, 2342-567891"

[Llama: derivarASecretaria({
  nombre_completo: "José Pérez",
  telefono: "2342-567891",
  dni: "28999888",  // Si se capturó antes
  motivo: "receta",
  observaciones: "Solicita receta de anteojos",
  prioridad: "baja"
})]

Agente: "✅ Su pedido de receta fue registrado.
         La secretaria lo contactará en el día para coordinar.
         
         Puede retirarla en el consultorio."
```

### Ejemplo 3: Consulta de presupuesto
```
Usuario: "Cuánto sale el OCT macular?"

Agente: "Para presupuestos necesito que hable con la secretaria.
         ¿Me dice su nombre y teléfono?"

Usuario: "Ana López, 2342-567892"

[Llama: derivarASecretaria({
  nombre_completo: "Ana López",
  telefono: "2342-567892",
  motivo: "presupuesto",
  observaciones: "Consulta precio OCT macular",
  prioridad: "media"
})]

Agente: "✅ Su consulta fue derivada.
         La secretaria le enviará el presupuesto hoy."
```

### Ejemplo 4: Error técnico
```
Usuario: "Quiero solicitar un turno"

[Llama: consultarDisponibilidadAgenda({ tipoDia: "PARTICULAR" })]
→ Retorna: { status: "error", mensaje: "Connection timeout" }

[Detectar: error técnico]

Agente: "Disculpe, tengo un problema técnico con la agenda.
         
         ¿Me deja su teléfono? La secretaria lo llama hoy 
         para coordinar el turno."

Usuario: "35123456, teléfono 2342-567890"

[Llama: derivarASecretaria({
  nombre_completo: "Nombre capturado anteriormente",
  telefono: "11-2345-6789",
  dni: "35123456",
  motivo: "error_tecnico",
  observaciones: "Error de conexión a agenda. Paciente quiere solicitar turno para consulta.",
  prioridad: "media"
})]

Agente: "✅ Registré sus datos.
         La secretaria lo contactará hoy para agendar su turno.
         
         Disculpe las molestias.
         Si prefiere, puede llamar al [TELÉFONO]."
```

### Ejemplo 5: Obra social no soportada
```
Usuario: "Trabajan con Swiss Medical?"

Agente: "Por el momento trabajamos con PAMI, OSDE y Particular.
         
         Para consultar sobre Swiss Medical, 
         ¿me deja su teléfono? La secretaria puede informarle."

Usuario: "Sí, 2342-567893, soy Roberto Díaz"

[Llama: derivarASecretaria({
  nombre_completo: "Roberto Díaz",
  telefono: "2342-567893",
  motivo: "obra_social",
  observaciones: "Consulta por Swiss Medical",
  prioridad: "baja"
})]

Agente: "✅ Su consulta fue registrada.
         La secretaria lo contactará para informarle."
```

### Ejemplo 6: Modificación urgente (< 24hs)
```
Usuario: "Necesito cambiar turno de mañana, es urgente"

Agente: "Para modificaciones con menos de 24hs necesito 
         derivarlo con la secretaria.
         
         ¿Cuál es su DNI?"

Usuario: "35123456"

[Llama: buscarTurnosPorDNI({ dni: "35123456" })]
→ Tiene turno mañana 9:00

[Llama: derivarASecretaria({
  nombre_completo: "María González",  // De su registro
  telefono: "11-2345-6789",
  dni: "35123456",
  motivo: "modificacion_urgente",
  observaciones: "Necesita cambiar turno de mañana 01/01 9:00",
  turno_relacionado: "turno_01012025_xxx",
  prioridad: "alta"
})]

Agente: "✅ Su caso fue derivado como urgente.
         La secretaria lo contactará a la brevedad.
         
         Turno actual: Mañana 1/1 a las 9:00
         
         Si no puede esperar, llame al [TELÉFONO]."
```

## 🔄 FLUJO DE DERIVACIÓN

```
1. Detectar situación que requiere derivación
2. Explicar al usuario por qué se deriva
3. Capturar datos necesarios:
   ├─ Nombre completo (SIEMPRE)
   ├─ Teléfono (SIEMPRE)
   ├─ DNI (si está disponible)
   └─ Detalles del caso
4. Determinar prioridad:
   ├─ Alta: Urgencias, modificaciones < 24hs
   ├─ Media: Turnos, presupuestos, errores técnicos
   └─ Baja: Recetas, consultas generales
5. Llamar derivarASecretaria({ ...datos })
6. Evaluar resultado:
   ├─ Si success → Confirmar derivación y dar info contacto
   └─ Si error → Dar teléfono directo del consultorio
7. Finalizar conversación cortésmente
```

## 💬 RESPUESTAS SUGERIDAS

### Antes de derivar:
```
"Para ayudarlo/a con [motivo], necesito derivarlo/a con la secretaria.
¿Me confirma su nombre y teléfono?"
```

### Después de derivar - Prioridad alta:
```
"✅ Su caso fue derivado como URGENCIA.
La secretaria lo contactará en los próximos 30 minutos.

📍 Consultorio: Lavalle 241, Bragado
🗺️ Google Maps: https://www.google.com/maps/search/?api=1&query=calle+lavalle+241+bragado
📞 Teléfono directo: [TELÉFONO]
⏰ Horario: Lunes a Viernes 9-12hs

[Si es urgencia médica:
Si el problema empeora, vaya a guardia médica.]"
```

### Después de derivar - Prioridad media/baja:
```
"✅ Su consulta fue registrada.
La secretaria lo contactará en el día.

Si prefiere, puede llamar directamente:
📞 [TELÉFONO]
⏰ Lunes a Viernes 9-12hs"
```

### Error al derivar:
```
"Disculpe, no pude registrar su consulta por un problema técnico.

Por favor comuníquese directamente:
📞 Teléfono: [TELÉFONO]
⏰ Horario: Lunes a Viernes 9-12hs
📍 Consultorio: Lavalle 241, Bragado
🗺️ Google Maps: https://www.google.com/maps/search/?api=1&query=calle+lavalle+241+bragado

Disculpe las molestias."
```

## 🚨 PRIORIDADES

### Alta (contacto en 30 min - 1 hora):
- ✅ Urgencias médicas
- ✅ Dolor intenso
- ✅ Pérdida de visión
- ✅ Modificación/cancelación < 24hs
- ✅ Errores técnicos que bloquean registro de turno urgente

### Media (contacto en el día):
- ✅ Solicitud de turno (por error técnico)
- ✅ Presupuestos
- ✅ Consultas sobre obras sociales
- ✅ Problemas técnicos generales

### Baja (contacto en 24-48hs):
- ✅ Solicitud de recetas
- ✅ Consultas administrativas generales
- ✅ Confirmaciones de turnos lejanos

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Derivar sin capturar datos de contacto
derivarASecretaria({ 
  motivo: "urgencia" 
  // Falta nombre y teléfono!
});

// No explicar por qué se deriva
// (usuario se siente derivado sin razón)

// Derivar casos que el bot SÍ puede resolver
derivarASecretaria({ motivo: "solicitar_turno" });
// Si la agenda funciona, el bot debe resolver
```

✅ **SÍ hacer:**
```javascript
// 1. Explicar razón de derivación
responder("Para [motivo], necesito derivarlo con la secretaria.");

// 2. Capturar datos completos
const nombre = await preguntar("¿Su nombre completo?");
const telefono = await preguntar("¿Su teléfono?");

// 3. Derivar con todos los datos
derivarASecretaria({
  nombre_completo: nombre,
  telefono: telefono,
  dni: dni,  // Si está disponible
  motivo: motivo_claro,
  observaciones: detalles_importantes,
  prioridad: calcularPrioridad(motivo)
});

// 4. Confirmar y dar alternativas
responder("✅ Derivado. Lo contactarán en [tiempo].
          O llame al [TELÉFONO]");
```

## 📝 NOTAS IMPORTANTES

- 📞 **Teléfono obligatorio:** Siempre capturar para que secretaria pueda contactar
- 📋 **Observaciones claras:** Cuanto más detalle, mejor atención
- ⏱️ **Prioridad correcta:** Urgencias deben ser alta, no saturar con falsas urgencias
- 💬 **Explicar siempre:** Usuario debe entender por qué se deriva
- ☎️ **Dar alternativa:** Siempre ofrecer teléfono directo del consultorio
- 🤝 **Ser cortés:** "Disculpe las molestias", "Gracias por su paciencia"

## 🎯 CASOS ESPECIALES

### Usuario insiste que es urgencia pero no lo es:
```
Usuario: "ES URGENTE necesito turno YA"
[Agenda funciona correctamente]

Agente: "Entiendo que lo necesita pronto.
         Déjeme revisar la disponibilidad...
         
         [Consultar agenda normalmente]
         
         Tengo lugar el [próxima fecha disponible].
         
         Si necesita antes por una urgencia MÉDICA,
         ahí sí lo derivo con la secretaria."
```

### Derivación rechazada (usuario no da datos):
```
Usuario: "Solo quiero saber el precio"
Agente: "Para presupuestos necesito su teléfono"
Usuario: "No, solo dígame el precio"

Agente: "Los precios pueden variar según el caso.
         Puede llamar directamente al [TELÉFONO]
         en horario de 9 a 12hs para consultarlos."
```

---

**IMPORTANTE:** Esta tool es el "último recurso" cuando el agente no puede resolver. Usar criteriosamente para no saturar a la secretaria.

