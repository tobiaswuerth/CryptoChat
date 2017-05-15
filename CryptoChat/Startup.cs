#region includes

using ch.upzone.CryptoChat;
using Microsoft.Owin;

#endregion

[assembly: OwinStartup(typeof(Startup))]

namespace ch.upzone.CryptoChat
{
    #region includes

    using Owin;

    #endregion

    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Any connection or hub wire up and configuration should go here
            app.MapSignalR();
        }
    }
}