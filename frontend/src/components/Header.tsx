import Logo from '../assets/Logo/NotaFlowLogo.svg';
import Icon from '../assets/Icon/UserIcon.svg';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';


const Dropdown = ({ isOpen, navigate, onLogout }: { isOpen: boolean; navigate: (path: string) => void; onLogout: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-8 w-60 bg-white border-gray-300 shadow-md rounded-lg">
      <ul className="text-gray-800 text-4xl">
        <li className="px-4 py-2 hover:bg-indigo-100 cursor-pointer rounded-lg h-20 flex items-center justify-center" onClick={() => navigate('/user')}>
          Innstillinger
        </li>
        <li className="px-4 py-2 hover:bg-indigo-100 cursor-pointer rounded-lg h-20 flex items-center justify-center" onClick={onLogout}>
          Logg ut
        </li>
      </ul>
    </div>
  );
};


export const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative border-b-[1.5px] h-23 border-b-indigo-400 bg-indigo-500 flex items-center justify-center">
        <div className="text-5xl text-white">
            NOTAFLOW
        </div>
        {/* Clickable logo, which takes you back to dashboard */}
        <div className='absolute left-10' onClick={() => navigate('/Dashboard')}>
            <img src={Logo} alt="Logo" className="h-15 w-15 cursor-pointer" />
        </div>
        {/* Clickable usericon, with a dropdown menu */}
        <div className='absolute right-10'
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}>
            <img src={Icon} alt="user icon" className='h-12 w-12 cursor-pointer' />
            {/* TODO: Add logout page */}
            <Dropdown isOpen={isOpen} navigate={navigate} onLogout={() => navigate('/')} />
        </div>
    </div>
  );
}