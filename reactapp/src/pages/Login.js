import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from "../context/UserContext";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import '../css/Login.css';

const InputField = ({ type, placeholder, icon, value, onChange }) => {
  const [isPasswordShown, setIsPasswordShown] = useState(false);
  return (
    <div className="input-wrapper">
      <input
        type={isPasswordShown ? 'text' : type}
        placeholder={placeholder}
        className="input-field"
        value={value}
        onChange={onChange}
        required
      />
      {icon === 'person' && <FaUser className="icon" />}
      {icon === 'mail' && <FaEnvelope className="icon" />}
      {icon === 'lock' && <FaLock className="icon" />}
      {type === 'password' && (
        <span onClick={() => setIsPasswordShown(prevState => !prevState)} className="eye-icon">
          {isPasswordShown ? <FaEye /> : <FaEyeSlash />}
        </span>
      )}
    </div>
  );
};

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    const newUser = {
      name: signUpName,
      email: signUpEmail,
      password: signUpPassword,
    };
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users`, newUser, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200) {
        setSuccessMessage('Registration successful! You can now log in.');
        setError('');
        setIsSignUp(false);
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      }
    } catch (error) {
      setError('Email is already registered. Please log in.');
      setSuccessMessage('');
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, {
        email: signInEmail,
        password: signInPassword
      });
      if (response.status === 200) {
        setUser(response.data);
        setSuccessMessage('Log in successful!');
        setError('');
        navigate('/home');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      }
    } catch (error) {
      setError('Incorrect email or password. Please try again.');
      setSuccessMessage('');
    }
  };

  // Validate email format
  const isValidEmail = (email) => {
    const atIndex = email.indexOf('@');
    if (atIndex === -1) return false;

    const localPart = email.slice(0, atIndex);
    const domainPart = email.slice(atIndex + 1);

    const hasLetter = /[a-zA-Z]/.test(localPart);
    const isNotFullyNumeric = /\D/.test(localPart);
    if (!hasLetter || !isNotFullyNumeric) return false;

    const domainRegex = /^(gmail|yahoo|hotmail|outlook|icloud|protonmail)\.(com|net|org|co)$/;
    return domainRegex.test(domainPart);
  };

  // Validate password complexity
  const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return passwordRegex.test(password);
  };

  return (
    <div className="login-page">
      <div className="login">
        <div className="login-container">
          <h2 className="form-title">{isSignUp ? 'SIGN UP' : 'LOG IN'}</h2>
          <form className="login-form" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            {error && <p className="error-message">{error}</p>}
            {successMessage && <p className="success-message">{successMessage}</p>}
            {isSignUp && (
              <InputField type="text" placeholder="Name" icon="person" value={signUpName} onChange={(e) => setSignUpName(e.target.value)} />
            )}
            <InputField type="text" placeholder="Email address" icon="mail" value={isSignUp ? signUpEmail : signInEmail} onChange={(e) => isSignUp ? setSignUpEmail(e.target.value) : setSignInEmail(e.target.value)} />
            <InputField type="password" placeholder="Password" icon="lock" value={isSignUp ? signUpPassword : signInPassword} onChange={(e) => isSignUp ? setSignUpPassword(e.target.value) : setSignInPassword(e.target.value)} />
            <button type="submit" className="login-button">{isSignUp ? 'Sign Up' : 'Log In'}</button>
          </form>
          <p className="signup-prompt">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <a href="#" className="signup-link" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Log in" : "Sign up"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;