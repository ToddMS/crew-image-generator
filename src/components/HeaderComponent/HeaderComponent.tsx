import React from 'react';
import styles from './HeaderComponent.module.css';
import RowGramIcon from '../../assets/RowGramIcon.png';
import { TbHelp } from "react-icons/tb";
import { IoHomeOutline, IoPeopleOutline  } from "react-icons/io5";
import { SlPicture } from "react-icons/sl";



const HeaderComponent: React.FC = () => {
  return (
    <header>
      <div className={styles.header}>
        <div className={styles.brand}>
          <img src={RowGramIcon} alt="RowGram Logo" className={styles.icon} />
          <h1 className={styles.title}>RowGram</h1>
        </div>
        <nav>
        <ul className={styles.navList}>
          <li className={styles.navItem}>
            <IoHomeOutline className={styles.navIcon} />
            <a href="#home">Home</a>
          </li>
          <li className={styles.navItem}>
            <SlPicture className={styles.navIcon} />
            <a href="#templates">Templates</a>
          </li>
          <li className={styles.navItem}>
            <IoPeopleOutline className={styles.navIcon} />
            <a href="#myCrews">My Crews</a>
          </li>
          <li className={styles.navItem}>
            <TbHelp className={styles.navIcon} />
            <a href="#help">Help</a>
          </li>
        </ul>
      </nav>
      </div>
    </header>
  );
};

export default HeaderComponent;