const net = require('net');
const dns = require('dns');
const tls = require('tls');

const possibleServerConfigurations = [
    {port: 25, name: 'SMTP', secure: false},
    {port: 465, name: 'SMTPS', secure: true},
    {port: 587, name: 'SMTPS', secure: true},
    {port: 110, name: 'POP3', secure: false},
    {port: 995, name: 'POP3S', secure: true},
    {port: 143, name: 'IMAP', secure: false},
    {port: 993, name: 'IMAPS', secure: true}
];

const getMXRecords = async (server) => {
    return new Promise((resolve, reject) => {
        dns.resolveMx(server, (err, addresses) => {
            if (err) throw err;
            resolve(addresses);
        });
    });
}

const connectToServer = async (port, record, secure=false) => {

    if (secure) {
        return await connectToServerSecure(port, record);
    } else {
        return await connectToServerUnsecure(port, record);
    }
}

const connectToServerUnsecure = async (port, record) => {
    return new Promise((resolve, reject) => {
        try {
            const socket = new net.Socket();
            socket.setTimeout(3000);
            socket.connect(port, record, function () {
                socket.end();
                resolve(true);
            })
            socket.on('error', function (err) {
                resolve(false);
            })
        } catch (e) {
            resolve(false);
        }
    })
}

const connectToServerSecure = async (port, record) => {
    return new Promise((resolve, reject) => {
        try {
            const socket = tls.connect(port, record, function () {
                socket.end();
                resolve(true);
            })
            socket.on('error', function (err) {
                resolve(false);
            })
        } catch (e) {
            resolve(false);
        }
    })
}


// Function that returns a promise that resolve the server type: {port, name}
const checkServerType = async (server) => {
    let serverType = "unknown";

    const mxRecords = await getMXRecords(server);
    console.log(mxRecords);


    for (let record of mxRecords) {
        for (let serverConfiguration of possibleServerConfigurations) {
            const connected = await connectToServer(serverConfiguration.port, record.exchange);
            if (connected) {
                return Object.assign(serverConfiguration, {type: serverConfiguration.name, name: record.exchange});
            }
        }
    }

    return null;
}


module.exports = checkServerType;
