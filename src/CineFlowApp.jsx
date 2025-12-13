 import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Home,
  Calendar,
  Search,
  Bookmark,
  User,
  Bell,
  ChevronLeft,
  Share2,
  Play,
  Star,
  Plus,
  Check,
  TrendingUp,
  SlidersHorizontal,
  Flame,
  Clock,
  Sparkles,
  Ticket,
  Settings,
  Moon,
} from "lucide-react";

/**
 * ✅ CINÉVEILLE — VERSION “IDÉALE LÉA” (1 fichier JSX)
 * - PAS de “Résumé du jour”
 * - À la place: un HEADER “Dernières sorties selon vos intérêts” (basé sur follows acteurs/genres)
 * - Feed centralisé + agenda + fiche film + watchlist + notifications configurables
 * - Persistance localStorage (prefs, watchlist, alertes, settings notifs)
 *
 * ⚠️ Nécessite Tailwind CSS.
 */

// -------------------- MOCK DATA --------------------

const MOVIES = [
  {
    id: 1,
    title: "Dune: Part Two",
    director: "Denis Villeneuve",
    releaseDate: "2024-02-28",
    rating: 4.8,
    genre: "Science Fiction",
    poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    actors: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson"],
    synopsis:
      "Paul Atreides s'unit à Chani et aux Fremen pour mener la révolte contre ceux qui ont anéanti sa famille.",
    tags: ["IMAX", "Blockbuster"],
  },
  {
    id: 2,
    title: "Mickey 17",
    director: "Bong Joon-ho",
    releaseDate: "2024-03-29",
    rating: 4.5,
    genre: "Sci-Fi / Thriller",
    poster: "https://upload.wikimedia.org/wikipedia/en/3/30/Mickey_17_poster.jpeg",
    backdrop: "https://variety.com/wp-content/uploads/2022/12/Mickey7.jpg",
    actors: ["Robert Pattinson", "Mark Ruffalo"],
    synopsis: "Un employé jetable est envoyé en mission pour coloniser le monde de glace de Niflheim.",
    tags: ["Attente Élevée", "Cannes"],
  },
  {
    id: 3,
    title: "Challengers",
    director: "Luca Guadagnino",
    releaseDate: "2024-04-26",
    rating: 4.2,
    genre: "Drame / Sport",
    poster: "https://fr.web.img6.acsta.net/pictures/24/02/22/10/44/2293883.jpg",
    backdrop:
      "https://media.vogue.fr/photos/64917a233512257d07730e2a/16:9/w_1280,c_limit/challengers_zendaya.jpg",
    actors: ["Zendaya", "Josh O'Connor"],
    synopsis: "Tashi, une ancienne prodige du tennis devenue entraîneuse, fait de son mari un champion.",
    tags: ["Romance", "Tendance"],
  },
];

const NEWS_FEED = [
  {
    id: 1,
    type: "trailer", // trailer | news | event | award
    title: "Nouvelle bande-annonce exclusive",
    subject: "Joker: Folie à Deux",
    timestamp: "Il y a 2h",
    image: "https://i.ytimg.com/vi/_OKAwz2MsJs/maxresdefault.jpg",
    likes: 1204,
    relatedActors: ["Joaquin Phoenix", "Lady Gaga"],
    relatedGenres: ["Thriller", "Drame"],
    priority: 3,
  },
  {
    id: 2,
    type: "news",
    title: "Casting confirmé",
    subject: "Quentin Tarantino engage Brad Pitt pour son dernier film.",
    timestamp: "Il y a 5h",
    image: null,
    likes: 850,
    relatedActors: ["Brad Pitt"],
    relatedGenres: ["Crime", "Drame"],
    priority: 2,
  },
  {
    id: 3,
    type: "event",
    title: "Festival de Cannes 2024",
    subject: "La sélection officielle dévoilée ce jeudi.",
    timestamp: "Hier",
    image:
      "https://media.vogue.fr/photos/646b38c2921570534289873d/16:9/w_1920,c_limit/GettyImages-1490899818.jpg",
    likes: 2300,
    relatedActors: [],
    relatedGenres: [],
    priority: 4,
  },
  {
    id: 4,
    type: "award",
    title: "Oscars — favoris du moment",
    subject: "Les prédictions de la semaine (top 5).",
    timestamp: "Il y a 1j",
    image: null,
    likes: 410,
    relatedActors: [],
    relatedGenres: [],
    priority: 1,
  },
];

const ACTORS = [
  { id: 1, name: "Timothée Chalamet" },
  { id: 2, name: "Zendaya" },
  { id: 3, name: "Florence Pugh" },
  { id: 4, name: "Austin Butler" },
  { id: 5, name: "Brad Pitt" },
];

const GENRES = [
  "Science Fiction",
  "Thriller",
  "Drame",
  "Romance",
  "Action",
  "Comédie",
  "Crime",
  "Sport",
];

// -------------------- UTILS --------------------

const cx = (...arr) => arr.filter(Boolean).join(" ");

function safeImgFallback(e, fallbackUrl) {
  if (!e?.currentTarget) return;
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallbackUrl;
}

function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function formatFR(dateISO) {
  const [y, m, d] = dateISO.split("-").map(Number);
  const dt = new Date(y, (m || 1) - 1, d || 1);
  return dt.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}
function yearOnly(dateISO) {
  return (dateISO || "").split("-")[0] || "";
}

