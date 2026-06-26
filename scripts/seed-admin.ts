// Script to seed the admin account in Firebase Auth + Firestore
// Run once: npx tsx scripts/seed-admin.ts

import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDERYSBpHMfuSQVcc8ze0RIOw6wEAhbb3I",
  authDomain: "civic-us.firebaseapp.com",
  projectId: "civic-us",
  storageBucket: "civic-us.firebasestorage.app",
  messagingSenderId: "1024923109060",
  appId: "1:1024923109060:web:f30149e3232853d3ca6b91",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_EMAIL = "admin@civicus.com";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "Admin";

async function seedAdmin() {
  try {
    // Try to create the user
    let uid: string;
    try {
      const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      await updateProfile(cred.user, { displayName: ADMIN_NAME });
      uid = cred.user.uid;
      console.log("✅ Admin auth account created");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        // User already exists — sign in to get the UID
        const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        uid = cred.user.uid;
        console.log("ℹ️  Admin auth account already exists, updating Firestore role...");
      } else {
        throw err;
      }
    }

    // Set admin role in Firestore
    await setDoc(doc(db, "users", uid), {
      displayName: ADMIN_NAME,
      email: ADMIN_EMAIL,
      role: "admin",
      createdAt: serverTimestamp(),
    });

    console.log("✅ Admin Firestore document set with role: admin");
    console.log(`\n🔑 Admin credentials:`);
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log(`   UID:      ${uid}`);
    console.log(`\nYou can now log in at /admin/login`);

    process.exit(0);
  } catch (error: any) {
    console.error("❌ Failed to seed admin:", error.message);
    process.exit(1);
  }
}

seedAdmin();
