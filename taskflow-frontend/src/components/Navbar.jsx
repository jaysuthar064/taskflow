import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom";


const Navbar = () => {
    const {logout} = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = ()=>{
        logout();
        navigate("/login");
    }
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gray-800 text-white shadow-md">
      <h1 className="text-xl font-semibold" >TaskFlow</h1>  
      <button 
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md transition">
        Logout
      </button>
    </div>
  )
}

export default Navbar


