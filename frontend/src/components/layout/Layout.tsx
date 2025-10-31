import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { User } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  activeSection, 
  onSectionChange,
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsMobileMenuOpen(false); // Close mobile menu when section changes
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={isMobileMenuOpen} 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />
      
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar 
          user={user} 
          onMenuToggle={handleMenuToggle}
          isMobileMenuOpen={isMobileMenuOpen}
          onLogout={onLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;