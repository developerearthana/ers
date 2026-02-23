const https = require('https');
https.get('https://api.ipify.org', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Your IPv4 is:', data));
});
https.get('https://api6.ipify.org', (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => console.log('Your IPv6 is:', data));
});
