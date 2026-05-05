import { db, auth, admin } from '../../config/firebase.js';

export class PlatformUserService {
  static async listUsers() {
    const snapshot = await db.collection('platform_users').orderBy('created_at', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  static async createUser(data, createdBy) {
    const { name, email, role, password } = data;
    
    // Create in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password: password || Math.random().toString(36).slice(-10),
      displayName: name,
    });

    // Set Platform Admin Claims
    await auth.setCustomUserClaims(userRecord.uid, {
      is_platform_admin: true,
      role: role
    });

    const userData = {
      name,
      email,
      role,
      status: 'active',
      created_at: admin.firestore.Timestamp.now(),
      created_by: createdBy,
      last_login_at: null
    };

    await db.collection('platform_users').doc(userRecord.uid).set(userData);
    
    return { id: userRecord.uid, ...userData };
  }

  static async updateRole(id, { role }, performedBy) {
    await db.collection('platform_users').doc(id).update({ 
      role, 
      updated_at: admin.firestore.Timestamp.now() 
    });
    
    // Update claims
    await auth.setCustomUserClaims(id, {
      is_platform_admin: true,
      role: role
    });

    return { id, role };
  }

  static async deleteUser(id) {
    await auth.deleteUser(id);
    await db.collection('platform_users').doc(id).delete();
    return { id };
  }
}
