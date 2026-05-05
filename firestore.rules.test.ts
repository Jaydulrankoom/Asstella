import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import * as fs from "fs";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  // Load the rules file
  const rules = fs.readFileSync('firestore.rules', 'utf8');

  testEnv = await initializeTestEnvironment({
    projectId: 'demo-asstella-erp',
    firestore: {
      rules,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe('Asstella ERP Firestore Multi-Tenant Security Rules', () => {

  const TENANT_A = 'tenant_a';
  const TENANT_B = 'tenant_b';
  const USER_A_ID = 'alice';
  const USER_B_ID = 'bob';

  const userAContext = () => testEnv.authenticatedContext(USER_A_ID, { tenant_id: TENANT_A, permissions: { 'asset_register.create': true, 'asset_register.edit': true } });
  const userBContext = () => testEnv.authenticatedContext(USER_B_ID, { tenant_id: TENANT_B });

  it('ALLOWS authenticated user to read assets in their own tenant', async () => {
    const db = userAContext().firestore();
    const docRef = db.collection(`tenants/${TENANT_A}/assets`).doc('asset_123');
    await assertSucceeds(docRef.get());
  });

  it('DENIES authenticated user from reading assets in a different tenant', async () => {
    // User A belongs to TENANT_A, trying to read TENANT_B
    const db = userAContext().firestore();
    const docRef = db.collection(`tenants/${TENANT_B}/assets`).doc('asset_456');
    await assertFails(docRef.get());
  });

  it('ALLOWS user with asset_register.create permission to write asset in their own tenant', async () => {
    const db = userAContext().firestore();
    const docRef = db.collection(`tenants/${TENANT_A}/assets`).doc('asset_new');
    await assertSucceeds(docRef.set({ name: 'Laptop', tenant_id: TENANT_A }));
  });

  it('DENIES user without asset_register.create permission to write asset', async () => {
    // User B doesn't have permissions configured in auth token
    const db = userBContext().firestore();
    const docRef = db.collection(`tenants/${TENANT_B}/assets`).doc('asset_new_bob');
    await assertFails(docRef.set({ name: 'Monitor', tenant_id: TENANT_B }));
  });

  it('DENIES user from reading depreciation_logs in a different tenant', async () => {
    const db = userAContext().firestore();
    const docRef = db.collection(`tenants/${TENANT_B}/depreciation_logs`).doc('log_123');
    await assertFails(docRef.get());
  });

  it('DENIES user from writing depreciation_logs (Server-only)', async () => {
    const db = userAContext().firestore();
    const docRef = db.collection(`tenants/${TENANT_A}/depreciation_logs`).doc('log_123');
    // Even if reading is allowed (if same tenant), writing MUST fail because it's server-only.
    await assertFails(docRef.set({ asset_id: '123' }));
  });
  
  it('ALLOWS platform admin to access tenant metadata', async () => {
    const adminContext = testEnv.authenticatedContext('platform_admin_id', { is_platform_admin: true });
    const db = adminContext.firestore();
    const docRef = db.collection('tenants').doc(TENANT_A);
    // Platform admin should succeed
    await assertSucceeds(docRef.get());
  });
});
