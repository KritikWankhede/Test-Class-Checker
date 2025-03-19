(async () => {
    const fetch = (await import('node-fetch')).default;
    const express = require('express');
    const app = express();
    const port = 3000;

    app.use(express.static('public'));

    app.get('/callback', async (req, res) => {
        const authorizationCode = req.query.code;
        const tokenUrl = 'https://login.salesforce.com/services/oauth2/token';
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'code': authorizationCode,
                'client_id': 'client_id', // Replace with your actual client ID
                'client_secret': 'client_secret', // Replace with your actual client secret
                'redirect_uri': 'http://localhost:3000/callback'
            })
        });
        const data = await response.json();
        const accessToken = data.access_token;
        res.send(`Access Token: ${accessToken}`);
    });

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
})();