function matchesPrefs(itemOrMovie, prefs) {
  const followedActors = new Set(prefs.followedActors || []);
  const followedGenres = new Set(prefs.followedGenres || []);

  const actors = itemOrMovie.relatedActors || itemOrMovie.actors || [];
  const genres =
    itemOrMovie.relatedGenres ||
    (itemOrMovie.genre ? [itemOrMovie.genre.split("/")[0].trim()] : []);

  const actorHit = actors.some((a) => followedActors.has(a));
  const genreHit = genres.some((g) => followedGenres.has(g));

  return { actorHit, genreHit, anyHit: actorHit || genreHit };
}

function withinQuietHours(now, quiet) {
  if (!quiet?.enabled) return false;
  const [sh, sm] = quiet.start.split(":").map(Number);
  const [eh, em] = quiet.end.split(":").map(Number);

  const start = new Date(now);
  start.setHours(sh, sm, 0, 0);

  const end = new Date(now);
  end.setHours(eh, em, 0, 0);

  // Traverse minuit
  if (end <= start) return now >= start || now <= end;
  return now >= start && now <= end;
}

// -------------------- UI PRIMITIVES --------------------

const Section = ({ title, right, children }) => (
  <section className="mt-7">
    <div className="flex items-end justify-between gap-3">
      <h2 className="text-[15px] sm:text-base font-extrabold tracking-tight text-white">{title}</h2>
      {right}
    </div>
    <div className="mt-3">{children}</div>
  </section>
);

const Chip = ({ active, children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={cx(
      "px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all border",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70",
      active
        ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/20"
        : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/8"
    )}
  >
    {children}
  </button>
);

const IconButton = ({ label, onClick, children }) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className={cx(
      "p-2.5 rounded-2xl border transition-all",
      "bg-white/5 border-white/10 hover:bg-white/8",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
    )}
  >
    {children}
  </button>
);

const Card = ({ className, children }) => (
  <div className={cx("rounded-3xl bg-white/5 border border-white/10", className)}>{children}</div>
);

// -------------------- TAB BAR --------------------

const TabBar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "home", icon: Home, label: "Accueil" },
    { id: "search", icon: Search, label: "Explorer" },
    { id: "calendar", icon: Calendar, label: "Sorties" },
    { id: "lists", icon: Bookmark, label: "Liste" },
    { id: "profile", icon: User, label: "Profil" },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-t border-white/10"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
    >
      <div className="max-w-2xl mx-auto px-4 pt-3 pb-2 flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cx(
                "w-16 flex flex-col items-center gap-1 py-1 rounded-xl transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70",
                isActive ? "text-rose-400" : "text-slate-400 hover:text-slate-200"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={24} strokeWidth={isActive ? 2.6 : 2} />
              <span className={cx("text-[10px] font-semibold", isActive && "font-extrabold")}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// -------------------- MOVIE CARDS --------------------

