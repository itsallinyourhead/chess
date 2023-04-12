![alt text](https://raw.githubusercontent.com/itsallinyourhead/chess/main/BoardForReadme.png)

<b>Introduction</b>

You can see an example at https://chess.neverwasinparis.com.<br>
Play chess online or offline with a browser. <br>
<br>

<b>Description</b>

In online mode you can play against another human player on another device. Push the start button and share the invitation link.<br>
The server validates every move and will only send it to the other player if the move was found valid. Cheating is impossible.<br>
You can also send text messages to your opponent.<br>
Websocket connections are used to send and receive moves and messages very fast and without the need to reload the page.<br>
You can continue a game at a later time by visiting the same URL.<br>

In offline mode you can play against another human player on the same device.<br>
At your first visit the game gets installed automatically as a progressive web app. From there on you can use it even when your device is offline.<br>
<br>

<b>Installation</b>


1. Creation of database

See database.txt file.


2. Configuration of webserver

See nginx.txt file.<br>
Upload chess folder and ipv6 folder and make them web accessible.


3. Configuration of nodejs

Install packages:<br>
<pre>npm install forever -g<br>
npm install mysql -g<br>
npm install websocket -g</pre>

Enter your database credentials in chess.js from nodejs folder and upload this file.<br>
Navigate via SSH to chess.js and start it with<br>
<pre>forever start chess.js</pre>
