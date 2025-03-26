import axios from "axios";

const API_URL = "http://localhost:8000/api";

export interface Message {
  id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMessageDto {
  text: string;
}

class MessageService {
  async getAll(): Promise<Message[]> {
    const response = await axios.get(`${API_URL}/messages`);
    return response.data;
  }

  async create(message: CreateMessageDto): Promise<Message> {
    const response = await axios.post(`${API_URL}/messages`, message);
    return response.data;
  }
}

export const messageService = new MessageService();
