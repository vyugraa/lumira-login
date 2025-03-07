const axios = require('axios');
const fs = require('fs').promises;

async function getFirebaseToken(email, password) {
    try {
        const url = 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword';
        
        const params = {
            key: 'AIzaSyB0YXNLWl-mPWQNX-tvd7rp-HVNr_GhAmk'
        };

        const payload = {
            email: email,
            password: password,
            returnSecureToken: true,
            clientType: 'CLIENT_TYPE_ANDROID'
        };

        const headers = {
            'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 9; ASUS_Z01QD Build/PI)',
            'Connection': 'Keep-Alive',
            'Accept-Encoding': 'gzip',
            'Content-Type': 'application/json',
            'X-Android-Package': 'com.lumira_mobile',
            'X-Android-Cert': '1A1F179100AAF62649EAD01C6870FDE2510B1BC2',
            'Accept-Language': 'en-US',
            'X-Client-Version': 'Android/Fallback/X22003001/FirebaseCore-Android',
            'X-Firebase-GMPID': '1:599727959790:android:5c819be0c7e7e3057a4dff',
            'X-Firebase-Client': 'H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA'
        };

        const response = await axios.post(url, payload, { 
            params: params, 
            headers: headers 
        });

        return {
            email: response.data.email,
            idToken: response.data.idToken
        };

    } catch (error) {
        console.error(`Error for ${email}:`, error.response?.data?.error?.message || error.message);
        return null;
    }
}

async function processAccounts() {
    try {
        const data = await fs.readFile('accounts.json', 'utf8');
        const accounts = JSON.parse(data);
        let allTokens = [];
        
        for (const account of accounts) {
            const tokenData = await getFirebaseToken(account.email, account.password);
            if (tokenData) {
                allTokens.push(tokenData);
            }
        }
        
        if (allTokens.length > 0) {
            const content = allTokens.map(t => `email:${t.email}\ntoken:${t.idToken}`).join('\n\n') + '\n';
            await fs.writeFile('token.txt', content);
            console.log(`\n${allTokens.length} token berhasil disimpan ke token.txt`);
        } else {
            console.log('Tidak ada token yang berhasil didapatkan');
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

processAccounts();
