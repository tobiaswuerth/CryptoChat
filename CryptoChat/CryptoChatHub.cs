namespace ch.upzone.CryptoChat
{
    #region includes

    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.AspNet.SignalR;

    #endregion

    public class CryptoChatHub : Hub
    {
        private static readonly IDictionary<String, User> ACTIVE_CONNECTIONS = new Dictionary<String, User>();
        private void SendError(String message) { Clients.Caller.error(message); }

        public Boolean ValidateUsername(String username, String room)
        {
            return !ACTIVE_CONNECTIONS.ToList()
                                      .Where(x => null != x.Value)
                                      .Where(x => x.Value.Room.Equals(room))
                                      .Any(x => x.Value.Username.Equals(username));
        }

        public void Init(String username, String room)
        {
            User u = GetCurrentUser();
            if (null == u)
            {
                if (!ValidateUsername(username, room))
                {
                    // username already taken
                    SendError("Username already taken");
                    return;
                }

                // new user
                u = new User
                    {
                        Username = username,
                        Room = room
                    };
                ACTIVE_CONNECTIONS[Context.ConnectionId] = u;
                GetUsersInRoomByConnection()
                        .ForEach(x => Clients.Client(x.Key)
                                             .userJoined(u.Username));
                return;
            }

            // existing user
            if (!room.Equals(u.Room))
            {
                // joined different room
                GetUsersInRoomByConnection()
                        .ForEach(x => Clients.Client(x.Key)
                                             .userLeft(u.Username));
                u.Username = username;
                u.Room = room;
                GetUsersInRoomByConnection()
                        .ForEach(x => Clients.Client(x.Key)
                                             .userJoined(u.Username));
                return;
            }

            if (username.Equals(u.Username)) { return; }

            // username changed
            if (!ValidateUsername(username, room))
            {
                // username already taken
                SendError("Username already taken");
                return;
            }

            GetUsersInRoomByConnection()
                    .ForEach(x => Clients.Client(x.Key)
                                         .userRenamed(u.Username, username));
            u.Username = username;
        }

        private User GetCurrentUser()
        {
            return !ACTIVE_CONNECTIONS.ContainsKey(Context.ConnectionId)
                ? null
                : ACTIVE_CONNECTIONS[Context.ConnectionId];
        }

        private List<KeyValuePair<String, User>> GetUsersInRoomByConnection()
        {
            List<KeyValuePair<String, User>> users = new List<KeyValuePair<String, User>>();
            User u = GetCurrentUser();
            if (null == u) { return users; }

            return ACTIVE_CONNECTIONS.Where(x => null != x.Value)
                                     .Where(x => x.Value.Room.Equals(u.Room))
                                     .ToList();
        }

        private void Send(User u, Object msg, Object msgIv)
        {
            GetUsersInRoomByConnection()
                    .ForEach(x => Clients.Client(x.Key)
                                         .getMessage(u.Username, msg, msgIv));
        }

        public void Send(Object msg, Object msgIv)
        {
            User u = GetCurrentUser();
            if (null == u) { return; }

            Send(u, msg, msgIv);
        }

        public override Task OnDisconnected(Boolean stopCalled)
        {
            User u = GetCurrentUser();
            if (null == u) { return base.OnDisconnected(stopCalled); }

            // was in a room
            GetUsersInRoomByConnection()
                    .ForEach(x => Clients.Client(x.Key)
                                         .userLeft(u.Username));
            ACTIVE_CONNECTIONS.Remove(Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            User u = GetCurrentUser();
            if (null != u) { ACTIVE_CONNECTIONS.Remove(Context.ConnectionId); }

            // request new init
            Clients.Caller.initRequest();
            return base.OnReconnected();
        }

        public void RequestUsers()
        {
            List<KeyValuePair<String, User>> users = GetUsersInRoomByConnection();
            Clients.Caller.getUsersInRoom(users.Select(x => x.Value.Username));
        }
    }
}