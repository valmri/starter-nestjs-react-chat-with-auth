import React from "react";
import { useForm } from "react-hook-form";
import {
  messageService,
  CreateMessageDto,
} from "../../services/messageService";
import { SendHorizontal } from "lucide-react";
import { getSocket } from "../../services/socket";
import { authService } from "../../services/authService";

const MessageForm: React.FC = () => {
  const { register, handleSubmit, reset, watch } = useForm<CreateMessageDto>();
  const messageText = watch("text", "");

  const allowToSend = messageText.trim() !== "";

  const socket = getSocket();

  const onSubmit = async (data: CreateMessageDto) => {
    try {
      const user = await authService.getCurrentUser();
      socket.emit("sendMessage", {
        text: data.text,
        userId: user.id,
      });
      reset();
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="relative">
      <div className="flex gap-2">
        <input
          {...register("text", { required: true })}
          type="text"
          placeholder="Type your message..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <button
          type="submit"
          disabled={!allowToSend}
          className={`absolute right-0 top-0 bottom-0 rounded-r-lg bg-indigo-500 px-4 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 cursor-pointer ${
            allowToSend ? "opacity-100" : "opacity-0"
          }`}
        >
          {<SendHorizontal />}
        </button>
      </div>
    </form>
  );
};

export default MessageForm;
