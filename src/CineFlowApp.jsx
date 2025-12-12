import React, { useState, useEffect } from 'react';
import { Play, Calendar, Search, User, Heart, Clock, ChevronLeft, Share2, Info, Star, Plus, Check, Film, X } from 'lucide-react';

// --- DATA MOCKÉE (Simulation de base de données) ---

const MOCK_DATA = {
  stories: [
    { id: 1, title: "Dune: Part Two", type: "Trailer", img: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
    { id: 2, title: "Mickey 17", type: "Teaser", img: "https://image.tmdb.org/t/p/w500/552k1a0hO90c8M7Vd1i17V2.jpg" },
    { id: 3, title: "Cannes 2025", type: "Event", img: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe850ndgjsd86FW23p.jpg" },
    { id: 4, title: "Nolan's Next", type: "News", img: "https://image.tmdb.org/t/p/w500/tRS6jvPM9qPrrnx2KRp3ew96Yot.jpg" },
  ],
  feed: [
    { 
      id: 101, 
      type: 'movie_release', 
      title: "Oppenheimer", 
      subtitle: "Le nouveau chef-d'œuvre de Nolan", 
      date: "Sortie le 19 Juillet", 
      rating: 4.8, 
      img: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
      tags: ["Drame", "Historique"],
      desc: "L'histoire du scientifique américain J. Robert Oppenheimer et de son rôle dans le développement de la bombe atomique."
    },
    { 
      id: 102, 
      type: 'news', 
      title: "Pourquoi le cinéma IMAX change tout ?", 
      subtitle: "Analyse Technique • 5 min de lecture", 
      img: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
      tags: ["Tech", "Salles"]
    },
    { 
      id: 103, 
      type: 'trailer', 
      title: "Barbie", 
      subtitle: "Nouvelle bande-annonce officielle", 
      img: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg",
      tags: ["Comédie", "Fantastique"],
      desc: "Vivre à Barbie Land, c'est être un être parfait dans un endroit parfait. À moins d'avoir une crise existentielle complète. Ou d'être Ken."
    }
  ],
  agenda: [
    { day: "Mer", date: "12 Oct", films: [{ title: "Killers of the Flower Moon", time: "20:30", cinema: "Pathé Wepler" }] },
    { day: "Ven", date: "14 Oct", films: [{ title: "The Creator", time: "18:00", cinema: "MK2 Bibliothèque" }] }
  ]
};

const TAGS = ["Science-Fiction", "Horreur", "Indépendant", "Marvel/DC", "Classiques", "Comédie", "Documentaire", "Animation"];

// --- COMPOSANTS UI ---

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const baseStyle = "font-bold rounded-full py-3 px-6 transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-[#DEFF9A] text-black hover:bg-[#c9ef7a]",
    secondary: "bg-[#1A1A1A] text-white border border-[#333] hover:bg-[#252525]",
    ghost: "bg-transparent text-[#999] hover:text-white"
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Chip = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${active ? 'bg-[#DEFF9A] text-black' : 'bg-[#1A1A1A] text-[#AAA] border border-[#333]'}`}
  >
    {label}
  </button>
);

const NavIcon = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? 'text-[#DEFF9A]' : 'text-[#666]'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

// --- ECRANS ---

// 1. Onboarding
const OnboardingScreen = ({ onComplete }) => {
  const [selectedTags, setSelectedTags] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="h-full flex flex-col p-6 animate-in fade-in duration-700">
      <div className="flex-1 flex flex-col justify-center">
        <h1 className="text-5xl font-bold text-white mb-2 tracking-tighter">Cine<span className="text-[#DEFF9A]">Flow</span></h1>
        <p className="text-[#999] text-xl mb-12">Le cinéma, sans le chaos.</p>
        
        <h2 className="text-2xl text-white font-semibold mb-6">Qu'est-ce qui te fait vibrer ?</h2>
        <div className="flex flex-wrap gap-3">
          {TAGS.map(tag => (
            <Chip 
              key={tag} 
              label={tag} 
              active={selectedTags.includes(tag)} 
              onClick={() => toggleTag(tag)} 
            />
          ))}
        </div>
      </div>
      
      <div className="py-6">
        <Button onClick={onComplete} className="w-full text-lg">
          Commencer l'expérience
        </Button>
        <div className="text-center mt-4">
          <button onClick={onComplete} className="text-[#666] text-sm underline">Passer pour l'instant</button>
        </div>
      </div>
    </div>
  );
};

// 2. Home Feed
const HomeScreen = ({ onMovieClick }) => {
  return (
    <div className="pb-24 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="px-5 pt-12 pb-4 flex justify-between items-center bg-gradient-to-b from-[#0A0A0A] to-transparent sticky top-0 z-10 backdrop-blur-sm">
        <div>
          <h2 className="text-[#666] text-sm uppercase tracking-wider font-semibold">Bonsoir, Léa</h2>
          <h1 className="text-2xl text-white font-bold">À la une</h1>
        </div>
        <div className="bg-[#1A1A1A] p-2 rounded-full relative">
          <div className="w-2 h-2 bg-[#DEFF9A] rounded-full absolute top-2 right-2 border border-[#1A1A1A]"></div>
          <Share2 size={20} className="text-white" />
        </div>
      </div>

      {/* Stories */}
      <div className="flex gap-4 overflow-x-auto px-5 pb-6 no-scrollbar snap-x">
        {MOCK_DATA.stories.map(story => (
          <div key={story.id} className="snap-start shrink-0 w-24 flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-[#DEFF9A] to-[#0A0A0A]">
              <img src={story.img} alt={story.title} className="w-full h-full rounded-full object-cover border-2 border-[#0A0A0A]" />
            </div>
            <span className="text-xs text-[#CCC] text-center w-full truncate">{story.title}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="px-5 flex gap-3 mb-6 overflow-x-auto no-scrollbar">
        <Chip label="Tout" active={true} />
        <Chip label="Sorties" active={false} />
        <Chip label="Trailers" active={false} />
        <Chip label="Critiques" active={false} />
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-8 px-5">
        {MOCK_DATA.feed.map(item => (
          <div key={item.id} className="group relative cursor-pointer" onClick={() => item.type !== 'news' && onMovieClick(item)}>
            <div className="relative aspect-[4/5] md:aspect-video rounded-3xl overflow-hidden mb-3">
              <img src={item.img} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              
              {/* Card Content Overlay */}
              <div className="absolute bottom-0 left-0 p-5 w-full">
                {item.type === 'movie_release' && (
                  <div className="inline-flex items-center gap-1 bg-[#DEFF9A] text-black text-xs font-bold px-2 py-1 rounded-md mb-2">
                    <Calendar size={12} /> {item.date}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white leading-tight mb-1">{item.title}</h3>
                <p className="text-[#CCC] text-sm line-clamp-1">{item.subtitle}</p>
              </div>

              {item.type === 'trailer' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center pl-1">
                  <Play size={24} fill="white" className="text-white" />
                </div>
              )}
            </div>
            
            {/* Action Bar under card */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                 {item.tags && item.tags.map(tag => (
                   <span key={tag} className="text-[#666] text-xs font-medium px-2 py-1 bg-[#1A1A1A] rounded-md">{tag}</span>
                 ))}
              </div>
              <div className="flex gap-4 text-[#666]">
                <button className="hover:text-white transition-colors"><Heart size={20} /></button>
                <button className="hover:text-white transition-colors"><Plus size={20} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Movie Details
const DetailScreen = ({ movie, onBack }) => {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
      {/* Hero */}
      <div className="relative h-[60vh]">
        <img src={movie.img} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/20 to-transparent"></div>
        
        <button onClick={onBack} className="absolute top-12 left-5 w-10 h-10 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80">
          <ChevronLeft />
        </button>

        <div className="absolute bottom-0 left-0 p-6 w-full">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded border border-white/10">2h 49m</span>
            <span className="bg-[#1A1A1A] text-white text-xs px-2 py-1 rounded border border-white/10">12+</span>
            <div className="flex items-center gap-1 text-[#DEFF9A] text-xs font-bold">
               <Star size={12} fill="#DEFF9A" /> {movie.rating || 4.5}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 leading-none">{movie.title}</h1>
          <p className="text-[#999] text-sm">{movie.tags?.join(" • ")}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex gap-3 mb-8">
           <Button className="flex-1" variant="primary">
             <Plus size={18} /> Watchlist
           </Button>
           <Button className="flex-1" variant="secondary">
             <Calendar size={18} /> Séances
           </Button>
        </div>

        <h3 className="text-white font-bold text-lg mb-3">Synopsis</h3>
        <p className="text-[#CCC] leading-relaxed text-sm mb-8">
          {movie.desc || "Un film captivant qui repousse les limites du genre. Une expérience visuelle époustouflante accompagnée d'une bande sonore immersive qui vous tiendra en haleine du début à la fin."}
        </p>

        <h3 className="text-white font-bold text-lg mb-4">Casting</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
           {[1,2,3,4,5].map(i => (
             <div key={i} className="flex flex-col items-center gap-2 shrink-0">
               <div className="w-16 h-16 bg-[#222] rounded-full overflow-hidden">
                 <img src={`https://i.pravatar.cc/150?img=${i+10}`} className="w-full h-full object-cover" />
               </div>
               <span className="text-[#999] text-xs">Actor Name</span>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// 4. Agenda Screen
const AgendaScreen = () => {
  const [view, setView] = useState('list'); // 'list' or 'calendar'

  return (
    <div className="p-5 pt-12 pb-24 h-full animate-in fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">Agenda</h1>
      
      {/* Toggle */}
      <div className="bg-[#1A1A1A] p-1 rounded-xl flex mb-8">
        <button 
          onClick={() => setView('list')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'list' ? 'bg-[#333] text-white' : 'text-[#666]'}`}
        >
          Liste
        </button>
        <button 
          onClick={() => setView('calendar')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'calendar' ? 'bg-[#333] text-white' : 'text-[#666]'}`}
        >
          Calendrier
        </button>
      </div>

      {/* List View */}
      <div className="flex flex-col gap-6">
        {MOCK_DATA.agenda.map((day, idx) => (
          <div key={idx}>
            <h3 className="text-[#DEFF9A] font-bold text-lg mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#DEFF9A] rounded-full inline-block"></span>
              {day.day} <span className="text-white">{day.date}</span>
            </h3>
            {day.films.map((film, fidx) => (
               <div key={fidx} className="bg-[#1A1A1A] p-4 rounded-xl flex items-center justify-between group mb-2 border border-transparent hover:border-[#333] transition-colors">
                 <div className="flex gap-4 items-center">
                    <div className="bg-[#333] text-white font-mono rounded px-2 py-1 text-sm">{film.time}</div>
                    <div>
                      <h4 className="text-white font-bold">{film.title}</h4>
                      <p className="text-[#666] text-xs">{film.cinema}</p>
                    </div>
                 </div>
                 <button className="w-8 h-8 rounded-full bg-[#222] flex items-center justify-center text-[#666] group-hover:bg-[#DEFF9A] group-hover:text-black transition-colors">
                   <Check size={16} />
                 </button>
               </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. Explorer/Search Screen (Placeholder for structure)
const ExplorerScreen = () => (
  <div className="p-5 pt-12 h-full">
    <div className="relative mb-6">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" size={20} />
      <input type="text" placeholder="Films, acteurs, cinémas..." className="w-full bg-[#1A1A1A] text-white pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#DEFF9A]" />
    </div>
    
    <h3 className="text-white font-bold mb-4">Catégories</h3>
    <div className="grid grid-cols-2 gap-4">
      {['Action', 'Drame', 'Horreur', 'Comédie'].map(cat => (
        <div key={cat} className="h-24 bg-[#1A1A1A] rounded-xl flex items-center justify-center border border-[#333] hover:border-[#DEFF9A] transition-colors cursor-pointer">
          <span className="text-[#CCC] font-medium">{cat}</span>
        </div>
      ))}
    </div>
  </div>
);

// --- MAIN APP ORCHESTRATOR ---

export default function CineFlowApp() {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Pour l'effet "Mobile" dans le navigateur
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#050505] font-sans">
      <div className="w-full max-w-md h-[100dvh] md:h-[850px] bg-[#0A0A0A] md:rounded-[3rem] md:border-[8px] md:border-[#1a1a1a] shadow-2xl relative overflow-hidden flex flex-col">
        
        {!hasOnboarded ? (
          <OnboardingScreen onComplete={() => setHasOnboarded(true)} />
        ) : (
          <>
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
              {currentTab === 'home' && <HomeScreen onMovieClick={setSelectedMovie} />}
              {currentTab === 'agenda' && <AgendaScreen />}
              {currentTab === 'explorer' && <ExplorerScreen />}
              {currentTab === 'profil' && <div className="flex items-center justify-center h-full text-[#666]">Profil (À venir)</div>}
            </div>

            {/* Bottom Navigation */}
            <div className="h-20 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/5 flex justify-around items-center px-2 shrink-0 z-40 absolute bottom-0 w-full">
              <NavIcon icon={Film} label="Feed" active={currentTab === 'home'} onClick={() => setCurrentTab('home')} />
              <NavIcon icon={Calendar} label="Agenda" active={currentTab === 'agenda'} onClick={() => setCurrentTab('agenda')} />
              <NavIcon icon={Search} label="Explorer" active={currentTab === 'explorer'} onClick={() => setCurrentTab('explorer')} />
              <NavIcon icon={User} label="Profil" active={currentTab === 'profil'} onClick={() => setCurrentTab('profil')} />
            </div>

            {/* Detail Overlay */}
            {selectedMovie && (
              <DetailScreen movie={selectedMovie} onBack={() => setSelectedMovie(null)} />
            )}
          </>
        )}
      </div>
      
      {/* Global CSS for utilities not in Tailwind default */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}