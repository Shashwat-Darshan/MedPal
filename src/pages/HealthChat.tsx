
import React from 'react';
import Navbar from '@/components/Navbar';
import SimpleChatInterface from '@/components/SimpleChatInterface';

const HealthChat = () => {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">
        <SimpleChatInterface />
      </div>
    </div>
  );
};

export default HealthChat;
