import React, { useState } from 'react';
import styles from './HeaderComponent.module.css';
import RowGramIcon from '../../assets/RowGramIcon.png';
import { TbHelp } from "react-icons/tb";
import { IoHomeOutline, IoPeopleOutline  } from "react-icons/io5";
import { PiSquaresFourLight } from "react-icons/pi";
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../Auth/AuthModal';
import UserProfileDropdown from '../Auth/UserProfileDropdown';

const HeaderComponent: React.FC = () => {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header>
        <div className={styles.header}>
          <div className={styles.brand}>
            <img src={RowGramIcon} alt="RowGram Logo" className={styles.icon} />
            <h2 className={styles.title}>RowGram</h2>
          </div>
          <nav>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <IoHomeOutline size={18} style={{ marginTop: '2px' }} />
              <button onClick={() => scrollToSection('home')} className={styles.navButton}>Home</button>
            </li>

            <li className={styles.navItem}>
              <PiSquaresFourLight size={25} style={{marginTop: '3px'}} />
              <button onClick={() => scrollToSection('crew-form')} className={styles.navButton}>Templates</button>
            </li>
            <li className={styles.navItem}>
              <IoPeopleOutline size={21} style={{marginTop: '5px'}} />
              <button onClick={() => scrollToSection('saved-crews')} className={styles.navButton}>My Crews</button>
            </li>
            <li className={styles.navItem} >
              <TbHelp size={17} style={{marginTop: '3px'}} />
              <button onClick={() => scrollToSection('help')} className={styles.navButton}>Help</button>
            </li>
            
            {/* Authentication Section */}
            <li className={styles.navItem}>
              {user ? (
                <UserProfileDropdown user={user} />
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)} 
                  className={`${styles.navButton} ${styles.loginButton}`}
                >
                  Login
                </button>
              )}
            </li>
          </ul>
        </nav>
        </div>
      </header>
      
      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
};

export default HeaderComponent;