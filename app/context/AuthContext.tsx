"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "citizen" | "admin";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch role from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            setRole((userDoc.data().role as UserRole) || "citizen");
          } else {
            setRole("citizen");
          }
        } catch {
          setRole("citizen");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signup = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Set display name on the auth profile
    await updateProfile(cred.user, { displayName });

    // Create user document in Firestore
    await setDoc(doc(db, "users", cred.user.uid), {
      displayName,
      email,
      role: "citizen",
      createdAt: serverTimestamp(),
    });

    setRole("citizen");
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
