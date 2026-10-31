import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

const LogoutButton = () => {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null); // Reset user to null
    localStorage.removeItem("user"); // Remove from localStorage
    navigate("/"); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
