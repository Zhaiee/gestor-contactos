// Reglas de Seguridad de Firestore para la aplicación de Chat
// Copiar y pegar en Firebase Console > Firestore Database > Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Permitir lectura y escritura de datos de usuario solo al propietario
    match /users/{uid} {
      allow read: if request.auth.uid != null;
      allow write: if request.auth.uid == uid;
    }
    
    // Permitir lectura y escritura de contactos solo al propietario
    match /contactos/{document=**} {
      allow read, write: if resource.data.userId == request.auth.uid;
      allow create: if request.resource.data.userId == request.auth.uid;
    }
    
    // Estructura de chat: /chats/{chatId}/messages/{messageId}
    // chatId = sort(uid1, uid2).join('_')
    match /chats/{chatId}/messages/{messageId} {
      // Permitir lectura y escritura solo a los dos usuarios de la conversación
      allow read, write: if request.auth.uid == request.resource.data.from || 
                            request.auth.uid == request.resource.data.to ||
                            request.auth.uid == resource.data.from ||
                            request.auth.uid == resource.data.to;
      
      // Permitir crear mensajes solo si el usuario autenticado es el remitente (from)
      allow create: if request.resource.data.from == request.auth.uid &&
                       (request.resource.data.to != null) &&
                       request.resource.data.text != null &&
                       request.resource.data.timestamp != null &&
                       request.resource.data.read == false;
      
      // Permitir actualizar solo el campo 'read' para marcar como leído
      allow update: if request.auth.uid == resource.data.to &&
                       resource.data.read == false &&
                       request.resource.data.read == true;
    }
    
    // Denegar acceso a cualquier otra colección
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
