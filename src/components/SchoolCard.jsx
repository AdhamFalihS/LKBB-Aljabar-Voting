// SchoolCard.jsx
function SchoolCard({ school, onVoteClick }) {
  return (
    <div className="group bg-gradient-to-br from-white to-amber-50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border-3 border-amber-200 hover:border-red-400 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
      
      {school.rank && school.rank <= 3 && (
        <div className="absolute top-2 left-2 z-10">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-white shadow-lg border-2 border-white
            ${school.rank === 1 ? 'bg-yellow-500' : ''}
            ${school.rank === 2 ? 'bg-gray-400' : ''}
            ${school.rank === 3 ? 'bg-orange-600' : ''}`}>
            {school.rank === 1 && '🥇'}
            {school.rank === 2 && '🥈'}
            {school.rank === 3 && '🥉'}
          </div>
        </div>
      )}

      <div className="relative h-32 sm:h-40 bg-gradient-to-br from-red-100 to-amber-100 overflow-hidden">
        {school.image ? (
          <img 
            src={school.image} 
            alt={school.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-5xl sm:text-6xl opacity-30">🏫</div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-2 right-2 bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-lg border-2 border-white">
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm font-black">{school.total_votes || 0}</span>
            <span className="text-xs font-bold opacity-90">vote</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <h3 className="font-black text-base sm:text-lg text-red-700 mb-2 sm:mb-3 line-clamp-2 min-h-[3rem] sm:min-h-[3.5rem] leading-tight group-hover:text-red-800 transition-colors">
          {school.name}
        </h3>

        <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 border-b-2 border-amber-100">
          <div className="flex items-center gap-1 text-amber-700">
            <span className="text-sm sm:text-base">📊</span>
            <span className="text-xs sm:text-sm font-bold">Peringkat #{school.rank || '-'}</span>
          </div>
          <div className="flex items-center gap-1 text-green-700">
            <span className="text-sm sm:text-base">✅</span>
            <span className="text-xs sm:text-sm font-bold">{school.total_votes || 0} Vote</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onVoteClick();
          }}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg border-b-4 border-red-900 transition-all hover:scale-105 active:scale-95 uppercase text-xs sm:text-sm tracking-wide group-hover:shadow-xl"
        >
          <span className="flex items-center justify-center gap-2">
            <span>🗳️</span>
            <span>Vote Sekarang!</span>
          </span>
        </button>
      </div>

      <div className="absolute inset-0 border-2 border-red-500 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}

export default SchoolCard;