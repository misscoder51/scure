import React from 'react';
import { useHistory } from 'react-router-dom';

const Logout = ({ onLogout }) => {
  const history = useHistory();

  const handleLogout = () => {
    // Perform logout actions here, such as clearing local storage, resetting state, etc.
    // For example, you might call an API to invalidate the user's session.
    
    // After logout actions, update the authentication state
    onLogout(false);

    // Redirect the user to the login page
    history.push('/login');
  };

  return (
    <div>
      <h2>Logout</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Logout;
