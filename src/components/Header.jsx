import { Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex justify-between items-center px-6 py-3 bg-white shadow-sm border-b sticky top-0 z-10">
      <div className="text-sm text-gray-700 font-semibold tracking-wide">
        Pages / <span className="text-gray-900 font-bold">Dashboard</span>
      </div>
      <div className="flex items-center gap-5">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 text-gray-700 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300 transition"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
        </div>

        {/* Sign In Button */}
        <button
          type="button"
          className="flex items-center gap-2 text-gray-700 font-medium hover:text-gray-900 transition"
        >
          <User className="w-5 h-5" />
          Sign In
        </button>
      </div>
    </header>
  );
};

export default Header;
