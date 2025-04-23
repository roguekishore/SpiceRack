import React, { useEffect, useState } from "react";

const Notification = ({ message }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="notification">
      <span className="notification-message">{message}</span>
      <button className="notification-close" onClick={() => setVisible(false)}>
        &times;
      </button>
    </div>
  );
};

export default Notification;
