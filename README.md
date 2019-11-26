# CryptoChat
A webchat with AES-256 encryption and a no-log instant relay setup. This allows for anonymous communication around the web.

You can find a live demo edition on [chat.fooo.ooo](https://chat.fooo.ooo)

# How do I use it?

This is the landing page:
![landing page](https://dl.dropboxusercontent.com/s/xt1bglcfjilqvwq/chrome_2019-11-26_19-52-09.png)

You can choose a name, a room name and a password for the room. All of these values can be arbitrary.
Once you click "Join" a client-side key will be generated. You can share the name of the room and the password with the ones you'd like to communicate securely.

![key generation](https://dl.dropboxusercontent.com/s/cifkf02w93eyo5b/chrome_2019-11-26_19-56-30.png)

This key is then used to encrypt your messages before sending them over the web.
![conversation](https://dl.dropboxusercontent.com/s/h3n1jxt0tri5kw3/chrome_2019-11-26_20-02-04.png)

Nothing is stored on the server.
Only people already in the chat can see what has been sent.
Anyone joining later will start with a clean chat history.
Every member in the room will be notified once people join or leave the room, as well as change their name within one session.

I did this project for fun and never actually had a proper security test performed on it. If someone is skilled on this I'd appreciate some input as far as it is properly implemented. Also, one might argue that with HTTPS an additional encryption layer isn't nescessary, since the content is already encrypted. But then there are always the few paranoid ones...
