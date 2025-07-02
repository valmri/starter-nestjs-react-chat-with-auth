import React, { useEffect, useRef, useState } from "react";
import { messageService, Message } from "../../services/messageService";
import { authService, User } from "../../services/authService";
import { getSocket } from "../../services/socket";
import MessageForm from "./MessageForm";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const MessageList: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const socket = getSocket();

  useEffect(() => {
    authService.getCurrentUser().then(setUser).catch(console.error);
    messageService.findAll().then(setMessages);

    socket.on("message", (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("messageLiked", (updated: Message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    });

    return () => {
      socket.off("message");
      socket.off("messageLiked");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="space-y-4">
      <MessageForm user={user} socket={socket} />

      {messages.map((message) => (
        <div key={message.id} className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-gray-800">{message.text}</p>
          <div className="flex justify-between items-center text-sm text-gray-500/60 mt-4">
            <p>{message?.user?.email}</p>
            <p>{new Date(message.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-end mt-2 space-x-2">
            <p>
              {formatDistanceToNow(new Date(message.createdAt), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
            <button
              onClick={() => {
                if (!user) return;
                socket.emit("likeMessage", {
                  messageId: message.id,
                  userId: user.id,
                });
              }}
              className="text-sm text-blue-500 hover:underline cursor-pointer"
            >
              ❤️ Like
            </button>
            <span className="text-sm text-gray-600">{message.likes}</span>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
