import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/RowgramThemeContext';
import RowGramLogo from '../../assets/RowGramImage.svg';
import './Navigation.css';

interface DropdownItem {
  label: string;
  path: string;
  icon?: string;
}

interface NavigationProps {
  currentPage: string;
  onAuthModalOpen: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onAuthModalOpen }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeMode();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleNavClick = (path: string) => {
    navigate(path);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdownName: string) => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.nav-dropdown')) {
        setActiveDropdown(null);
      }
    };

    if (activeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeDropdown]);

  const crewDropdownItems: DropdownItem[] = [
    { label: 'Create Crew', path: '/crews/create' },
    { label: 'My Crews', path: '/crews' },
  ];

  const isCrewsActive = currentPage === 'crews' || currentPage === 'create';
  const isClubPresetsActive = currentPage === 'club-presets';

  const profileDropdownItems: DropdownItem[] = [{ label: 'Settings', path: '/settings' }];

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <button className="logo" onClick={() => handleNavClick('/')}>
          <img src={RowGramLogo} alt="RowGram Logo" className="logo-icon" />
          <span>RowGram</span>
        </button>

        <div className="nav-links">
          <button
            className={`nav-link ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('/')}
          >
            Dashboard
          </button>

          {/* Crews Dropdown */}
          <div className="nav-dropdown">
            <button
              className={`nav-link dropdown-trigger ${isCrewsActive ? 'active' : ''}`}
              onClick={() => toggleDropdown('crews')}
            >
              Crews
              <span className={`dropdown-arrow ${activeDropdown === 'crews' ? 'open' : ''}`}>
                ▼
              </span>
            </button>
            {activeDropdown === 'crews' && (
              <div
                className="dropdown-menu"
                ref={(el) => {
                  dropdownRefs.current['crews'] = el;
                }}
              >
                {crewDropdownItems.map((item) => (
                  <button
                    key={item.path}
                    className="dropdown-item"
                    onClick={() => handleNavClick(item.path)}
                  >
                    {item.icon && <span className="dropdown-icon">{item.icon}</span>}
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className={`nav-link ${isClubPresetsActive ? 'active' : ''}`}
            onClick={() => handleNavClick('/club-presets')}
          >
            Club Presets
          </button>

          <button
            className={`nav-link ${currentPage === 'generate' ? 'active' : ''}`}
            onClick={() => handleNavClick('/generate')}
          >
            Generate
          </button>
          <button
            className={`nav-link ${currentPage === 'gallery' ? 'active' : ''}`}
            onClick={() => handleNavClick('/gallery')}
          >
            Gallery
          </button>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="nav-dropdown">
              <button className="user-profile-btn" onClick={() => toggleDropdown('profile')}>
                <div className="user-avatar">
                  {user.profile_picture ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/api/auth/profile-picture/${user.id}`}
                      alt={user.name || 'User'}
                      className="avatar-image"
                      onError={(e) => {
                        console.error(
                          'Failed to load profile picture via proxy for user:',
                          user.id,
                        );
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        // Show fallback text
                        if (target.parentElement) {
                          target.parentElement.innerHTML = user.name?.[0] || 'U';
                        }
                      }}
                    />
                  ) : (
                    user.name?.[0] || 'U'
                  )}
                </div>
                <span className="user-name">{user.club_name || user.name}</span>
                <span className={`dropdown-arrow ${activeDropdown === 'profile' ? 'open' : ''}`}>
                  ▼
                </span>
              </button>
              {activeDropdown === 'profile' && (
                <div
                  className="dropdown-menu profile-dropdown"
                  ref={(el) => {
                    dropdownRefs.current['profile'] = el;
                  }}
                >
                  {profileDropdownItems.map((item) => (
                    <button
                      key={item.path}
                      className="dropdown-item"
                      onClick={() => handleNavClick(item.path)}
                    >
                      {item.icon && <span className="dropdown-icon">{item.icon}</span>}
                      {item.label}
                    </button>
                  ))}
                  <div className="dropdown-separator"></div>
                  <button
                    className="dropdown-item theme-toggle-item"
                    onClick={() => {
                      toggleTheme();
                      setActiveDropdown(null);
                    }}
                  >
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    <span className="dropdown-icon">{isDarkMode ? '☀️' : '🌙'}</span>
                  </button>
                  <button
                    className="dropdown-item logout-item"
                    onClick={() => {
                      logout();
                      setActiveDropdown(null);
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={onAuthModalOpen}>
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
