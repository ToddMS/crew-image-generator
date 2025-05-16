import React from 'react';
import styles from './HeaderComponent.module.css';
import RowGramIcon from '../../assets/RowGramIcon.png';
import { TbHelp } from "react-icons/tb";
import { IoHomeOutline, IoPeopleOutline  } from "react-icons/io5";
import { PiSquaresFourLight } from "react-icons/pi";

const HeaderComponent: React.FC = () => {
  return (
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
            <a href="#home">Home</a>
          </li>

          <li className={styles.navItem}>
            <PiSquaresFourLight size={25} style={{marginTop: '3px'}} />
            <a href="#templates">Templates</a>
          </li>
          <li className={styles.navItem}>
            <IoPeopleOutline size={21} style={{marginTop: '5px'}} />
            <a href="#myCrews">My Crews</a>
          </li>
          <li className={styles.navItem} >
            <TbHelp size={17} style={{marginTop: '3px'}} />
            <a href="#help">Help</a>
          </li>
        </ul>
      </nav>
      </div>
    </header>
  );
};

export default HeaderComponent;