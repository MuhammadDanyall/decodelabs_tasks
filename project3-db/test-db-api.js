/**
 * Project 3 Database Integration API Verification Test Suite
 * Automated tests for 1:1, 1:Many, and Many:Many database persistence endpoints.
 */

const BASE_URL = 'http://127.0.0.1:5001/api';

const runTests = async () => {
  console.log('========================================================');
  console.log('   Starting Project 3 Database REST API Verifications');
  console.log('========================================================\n');

  try {
    // --- TEST 1: Health Diagnostic check ---
    console.log('Test 1: Fetching API Server Health...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log(` -> Status: ${healthRes.status}`);
    console.log(` -> Server Active: ${healthData.success}`);
    console.log(` -> Storage Engine: ${healthData.engine}\n`);

    // --- TEST 2: Create User & Profile (1:1 Transaction) ---
    console.log('Test 2: POST /api/users (Creating User & Profile)...');
    const userPayload = {
      email: 'john.dev@decodelabs.com',
      password: 'securepassword123',
      fullName: 'John Dev',
      phoneNumber: '+15550199'
    };
    const createUserRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload)
    });
    const createUserData = await createUserRes.json();
    console.log(` -> Status: ${createUserRes.status}`);
    console.log(` -> Success: ${createUserData.success}`);
    console.log(` -> User ID Created: ${createUserData.data?.id}`);
    console.log(` -> Profile Name Linked: "${createUserData.data?.profile?.fullName}"\n`);
    
    const userId = createUserData.data?.id;

    // --- TEST 3: Validate Unique Constraint (Pillar 4 Shield) ---
    console.log('Test 3: POST /api/users (Triggering duplicate unique email error)...');
    const dupUserRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload)
    });
    const dupUserData = await dupUserRes.json();
    console.log(` -> Status: ${dupUserRes.status} (Expected: 409 Conflict)`);
    console.log(` -> Error message: "${dupUserData.message}"\n`);

    // --- TEST 4: Get All Users (1:1 Read verification) ---
    console.log('Test 4: GET /api/users (Retrieve joined users list)...');
    const getUsersRes = await fetch(`${BASE_URL}/users`);
    const getUsersData = await getUsersRes.json();
    console.log(` -> Status: ${getUsersRes.status}`);
    console.log(` -> Total Database Users: ${getUsersData.count}`);
    console.log(` -> First User Email: "${getUsersData.data?.[0]?.email}"`);
    console.log(` -> Joined Profile Name: "${getUsersData.data?.[0]?.profile?.fullName}"\n`);

    // --- TEST 5: Update User Profile (1:1 PUT modification) ---
    console.log(`Test 5: PUT /api/users/${userId} (Updating Profile details)...`);
    const updateProfilePayload = {
      fullName: 'John Senior Developer',
      phoneNumber: '+19999999'
    };
    const updateRes = await fetch(`${BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateProfilePayload)
    });
    const updateData = await updateRes.json();
    console.log(` -> Status: ${updateRes.status}`);
    console.log(` -> Updated Profile Name: "${updateData.data?.fullName}"\n`);

    // --- TEST 6: Create Customer & Order (1:Many mapping) ---
    console.log('Test 6a: POST /api/customers (Creating customer)...');
    const customerPayload = { name: 'Sarah Tech', email: 'sarah@decodelabs.com' };
    const createCustomerRes = await fetch(`${BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerPayload)
    });
    const createCustomerData = await createCustomerRes.json();
    console.log(` -> Status: ${createCustomerRes.status}`);
    console.log(` -> Customer ID: ${createCustomerData.data?.id}\n`);
    
    const customerId = createCustomerData.data?.id;

    console.log('Test 6b: POST /api/orders (Creating order linked to Customer)...');
    const orderPayload = { amount: 499.95, status: 'pending', customerId };
    const createOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    const createOrderData = await createOrderRes.json();
    console.log(` -> Status: ${createOrderRes.status}`);
    console.log(` -> Order ID: ${createOrderData.data?.id}`);
    console.log(` -> Linked Customer ID (FK): ${createOrderData.data?.customerId}\n`);

    const orderId = createOrderData.data?.id;

    // --- TEST 7: Get Customer Orders (1:Many Read verification) ---
    console.log(`Test 7: GET /api/customers/${customerId}/orders (Fetch orders array)...`);
    const getOrdersRes = await fetch(`${BASE_URL}/customers/${customerId}/orders`);
    const getOrdersData = await getOrdersRes.json();
    console.log(` -> Status: ${getOrdersRes.status}`);
    console.log(` -> Customer: "${getOrdersData.customer?.name}"`);
    console.log(` -> Total Orders Count: ${getOrdersData.ordersCount}`);
    console.log(` -> Order Amount: $${getOrdersData.orders?.[0]?.amount}\n`);

    // --- TEST 8: Create Student, Course, & Enroll (Many:Many configuration) ---
    console.log('Test 8a: POST /api/students (Creating student record)...');
    const studentPayload = { name: 'Danyal Amin', matricNumber: 'DL2026-042' };
    const createStudentRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentPayload)
    });
    const createStudentData = await createStudentRes.json();
    console.log(` -> Status: ${createStudentRes.status}`);
    console.log(` -> Student ID: ${createStudentData.data?.id}\n`);
    
    const studentId = createStudentData.data?.id;

    console.log('Test 8b: POST /api/courses (Creating course record)...');
    const coursePayload = { code: 'CS-302', title: 'Relational Database Design' };
    const createCourseRes = await fetch(`${BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coursePayload)
    });
    const createCourseData = await createCourseRes.json();
    console.log(` -> Status: ${createCourseRes.status}`);
    console.log(` -> Course ID: ${createCourseData.data?.id}\n`);

    const courseId = createCourseData.data?.id;

    console.log('Test 8c: POST /api/enroll (Mapping student course enrollment junction)...');
    const enrollRes = await fetch(`${BASE_URL}/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, courseId })
    });
    const enrollData = await enrollRes.json();
    console.log(` -> Status: ${enrollRes.status}`);
    console.log(` -> Composite studentId_courseId enrolled: ${enrollData.data?.studentId}_${enrollData.data?.courseId}\n`);

    // --- TEST 9: Query Many:Many relationships from both sides ---
    console.log('Test 9a: GET /api/courses/CS-302/students (Checking students enrolled in course)...');
    const courseStudentsRes = await fetch(`${BASE_URL}/courses/CS-302/students`);
    const courseStudentsData = await courseStudentsRes.json();
    console.log(` -> Status: ${courseStudentsRes.status}`);
    console.log(` -> Course: "${courseStudentsData.title}"`);
    console.log(` -> Enrolled Student Name: "${courseStudentsData.students?.[0]?.name}"\n`);

    console.log(`Test 9b: GET /api/students/${studentId}/courses (Checking courses student registered for)...`);
    const studentCoursesRes = await fetch(`${BASE_URL}/students/${studentId}/courses`);
    const studentCoursesData = await studentCoursesRes.json();
    console.log(` -> Status: ${studentCoursesRes.status}`);
    console.log(` -> Student: "${studentCoursesData.name}"`);
    console.log(` -> Course Code Registered: "${studentCoursesData.courses?.[0]?.code}"\n`);

    // --- TEST 10: Cascade Deletes Verification (1:1 & 1:Many checks) ---
    console.log(`Test 10a: DELETE /api/users/${userId} (Testing 1:1 Cascade)...`);
    const deleteUserRes = await fetch(`${BASE_URL}/users/${userId}`, { method: 'DELETE' });
    console.log(` -> Delete Status: ${deleteUserRes.status}`);
    
    // Check if user is gone
    const checkUserRes = await fetch(`${BASE_URL}/users/${userId}`);
    console.log(` -> Fetch User Status after delete (Expected: 404): ${checkUserRes.status}\n`);

    console.log(`Test 10b: DELETE /api/customers/${customerId} (Testing 1:Many Cascade)...`);
    const deleteCustomerRes = await fetch(`${BASE_URL}/customers/${customerId}`, { method: 'DELETE' });
    console.log(` -> Delete Status: ${deleteCustomerRes.status}`);

    // Check if customer orders are gone
    const checkOrdersRes = await fetch(`${BASE_URL}/customers/${customerId}/orders`);
    console.log(` -> Fetch Orders Status after customer delete (Expected: 404): ${checkOrdersRes.status}\n`);

    // --- TEST 11: Junction Unenrollment (Many:Many composite key delete) ---
    console.log('Test 11: DELETE /api/enroll (Testing Many:Many unenrollment composite purge)...');
    const unenrollRes = await fetch(`${BASE_URL}/enroll`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, courseId })
    });
    const unenrollData = await unenrollRes.json();
    console.log(` -> Status: ${unenrollRes.status}`);
    console.log(` -> Message: "${unenrollData.message}"\n`);

    // Check if student list in course CS-302 is empty now
    const checkCourseStudsRes = await fetch(`${BASE_URL}/courses/CS-302/students`);
    const checkCourseStudsData = await checkCourseStudsRes.json();
    console.log(` -> Final Enrolled Students Count: ${checkCourseStudsData.enrolledStudentsCount}`);

    console.log('\n========================================================');
    console.log('   All Database REST API integration tests completed.');
    console.log('========================================================');
  } catch (error) {
    console.error('❌ Error executing integration test script:', error);
  }
};

runTests();
