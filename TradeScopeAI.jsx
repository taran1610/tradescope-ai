// Import the Supabase client
import { createClient } from '@supabase/supabase-js';

// Use the public Vercel environment variables (NEXT_PUBLIC_ prefix)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TradeScopeAI = () => {
  // ... rest of your component logic


import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)






  import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
// Assuming you have components like TradeInputForm, SessionList, etc.
// import TradeInputForm from './TradeInputForm'; 
// import SessionList from './SessionList'; 

// --- 1. Supabase Initialization (Outside Component) ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- 2. AuthForm Component (Login/Signup UI) ---
const AuthForm = ({ handleAuth, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuth(email, password, isSignUp);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        {isSignUp ? "Already have an account?" : "Need an account?"}
        <button 
          type="button" 
          onClick={() => setIsSignUp(!isSignUp)} 
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginLeft: '5px' }}
        >
          {isSignUp ? 'Log In' : 'Sign Up'}
        </button>
      </p>
    </div>
  );
};


// --- 3. Main Application Component ---
const TradeScopeAI = () => {
  const [session, setSession] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [authLoading, setAuthLoading] = useState(false);
  // Add your other state here: 
  const [tradeInput, setTradeInput] = useState('');
  // ... other state variables

  // --- 4. Authentication Logic ---
  const handleAuth = async (email, password, isSignUp) => {
    setAuthLoading(true);
    let error;

    if (isSignUp) {
      // Supabase handles user creation and RLS assignment automatically
      ({ error } = await supabase.auth.signUp({ email, password }));
    } else {
      ({ error } = await supabase.auth.signInWithPassword({ email, password }));
    }

    setAuthLoading(false);

    if (error) {
      alert(`Authentication Error: ${error.message}`);
    } else if (isSignUp) {
        alert("Sign up successful! Please check your email to confirm your account.");
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout Error:', error.message);
  };

  // --- 5. Data Handling Logic (Uses RLS) ---
  const loadSessions = async () => {
    // RLS (Row Level Security) ensures this only fetches sessions for the currently logged-in user
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false }); 
      
    if (error) {
      console.error('Error loading sessions:', error.message);
      setSessions([]);
      return;
    }
    setSessions(data);
  };

  const saveSession = async (sessionData) => {
    // Insert or update a session. The 'user_id' column is automatically filled 
    // by the RLS INSERT policy you set up.
    const { error } = await supabase
      .from('sessions')
      .upsert([sessionData], { onConflict: 'id' }); // Assuming 'id' is the primary key

    if (error) {
      console.error('Error saving session:', error.message);
    } else {
      loadSessions(); // Reload the list after a successful save
    }
  };
  
  // --- 6. Effects (Check Session and Load Data) ---
  useEffect(() => {
    // 6a. Set initial session and listen for changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      // Clean up the listener
      authListener.subscription.unsubscribe();
    };
  }, []); // Run only on mount

  useEffect(() => {
    // 6b. Load data only when a session is active
    if (session) {
      loadSessions();
    } else {
      setSessions([]);
    }
  }, [session]); // Rerun when session changes

  // --- 7. Conditional Render (Show Auth or App) ---
  if (!session) {
    return <AuthForm handleAuth={handleAuth} loading={authLoading} />;
  }
  
  // --- 8. Main Application UI ---
  // If the user is logged in, show the main application UI
  return (
    <div className="App" style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>TradeScope AI</h1>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <p style={{ marginRight: '15px' }}>Logged in as: <strong>{session.user.email}</strong></p>
          <button 
            onClick={handleLogout}
            style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Placeholder for your main input component */}
      <section>
        <h2>Trade Input & Analysis</h2>
        {/* Replace this placeholder with your TradeInputForm */}
        <textarea
            value={tradeInput}
            onChange={(e) => setTradeInput(e.target.value)}
            placeholder="Paste your trade chart data or details here..."
            style={{ width: '100%', minHeight: '150px', padding: '10px', marginBottom: '10px' }}
        />
        <button onClick={() => saveSession({ /* Collect data from tradeInput and current state */ })}>
            Run AI Analysis & Save
        </button>
      </section>

      {/* Placeholder for your sessions list */}
      <section style={{ marginTop: '40px' }}>
        <h2>My Trade Sessions ({sessions.length})</h2>
        {/* Replace this placeholder with your SessionList component */}
        <ul>
          {sessions.map((s) => (
            <li key={s.id} style={{ border: '1px solid #eee', padding: '10px', margin: '5px 0' }}>
              **Session ID:** {s.id} - **Created:** {new Date(s.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default TradeScopeAI;
