
async function testRateLimit() {
  const url = 'http://localhost:3000/api/admin/login';
  const payload = { password: 'wrong-password' };

  console.log('--- Testing Rate Limiting ---');
  
  for (let i = 1; i <= 6; i++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    console.log(`Attempt ${i}: Status ${res.status}, Message: ${data.error || 'Success'}`);
    
    if (res.status === 429) {
      console.log('SUCCESS: Rate limit triggered!');
      break;
    }
  }
}

// Note: This script assumes the server is running on localhost:3000
// testRateLimit();
