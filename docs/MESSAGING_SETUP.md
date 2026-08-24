# Configuration du Système de Messagerie

## ✅ Ce qui est déjà fait

Le système de messagerie interne est **100% opérationnel** avec:

### Backend
- ✅ Base de données configurée avec tables `Message`, `MessageRecipient`, `FcmToken`
- ✅ Module Messages avec tous les endpoints REST
- ✅ WebSocket Gateway pour messagerie temps réel
- ✅ Firebase Admin SDK configuré pour notifications push
- ✅ Credentials Firebase ajoutés au `.env`

### Frontend
- ✅ Page Messages avec interface WhatsApp-style
- ✅ Support messages directs (1-à-1) et broadcasts (collectifs)
- ✅ Navigation et traductions (EN/HE)
- ✅ Compteur de messages non lus
- ✅ Indicateurs de lecture (✓✓)

## 📱 Étapes optionnelles pour notifications push

Les notifications push permettent d'envoyer des alertes aux utilisateurs même quand ils n'ont pas l'application ouverte.

### 1. Configuration Frontend Firebase (Optionnel)

Pour activer les notifications push sur le frontend:

#### a) Créer `apps/web/src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "eliana-beauty-001.firebaseapp.com",
  projectId: "eliana-beauty-001",
  storageBucket: "eliana-beauty-001.firebasestorage.app",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, {
        vapidKey: 'VOTRE_VAPID_KEY'
      });
      return token;
    }
    return null;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
```

#### b) Installer les dépendances Firebase frontend:

```bash
cd apps/web
pnpm add firebase
```

#### c) Obtenir la configuration Firebase:

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet "eliana-beauty-001"
3. Cliquez sur l'icône Web (</>) pour ajouter une application web
4. Copiez la configuration `firebaseConfig`
5. Générez une clé VAPID dans Project Settings > Cloud Messaging

#### d) Créer `apps/web/public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "VOTRE_API_KEY",
  authDomain: "eliana-beauty-001.firebaseapp.com",
  projectId: "eliana-beauty-001",
  storageBucket: "eliana-beauty-001.firebasestorage.app",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

#### e) Enregistrer le token FCM dans votre app:

Dans `apps/web/src/App.tsx` ou un composant racine:

```typescript
import { useEffect } from 'react';
import { requestNotificationPermission } from './lib/firebase';
import { api } from './lib/api';
import { useAuthStore } from './store/authStore';

// Dans votre composant:
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

useEffect(() => {
  if (isAuthenticated) {
    requestNotificationPermission().then((token) => {
      if (token) {
        api.registerFcmToken(token);
      }
    });
  }
}, [isAuthenticated]);
```

### 2. Client WebSocket (Optionnel mais recommandé)

Pour recevoir les messages en temps réel sans recharger la page:

#### a) Installer socket.io-client:

```bash
cd apps/web
pnpm add socket.io-client
```

#### b) Créer `apps/web/src/lib/socket.ts`:

```typescript
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const connectSocket = (userId: string) => {
  if (socket?.connected) return socket;

  socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('WebSocket connected');
    socket?.emit('register', { userId });
  });

  socket.on('newMessage', (message) => {
    console.log('New message received:', message);
    // Vous pouvez déclencher un refresh de la boîte de réception ici
  });

  socket.on('userTyping', ({ userId, isTyping }) => {
    console.log(`User ${userId} is ${isTyping ? 'typing' : 'stopped typing'}`);
  });

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};

export const sendMessage = (data: any) => {
  socket?.emit('sendMessage', data);
};

export const markAsRead = (messageId: string, userId: string) => {
  socket?.emit('markRead', { messageId, userId });
};

export const emitTyping = (userId: string, recipientId: string, isTyping: boolean) => {
  socket?.emit('typing', { userId, recipientId, isTyping });
};

export { socket };
```

#### c) Utiliser dans votre page Messages:

```typescript
import { useEffect } from 'react';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';

// Dans votre composant Messages:
const user = useAuthStore((state) => state.user);

useEffect(() => {
  if (user?.id) {
    const socket = connectSocket(user.id);

    socket.on('newMessage', (message) => {
      // Recharger la boîte de réception
      loadInbox();

      // Si c'est pour la conversation actuelle, l'ajouter directement
      if (selectedConversation &&
          (message.senderId === selectedConversation.id ||
           message.recipientId === selectedConversation.id)) {
        setMessages(prev => [...prev, message]);
      }
    });

    return () => disconnectSocket();
  }
}, [user?.id]);
```

## 🔔 Rappels Automatiques (À implémenter)

Pour envoyer automatiquement des rappels de rendez-vous:

