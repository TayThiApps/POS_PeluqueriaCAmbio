import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">POS System</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant={isActive('/') ? 'default' : 'ghost'}>
                Sales
              </Button>
            </Link>
            <Link to="/clients">
              <Button variant={isActive('/clients') ? 'default' : 'ghost'}>
                Clients
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant={isActive('/reports') ? 'default' : 'ghost'}>
                Reports
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
