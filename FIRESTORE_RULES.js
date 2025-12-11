rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // CONTACTOS: solo dueño
    match /contactos/{contactoId} {
      allow read, update, delete: if request.auth != null
                                  && request.auth.uid == resource.data.userId;

      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.userId;
    }

    // USERS: datos públicos pero protegidos contra escritura indebida
    match /users/{uid} {
      allow read: if request.auth != null;

      allow create: if request.auth != null
                    && request.auth.uid == uid
                    && request.resource.data.uid == request.auth.uid;

      allow update: if request.auth != null
                    && request.auth.uid == uid;

      allow delete: if false;
    }

    // CHATS / MENSAJES: solo los dos participantes
    // Estructura: /chats/{chatId}/messages/{messageId}
    match /chats/{chatId}/messages/{messageId} {

      // Leer mensaje: solo si eres from o to
      allow read: if request.auth != null
                  && (request.auth.uid == resource.data.from
                      || request.auth.uid == resource.data.to);

      // Crear mensaje: solo si eres el emisor (from)
      allow create: if request.auth != null
                    && request.auth.uid == request.resource.data.from;

      // Actualizar mensaje (p.ej. marcar como leído): solo el destinatario
      allow update: if request.auth != null
                    && request.auth.uid == resource.data.to;

      // Borrar mensaje (opcional): emisor o receptor
      allow delete: if request.auth != null
                    && (request.auth.uid == resource.data.from
                        || request.auth.uid == resource.data.to);
    }

    // RESTO DE COLECCIONES → de momento siguen abiertas
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
