import type React from "react";
import { Search } from "lucide-react";

interface HeaderProps {
  userName?: string;
  userAvatar?: string;
}

const Header: React.FC<HeaderProps> = ({ userName = "JD", userAvatar }) => {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h1 className="text-xl font-semibold text-gray-800">Message Center</h1>
      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            placeholder="Search"
            className="w-full pl-10 py-2 pr-3 rounded-md bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
          <span className="font-semibold text-white text-sm">{userName}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
