import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private server: Server;
  private connectedUsers: Map<string, string> = new Map();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    console.log('🔐 Token reçu lors de la connexion WebSocket:', token);

    if (!token) {
      console.error('❌ Aucun token fourni dans la connexion WebSocket.');
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token);
      console.log('🔓 Payload JWT décodé :', payload);

      const user = await this.usersService.findOne(payload.id);
      user.lastSeen = new Date();
      await this.usersService.updateLastSeen(user.id);

      this.connectedUsers.set(client.id, payload.id);

      // Attache l'utilisateur au socket
      (client as any).user = payload;

      await this.broadcastConnectedUsers();
      console.log(
        `✅ User ${payload.email} connecté avec le socket ID: ${client.id}`,
      );
    } catch (e) {
      console.error(
        '❌ Erreur lors de la vérification du token WebSocket :',
        e.message,
      );
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      await this.usersService.updateLastSeen(userId);
      this.connectedUsers.delete(client.id);
    }
    await this.broadcastConnectedUsers();
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { text: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) {
      console.error('❌ Aucun utilisateur trouvé dans le socket');
      return;
    }

    const message = await this.messagesService.create(
      { text: data.text },
      user.id,
    );
    this.server.emit('message', message);
  }

  private async broadcastConnectedUsers() {
    const userIds = Array.from(this.connectedUsers.values());

    const users = await Promise.all(
      userIds.map((id) => this.usersService.findOne(id)),
    );

    console.log('📡 Emitting connected users:', users);
    this.server.emit('connectedUsers', users);
  }

  @SubscribeMessage('likeMessage')
  async handleLikeMessage(
    @MessageBody() data: { messageId: string; userId: string },
  ): Promise<void> {
    const updated = await this.messagesService.likeMessage(
      data.messageId,
      data.userId,
    );
    this.server.emit('messageLiked', updated);
  }
}
