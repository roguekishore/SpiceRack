import React, { useEffect, useState } from "react";
import { X } from 'lucide-react';
import { Button } from '../components/ui/button';

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
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-primary text-primary-foreground max-w-sm">
      <span className="text-sm flex-1">{message}</span>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 hover:bg-primary-foreground/20 text-primary-foreground"
        onClick={() => setVisible(false)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default Notification;
