import React from 'react';
import styles from './FooterComponent.module.css';
import RowGramIcon from '../../assets/RowGramIcon.png';

interface FooterComponentProps {
  scrollToSection: (sectionId: string) => void;
}

const FooterComponent: React.FC<FooterComponentProps> = ({ scrollToSection }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* RowGram Brand */}
        <div>
          <div className={styles.brand}>
            <img src={RowGramIcon} alt="RowGram Logo" className={styles.brandIcon} />
            <h3 className={styles.brandTitle}>RowGram</h3>
          </div>
          <p className={styles.brandDescription}>
            Create stunning Instagram posts for your rowing achievements
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className={styles.sectionTitle}>Quick Links</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <button 
                onClick={() => scrollToSection('home')} 
                className={styles.linkButton}
              >
                Home
              </button>
            </li>
            <li className={styles.linkItem}>
              <button 
                onClick={() => scrollToSection('crew-form')} 
                className={styles.linkButton}
              >
                Templates
              </button>
            </li>
            <li className={styles.linkItem}>
              <button 
                onClick={() => scrollToSection('saved-crews')} 
                className={styles.linkButton}
              >
                My Crews
              </button>
            </li>
            <li className={styles.linkItem}>
              <button 
                onClick={() => scrollToSection('help')} 
                className={styles.linkButton}
              >
                Help Center
              </button>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className={styles.sectionTitle}>Legal</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <span className={styles.legalText}>Terms of Service</span>
            </li>
            <li className={styles.linkItem}>
              <span className={styles.legalText}>Privacy Policy</span>
            </li>
            <li className={styles.linkItem}>
              <span className={styles.legalText}>Cookie Policy</span>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className={styles.sectionTitle}>Contact</h4>
          <ul className={styles.linkList}>
            <li className={styles.linkItem}>
              <a href="mailto:support@rowgram.com" className={styles.linkAnchor}>
                support@rowgram.com
              </a>
            </li>
            <li className={styles.linkItem}>
              <a href="tel:+15551234567" className={styles.linkAnchor}>
                +1 (555) 123-4567
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        <p className={styles.copyrightText}>
          © 2024 RowGram. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default FooterComponent;