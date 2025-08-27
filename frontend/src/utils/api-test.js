// Quick API endpoint tester - run in browser console
// Copy and paste this into your browser console on the generate page

const testAPI = async () => {
  const baseUrl = 'http://localhost:8080/api';
  
  const endpoints = [
    '/crews',
    '/templates', 
    '/club-presets',
    '/generate-images'
  ];
  
  console.log('🔍 Testing API endpoints...\n');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const fullUrl = baseUrl + endpoint;
    console.log(`Testing: ${fullUrl}`);
    
    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed
          ...(localStorage.getItem('sessionId') ? {
            'Authorization': `Bearer ${localStorage.getItem('sessionId')}`
          } : {})
        }
      });
      
      const status = response.status;
      const statusText = response.statusText;
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = await response.text();
      }
      
      results.push({
        endpoint,
        status,
        statusText,
        ok: response.ok,
        data: typeof data === 'string' ? data.substring(0, 100) + '...' : data
      });
      
      console.log(`✅ ${endpoint}: ${status} ${statusText}`);
      
    } catch (error) {
      results.push({
        endpoint,
        status: 'ERROR',
        statusText: error.message,
        ok: false,
        data: null
      });
      
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('\n📊 Results Summary:');
  console.table(results);
  
  return results;
};

// Available in console as: testAPI()
window.testAPI = testAPI;

console.log('🚀 API Tester loaded! Run testAPI() in console to test all endpoints.');