import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const menus = [
    { name: 'HOME', path: '/' },
    { name: 'VOTE', path: '/vote' },
    { name: 'LEADERBOARD', path: '/leaderboard' },
    { name: 'TOP VOTER', path: '/top-voters' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full flex justify-center pt-10 px-4">
      
      {/* NAV CONTAINER */}
      {/* Menambahkan efek shadow yang lebih dalam dan border tebal sesuai tema container Page */}
      <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full px-5 py-3 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.4)] border-4 border-yellow-200 backdrop-blur-md">
        
        <ul className="flex items-center gap-3 md:gap-5">
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path;

            return (
              <li key={menu.path}>
                <Link
                  to={menu.path}
                  className={`
                    relative px-6 py-3 rounded-full text-base font-black tracking-widest
                    transition-all duration-300 ease-out
                    
                    /* EFEK HOVER: Membesar sedikit dan ganti warna */
                    hover:scale-110 hover:shadow-lg
                    
                    /* EFEK ACTIVE (DIPENCET): Mengecil sedikit (efek klik) */
                    active:scale-90
                    
                    ${
                      isActive
                        ? 'bg-yellow-100 text-black shadow-[inset_0_2px_10px_rgba(0,0,0,0.2)] scale-105'
                        : 'text-[#3b2a1a] hover:bg-yellow-300 hover:text-black'
                    }
                  `}
                >
                  {menu.name}
                  
                  {/* AKSEN GARIS BAWAH UNTUK MENU AKTIF */}
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-red-600 rounded-full"></span>
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