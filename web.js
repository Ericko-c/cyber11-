// Updated App.js with Service Images, Styled Header/Footer, and Home Enhancements

import React, { useEffect, useState, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  onSnapshot
} from "firebase/firestore";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";
import emailjs from 'emailjs-com';
import ReactGA from 'react-ga4';
import { Menu } from "lucide-react";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
ReactGA.initialize("G-XXXXXXXXXX");

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const signup = async (email, password) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCredential.user.uid), { role: "student" });
  };
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

function ProtectedRoute({ children, requiredRole }) {
  const { user, role, loading } = useAuth();
  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/unauthorized" />;
  return children;
}

function Navigation() {
  const { user, role } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-700 text-white shadow-md px-4 py-2">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <Link to="/" className="text-xl font-bold">Debsploit</Link>
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="w-6 h-6" />
        </button>
        <ul className="hidden md:flex space-x-4 font-semibold">
          {!user && <li><Link to="/login">Login</Link></li>}
          {!user && <li><Link to="/signup">Sign Up</Link></li>}
          {user && <li><Link to="/dashboard">Dashboard</Link></li>}
          {user && <li><Link to="/book">Book</Link></li>}
          {user && role === "admin" && <li><Link to="/admin" className="text-yellow-300">Admin</Link></li>}
        </ul>
      </div>
      {isOpen && (
        <ul className="md:hidden mt-2 space-y-2 font-semibold">
          {!user && <li><Link to="/login" onClick={() => setIsOpen(false)}>Login</Link></li>}
          {!user && <li><Link to="/signup" onClick={() => setIsOpen(false)}>Sign Up</Link></li>}
          {user && <li><Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link></li>}
          {user && <li><Link to="/book" onClick={() => setIsOpen(false)}>Book</Link></li>}
          {user && role === "admin" && <li><Link to="/admin" onClick={() => setIsOpen(false)} className="text-yellow-300">Admin</Link></li>}
        </ul>
      )}
    </nav>
  );
}

function Home() {
  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: "/" });
  }, []);
  return (
    <section className="text-center py-12">
      <h1 className="text-4xl md:text-6xl font-bold text-blue-600 mb-4">Debsploit Solutions</h1>
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-10">
        Empowering Communities with Digital Skills & Tech Services
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[
          { name: "Programming", image: "https://source.unsplash.com/400x300/?coding" },
          { name: "Graphics Design", image: "https://source.unsplash.com/400x300/?graphicdesign" },
          { name: "Cybersecurity", image: "https://source.unsplash.com/400x300/?cybersecurity" },
          { name: "Networking", image: "https://source.unsplash.com/400x300/?networking" },
          { name: "AI Training", image: "https://source.unsplash.com/400x300/?ai" },
          { name: "CCTV Installation", image: "https://source.unsplash.com/400x300/?cctv" },
        ].map((item, idx) => (
          <div key={idx} className="rounded-xl shadow hover:shadow-lg overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
            <div className="p-4 bg-white">
              <h2 className="text-lg font-bold text-blue-700">{item.name}</h2>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-blue-700 text-white text-center py-4 mt-12">
      <p>&copy; {new Date().getFullYear()} Debsploit Solutions. All Rights Reserved.</p>
      <p className="text-sm">info@debsploit.com | +25446838304</p>
    </footer>
  );
}

// Placeholder components to prevent errors
function LoginForm() {
  return <div>Login Form Placeholder</div>;
}
function SignupForm() {
  return <div>Signup Form Placeholder</div>;
}
function Dashboard() {
  return <div>Dashboard Placeholder</div>;
}
function BookingForm() {
  return <div>Booking Form Placeholder</div>;
}
function AdminPanel() {
  return <div>Admin Panel Placeholder</div>;
}
function Unauthorized() {
  return <div>Unauthorized Access</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <main className="min-h-screen bg-white text-gray-900 p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/book" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}
