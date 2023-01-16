const net = require('net');

const returnChar = '\r\n';


// Takes in a command, and returns the response
const SocketSequencer = async (socket, message) => {
    console.log('COMMAND', message);
    return new Promise((resolve, reject) => {
        socket.write(message);
        socket.write(returnChar);
        socket.once('data', (data) => {
            const str = data.toString();
            console.log(str);
            resolve(str);
        });
        socket.once('error', (err) => {
            console.log(err);
            reject(err);
        })
    });
}

// Connects to the server, and returns the socket
const connectToServer = async (port, record) => {
    return new Promise((resolve, reject) => {
        try {
            const socket = new net.Socket();
            socket.setTimeout(3000);
            socket.connect(port, record, function () {
                // resolve(socket);
                // socket.write('HELO example.com');
            })
            socket.on('error', function (err) {
                resolve(false);
            })
            socket.on('data', (data) => {
                // console.log(data.toString());
                resolve(socket)
            })

        } catch (e) {
            resolve(false);
        }
    })
}

const checkAddress = async (server, port, address) => {

    console.log(`Checking ${address}`);
    const socket = await connectToServer(port, server);
    if (!socket) {
        console.log(`Could not connect to ${server}:${port}`);
        return null;
    }


    const helo = await SocketSequencer(socket, `HELO example.com`);
    if (!helo.startsWith('250')) {
        console.log(new Error(`HELO failed: ${helo}`));
        return null;
    }


    const mailFrom = await SocketSequencer(socket, `MAIL FROM: <user@example.com>`);
    if (!mailFrom.startsWith('250')) {
        console.log( new Error(`MAIL FROM failed: ${mailFrom}`));
        return null;
    }

    const rcptTo = await SocketSequencer(socket, `RCPT TO: <${address}>`);
    if (!rcptTo.startsWith('250')) {
        console.log( new Error(`RCPT TO failed: ${rcptTo}`));
        return null;
    }

    const quit = await SocketSequencer(socket, `QUIT`);
    if (!quit.startsWith('221')) {
        console.log( new Error(`QUIT failed: ${quit}`));
    }

    socket.end();
    return address;

}

const checkEmailAddresses = async (server, port, addresses) => {
    console.log(`Checking ${addresses.length} addresses`);
    const validAddresses = await Promise.all(addresses.map((add) => checkAddress(server, port, add)))
    console.log('new', validAddresses);
    return validAddresses.filter(address => address);
}


module.exports = checkEmailAddresses
