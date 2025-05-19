import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [showRoleOptions, setShowRoleOptions] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuActive(!menuActive);
    setShowRoleOptions(false); // Close role dropdown when toggling menu
  };

  const toggleRoleOptions = () => {
    setShowRoleOptions(!showRoleOptions);
  };

  return (
    <header className="header">
      <div className="header_logo">
        <img src="/image.svg" alt="logo" className="logo" />
      </div>

      <button className="menu-btn" onClick={toggleMenu}>
        <ion-icon name={menuActive ? "close" : "menu"}></ion-icon>
      </button>

      <nav className={`header_nav ${menuActive ? 'active' : ''}`}>
        <Link to="/" onClick={toggleMenu}>Home</Link>
        <Link to="/about" onClick={toggleMenu}>About</Link>
        <Link to="/helpLine" onClick={toggleMenu}>HelpLine</Link>
        <Link to="/myrides" onClick={toggleMenu}>My Rides</Link>

        <div className="dropdown-wrapper">
          <button onClick={toggleRoleOptions} className="person-icon-btn">
            <ion-icon name="person-circle-sharp" size="large"></ion-icon>
          </button>

          {showRoleOptions && (
            <div className="role-dropdown">
              <button onClick={() => navigate('/driver/login')}>Driver</button>
              <button onClick={() => navigate('/rider/login')}>Rider</button>
            </div>
          )}
        </div>

        <span>
          <ion-icon name="search-sharp"></ion-icon>
          <button type="submit" className='search'>Search</button>
        </span>
      </nav>
    </header>
  );
};

export default Header;
