import Icon from "../assets/Icon/UserIcon.svg";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AuthLogout } from "./logout";
import Button from "@mui/material/Button";
import { useAuth } from "../firebase/func/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { Box } from "@mui/material";

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
    <Box className="absolute right-0 mt-8 w-40 bg-white border-gray-300 shadow-md rounded-lg">
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
    </Box>
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
    <div
      className="relative border-b-[1.5px] h-17 border-b-gray-100 bg-[#19262d] flex items-center justify-between px-4"
      style={{ zIndex: 100000 }}>
      <div
        className="left-20 relative text-4xl text-white cursor-pointer"
        onClick={() => navigate("/Dashboard")}>
        NOTAFLOW
      </div>

      {/* Right side elements */}
      <div className="flex items-center gap-4 sticky right-10">
        {/* Dark/light mode switch */}
        <ThemeToggle />

        {/* Log in button or user icon */}
        {!isLoggedIn ? (
          <Button
            sx={{ marginRight: "-10px" }}
            variant="contained"
            color="success"
            size="large"
            onClick={() => navigate("/Login")}>
            Logg inn
          </Button>
        ) : (
          // Postbutton and user icon
          <Box sx={{ zIndex: 10000 }}>
            <Box className="flex items-center gap-6">
              {/* <button
              className="h-10 w-10 border-2 border-black text-black bg-transparent text-3xl rounded-lg flex items-center justify-center hover:bg-indigo-900 transition cursor-pointer"
              onClick={() => navigate("/PublishingPage")}>
              +
            </button> */}
              <Box
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                className="relative">
                <img src={Icon} alt="user icon" className="h-12 w-12 cursor-pointer" />
                <Dropdown isOpen={isOpen} navigate={navigate} onLogout={handleLogout} />
              </Box>
            </Box>
          </Box>
        )}
      </div>
    </div>
  );
};
