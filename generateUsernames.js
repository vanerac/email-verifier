


const emailFormats = (serverName) =>  [
    (first, last) => first + "." + last + "@" + serverName,
    (first, last) => first[0] + last + "@" + serverName,
    (first, last) => first + last[0] + "@" + serverName,
    (first, last) => first + "-" + last + "@" + serverName,
    (first, last) => first + "_" + last + "@" + serverName,
    (first, last) => first + last + "@" + serverName,
    (first, last) => first + "@" + serverName,
    (first, last) => last + "@" + serverName,
];

const generateEmails = (firstName, lastName, serverName) => emailFormats(serverName).map(format => format(firstName, lastName));

module.exports = generateEmails;
