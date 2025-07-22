import * as React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="border-b bg-gradient-to-r from-purple-50 to-violet-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
              Peluquería Cambio
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button 
                variant={isActive("/") ? "default" : "ghost"}
                className={isActive("/") 
                  ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700" 
                  : "hover:bg-purple-50 hover:text-purple-700"
                }
              >
                💰 Ventas
              </Button>
            </Link>
            <Link to="/clients">
              <Button 
                variant={isActive("/clients") ? "default" : "ghost"}
                className={isActive("/clients") 
                  ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700" 
                  : "hover:bg-purple-50 hover:text-purple-700"
                }
              >
                👥 Clientes
              </Button>
            </Link>
            <Link to="/reports">
              <Button 
                variant={isActive("/reports") ? "default" : "ghost"}
                className={isActive("/reports") 
                  ? "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700" 
                  : "hover:bg-purple-50 hover:text-purple-700"
                }
              >
                📊 Informes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