const MovieCardRow = ({ movie, onClick, right }) => (
  <button
    type="button"
    onClick={() => onClick(movie)}
    className={cx(
      "w-full text-left flex gap-4 p-4 rounded-3xl border transition-all",
      "bg-white/5 border-white/10 hover:bg-white/8 active:scale-[0.99]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
    )}
  >
    <div className="w-20 h-28 rounded-2xl overflow-hidden shrink-0 bg-slate-800">
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-full object-cover"
        onError={(e) => safeImgFallback(e, "https://placehold.co/200x300?text=No+Image")}
      />
    </div>

    <div className="min-w-0 flex-1 flex flex-col justify-center">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-black tracking-tight text-white line-clamp-1">{movie.title}</h3>
        <div className="shrink-0 flex items-center gap-1 text-xs font-extrabold text-yellow-400">
          <Star size={14} className="fill-current" />
          <span>{movie.rating}</span>
        </div>
      </div>

      <p className="text-slate-300 font-semibold">
        {formatFR(movie.releaseDate)} • {movie.genre.split("/")[0]}
      </p>
      <p className="text-slate-400 text-sm mt-1 line-clamp-1">{movie.director}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {(movie.tags || []).slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 rounded-xl text-[10px] font-extrabold tracking-wider uppercase bg-white/8 text-slate-200 border border-white/10"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>

    <div className="shrink-0 flex items-center gap-2">{right}</div>
  </button>
);

const MovieCardPoster = ({ movie, onClick, badge }) => (
  <button
    type="button"
    onClick={() => onClick(movie)}
    className={cx(
      "relative w-40 sm:w-44 flex-shrink-0 snap-start text-left rounded-3xl",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
    )}
  >
    <div className="relative aspect-[2/3] rounded-3xl overflow-hidden shadow-xl shadow-black/40 border border-white/10">
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-full object-cover"
        onError={(e) => safeImgFallback(e, "https://placehold.co/200x300?text=No+Image")}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

      <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/10">
        <Star size={12} className="text-yellow-400 fill-yellow-400" />
        <span className="text-xs font-extrabold text-white">{movie.rating}</span>
      </div>

      {badge ? (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[10px] font-extrabold border border-white/10">
          {badge}
        </div>
      ) : null}

      <div className="absolute bottom-3 left-3 right-3">
        <h3 className="text-white font-black text-sm leading-tight line-clamp-2">{movie.title}</h3>
        <p className="text-xs text-slate-200/90 font-semibold mt-1">
          {formatFR(movie.releaseDate)} • {movie.genre.split("/")[0]}
        </p>
      </div>
    </div>
  </button>
);

// -------------------- NEWS ITEM --------------------

const NewsItem = ({ item, pinned = false }) => {
  const isTrailer = item.type === "trailer";
  const isEvent = item.type === "event";
  const isAward = item.type === "award";
  const Icon = isTrailer ? Play : isEvent ? Flame : isAward ? Star : TrendingUp;

  return (
    <div className={cx("mb-5", pinned && "ring-1 ring-rose-500/30 rounded-3xl")}>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div
            className={cx(
              "w-9 h-9 rounded-2xl flex items-center justify-center border",
              isTrailer
                ? "bg-rose-600/80 border-rose-500/40"
                : isEvent
                ? "bg-purple-600/60 border-purple-500/30"
                : isAward
                ? "bg-yellow-500/25 border-yellow-400/30"
                : "bg-blue-600/70 border-blue-500/40"
            )}
          >
            <Icon size={14} className={cx("text-white", isTrailer && "fill-white")} />
          </div>
          <div>
            <p className="text-white text-sm font-extrabold">
              {isTrailer ? "Trailer" : isEvent ? "Événement" : isAward ? "Récompenses" : "Actu"}
            </p>
            <p className="text-slate-400 text-xs font-semibold">{item.timestamp}</p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Partager"
          className="text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 rounded-full p-2"
        >
          <Share2 size={18} />
        </button>
      </div>

      <div className="rounded-3xl overflow-hidden bg-white/5 border border-white/10 shadow-xl shadow-black/30">
        {item.image ? (
          <div className="relative aspect-video">
            <img
              src={item.image}
              alt={item.subject}
              className="w-full h-full object-cover"
              onError={(e) => safeImgFallback(e, "https://placehold.co/1280x720?text=No+Image")}
            />
            {isTrailer ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25">
                  <Play size={22} className="text-white fill-white ml-1" />
                </div>
              </div>
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          </div>
        ) : null}

        <div className="p-4">
          <h3 className="text-lg font-black text-white leading-tight">{item.title}</h3>
          <p className="text-slate-300 text-sm mt-1">{item.subject}</p>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-black/25 border border-white/10 text-slate-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
            >
              <span className="text-rose-400 font-black">♥</span>
              <span className="text-xs font-extrabold">{item.likes}</span>
            </button>

            <button
              type="button"
              className="text-xs font-extrabold text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70 rounded-lg px-2 py-2"
            >
              Lire la suite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------- MOVIE DETAIL --------------------

const MovieDetail = ({
  movie,
  onClose,
  watchlistIds,
  toggleWatchlist,
  notifIds,
  toggleNotif,
  prefs,
}) => {
  const closeBtnRef = useRef(null);
  useEffect(() => closeBtnRef.current?.focus?.(), []);

  const isListed = watchlistIds.includes(movie.id);
  const isNotified = notifIds.includes(movie.id);

  const whyForYou = useMemo(() => {
    const m = matchesPrefs(movie, prefs);
    const reasons = [];
    if (m.actorHit) reasons.push("Tu suis un acteur du casting");
    if (m.genreHit) reasons.push("Ça match tes genres favoris");
    if (!reasons.length) reasons.push("Tendance + très bien noté");
    return reasons;
  }, [movie, prefs]);

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-y-auto">
        <div style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }} />

        <div className="sticky top-0 z-20 px-4 pb-3 pt-2 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
              aria-label="Retour"
            >
              <ChevronLeft />
            </button>

            <div className="flex items-center gap-2">
              <IconButton
                label={isListed ? "Retirer de la watchlist" : "Ajouter à la watchlist"}
                onClick={() => toggleWatchlist(movie.id)}
              >
                {isListed ? <Check size={20} /> : <Plus size={20} />}
              </IconButton>

              <IconButton
                label={isNotified ? "Désactiver alerte" : "Activer alerte"}
                onClick={() => toggleNotif(movie.id)}
              >
                <Bell size={20} className={isNotified ? "fill-white" : ""} />
              </IconButton>

              <IconButton label="Partager" onClick={() => {}}>
                <Share2 size={20} />
              </IconButton>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4">
          <div className="relative mt-4 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
            <div className="relative aspect-[4/5] sm:aspect-video">
              <img
                src={movie.backdrop}
                alt={movie.title}
                className="w-full h-full object-cover"
                onError={(e) => safeImgFallback(e, movie.poster)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

              <div className="absolute inset-0 grid place-items-center">
                <button
                  type="button"
                  className="w-16 h-16 rounded-full grid place-items-center bg-rose-600/90 hover:bg-rose-600 border border-white/10 shadow-xl shadow-rose-900/30 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/70"
                  aria-label="Lire la bande-annonce"
                >
                  <Play size={24} className="text-white fill-white ml-1" />
                </button>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {(movie.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-xl text-[10px] uppercase tracking-wider font-extrabold bg-white/10 text-white border border-white/10 backdrop-blur-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">{movie.title}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-200 font-semibold">
                  <span>{movie.director}</span>
                  <span className="opacity-60">•</span>
                  <span>{yearOnly(movie.releaseDate)}</span>
                  <span className="opacity-60">•</span>
                  <span className="inline-flex items-center gap-1 text-yellow-400 font-extrabold">
                    <Star size={14} className="fill-current" /> {movie.rating}/5
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Infos clés immédiates (Léa) */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="p-4">
              <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Sortie</p>
              <p className="mt-1 text-white font-black">{formatFR(movie.releaseDate)}</p>
              <p className="mt-1 text-slate-300 text-sm font-semibold">Salle + streaming (mock)</p>
            </Card>

            <Card className="p-4">
              <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Casting</p>
              <p className="mt-1 text-white font-black line-clamp-1">{movie.actors.slice(0, 2).join(" • ")}</p>
              <p className="mt-1 text-slate-300 text-sm font-semibold">{movie.actors.length} acteurs</p>
            </Card>

            <Card className="p-4">
              <p className="text-[11px] text-slate-400 font-extrabold uppercase tracking-wider">Pourquoi pour toi</p>
              <ul className="mt-2 space-y-1">
                {whyForYou.slice(0, 2).map((r, i) => (
                  <li key={i} className="text-slate-200 text-sm font-semibold flex items-center gap-2">
                    <Sparkles size={14} className="text-rose-300" /> {r}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Actions */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => toggleNotif(movie.id)}
              className={cx(
                "py-3 px-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 border transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70",
                isNotified
                  ? "bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-900/25"
                  : "bg-white/5 text-white border-white/10 hover:bg-white/8"
              )}
            >
              <Bell size={18} className={isNotified ? "fill-white" : ""} />
              {isNotified ? "Alerte activée" : "M’alerter"}
            </button>

            <button
              type="button"
              onClick={() => toggleWatchlist(movie.id)}
              className={cx(
                "py-3 px-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 border transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70",
                isListed
                  ? "bg-white text-slate-950 border-white shadow-lg shadow-black/15"
                  : "bg-white/5 text-white border-white/10 hover:bg-white/8"
              )}
            >
              {isListed ? <Check size={18} /> : <Plus size={18} />}
              {isListed ? "Dans ma liste" : "Ajouter"}
            </button>
          </div>

          {/* Contenu */}
          <div className="mt-8 pb-28">
            <Card className="p-5">
              <h2 className="text-white font-black text-lg">Synopsis</h2>
              <p className="mt-3 text-slate-300 leading-relaxed">{movie.synopsis}</p>
            </Card>

            <Card className="p-5 mt-6">
              <h2 className="text-white font-black text-lg">Casting</h2>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {movie.actors.map((actor, idx) => (
                  <div key={idx} className="min-w-[92px] flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-white/8 border border-white/10 grid place-items-center text-white font-black">
                      {actor.split(" ")[0]?.[0] || "A"}
                    </div>
                    <span className="text-xs text-center w-24 line-clamp-2 text-slate-200 font-semibold">
                      {actor}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="mt-6 rounded-3xl p-5 bg-gradient-to-r from-rose-600/90 to-purple-600/80 border border-white/10 shadow-xl shadow-rose-900/25">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-white/90 font-extrabold text-sm">Gain de temps</p>
                  <h3 className="text-white font-black text-xl mt-1">Réserver une séance (bientôt)</h3>
                  <p className="text-white/85 text-sm mt-2">Trouver vite une séance sans 5 applis.</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/15 border border-white/20">
                  <Ticket className="text-white" />
                </div>
              </div>
              <button
                type="button"
                className="mt-4 w-full py-3 rounded-2xl bg-white text-slate-950 font-black hover:bg-white/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                Voir les séances
              </button>
            </div>
          </div>
        </div>

        <div style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 88px)" }} />
      </div>
    </div>
  );
};

// -------------------- HOME (IDÉAL LÉA — SANS DIGEST) --------------------

const HomeView = ({
  onMovieClick,
  prefs,
  setPrefs,
  watchlistIds,
  notifIds,
  openPrefsQuick,
  goToAgenda,
}) => {
  // Feed news trié selon follows
  const rankedNews = useMemo(() => {
    const scored = NEWS_FEED.map((it) => {
      const m = matchesPrefs(it, prefs);
      const matchScore = (m.actorHit ? 4 : 0) + (m.genreHit ? 2 : 0);
      const typeBoost = it.type === "trailer" ? 2 : it.type === "event" ? 1 : 0;
      const score = matchScore + typeBoost + (it.priority || 0);
      return { ...it, __score: score, __match: m.anyHit };
    });
    scored.sort((a, b) => b.__score - a.__score);
    return scored;
  }, [prefs]);

  // ✅ Dernières sorties “selon vos intérêts”
  const releasesRanked = useMemo(() => {
    const list = MOVIES.map((m) => {
      const hit = matchesPrefs(m, prefs);
      const score = (hit.actorHit ? 10 : 0) + (hit.genreHit ? 6 : 0) + (m.rating || 0);
      return { ...m, __score: score, __hit: hit.anyHit };
    });
    list.sort((a, b) => b.__score - a.__score);
    return list;
  }, [prefs]);

  const topReleases = releasesRanked.slice(0, 6);
  const pinned = rankedNews.slice(0, 2);
  const rest = rankedNews.slice(2);

  const hasPrefs = (prefs.followedActors?.length || 0) + (prefs.followedGenres?.length || 0) > 0;

  return (
    <div className="min-h-screen pb-28 bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 pt-7">
        {/* Header app */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400">
                CineFlow
              </span>
            </h1>
            <p className="text-slate-400 font-semibold text-sm">Bonjour Léa 👋</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <IconButton label="Notifications" onClick={() => {}}>
                <Bell size={20} />
              </IconButton>
              {notifIds.length > 0 ? (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border border-slate-950" />
              ) : null}
            </div>
            <IconButton label="Préférences" onClick={openPrefsQuick}>
              <SlidersHorizontal size={20} />
            </IconButton>
          </div>
        </div>

        {/* Quick actions (gain de temps) */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={goToAgenda}
            className="rounded-3xl p-4 bg-white/5 border border-white/10 hover:bg-white/8 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
          >
            <div className="flex items-center justify-between">
              <p className="font-black">Agenda</p>
              <Clock className="text-slate-200" size={18} />
            </div>
            <p className="mt-2 text-slate-400 text-sm font-semibold">Planifier une sortie.</p>
          </button>

          <button
            type="button"
            onClick={openPrefsQuick}
            className="rounded-3xl p-4 bg-gradient-to-r from-rose-600/90 to-purple-600/80 border border-white/10 shadow-xl shadow-rose-900/20 hover:opacity-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/70"
          >
            <div className="flex items-center justify-between">
              <p className="font-black">Pour toi</p>
              <Sparkles className="text-white" size={18} />
            </div>
            <p className="mt-2 text-white/90 text-sm font-semibold">Affiner tes intérêts.</p>
          </button>
        </div>

        {/* ✅ HEADER demandé (remplace le digest) */}
        <div className="mt-6 rounded-3xl p-5 bg-white/5 border border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-white font-black text-lg leading-tight">
                Dernières sorties{" "}
                <span className="text-rose-300">selon vos intérêts</span>
              </p>
              <p className="text-slate-400 text-sm font-semibold mt-1">
                Basé sur les acteurs/genres que tu suis.
                {!hasPrefs ? " Ajoute des follows pour un résultat parfait." : ""}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-rose-600/20 border border-rose-500/30">
              <Sparkles size={18} className="text-rose-200" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {(prefs.followedActors || []).slice(0, 3).map((a) => (
              <span
                key={a}
                className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-white/8 border border-white/10 text-slate-100"
              >
                {a}
              </span>
            ))}
            {(prefs.followedGenres || []).slice(0, 3).map((g) => (
              <span
                key={g}
                className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-rose-600/15 border border-rose-500/25 text-rose-100"
              >
                {g}
              </span>
            ))}
            <button
              type="button"
              onClick={openPrefsQuick}
              className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-white/5 border border-white/10 hover:bg-white/8 transition-all"
            >
              Modifier
            </button>
          </div>

          <div className="mt-4 flex gap-4 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
            {topReleases.map((m) => (
              <MovieCardPoster key={m.id} movie={m} onClick={onMovieClick} badge={m.__hit ? "Pour toi" : null} />
            ))}
          </div>
        </div>

        {/* Setup prefs si vide */}
        {!hasPrefs ? (
          <div className="mt-6 rounded-3xl p-5 bg-white/5 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-white font-black">Personnalise ton feed</p>
                <p className="text-slate-400 text-sm font-semibold mt-1">
                  Moins de bruit, plus d’infos pertinentes.
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-rose-600/20 border border-rose-500/30">
                <Flame size={18} className="text-rose-200" />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Zendaya", "Timothée Chalamet", "Science Fiction", "Drame"].map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => {
                    if (GENRES.includes(x)) {
                      setPrefs((p) => ({
                        ...p,
                        followedGenres: Array.from(new Set([...(p.followedGenres || []), x])),
                      }));
                    } else {
                      setPrefs((p) => ({
                        ...p,
                        followedActors: Array.from(new Set([...(p.followedActors || []), x])),
                      }));
                    }
                  }}
                  className="px-3 py-2 rounded-full text-sm font-extrabold bg-rose-600/15 border border-rose-500/25 text-rose-100 hover:bg-rose-600/20 transition-all"
                >
                  + {x}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Feed centralisé */}
        <Section
          title="Actualités (centralisées)"
          right={
            <button className="text-xs font-extrabold text-slate-300 hover:text-white flex items-center gap-2">
              <SlidersHorizontal size={14} /> Filtrer
            </button>
          }
        >
          <div className="space-y-3">
            {pinned.map((n) => (
              <NewsItem key={n.id} item={n} pinned />
            ))}
          </div>

          <div className="mt-2 space-y-3">
            {rest.map((n) => (
              <NewsItem key={n.id} item={n} />
            ))}
          </div>
        </Section>

        <div style={{ height: 12 }} />
      </div>
    </div>
  );
};

// -------------------- SEARCH --------------------

const SearchView = ({ onMovieClick, prefs, setPrefs }) => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tout");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return MOVIES;
    return MOVIES.filter((m) => {
      const blob = `${m.title} ${m.director} ${m.genre} ${(m.actors || []).join(" ")}`.toLowerCase();
      return blob.includes(query);
    });
  }, [q]);

  return (
    <div className="min-h-screen pb-28 bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 pt-7">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">Explorer</h1>
          <IconButton label="Préférences" onClick={() => {}}>
            <Settings size={20} />
          </IconButton>
        </div>

        <div className="mt-4 relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="text"
            placeholder="Films, acteurs, réalisateurs…"
            className="w-full py-3 pl-12 pr-4 rounded-2xl outline-none border transition-all bg-white/5 text-white border-white/10 focus:ring-2 focus:ring-rose-500/60"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {["Tout", "Films", "Acteurs", "Festivals", "Critiques"].map((c) => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {c}
            </Chip>
          ))}
        </div>

        <Section title="Suggestions">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filtered.map((movie) => {
              const hit = matchesPrefs(movie, prefs).anyHit;
              return (
                <button
                  key={movie.id}
                  type="button"
                  onClick={() => onMovieClick(movie)}
                  className="text-left rounded-3xl overflow-hidden border transition-all bg-white/5 border-white/10 hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70"
                >
                  <div className="relative aspect-[2/3] bg-slate-800">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      onError={(e) => safeImgFallback(e, "https://placehold.co/200x300?text=No+Image")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 bg-black/45 backdrop-blur-md px-2 py-1 rounded-full text-xs font-extrabold text-yellow-400 flex items-center gap-1 border border-white/10">
                      <Star size={12} className="fill-current" /> {movie.rating}
                    </div>
                    {hit ? (
                      <div className="absolute top-2 left-2 bg-rose-600/90 px-2 py-1 rounded-full text-[10px] font-extrabold border border-white/10">
                        Pour toi
                      </div>
                    ) : null}
                  </div>

                  <div className="p-3">
                    <p className="font-black text-white line-clamp-1">{movie.title}</p>
                    <p className="text-xs text-slate-300 font-semibold mt-1">{movie.genre}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Quick follow (1 tap)" right={<span className="text-xs text-slate-400 font-extrabold">optionnel</span>}>
          <div className="flex flex-wrap gap-2">
            {["Zendaya", "Timothée Chalamet", "Science Fiction", "Drame"].map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => {
                  if (GENRES.includes(x)) {
                    setPrefs((p) => ({
                      ...p,
                      followedGenres: Array.from(new Set([...(p.followedGenres || []), x])),
                    }));
                  } else {
                    setPrefs((p) => ({
                      ...p,
                      followedActors: Array.from(new Set([...(p.followedActors || []), x])),
                    }));
                  }
                }}
                className="px-3 py-2 rounded-full text-sm font-extrabold bg-white/5 border border-white/10 hover:bg-white/8 transition-all"
              >
                + {x}
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

// -------------------- AGENDA --------------------

const AgendaView = ({ onMovieClick }) => {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const [selected, setSelected] = useState(2); // Mer

  return (
    <div className="min-h-screen pb-28 bg-slate-950 text-white">
      <div className="sticky top-0 z-20 bg-slate-950/85 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-2xl mx-auto px-4 pt-7 pb-4">
          <h1 className="text-2xl font-black tracking-tight">Agenda des sorties</h1>
          <p className="text-slate-400 text-sm font-semibold mt-1">Anticiper et planifier.</p>

          <div className="mt-4 flex items-center justify-between gap-2">
            {days.map((d, i) => {
              const active = selected === i;
              return (
                <button
                  type="button"
                  key={d}
                  onClick={() => setSelected(i)}
                  className={cx(
                    "w-12 h-[68px] rounded-3xl flex flex-col items-center justify-center border transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/70",
                    active
                      ? "bg-rose-600 border-rose-500 shadow-lg shadow-rose-900/30 scale-[1.06]"
                      : "bg-white/5 border-white/10 hover:bg-white/8"
                  )}
                >
                  <span className="text-[10px] font-extrabold uppercase">{d}</span>
                  <span className="text-lg font-black">{26 + i > 31 ? 26 + i - 31 : 26 + i}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-5">
        {selected === 2 ? (
          <>
            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl bg-rose-600/20 border border-rose-500/30 text-rose-200 text-xs font-extrabold uppercase tracking-wider">
              <Flame size={14} /> Sorties du jour
            </div>

            <div className="mt-4 space-y-3">
              {MOVIES.map((m) => (
                <MovieCardRow
                  key={m.id}
                  movie={m}
                  onClick={onMovieClick}
                  right={<ChevronLeft className="rotate-180 text-slate-400" />}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-16 flex flex-col items-center text-center opacity-70">
            <Calendar size={52} className="text-slate-500" />
            <p className="mt-4 text-slate-300 font-extrabold">Aucune sortie majeure ce jour.</p>
            <p className="mt-1 text-slate-400 text-sm font-semibold">Choisis un autre jour.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------- WATCHLIST --------------------

const ListsView = ({ watchlistIds, onMovieClick, toggleWatchlist }) => {
  const listMovies = MOVIES.filter((m) => watchlistIds.includes(m.id));

  return (
    <div className="min-h-screen pb-28 bg-slate-950 text-white">
      <div className="max-w-2xl mx-auto px-4 pt-7">
        <h1 className="text-2xl font-black tracking-tight">Ma watchlist</h1>
        <p className="mt-1 text-slate-400 font-semibold text-sm">Films repérés → jamais oubliés.</p>

        {listMovies.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center opacity-70">
            <Bookmark size={52} className="text-slate-500" />
            <p className="mt-4 text-slate-300 font-extrabold">Ta liste est vide.</p>
            <p className="mt-1 text-slate-400 text-sm font-semibold">Ajoute un film depuis Accueil / Explorer.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {listMovies.map((m) => (
              <MovieCardRow
                key={m.id}
                movie={m}
                onClick={onMovieClick}
                right={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(m.id);
                    }}
                    className="px-3 py-2 rounded-2xl bg-rose-600/15 border border-rose-500/25 text-rose-100 font-extrabold hover:bg-rose-600/20 transition-all"
                  >
                    Retirer
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------- PROFILE (Prefs + Notifs) --------------------

const ToggleRow = ({ on, setOn, label, desc, icon }) => {
  const Icon = icon;
  return (
    <div className="rounded-3xl p-5 bg-white/5 border border-white/10 flex items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-2xl bg-black/20 border border-white/10">
          <Icon size={18} className="text-white" />
        </div>
        <div>
          <p className="font-black text-white">{label}</p>
          <p className="text-sm text-slate-400 font-semibold mt-1">{desc}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOn(!on)}
        className={cx(
          "w-14 h-8 rounded-full relative border transition-colors shrink-0",
          on ? "bg-rose-600 border-rose-500" : "bg-white/10 border-white/10"
        )}
        aria-label={label}
      >
        <span className={cx("absolute top-1 w-6 h-6 rounded-full bg-white transition-all", on ? "left-7" : "left-1")} />
      </button>
    </div>
  );
};

const MultiSelect = ({ title, items, selected, onToggle }) => (
  <Card className="p-5">
    <p className="text-white font-black">{title}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      {items.map((x) => {
        const active = selected.includes(x);
        return (
          <button
            key={x}
            type="button"
            onClick={() => onToggle(x)}
            className={cx(
              "px-3 py-2 rounded-full text-sm font-extrabold border transition-all",
              active
                ? "bg-rose-600/90 text-white border-rose-500"
                : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/8"
            )}
          >
            {active ? "✓ " : "+ "}
            {x}
          </button>
        );
      })}
    </div>
  </Card>
);

const ProfileView = ({ prefs, setPrefs, notifSettings, setNotifSettings }) => (
  <div className="min-h-screen pb-28 bg-slate-950 text-white">
    <div className="max-w-2xl mx-auto px-4 pt-7">
      <h1 className="text-2xl font-black tracking-tight">Profil & Réglages</h1>

      <div className="mt-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 grid place-items-center text-2xl font-black shadow-xl shadow-rose-900/20">
          L
        </div>
        <div>
          <p className="text-xl font-black">Léa</p>
          <p className="text-slate-400 font-semibold text-sm">Objectif: infos rapides & fiables.</p>
        </div>
      </div>

      <Section title="Préférences (personnalisation)">
        <MultiSelect
          title="Acteurs suivis"
          items={ACTORS.map((a) => a.name)}
          selected={prefs.followedActors}
          onToggle={(name) =>
            setPrefs((p) => ({
              ...p,
              followedActors: p.followedActors.includes(name)
                ? p.followedActors.filter((x) => x !== name)
                : [...p.followedActors, name],
            }))
          }
        />

        <div className="mt-4" />

        <MultiSelect
          title="Genres favoris"
          items={GENRES}
          selected={prefs.followedGenres}
          onToggle={(genre) =>
            setPrefs((p) => ({
              ...p,
              followedGenres: p.followedGenres.includes(genre)
                ? p.followedGenres.filter((x) => x !== genre)
                : [...p.followedGenres, genre],
            }))
          }
        />
      </Section>

      <Section title="Notifications (contrôle total)">
        <ToggleRow
          on={notifSettings.enabled}
          setOn={(v) => setNotifSettings((s) => ({ ...s, enabled: v }))}
          label="Activer les notifications"
          desc="Tu choisis quoi, quand, et à quelle fréquence."
          icon={Bell}
        />

        <div className="mt-4 grid gap-3">
          <Card className="p-5">
            <p className="text-white font-black">Types d’alertes</p>
            <p className="text-slate-400 text-sm font-semibold mt-1">Pour éviter d’être dérangée.</p>

            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              {[
                ["trailer", "Trailers"],
                ["release", "Dates de sortie"],
                ["event", "Festivals / événements"],
                ["award", "Récompenses"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setNotifSettings((s) => ({
                      ...s,
                      types: { ...s.types, [key]: !s.types[key] },
                    }))
                  }
                  className={cx(
                    "p-4 rounded-2xl border text-left transition-all",
                    notifSettings.types[key]
                      ? "bg-rose-600/15 border-rose-500/25 text-white"
                      : "bg-white/5 border-white/10 text-slate-200 hover:bg-white/8"
                  )}
                >
                  <p className="font-extrabold">{label}</p>
                  <p className="text-sm mt-1 font-semibold text-slate-400">
                    {notifSettings.types[key] ? "Activé" : "Désactivé"}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl p-4 bg-black/20 border border-white/10">
              <div>
                <p className="font-extrabold text-white">Seulement si ça match mes follows</p>
                <p className="text-slate-400 text-sm font-semibold mt-1">Zéro spam, uniquement pertinent.</p>
              </div>
              <button
                type="button"
                onClick={() => setNotifSettings((s) => ({ ...s, matchOnly: !s.matchOnly }))}
                className={cx(
                  "w-14 h-8 rounded-full relative border transition-colors shrink-0",
                  notifSettings.matchOnly ? "bg-rose-600 border-rose-500" : "bg-white/10 border-white/10"
                )}
                aria-label="Match only"
              >
                <span
                  className={cx(
                    "absolute top-1 w-6 h-6 rounded-full bg-white transition-all",
                    notifSettings.matchOnly ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-white font-black">Fréquence</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                ["instant", "Instant"],
                ["daily", "1× / jour"],
                ["weekly", "1× / semaine"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setNotifSettings((s) => ({ ...s, frequency: key }))}
                  className={cx(
                    "px-3 py-2 rounded-full text-sm font-extrabold border transition-all",
                    notifSettings.frequency === key
                      ? "bg-rose-600/90 text-white border-rose-500"
                      : "bg-white/5 text-slate-200 border-white/10 hover:bg-white/8"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-black">Heures silencieuses</p>
                <p className="text-slate-400 text-sm font-semibold mt-1">Pas de notifications la nuit.</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setNotifSettings((s) => ({ ...s, quiet: { ...s.quiet, enabled: !s.quiet.enabled } }))
                }
                className={cx(
                  "w-14 h-8 rounded-full relative border transition-colors shrink-0",
                  notifSettings.quiet.enabled ? "bg-rose-600 border-rose-500" : "bg-white/10 border-white/10"
                )}
                aria-label="Quiet hours"
              >
                <span
                  className={cx(
                    "absolute top-1 w-6 h-6 rounded-full bg-white transition-all",
                    notifSettings.quiet.enabled ? "left-7" : "left-1"
                  )}
                />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="text-sm font-extrabold text-slate-200">
                <span className="block text-slate-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                  Début
                </span>
                <input
                  type="time"
                  value={notifSettings.quiet.start}
                  onChange={(e) =>
                    setNotifSettings((s) => ({ ...s, quiet: { ...s.quiet, start: e.target.value } }))
                  }
                  className="w-full px-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-rose-500/60"
                />
              </label>

              <label className="text-sm font-extrabold text-slate-200">
                <span className="block text-slate-400 text-xs font-extrabold uppercase tracking-wider mb-2">
                  Fin
                </span>
                <input
                  type="time"
                  value={notifSettings.quiet.end}
                  onChange={(e) =>
                    setNotifSettings((s) => ({ ...s, quiet: { ...s.quiet, end: e.target.value } }))
                  }
                  className="w-full px-3 py-3 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:ring-2 focus:ring-rose-500/60"
                />
              </label>
            </div>

            <div className="mt-4 flex items-center gap-2 text-slate-300">
              <Moon size={16} className="text-slate-300" />
              <p className="text-sm font-semibold">
                {notifSettings.quiet.enabled
                  ? `Silence de ${notifSettings.quiet.start} à ${notifSettings.quiet.end}`
                  : "Désactivé"}
              </p>
            </div>
          </Card>
        </div>
      </Section>
    </div>
  </div>
);

// -------------------- MAIN APP --------------------

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedMovie, setSelectedMovie] = useState(null);

  // Preferences (Follow)
  const [prefs, setPrefs] = useState(() =>
    loadLS("cv_prefs", {
      followedActors: ["Zendaya"], // exemple
      followedGenres: ["Science Fiction", "Drame"],
    })
  );

  // Watchlist / Alerts (per movie)
  const [watchlistIds, setWatchlistIds] = useState(() => loadLS("cv_watchlist", []));
  const [notifIds, setNotifIds] = useState(() => loadLS("cv_notif_movies", []));

  // Notification Center (control)
  const [notifSettings, setNotifSettings] = useState(() =>
    loadLS("cv_notif_settings", {
      enabled: true,
      matchOnly: true,
      frequency: "daily", // instant | daily | weekly
      types: { trailer: true, release: true, event: true, award: false },
      quiet: { enabled: true, start: "22:00", end: "09:00" },
    })
  );

  // Persist
  useEffect(() => saveLS("cv_prefs", prefs), [prefs]);
  useEffect(() => saveLS("cv_watchlist", watchlistIds), [watchlistIds]);
  useEffect(() => saveLS("cv_notif_movies", notifIds), [notifIds]);
  useEffect(() => saveLS("cv_notif_settings", notifSettings), [notifSettings]);

  const toggleWatchlist = (id) => {
    setWatchlistIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const toggleNotif = (id) => {
    setNotifIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Notifs status (mock)
  const notifStatus = useMemo(() => {
    const now = new Date();
    if (!notifSettings.enabled) return { allowed: false, reason: "Désactivées" };
    if (withinQuietHours(now, notifSettings.quiet)) return { allowed: false, reason: "Quiet hours" };
    return { allowed: true, reason: "OK" };
  }, [notifSettings]);

  const openPrefsQuick = () => setActiveTab("profile");
  const goToAgenda = () => setActiveTab("calendar");

  const content = useMemo(() => {
    switch (activeTab) {
      case "home":
        return (
          <HomeView
            onMovieClick={setSelectedMovie}
            prefs={prefs}
            setPrefs={setPrefs}
            watchlistIds={watchlistIds}
            notifIds={notifIds}
            openPrefsQuick={openPrefsQuick}
            goToAgenda={goToAgenda}
          />
        );
      case "search":
        return <SearchView onMovieClick={setSelectedMovie} prefs={prefs} setPrefs={setPrefs} />;
      case "calendar":
        return <AgendaView onMovieClick={setSelectedMovie} />;
      case "lists":
        return <ListsView watchlistIds={watchlistIds} onMovieClick={setSelectedMovie} toggleWatchlist={toggleWatchlist} />;
      case "profile":
        return <ProfileView prefs={prefs} setPrefs={setPrefs} notifSettings={notifSettings} setNotifSettings={setNotifSettings} />;
      default:
        return null;
    }
  }, [activeTab, prefs, watchlistIds, notifIds, notifSettings]);

  return (
    <div className="font-sans antialiased selection:bg-rose-500 selection:text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 -z-10 bg-slate-950" />
      <div className="fixed inset-0 -z-10 opacity-70 bg-[radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.18),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.14),transparent_45%),radial-gradient(circle_at_50%_90%,rgba(59,130,246,0.10),transparent_45%)]" />

      {/* Badge notifs (optionnel) */}
      <div className="fixed top-3 right-3 z-50">
        <div className="px-3 py-2 rounded-2xl bg-black/30 border border-white/10 backdrop-blur-md text-xs font-extrabold text-slate-200 flex items-center gap-2">
          <Bell size={14} className={notifStatus.allowed ? "text-rose-300" : "text-slate-400"} />
          Notifs: {notifStatus.allowed ? "OK" : notifStatus.reason}
        </div>
      </div>

      {content}

      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {selectedMovie ? (
        <MovieDetail
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          watchlistIds={watchlistIds}
          toggleWatchlist={toggleWatchlist}
          notifIds={notifIds}
          toggleNotif={toggleNotif}
          prefs={prefs}
        />
      ) : null}

      <div style={{ height: "calc(env(safe-area-inset-bottom) + 8px)" }} />
    </div>
  );
}
