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
  private connectedUsers = new Map<string, any>();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit(server: Server) {
    this.server = server;
    console.log('WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        throw new Error('Token manquant');
      }

      const payload = this.jwtService.verify(token);
      console.log('Client connecté avec payload JWT :', payload);

      (client as any).user = payload;
    } catch (err) {
      console.error("❌ Erreur d'authentification WebSocket :", err.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
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
    this.server.emit('message', message); // Émet à tous les clients
  }
}
