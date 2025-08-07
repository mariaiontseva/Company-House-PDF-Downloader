const fetch = require('node-fetch');
const { spawn } = require('child_process');

async function testLocalProxy() {
    console.log('Starting local proxy server...');
    
    // Start the proxy server
    const server = spawn('node', ['proxy-server.js'], {
        env: { ...process.env, PORT: '3003' }
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('\nTesting sanctions endpoint locally...\n');
    
    const testCases = [
        'SBERBANK CIB (UK) LIMITED',
        'VTB CAPITAL PLC'
    ];
    
    for (const name of testCases) {
        try {
            console.log(`Testing: ${name}`);
            const response = await fetch(`http://localhost:3003/api/sanctions/check/${encodeURIComponent(name)}`);
            const data = await response.json();
            
            if (data.status === 'success' && data.data) {
                console.log(`  Sanctioned: ${data.data.sanctioned}`);
                if (data.data.sanctioned) {
                    console.log(`  Lists: ${data.data.lists.join(', ')}`);
                    console.log(`  Matched: ${data.data.matchedName}`);
                }
            } else {
                console.log('  Error:', data);
            }
        } catch (error) {
            console.log('  Request failed:', error.message);
        }
    }
    
    // Kill the server
    server.kill();
    console.log('\nLocal test complete.');
}

testLocalProxy().catch(console.error);