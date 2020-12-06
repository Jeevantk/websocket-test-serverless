'use strict';

require('dotenv').config();
const axios = require('axios');
const WebsocketClient = require('websocket').client;

// Websocket client configuration
const client = new WebsocketClient();

client.on('connectFailed', (error) => {
    console.error('Connection attempt failed', error);
    client.abort();
});
client.on('connect', (connection) => {
    console.log('Connected!');
    connection.on('error', (error) => {
        console.error('Error during connection', error);
        connection.close();
    });
    connection.on('close', () => {
        console.log('Connection closed!');
    });
    connection.on('message', (message) => {
        const content = JSON.parse(message.utf8Data);
        console.log('new message recieved ',content);
    });

    // Websockets usually timeout and close automatically after being
    // idle for around a minute. This ping/pong implementation keeps
    // the socket alive.
    const ping = () => {
        if (connection.connected) {
            // console.log('Pinging!');
            const pingMessage = {
                action: 'PING'
            };
            connection.sendUTF(JSON.stringify(pingMessage));
            setTimeout(ping, 30000);
        }
    };

    const scheduledMessage = () => {
        if (connection.connected) {
            console.log('Greeting everyone!');
            const greetingMessage = {
                action: 'GREETING',
                message: `Hello everyone, this is instance ${instance}`
            };
            connection.sendUTF(JSON.stringify(greetingMessage));
            setTimeout(scheduledMessage, 5000);
        }
    };

    ping();
    if (greets) {
        scheduledMessage();
    }
});

// Process configuration and execution
// Connection metadata: API Websocket host address and Cognito user auth :)

const token = process.env.TOKEN;
const host = process.env.WS_HOST;
console.log(process.argv);

if (process.argv.length < 4) {
    console.error('ERROR: Client identifier and event must be provided');
    console.error('Command has the following pattern: node index.js <client-id> <event> <isPulisher>');
    console.error();
    console.error('Example usages:');
    console.error('\t- Listener only:');
    console.error('\t\tnode index.js first-listener greeting');
    console.error('\t\tnode index.js first-listener greeting false');
    console.error('\t- Listener publisher:');
    console.error('\t\tnode index.js second-listener greeting true');
    process.exit(1);
}

const instance = process.argv[2];
const event = process.argv[3];
const greets = process.argv.length > 4 ? process.argv[4] : false;

try{
  client.connect(`${host}?connectionType=${event}&Authorizer=${token}`);
}
catch(error){
  console.error('Unable to initialize socket connection', error.toString());
}
