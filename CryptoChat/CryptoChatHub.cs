namespace ch.upzone.CryptoChat
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.AspNet.SignalR;

    public class CryptoChatHub : Hub
    {
        private static readonly IDictionary<String, User> ACTIVE_CONNECTIONS = new Dictionary<String, User>();

        private static readonly List<String> INVALID_USERNAMES = new List<String>
                                                                 {
                                                                     "system",
                                                                     ""
                                                                 };

        private void SendError(String message) { Clients.Caller.error(message); }

        public void Init(String username, String room)
        {
            username = username.Trim();
            room = room.Trim();
            if (INVALID_USERNAMES.Contains(username.ToLower()))
            {
                SendError("Invalid username");
                return;
            }

            Boolean isNew = false;
            if (!ACTIVE_CONNECTIONS.ContainsKey(Context.ConnectionId) || null == ACTIVE_CONNECTIONS[Context.ConnectionId])
            {
                // initialize
                isNew = true;
                ACTIVE_CONNECTIONS[Context.ConnectionId] = new User
                                                           {
                                                               Username = username,
                                                               Room = room
                                                           };
            }
            User u = ACTIVE_CONNECTIONS[Context.ConnectionId];
            if (!isNew)
            {
                // re-init
                if (!room.Equals(u.Room))
                {
                    // joined different room
                    Send("System", u.Room, String.Format("User '{0}' has left the room", u.Username));
                    u.Username = username;
                    u.Room = room;
                }
                if (!u.Username.Equals(username))
                {
                    // username changed
                    Send("System", room, String.Format("User '{0}' changed username to '{1}'", u.Username, username));
                    u.Username = username;
                    return;
                }
            }

            Send("System", u.Room, String.Format("User '{0}' has joined the room", u.Username));
        }

        private void Send(String username, String room, String message) { ACTIVE_CONNECTIONS.Where(x => null != x.Value).Where(x => x.Value.Room.Equals(room)).ToList().ForEach(x => Clients.Client(x.Key).getMessage(DateTime.Now.ToLongTimeString(), username, message)); }

        public void Send(String message)
        {
            User u = ACTIVE_CONNECTIONS[Context.ConnectionId];
            Send(u.Username, u.Room, message);
        }

        public override Task OnDisconnected(Boolean stopCalled)
        {
            if (!ACTIVE_CONNECTIONS.ContainsKey(Context.ConnectionId))
            {
                return base.OnDisconnected(stopCalled);
            }

            User u = ACTIVE_CONNECTIONS[Context.ConnectionId];
            ACTIVE_CONNECTIONS.Remove(Context.ConnectionId);

            // was in a room
            Send("System", u.Room, String.Format("User '{0}' has disconnected", u.Username));
            Clients.All.broadcastMessage("System", String.Format("{0} disconnected", (Object) Clients.Caller.ToString()));
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            ACTIVE_CONNECTIONS.Add(Context.ConnectionId, null);
            Clients.All.broadcastMessage("System", String.Format("{0} reconnected", (Object) Clients.Caller.ToString()));
            return base.OnReconnected();
        }
    }
}