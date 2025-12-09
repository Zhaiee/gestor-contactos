# Cambios Implementados - Alineación con Enunciado

## 1. Estructura de Mensajes (Según Enunciado)

### Cambio realizado:
Se modificó la estructura de almacenamiento de mensajes para cumplir exactamente con lo especificado en el enunciado:

**Estructura anterior (adaptación propia):**
```
/mensajes/{messageId}
{
  conversacionId: "uid1_uid2",
  remitenteUid: "uid",
  remitente: "nombre",
  contenido: "texto",
  createdAt: timestamp
}
```

**Estructura nueva (según enunciado):**
```
/chats/{chatId}/messages/{messageId}
{
  from: "uid_remitente",
  to: "uid_destinatario",
  text: "contenido del mensaje",
  timestamp: timestamp,
  read: boolean
}
```

### Ventajas:
- ✅ Cumple exactamente con la especificación del enunciado
- ✅ Estructura jerárquica clara (chats como documento padre)
- ✅ Includes campo `read` para marcar mensajes como leídos
- ✅ Mejor segmentación: cada conversación es un documento independiente

---

## 2. Reglas de Seguridad de Firestore

Se ha creado un archivo `FIRESTORE_RULES.js` con reglas de seguridad alineadas a la estructura de datos:

### Reglas implementadas:

1. **Colección `/users`:**
   - Lectura: Cualquier usuario autenticado
   - Escritura: Solo el propietario del UID

2. **Colección `/contactos`:**
   - Lectura y escritura: Solo el propietario (userId)

3. **Subcolección `/chats/{chatId}/messages`:**
   - **Lectura/Escritura:** Solo los dos UIDs involucrados en la conversación
   - **Crear mensaje:** Solo el remitente (from == auth.uid)
   - **Actualizar:** Solo el destinatario puede marcar como leído
   - **Validaciones:** Asegura que los campos requeridos estén presentes

### Seguridad:
- ✅ Un usuario NO puede leer/escribir mensajes de otras conversaciones
- ✅ Un usuario NO puede enviar mensajes con otro `from`
- ✅ Los mensajes se marcan como leídos automáticamente en la app
- ✅ Estructura impide acceso no autorizado

---

## 3. Funcionalidad de "Leer" (read field)

Se implementó automáticamente en `chat.js`:

```javascript
// Los mensajes recibidos se marcan como leídos automáticamente
snapshot.docs.forEach(doc => {
  const data = doc.data()
  if (data.from !== user.uid && !data.read) {
    updateDoc(doc.ref, { read: true })
  }
})
```

---

## 4. Compatibilidad con Enunciado

| Requisito | Estado | Detalles |
|-----------|--------|---------|
| Estructura `/chats/{chatId}/messages` | ✅ Implementado | Usando subcolecciones |
| Campos: from, to, text, timestamp, read | ✅ Implementado | Todos presentes |
| Chat en tiempo real | ✅ Implementado | onSnapshot escucha cambios |
| Actualización en tiempo real | ✅ Implementado | Interfaz se actualiza automáticamente |
| Diferenciación mensajes enviados/recibidos | ✅ Implementado | Estilos CSS diferentes |
| Botón "Enviar" y campo de texto | ✅ Implementado | Presente en interfaz |
| Invitación a usuarios no registrados | ✅ Implementado | Botón "Invitar" en detalle contacto |
| Reglas de seguridad | ✅ Implementado | Archivo FIRESTORE_RULES.js |

---

## 5. Cómo Aplicar las Reglas de Seguridad

1. Ve a Firebase Console
2. Selecciona el proyecto `gestor-contactos-f7435`
3. Ve a **Firestore Database** → **Reglas**
4. Reemplaza las reglas actuales con el contenido de `FIRESTORE_RULES.js`
5. Haz clic en **Publicar**

---

## 6. Nota sobre Adaptaciones

La aplicación fue diseñada inicialmente con una colección centralizada `mensajes` para mayor flexibilidad. Se ha realizado la migración completa a la estructura jerárquica solicitada manteniendo toda la funcionalidad:

- ✅ Chat en tiempo real conservado
- ✅ Seguridad mejorada
- ✅ Estructura más organizada
- ✅ Todas las funciones operativas
