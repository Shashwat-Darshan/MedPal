
import React from 'react';
import Navbar from '@/components/Navbar';
import DashboardContent from '@/components/DashboardContent';

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <DashboardContent />
    </div>
  );
};

export default Dashboard;
