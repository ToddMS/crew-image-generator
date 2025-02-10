import { useEffect, useState } from "react";
import "../../styles/errors/ErrorPopup.css";

interface ErrorPopupProps {
  message: string;
  visible: boolean;
  onClose: () => void;
}

const ErrorPopup = ({ message, visible, onClose }: ErrorPopupProps) => {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!show) return null;

  return <div className="error-popup">{message}</div>;
};

export default ErrorPopup;
