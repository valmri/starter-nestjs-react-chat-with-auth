import React, { useEffect, useState } from "react";
import { getSocket } from "../../services/socket";
import { User } from "../../services/authService";

const ConnectedUsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const socket = getSocket();

  useEffect(() => {
    socket.on("connectedUsers", (connected: User[]) => {
      setUsers(connected);
    });

    return () => {
      socket.off("connectedUsers");
    };
  }, [socket]);

  return (
    <div className="bg-white shadow p-4 rounded w-full max-w-md mx-auto mb-4">
      <h2 className="text-lg font-semibold mb-2">Utilisateurs connectés</h2>
      <ul className="space-y-1">
        {users.map((user) => (
          <li key={user.id} className="text-gray-700">
            {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectedUsersList;
