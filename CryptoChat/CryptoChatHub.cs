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
        private static volatile IDictionary<String, User> _activeConnections = new Dictionary<String, User>();
        public Boolean ValidateUsername(String username, String room) { return !_activeConnections.ToList().Where(x => null != x.Value).Where(x => x.Value.Room.Equals(room)).Any(x => x.Value.Username.Equals(username)); }

        public void Init(String username, String room)
        {
            User u = GetCurrentUser();
            if (null == username && null == room)
            {
                // left room
                GetUsersInRoomByConnection().ForEach(x => Clients.Client(x.Key).userLeft(u.Username));
                _activeConnections.Remove(Context.ConnectionId);
                return;
            }

            if (null == u)
            {
                HandleNewUser(username, room);
                return;
            }

            // existing user
            if (!room.Equals(u.Room))
            {
                HandleNewRoom(username, room, u);
                return;
            }

            if (username.Equals(u.Username))
            {
                return;
            }

            HandleNewUsername(username, room, u);
        }

        private void HandleNewUsername(String username, String room, User u)
        {
            // username changed
            if (!ValidateUsername(username, room))
            {
                // username already taken
                Clients.Caller.initFailed("Username already taken");
                return;
            }

            GetUsersInRoomByConnection().ForEach(x => Clients.Client(x.Key).userRenamed(u.Username, username));
            u.Username = username;
            Clients.Caller.initSuccess();
        }

        private void HandleNewRoom(String username, String room, User u)
        {
            // joined different room
            GetUsersInRoomByConnection().ForEach(x => Clients.Client(x.Key).userLeft(u.Username));
            u.Username = username;
            u.Room = room;
            GetUsersInRoomByConnection().ForEach(x => Clients.Client(x.Key).userJoined(u.Username));
            Clients.Caller.initSuccess();
        }

        private void HandleNewUser(String username, String room)
        {
            if (!ValidateUsername(username, room))
            {
                // username already taken
                Clients.Caller.initFailed("Username already taken");
                return;
            }

            // new user
            User u = new User
                     {
                         Username = username,
                         Room = room
                     };
            _activeConnections[Context.ConnectionId] = u;
            GetUsersInRoomByConnection().ForEach(x => Clients.Client(x.Key).userJoined(u.Username));
            Clients.Caller.initSuccess();
        }

        private User GetCurrentUser() { return !_activeConnections.ContainsKey(Context.ConnectionId) ? null : _activeConnections[Context.ConnectionId]; }

        private List<KeyValuePair<String, User>> GetUsersInRoomByConnection()
        {
            List<KeyValuePair<String, User>> users = new List<KeyValuePair<String, User>>();
            User u = GetCurrentUser();
            if (null == u)
            {
                return users;
            }

            return _activeConnections.Where(x => x.Value != null && x.Value.Room != null).Where(x => x.Value.Room.Equals(u.Room)).ToList();
        }

        private void Send(User u, Object msg, Object msgIv) { GetUsersInRoomByConnection().ForEach(x => Clients.Client(x.Key).getMessage(u.Username, msg, msgIv)); }

        public void Send(Object msg, Object msgIv)
        {
            User u = GetCurrentUser();
            if (null == u)
            {
                return;
            }

            Send(u, msg, msgIv);
        }

        public override Task OnDisconnected(Boolean stopCalled)
        {
            User u = GetCurrentUser();
            if (null == u)
            {
                return base.OnDisconnected(stopCalled);
            }

            // was in a room
            GetUsersInRoomByConnection().ForEach(x => Clients.Client(x.Key).userLeft(u.Username));
            _activeConnections.Remove(Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            User u = GetCurrentUser();
            if (null != u)
            {
                _activeConnections.Remove(Context.ConnectionId);
            }

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