import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { Disc3 } from 'lucide-react';

export default function Login({ setUser }) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <Disc3 className="w-20 h-20 text-indigo-500 mb-6 animate-spin-slow" />
      <h1 className="text-4xl font-bold mb-2">Music Dashboard</h1>
      <p className="text-gray-400 mb-8">Sign in to listen or open a PR</p>
      <GoogleLogin
        onSuccess={credentialResponse => {
          const decoded = jwtDecode(credentialResponse.credential);
          setUser({ email: decoded.email, name: decoded.name, picture: decoded.picture });
        }}
        onError={() => console.log('Login Failed')}
      />
    </div>
  );
}