### Créer `apps/api/src/reminders/reminders.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class RemindersService {
  constructor(
    private prisma: PrismaService,
    private messagesService: MessagesService,
  ) {}

  // Exécuter toutes les heures
  @Cron(CronExpression.EVERY_HOUR)
  async send24HourReminders() {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: tomorrow,
          lte: new Date(tomorrow.getTime() + 60 * 60 * 1000), // +1h window
        },
        status: 'CONFIRMED',
      },
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });

    for (const appt of appointments) {
      // Vérifier si un rappel n'a pas déjà été envoyé
      const existingReminder = await this.prisma.message.findFirst({
        where: {
          type: 'REMINDER',
          appointmentId: appt.id,
          sentAt: {
            gte: new Date(Date.now() - 25 * 60 * 60 * 1000), // Dans les 25 dernières heures
          },
        },
      });

      if (!existingReminder && appt.client?.id) {
        const adminUser = await this.prisma.user.findFirst({
          where: { role: 'ADMIN' },
        });

        if (adminUser) {
          await this.messagesService.sendDirectMessage(adminUser.id, {
            type: 'REMINDER',
            content: `Rappel: Vous avez un rendez-vous demain à ${new Date(appt.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} pour ${appt.service.name} avec ${appt.staff?.name || 'notre équipe'}.`,
            subject: 'Rappel de rendez-vous - 24h',
            recipientId: appt.client.id,
            appointmentId: appt.id,
          });
        }
      }
    }
  }

  // Exécuter toutes les 30 minutes
  @Cron('*/30 * * * *')
  async send2HourReminders() {
    const in2Hours = new Date();
    in2Hours.setHours(in2Hours.getHours() + 2);

    const appointments = await this.prisma.appointment.findMany({
      where: {
        startsAt: {
          gte: in2Hours,
          lte: new Date(in2Hours.getTime() + 30 * 60 * 1000), // +30min window
        },
        status: 'CONFIRMED',
      },
      include: {
        client: true,
        service: true,
        staff: true,
      },
    });

    for (const appt of appointments) {
      const existingReminder = await this.prisma.message.findFirst({
        where: {
          type: 'REMINDER',
          appointmentId: appt.id,
          sentAt: {
            gte: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // Dans les 2.5 dernières heures
          },
        },
      });

      if (!existingReminder && appt.client?.id) {
        const adminUser = await this.prisma.user.findFirst({
          where: { role: 'ADMIN' },
        });

        if (adminUser) {
          await this.messagesService.sendDirectMessage(adminUser.id, {
            type: 'REMINDER',
            content: `Rappel: Votre rendez-vous est dans 2 heures à ${new Date(appt.startsAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} pour ${appt.service.name}.`,
            subject: 'Rappel de rendez-vous - 2h',
            recipientId: appt.client.id,
            appointmentId: appt.id,
          });
        }
      }
    }
  }
}
```

### Créer le module et l'enregistrer:

```typescript
// apps/api/src/reminders/reminders.module.ts
import { Module } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [MessagesModule],
  providers: [RemindersService],
})
export class RemindersModule {}
```

Puis ajouter `RemindersModule` dans `app.module.ts`:

```typescript
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [
    // ... autres imports
    ScheduleModule.forRoot(),
    MessagesModule,
    RemindersModule,
  ],
  // ...
})
export class AppModule {}
```

## 📊 Utilisation

### Pour les clients:
1. Se connecter à l'application
2. Aller dans "Messages" (menu)
3. Voir les conversations et annonces
4. Envoyer des messages à l'admin
5. Recevoir des rappels de rendez-vous automatiques

### Pour les admins:
1. Aller dans "Messages"
2. Répondre aux clients
3. Cliquer sur "Broadcast" pour envoyer un message à tous les clients
4. Les rappels de rendez-vous s'envoient automatiquement (si implémenté)

## 🎯 Avantages

✅ **100% gratuit** - Aucun coût SMS/Email
✅ **Temps réel** - Messages instantanés via WebSocket
✅ **Notifications push** - Via Firebase (gratuit, illimité)
✅ **Historique** - Tous les messages conservés en BDD
✅ **Indicateurs de lecture** - Savoir si le message a été lu
✅ **Broadcasts** - Envoyer à tous les clients en un clic
✅ **Rappels automatiques** - 24h et 2h avant les rendez-vous

## 🔧 Support

Toutes les fonctionnalités principales sont opérationnelles. Les étapes optionnelles ci-dessus ajoutent:
- Notifications push sur mobile/desktop
- Messages en temps réel sans recharger la page
- Rappels automatiques de rendez-vous

Le système fonctionne parfaitement même sans ces fonctionnalités optionnelles!
