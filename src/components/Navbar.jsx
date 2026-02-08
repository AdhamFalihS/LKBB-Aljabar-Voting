import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const menus = [
    { name: 'HOME', path: '/', icon: '🏠' },
    { name: 'VOTE', path: '/vote', icon: '🗳️' },
    { name: 'PAPAN SKOR', path: '/leaderboard', icon: '🏆' },
    { name: 'TOP VOTER', path: '/top-voters', icon: '⭐' },
  ];

  return (
    <nav className="fixed z-50 w-full flex justify-center px-3 sm:px-4
                    bottom-7 sm:bottom-auto sm:top-10">
      
      {/* Navigation Container */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-600 rounded-full px-2 sm:px-5 py-2 sm:py-3 shadow-2xl border-2 sm:border-4 border-white/90 backdrop-blur-md max-w-fit">
        
        <ul className="flex items-center gap-1 sm:gap-3">
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path;

            return (
              <li key={menu.path}>
                <Link
                  to={menu.path}
                  className={`
                    relative px-2.5 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full text-[10px] sm:text-sm lg:text-base font-bold tracking-wide
                    transition-all duration-300 ease-out flex items-center gap-1 sm:gap-2
                    
                    hover:scale-105 hover:shadow-lg
                    active:scale-95
                    
                    ${
                      isActive
                        ? 'bg-white text-red-700 shadow-lg scale-105 border-2 border-red-200'
                        : 'text-white hover:bg-red-500 hover:text-white'
                    }
                  `}
                >
                  <span className="text-sm sm:text-base">{menu.icon}</span>
                  <span className="hidden sm:inline">{menu.name}</span>
                  
                  {/* Mobile: Show abbreviated text */}
                  <span className="sm:hidden text-[9px] font-extrabold">
                    {menu.name === 'PAPAN SKOR' ? 'SKOR' : menu.name === 'TOP VOTER' ? 'VOTER' : menu.name}
                  </span>
                  
                  {/* Active Indicator */}
                  {isActive && (
                    <span className="absolute -top-1 sm:-bottom-1 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-1 bg-red-600 rounded-full"></span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

      </div>
    </nav>
  );
}

export default Navbar;
