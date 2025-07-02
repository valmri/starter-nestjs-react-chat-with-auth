import React, { useEffect, useState } from "react";
import { getSocket } from "../../services/socket";
import { User } from "../../services/authService";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const ConnectedUsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [now, setNow] = useState(new Date());
  const socket = getSocket();

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000); // toutes les 30 secondes

    return () => clearInterval(interval);
  }, []);

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
            <span className="text-gray-400 text-sm ml-2">
              (Connecté depuis{" "}
              {formatDistanceToNow(new Date(user.lastSeen), {
                addSuffix: true,
                locale: fr,
              })}
              )
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConnectedUsersList;
