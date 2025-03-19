// Function to generate code verifier
function generateCodeVerifier() {
    console.log('Generating Code Verifier...'); // Debugging line
    const array = new Uint32Array(56 / 2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substring(-2)).join('');
}

// Function to generate code challenge
function generateCodeChallenge(codeVerifier) {
    console.log('Generating Code Challenge...'); // Debugging line
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
        .then(buffer => {
            return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)))
                .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        });
}

// Constants for client ID and redirect URI
const CLIENT_ID = '3MVG9WVXk15qiz1JMmAGf9pWm1lyxU9qqQZA_TCIFgOJo54U04nH_rns62RRzRkAiKlkp5Z8xKUUwOwpUzCfJ'; // Replace with your actual client ID
const REDIRECT_URI = 'http://localhost:3000/callback';

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed'); // Debugging line

    // Event listener for login button click
    document.getElementById('loginButton').addEventListener('click', async () => {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        localStorage.setItem('code_verifier', codeVerifier);

        const authUrl = `https://login.salesforce.com/services/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=full&code_challenge=${codeChallenge}&code_challenge_method=S256`;
        window.location.href = authUrl;
    });

    // Check if the URL contains an authorization code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    console.log('Code:', code); // Debugging line

    if (code) {
        const encodedCode = encodeURIComponent(code);
        console.log('Encoded Code:', encodedCode); // Output the encoded code
        console.log('Authorization code found:', code); // Debugging line
        const codeVerifier = localStorage.getItem('code_verifier');
        console.log('Code Verifier:', codeVerifier); // Debugging line

        fetch('https://login.salesforce.com/services/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'client_id': CLIENT_ID,
                'redirect_uri': REDIRECT_URI,
                'code': encodedCode,
                'code_verifier': codeVerifier
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Token Response:', data); // Debugging line
            if (data.access_token) {
                document.getElementById('accessToken').innerText = `Access Token: ${data.access_token}`;
            } else {
                document.getElementById('accessToken').innerText = 'Access Token: undefined';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('accessToken').innerText = 'Access Token: undefined';
        });
    } else {
        console.log('No authorization code found'); // Debugging line
    }
});