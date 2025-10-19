// Complete API Endpoint Tester
// Run with: node test-endpoints.js

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testResults = [];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const lib = urlObj.protocol === 'https:' ? https : http;
    const req = lib.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test result logging
function logTest(endpoint, method, status, expected, actual, details = '') {
  const success = status === expected;
  const color = success ? colors.green : colors.red;
  const symbol = success ? '✅' : '❌';
  
  console.log(`${color}${symbol} ${method} ${endpoint} - ${actual}${colors.reset}`);
  if (details) console.log(`   ${colors.blue}ℹ️  ${details}${colors.reset}`);
  
  testResults.push({
    endpoint,
    method,
    expected,
    actual,
    success,
    details
  });
}

// Test functions
async function testHealth() {
  console.log(`\n${colors.bold}${colors.yellow}=== HEALTH CHECK ===${colors.reset}`);
  try {
    const response = await makeRequest(`${BASE_URL}/health`);
    logTest('/health', 'GET', 200, response.status, `Server is ${response.data.status}`);
  } catch (error) {
    logTest('/health', 'GET', 200, 'ERROR', `Connection failed: ${error.message}`);
  }
}

async function testPublicEndpoints() {
  console.log(`\n${colors.bold}${colors.yellow}=== PUBLIC ENDPOINTS ===${colors.reset}`);
  
  // Test Routes
  try {
    const response = await makeRequest(`${BASE_URL}/routes`);
    logTest('/routes', 'GET', 200, response.status, `Found ${response.data.length || 0} routes`);
  } catch (error) {
    logTest('/routes', 'GET', 200, 'ERROR', error.message);
  }

  // Test Buses
  try {
    const response = await makeRequest(`${BASE_URL}/buses`);
    logTest('/buses', 'GET', 200, response.status, `Found ${response.data.length || 0} buses`);
  } catch (error) {
    logTest('/buses', 'GET', 200, 'ERROR', error.message);
  }

  // Test specific route (using actual route ID from your data)
  try {
    const response = await makeRequest(`${BASE_URL}/routes/101`);
    logTest('/routes/101', 'GET', 200, response.status, `Route details loaded`);
  } catch (error) {
    logTest('/routes/101', 'GET', 200, 'ERROR', error.message);
  }

  // Test specific bus (using actual bus ID from your data)
  try {
    const response = await makeRequest(`${BASE_URL}/buses/10101`);
    logTest('/buses/10101', 'GET', 200, response.status, `Bus details loaded`);
  } catch (error) {
    logTest('/buses/10101', 'GET', 200, 'ERROR', error.message);
  }
}

