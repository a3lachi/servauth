// test-auth-flow.ts
const baseURL = "http://localhost:3000";
const testEmail = `test${Date.now()}@example.com`;
const testPassword = "TestPass123!";

async function testAuthFlow() {
  console.log("🧪 Testing Authentication Flow\n");
  
  // 1. Register
  console.log("1️⃣ Testing Registration...");
  const registerRes = await fetch(`${baseURL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: "Test User"
    })
  });
  
  const registerData = await registerRes.json();
  console.log("Registration Response:", registerRes.status, registerData);
  
  if (registerRes.status !== 201) {
    console.error("❌ Registration failed");
    return;
  }
  console.log("✅ Registration successful\n");
  
  // 2. Login
  console.log("2️⃣ Testing Login...");
  const loginRes = await fetch(`${baseURL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword
    })
  });
  
  const loginData = await loginRes.json();
  console.log("Login Response:", loginRes.status, loginData);
  
  // Get cookies
  const cookies = loginRes.headers.get("set-cookie");
  console.log("Cookies received:", cookies);
  
  if (loginRes.status !== 200 || !cookies) {
    console.error("❌ Login failed or no cookies received");
    return;
  }
  console.log("✅ Login successful\n");
  
  // 3. Access protected route
  console.log("3️⃣ Testing Protected Route (/auth/me)...");
  const meRes = await fetch(`${baseURL}/auth/me`, {
    headers: {
      "Cookie": cookies
    }
  });
  
  const meData = await meRes.json();
  console.log("Me Response:", meRes.status, meData);
  
  if (meRes.status !== 200) {
    console.error("❌ Failed to access protected route");
    console.log("Debug: Cookie sent:", cookies);
  } else {
    console.log("✅ Successfully accessed protected route\n");
  }
  
  // 4. Update user
  console.log("4️⃣ Testing Update User...");
  const updateRes = await fetch(`${baseURL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookies
    },
    body: JSON.stringify({
      name: "Updated Test User"
    })
  });
  
  const updateData = await updateRes.json();
  console.log("Update Response:", updateRes.status, updateData);
  
  if (updateRes.status === 200) {
    console.log("✅ User updated successfully\n");
  } else {
    console.error("❌ Failed to update user\n");
  }
  
  // 5. Logout
  console.log("5️⃣ Testing Logout...");
  const logoutRes = await fetch(`${baseURL}/auth/logout`, {
    method: "POST",
    headers: {
      "Cookie": cookies
    }
  });
  
  const logoutData = await logoutRes.json();
  console.log("Logout Response:", logoutRes.status, logoutData);
  
  if (logoutRes.status === 200) {
    console.log("✅ Logout successful\n");
  } else {
    console.error("❌ Logout failed\n");
  }
  
  // 6. Try to access protected route after logout
  console.log("6️⃣ Testing Access After Logout...");
  const afterLogoutRes = await fetch(`${baseURL}/auth/me`, {
    headers: {
      "Cookie": cookies
    }
  });
  
  console.log("After Logout Response:", afterLogoutRes.status);
  
  if (afterLogoutRes.status === 401) {
    console.log("✅ Correctly denied access after logout\n");
  } else {
    console.error("❌ Should have been denied access\n");
  }
  
  console.log("🎉 Test flow completed!");
}

// Run the test
testAuthFlow().catch(console.error);