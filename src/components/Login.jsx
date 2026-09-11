import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Disc3, LogOut } from 'lucide-react';

export default function Login({ user, setUser }) {
  
  const handleSignOut = () => {
    googleLogout(); // Clears the Google OAuth session state
    setUser(null);  // Clears your React state
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <Disc3 className="w-20 h-20 text-indigo-500 mb-6 animate-spin-slow" />
      <h1 className="text-4xl font-bold mb-2">Music Dashboard</h1>
      
      {user ? (
        <div className="flex flex-col items-center">
          <p className="text-gray-400 mb-6">Signed in as {user.email}</p>
          <button 
            onClick={handleSignOut}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors border border-gray-700"
          >
            <LogOut className="w-5 h-5" /> Sign Out & Switch Account
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-400 mb-8">Sign in to listen or open a PR</p>
          <GoogleLogin
            onSuccess={credentialResponse => {
              const decoded = jwtDecode(credentialResponse.credential);
              setUser({ email: decoded.email, name: decoded.name, picture: decoded.picture });
            }}
            onError={() => console.log('Login Failed')}
            useOneTap={false} // Ensures the standard account selector appears
          />
        </>
      )}
    </div>
  );
}