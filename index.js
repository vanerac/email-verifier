const checkServerType = require('./exploreServers');
const generateEmails = require('./generateUsernames');
const SMTPcheckEmailAddresses = require('./exporeUsers');

const domain = process.argv[2];
const firstName = process.argv[3];
const lastName = process.argv[4];

const main = async () => {
    const serverName = domain;
    const serverConfiguration = await checkServerType(serverName)

    if (!serverConfiguration) {
        console.log(`Could not determine server configuration for ${serverName}`);
        return;
    }
    const emails = generateEmails(firstName, lastName, serverName);

    if (serverConfiguration.type === 'SMTP') {
        const validEmails = await SMTPcheckEmailAddresses(serverConfiguration.name, serverConfiguration.port, emails);
        console.log(validEmails);
    } else {
        console.log('Not implemented');
    }


}


// Errors:
// Outlook Permission denied from domain
// Gandi : Blacklisted address by gandi


main()
