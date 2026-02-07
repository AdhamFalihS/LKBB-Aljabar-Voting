function SchoolCard({ school, onVoteClick }) {
  return (
    <div 
      onClick={onVoteClick}
      className="group bg-[#f7e6c4] p-4 rounded-lg border-4 border-[#3b2a1a] shadow-xl cursor-pointer transition-all hover:-rotate-2 hover:scale-105"
    >
      <div className="text-center mb-3">
        <h3 className="font-black text-[#3b2a1a] text-xl italic uppercase tracking-tighter">Vote Now</h3>
      </div>

      <div className="aspect-[3/4] overflow-hidden border-4 border-[#3b2a1a] mb-4 bg-white shadow-inner">
        <img 
          // PERBAIKAN: Menggunakan image_url sesuai kolom di Supabase kamu
          src={school.image_url || "https://via.placeholder.com/300x400?text=WANTED"} 
          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
          alt={school.name}
        />
      </div>

      <div className="text-center min-h-[50px] mb-4">
        <h4 className="font-black text-[#3b2a1a] text-md uppercase leading-tight line-clamp-2">{school.name}</h4>
        <p className="text-[10px] font-bold text-[#5a3b1e]/60 tracking-widest uppercase">Contestant</p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 bg-black text-yellow-400 py-2 rounded-lg font-black text-center text-sm border-b-4 border-gray-700">
          💛 {school.total_votes || 0}
        </div>
        <div className="bg-red-700 text-white font-black text-[10px] py-2 px-3 rounded-lg border-b-4 border-red-900 uppercase">
          Votes
        </div>
      </div>
    </div>
  );
}

export default SchoolCard;