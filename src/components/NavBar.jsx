import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseconfig/firebaseConfig";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'; 

const Navbar = ({ user, setUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <nav className="bg-teal-500 w-full p-6 shadow-md h-16 md:h-20"> {/* Height increased */}
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full"> {/* Align items to height */}
        <Link to="/" className="text-white font-bold text-3xl md:text-4xl">REASVA</Link> {/* Adjusted font size */}
        
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center focus:outline-none"
          >
            <FontAwesomeIcon icon={faUserCircle} className="text-white w-10 h-10 mr-2" /> {/* Icon size increased */}
            <span className="text-white font-semibold text-lg">{user.displayName || "User"}</span> {/* Text size adjusted */}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2">
              <Link to="/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Manage Account</Link>
              <Link to="/settings" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Settings</Link>
              <Link to="/privacy" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Privacy Settings</Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
