/**
 * REST API Automation Verification Suite
 * DecodeLabs Backend API - Integration Verification
 */

const BASE_URL = 'http://127.0.0.1:5000/api';

const runTests = async () => {
  console.log('=====================================================');
  console.log('   Starting Backend REST API Verification Script');
  console.log('=====================================================\n');

  try {
    // 1. Verify health check
    console.log('Test 1: GET /health check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log(`Status: ${healthRes.status} (${healthRes.statusText})`);
    console.log(`Payload Response Success: ${healthData.success}`);
    console.log(`Server Status: ${healthData.status}\n`);

    // 2. Verify retrieving all tasks
    console.log('Test 2: GET /tasks (all items)...');
    const getTasksRes = await fetch(`${BASE_URL}/tasks`);
    const getTasksData = await getTasksRes.json();
    console.log(`Status: ${getTasksRes.status}`);
    console.log(`Task Count Returned: ${getTasksData.count}`);
    console.log(`Data array valid: ${Array.isArray(getTasksData.data) && getTasksData.data.length === 6}\n`);

    // 3. Verify POST creation with valid payload
    console.log('Test 3: POST /tasks (valid item payload)...');
    const validPayload = {
      title: "Backend API Validation",
      category: "interactivity",
      status: "in-progress",
      progress: 50,
      desc: "Engineering custom schema request sanitizers and middleware handlers in Node.js.",
      spec: [
        "Create custom verification middleware for JSON payload verification",
        "Strip illegal fields and trim whitespace strings",
        "Throw HTTP 400 validation array summaries"
      ],
      deliverables: "Dynamic API endpoints protected by server validations."
    };

    const postValidRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validPayload)
    });
    const postValidData = await postValidRes.json();
    console.log(`Status: ${postValidRes.status}`);
    console.log(`Message: ${postValidData.message}`);
    console.log(`Created Task ID: ${postValidData.data?.id}\n`);

    // 4. Verify POST validation failures (invalid payload)
    console.log('Test 4: POST /tasks (invalid payload - triggering validations)...');
    const invalidPayload = {
      title: "Hi", // Too short (min 3)
      category: "invalid-category", // Not in enum
      status: "pending",
      progress: 150, // Out of bounds (0-100)
      desc: "Too short", // Too short (min 10)
      spec: [], // Empty array (invalid)
      deliverables: "" // Empty string (invalid)
    };

    const postInvalidRes = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload)
    });
    const postInvalidData = await postInvalidRes.json();
    console.log(`Status: ${postInvalidRes.status} (${postInvalidRes.statusText})`);
    console.log(`Success status: ${postInvalidData.success}`);
    console.log(`Validation Errors Found: ${postInvalidData.errors?.length}`);
    postInvalidData.errors?.forEach(err => {
      console.log(` -> Field [${err.field}]: ${err.message}`);
    });
    console.log('');

    // 5. Verify GET single task (existing task)
    console.log('Test 5: GET /tasks/:id (get new task ID 7)...');
    const getSingleRes = await fetch(`${BASE_URL}/tasks/7`);
    const getSingleData = await getSingleRes.json();
    console.log(`Status: ${getSingleRes.status}`);
    console.log(`Retrieved task title: "${getSingleData.data?.title}"\n`);

    // 6. Verify GET single task (missing 404)
    console.log('Test 6: GET /tasks/:id (missing task ID 99)...');
    const getMissingRes = await fetch(`${BASE_URL}/tasks/99`);
    const getMissingData = await getMissingRes.json();
    console.log(`Status: ${getMissingRes.status} (${getMissingRes.statusText})`);
    console.log(`Success status: ${getMissingData.success}`);
    console.log(`Error message: ${getMissingData.error?.message}\n`);

    // 7. Verify PUT update task
    console.log('Test 7: PUT /tasks/:id (update progress of Task 7)...');
    const updatePayload = { ...validPayload, progress: 100, status: "completed" };
    const putRes = await fetch(`${BASE_URL}/tasks/7`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    });
    const putData = await putRes.json();
    console.log(`Status: ${putRes.status}`);
    console.log(`Updated Progress: ${putData.data?.progress}%`);
    console.log(`Updated Status: ${putData.data?.status}\n`);

    // 8. Verify DELETE task
    console.log('Test 8: DELETE /tasks/:id (delete Task 7)...');
    const deleteRes = await fetch(`${BASE_URL}/tasks/7`, { method: 'DELETE' });
    const deleteData = await deleteRes.json();
    console.log(`Status: ${deleteRes.status}`);
    console.log(`Message: ${deleteData.message}\n`);

    // 9. Verify GET deleted task returns 404
    console.log('Test 9: GET /tasks/7 (verify deletion)...');
    const checkDeletedRes = await fetch(`${BASE_URL}/tasks/7`);
    console.log(`Status: ${checkDeletedRes.status} (Expected: 404)\n`);

    console.log('=====================================================');
    console.log('   All API Endpoint integration tests completed.');
    console.log('=====================================================');
  } catch (error) {
    console.error('Error executing REST API tests:', error);
  }
};

runTests();
