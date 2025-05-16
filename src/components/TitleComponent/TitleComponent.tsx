import React from 'react';
import styles from './TitleComponent.module.css';

const TitleComponent: React.FC = () => {
  return (
    <div className={styles.title}>
      <p className={styles.title1}>Create Your Crew Image</p>
      <p>Enter your crew details to get started</p>
    </div>
  );
};
 
export default TitleComponent;