async function testAuthEndpoints() {
  console.log(`\n${colors.bold}${colors.yellow}=== AUTHENTICATION ENDPOINTS ===${colors.reset}`);

  // Test Registration
  try {
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'testpass123',
      role: 'user'
    };
    
    const response = await makeRequest(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: testUser
    });
    
    if (response.status === 201) {
      logTest('/auth/register', 'POST', 201, response.status, 'User registered successfully');
    } else {
      logTest('/auth/register', 'POST', 201, response.status, response.data.message || 'Registration failed');
    }
  } catch (error) {
    logTest('/auth/register', 'POST', 201, 'ERROR', error.message);
  }

  // Test Login with admin credentials
  try {
    const loginData = {
      email: 'admin@bustrack.com',
      password: 'admin123456'
    };
    
    const response = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: loginData
    });
    
    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      logTest('/auth/login', 'POST', 200, response.status, 'Login successful, token obtained');
    } else {
      logTest('/auth/login', 'POST', 200, response.status, response.data.message || 'Login failed');
    }
  } catch (error) {
    logTest('/auth/login', 'POST', 200, 'ERROR', error.message);
  }

  // Test Profile (requires auth)
  if (authToken) {
    try {
      const response = await makeRequest(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      logTest('/auth/profile', 'GET', 200, response.status, `Profile loaded for ${response.data.user?.name || 'user'}`);
    } catch (error) {
      logTest('/auth/profile', 'GET', 200, 'ERROR', error.message);
    }
  }

  // Test Token Refresh
  if (authToken) {
    try {
      const response = await makeRequest(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      logTest('/auth/refresh', 'POST', 200, response.status, 'Token refreshed');
    } catch (error) {
      logTest('/auth/refresh', 'POST', 200, 'ERROR', error.message);
    }
  }
}

async function testAdminEndpoints() {
  console.log(`\n${colors.bold}${colors.yellow}=== ADMIN ENDPOINTS ===${colors.reset}`);
  
  if (!authToken) {
    console.log(`${colors.red}❌ No auth token available. Skipping admin tests.${colors.reset}`);
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${authToken}`
  };

  // Test Admin Dashboard Stats
  try {
    const response = await makeRequest(`${BASE_URL}/admin/stats`, {
      method: 'GET',
      headers: authHeaders
    });
    logTest('/admin/stats', 'GET', 200, response.status, `Stats: ${JSON.stringify(response.data).substring(0, 50)}...`);
  } catch (error) {
    logTest('/admin/stats', 'GET', 200, 'ERROR', error.message);
  }

  // Test Admin Users List
  try {
    const response = await makeRequest(`${BASE_URL}/admin/users`, {
      method: 'GET',
      headers: authHeaders
    });
    logTest('/admin/users', 'GET', 200, response.status, `Found ${response.data.users?.length || 0} users`);
  } catch (error) {
    logTest('/admin/users', 'GET', 200, 'ERROR', error.message);
  }

  // Test Create User
  try {
    const newUser = {
      name: 'Admin Test User',
      email: `admintest${Date.now()}@example.com`,
      password: 'admintest123',
      role: 'user'
    };
    
    const response = await makeRequest(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: authHeaders,
      body: newUser
    });
    logTest('/admin/users', 'POST', 201, response.status, 'User created by admin');
  } catch (error) {
    logTest('/admin/users', 'POST', 201, 'ERROR', error.message);
  }

  // Test Create Bus
  try {
    const newBus = {
      bus_id: Math.floor(Date.now() / 1000), // Convert timestamp to number
      route_id: 101, // Use existing route ID
      capacity: 50,
      type: 'normal',
      status: 'On Time' // Match your enum values
    };
    
    const response = await makeRequest(`${BASE_URL}/admin/buses`, {
      method: 'POST',
      headers: authHeaders,
      body: newBus
    });
    logTest('/admin/buses', 'POST', 201, response.status, `Bus ${newBus.bus_id} created`);
  } catch (error) {
    logTest('/admin/buses', 'POST', 201, 'ERROR', error.message);
  }

  // Test Create Route
  try {
    const newRoute = {
      route_id: Math.floor(Date.now() / 1000) + 1000, // Unique number ID
      name: 'Test Route ' + Date.now()
    };
    
    const response = await makeRequest(`${BASE_URL}/admin/routes`, {
      method: 'POST',
      headers: authHeaders,
      body: newRoute
    });
    logTest('/admin/routes', 'POST', 201, response.status, `Route ${newRoute.route_id} created`);
  } catch (error) {
    logTest('/admin/routes', 'POST', 201, 'ERROR', error.message);
  }
}

async function testErrorCases() {
  console.log(`\n${colors.bold}${colors.yellow}=== ERROR HANDLING ===${colors.reset}`);

  // Test unauthorized access
  try {
    const response = await makeRequest(`${BASE_URL}/admin/users`);
    logTest('/admin/users (no auth)', 'GET', 401, response.status, 'Correctly rejected unauthorized request');
  } catch (error) {
    logTest('/admin/users (no auth)', 'GET', 401, 'ERROR', error.message);
  }

  // Test invalid login
  try {
    const response = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    });
    logTest('/auth/login (invalid)', 'POST', 401, response.status, 'Correctly rejected invalid credentials');
  } catch (error) {
    logTest('/auth/login (invalid)', 'POST', 401, 'ERROR', error.message);
  }

  // Test non-existent endpoint
  try {
    const response = await makeRequest(`${BASE_URL}/nonexistent`);
    logTest('/nonexistent', 'GET', 404, response.status, 'Correctly returned 404');
  } catch (error) {
    logTest('/nonexistent', 'GET', 404, 'ERROR', error.message);
  }
}

async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}🧪 NTC Bus API - Complete Endpoint Testing${colors.reset}\n`);
  console.log(`Testing server at: ${BASE_URL}`);
  console.log(`Started at: ${new Date().toLocaleString()}\n`);

  await testHealth();
  await testPublicEndpoints();
  await testAuthEndpoints();
  await testAdminEndpoints();
  await testErrorCases();

  // Summary
  console.log(`\n${colors.bold}${colors.yellow}=== TEST SUMMARY ===${colors.reset}`);
  const passed = testResults.filter(t => t.success).length;
  const failed = testResults.filter(t => !t.success).length;
  const total = testResults.length;

  console.log(`${colors.green}✅ Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
  console.log(`📊 Total: ${total}`);
  console.log(`📈 Success Rate: ${((passed/total) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log(`\n${colors.bold}Failed Tests:${colors.reset}`);
    testResults.filter(t => !t.success).forEach(test => {
      console.log(`${colors.red}❌ ${test.method} ${test.endpoint} - ${test.details}${colors.reset}`);
    });
  }

  console.log(`\n${colors.bold}${colors.green}🎉 Testing complete!${colors.reset}`);
  
  if (authToken) {
    console.log(`\n${colors.blue}💡 Auth Token (for manual testing):${colors.reset}`);
    console.log(`Bearer ${authToken}`);
  }
}

// Run the tests
runAllTests().catch(console.error);