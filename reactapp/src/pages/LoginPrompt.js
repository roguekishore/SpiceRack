import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

export default function LoginPrompt({ isOpen, onClose, message }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <Card className="relative w-full max-w-md mx-4 shadow-lg">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute right-2 top-2 h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Login Required</CardTitle>
          <CardDescription>
            {message || 'Please login or sign up to continue with this action.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={handleLogin}>
            Login / Sign Up
          </Button>
          <Button variant="outline" className="w-full" onClick={onClose}>
            Continue Browsing
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
