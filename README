Introduction

You can see an example at https://chess.neverwasinparis.com.

In online mode you can play against another human player on another device. Push the start button and share the invitation link.
The server validates every move and will only send it to the other player if the move was found valid. Cheating is impossible.
You can also send text messages to your opponent.
Websocket connections are used to send and receive moves and messages very fast and without the need to reload the page.
You can continue a game at a later time by visiting the same URL.

In offline mode you can play against another human player on the same device.
At your first visit the game gets installed automatically as a progressive web app. From there on you can use it even when your device is offline.



Installation


1. Creation of database

See database.txt file.


2. Configuration of webserver

See nginx.txt file.
Upload chess folder and ipv6 folder and make them web accessible.


3. Configuration of nodejs

Install packages:
npm install forever -g
npm install mysql -g
npm install websocket -g

Enter your database credentials in chess.js from nodejs folder and upload this file.
Navigate via SSH to chess.js and start it with
forever start chess.js