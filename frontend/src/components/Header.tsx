import Icon from "../assets/Icon/UserIcon.svg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthLogout } from "./logout";
import Button from "@mui/material/Button";
import { useAuth } from "../firebase/func/useAuth";

const Dropdown = ({
  isOpen,
  navigate,
  onLogout,
}: {
  isOpen: boolean;
  navigate: (path: string) => void;
  onLogout: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-8 w-40 bg-white border-gray-300 shadow-md rounded-lg">
      <ul className="text-gray-800 text-2xl">
        <li
          className="px-4 py-2 hover:bg-indigo-100 cursor-pointer rounded-lg h-12 flex items-center justify-center"
          onClick={() => navigate("/user")}>
          Min konto
        </li>
        <li
          className="px-4 py-2 hover:bg-indigo-100 cursor-pointer rounded-lg h-12 flex items-center justify-center"
          onClick={onLogout}>
          Logg ut
        </li>
      </ul>
    </div>
  );
};

export const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn } = useAuth();

  const handleLogout = () => {
    AuthLogout();
    navigate("/");
  };

  useEffect(() => {
    setIsOpen(false);
  }, [isLoggedIn]);

  return (
    <div className="relative border-b-[1.5px] h-17 border-b-gray-100 bg-[#19262d] flex items-center">
      <div className="left-20 relative text-4xl text-white cursor-pointer" onClick={() => navigate("/Dashboard")}>
        NOTAFLOW
      </div>

      {/* Log in button */}
      <div className="absolute flex items-center right-10">
        {!isLoggedIn ? (
          <div>
            <Button
              sx={{ marginRight: "20px" }}
              variant="contained"
              color="success"
              size="large"
              onClick={() => navigate("/Login")}>
              Logg inn
            </Button>
          </div>
        ) : (
          // Postbutton and user icon
          <div className="right-10 flex items-center gap-6">
            {/* <button
              className="h-10 w-10 border-2 border-black text-black bg-transparent text-3xl rounded-lg flex items-center justify-center hover:bg-indigo-900 transition cursor-pointer"
              onClick={() => navigate("/PublishingPage")}>
              +
            </button> */}
            <div
              onMouseEnter={() => setIsOpen(true)}
              onMouseLeave={() => setIsOpen(false)}
              style={{ zIndex: 1000 }}
              className="relative">
              <img src={Icon} alt="user icon" className="h-12 w-12 cursor-pointer" />
              <Dropdown isOpen={isOpen} navigate={navigate} onLogout={handleLogout} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
