const net = require('net');

const returnChar = '\r\n';


// Takes in a command, and returns the response
const SocketSequencer = async (socket, message) => {
    return new Promise((resolve, reject) => {
        socket.write(message);
        socket.write(returnChar);
        socket.once('data', (data) => {
            const str = data.toString();
            resolve(str);
        });
        socket.once('error', (err) => {
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

    try {
        const helo = await SocketSequencer(socket, `HELO google.com`);
        if (!helo.startsWith('250') && !helo.startsWith('220')) {
            throw new Error(`HELO failed: ${helo}`)
        }


        const mailFrom = await SocketSequencer(socket, `MAIL FROM: <user@google.com>`);
        if (!mailFrom.startsWith('250')) {
            throw new Error(`MAIL FROM failed: ${mailFrom}`);

        }

        const rcptTo = await SocketSequencer(socket, `RCPT TO: <${address}>`);
        if (!rcptTo.startsWith('250')) {
            throw new Error(`RCPT TO failed: ${rcptTo}`);
        }

        const quit = await SocketSequencer(socket, `QUIT`);
        if (!quit.startsWith('221') && !quit.startsWith('250')) {
            throw new Error(`QUIT failed: ${quit}`);
        }

        socket.end();
        return address;

    } catch (e) {
        console.log(address, e.message.split(returnChar)[0]);
        return null;
    } finally {
        socket.end();
    }


}

const checkEmailAddresses = async (server, port, addresses) => {
    console.log(`Checking ${addresses.length} addresses`);
    const validAddresses = await Promise.all(addresses.map((add) => checkAddress(server, port, add)))
    return validAddresses.filter(address => address);
}


module.exports = checkEmailAddresses
