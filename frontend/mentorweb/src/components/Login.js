import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const login = async (userData) => {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // include the HTTP-only cookies
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        setLoginError(errorResponse.error);
      }

      const profileResponse = await fetch('/profile', {
        credentials: 'include', // include the HTTP-only cookies
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to retrieve user profile.');
      }

      const userProfile = await profileResponse.json();
      setUser(userProfile);
      navigate(`/${userProfile.account_type}`);
    } catch (error) {

    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="flex flex-col m-auto w-1/4 p-5 border shadow-lg border-light-gray rounded-md mt-8">
      <h1 className="text-xl text-center pb-5">Login</h1>
      <form className="" onSubmit={handleSubmit}>
        <div className="flex flex-col pb-2">
          <label htmlFor="email">Email</label>
          <input className="border-b"
            id='email'
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">Password</label>
          <input className="border-b"
            id='password'
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="text-purple pb-5">Forgot password?</div>
          <button className="bg-purple text-white h-10 w-full hover:text-gold hover:bg-purple rounded-lg" type="submit">
            Login
          </button>
          {loginError && (
            <p>
              <span role="img" aria-label="error-icon" style={{ color: 'red' }}>
                ❌&nbsp;&nbsp;&nbsp;
              </span>
              {loginError}
            </p>
          )}
          <strong className="p-5 text-center">OR</strong>
          <div className="p-1 text-center">
            New user? <Link to="/registerform"><span className="text-purple hover:text-gold underline">Create Account</span></Link>
          </div>
        </div>
      </form>
    </div>
  );
}
