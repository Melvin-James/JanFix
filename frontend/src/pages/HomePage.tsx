import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/authStore";

import { logoutUser } from "../features/auth/services/authService";


function HomePage() {

  const navigate = useNavigate();

  const clearAuth = useAuthStore((state) => state.clearAuth);

  const handleLogout = async () => {

    try {

      await logoutUser();

      clearAuth();

      navigate("/login");

    } catch (error) {

      console.error(error);

    }
  };

  return (
    <>
      <h1> User Home Page</h1>
      
      <button onClick={handleLogout}>

        Logout

      </button>
    </>
  )
}

export default HomePage;