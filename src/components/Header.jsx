import { Search, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="flex justify-between items-center px-6 py-3 bg-[#3F9540] shadow-sm border-b border-[#3F9540] sticky top-0 z-10">
      {/* Breadcrumb */}
      <div className="text-sm text-white font-semibold tracking-wide">
        Pages / <span className="text-white font-bold">Dashboard</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 rounded-full border border-white text-[#3F9540] placeholder-white text-sm focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition bg-white"
          />
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-[#3F9540]" />
        </div>

        {/* Sign In Button */}
        <button
          type="button"
          className="flex items-center gap-2 bg-[#E81F25] text-white font-medium px-4 py-2 rounded-full hover:bg-red-600 transition"
        >
          <User className="w-5 h-5" />
          Sign In
        </button>
      </div>
    </header>
  );
};

export default Header;
