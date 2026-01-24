import "./App.css";
import {
  FormControl,
  InputGroup,
  Container,
  Button,
  Card,
  Row,
} from "react-bootstrap";
import { useState, useEffect } from "react";

const clientId = import.meta.env.VITE_CLIENT_ID;
const clientSecret = import.meta.env.VITE_CLIENT_SECRET;

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [albums, setAlbums] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#121212");
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    let authParams = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body:
        "grant_type=client_credentials&client_id=" +
        clientId +
        "&client_secret=" +
        clientSecret,
    };

    fetch("https://accounts.spotify.com/api/token", authParams)
      .then((result) => result.json())
      .then((data) => {
        if (data.access_token) {
          setAccessToken(data.access_token);
          setAuthError(false);
        } else {
          setAuthError(true);
          setError("Authentication failed. Please check your API credentials.");
        }
      })
      .catch((err) => {
        console.error("Auth error:", err);
        setAuthError(true);
        setError("Failed to connect to Spotify. Please try again later.");
      });
  }, []);

  const getBackgroundColor = (artistName) => {
    const femaleKeywords = ['lady', 'girl', 'queen', 'woman', 'female', 'ariana', 'taylor', 'billie', 'beyonce', 'rihanna', 'adele', 'sia', 'dua', 'selena', 'miley', 'katy', 'pink', 'madonna', 'cher', 'mariah', 'whitney', 'celine', 'shakira', 'britney', 'nicki', 'cardi', 'megan', 'lizzo', 'halsey', 'lana', 'camila', 'olivia'];
    const maleKeywords = ['boy', 'man', 'king', 'mr', 'sir', 'drake', 'weeknd', 'bruno', 'ed', 'shawn', 'justin', 'kanye', 'jay', 'eminem', 'kendrick', 'post', 'travis', 'bad bunny', 'harry', 'zayn', 'lil', 'juice', 'tyler', 'frank', 'childish', 'pharrell', 'usher', 'chris', 'jason', 'john', 'adam', 'charlie', 'sam smith'];

    const lowerArtist = artistName.toLowerCase();

    const isFemale = femaleKeywords.some(keyword => lowerArtist.includes(keyword));
    const isMale = maleKeywords.some(keyword => lowerArtist.includes(keyword));

    if (isFemale) {
      const femaleColors = ['#ff6b9d', '#c44569', '#f39c12', '#e74c3c', '#9b59b6'];
      return femaleColors[Math.floor(Math.random() * femaleColors.length)];
    } else if (isMale) {
      const maleColors = ['#3498db', '#2ecc71', '#f39c12', '#e67e22', '#1abc9c'];
      return maleColors[Math.floor(Math.random() * maleColors.length)];
    } else {
      const neutralColors = ['#8e44ad', '#34495e', '#16a085', '#27ae60', '#2980b9'];
      return neutralColors[Math.floor(Math.random() * neutralColors.length)];
    }
  };

  async function search() {
    if (!searchInput.trim()) {
      setError("Please enter an artist or album name to search.");
      return;
    }

    if (!accessToken) {
      setError("Unable to connect to Spotify. Try to refresh the page.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setError("");
    setAlbums([]);

    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    // Get Artist
    try {
      const artistData = await fetch(
        "https://api.spotify.com/v1/search?q=" + encodeURIComponent(searchInput) + "&type=artist",
        artistParams
      ).then((result) => result.json());

      if (!artistData.artists || !artistData.artists.items || artistData.artists.items.length === 0) {
        setError(`No artist found for "${searchInput}". Please check the spelling and try again.`);
        setIsLoading(false);
        return;
      }

      const artistID = artistData.artists.items[0].id;
      const artistName = artistData.artists.items[0].name;

      setBackgroundColor(getBackgroundColor(artistName));

      // Get Album
      const albumData = await fetch(
        "https://api.spotify.com/v1/artists/" +
        artistID +
        "/albums?include_groups=album&market=US&limit=50",
        artistParams
      ).then((result) => result.json());

      if (!albumData.items || albumData.items.length === 0) {
        setError(`No albums found for "${artistName}". Try searching for a different artist.`);
      } else {
        setAlbums(albumData.items);
      }
    }

    catch (error) {
      console.error("Error fetching data:", error);
      setError("Something went wrong while searching. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoBack = () => {
    setHasSearched(false);
    setAlbums([]);
    setSearchInput("");
    setError("");
    setBackgroundColor("#121212");
  };

  return (
    <div className="min-h-screen" style={{ background: "url('/doodle-background.svg') repeat, #0a0a0a" }}>
      {!hasSearched ? (
        // SEARCH PAGE
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="relative max-w-3xl w-full rounded-lg overflow-hidden shadow-2xl h-72 sm:h-80 md:h-96 bg-[#121212] flex items-center justify-center">

            {/* 1. Base Gradient Layer (Green edges, Black center) */}
            <div
              className="absolute inset-0"
              style={{
                background: `
        radial-gradient(circle at center, transparent 0%, rgba(29, 185, 84, 0.52) 100%),
        radial-gradient(circle at center, #030303 0%, #000 100%)
      `
              }}
            />

            {/* 2. AUTHENTIC NOISE LAYER (The "Mixer") */}
            <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <filter id="spotifyNoise">
                  {/* High frequency creates the 'sandpaper' grain look */}
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency="0.80"
                    numOctaves="4"
                    stitchTiles="stitch"
                  />
                  {/* This makes the noise interact with the colors underneath */}
                  <feColorMatrix type="saturate" values="0" />
                </filter>
                <rect width="100%" height="100%" filter="url(#spotifyNoise)" />
              </svg>
            </div>

            {/* 3. Subtle Lighting Overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            {/* Content (Remains identical to your logic) */}
            <div className="relative z-10 text-center p-8 sm:p-12 w-full">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-5"
                style={{
                  fontFamily: "'Instrument Serif', serif",
                  fontWeight: '400',
                }}>
                Discover Your Favorite
                <span className="relative inline-block ml-2 sm:ml-3">
                  Albums
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1283 132"><path d="M1282.46 5.79c-.91-3.88-5.18-6.65-9.04-5.54-104.37 29.02-193.78 56.87-361.6 74.53-268.41 28.16-539.6 14.6-803.08-26.38C94.9 47.97-.34 26.24.08 41.38c-1.56 14.21 19.47 12.91 29.6 17.24 32.82 8.6 66.1 15.33 99.4 21.81 238.99 44.43 482.98 55.29 725.63 49.01 92.37-4.11 185.68-9.96 275.51-33.09 18.68-6.31 42.79-9.21 55.18-25.89 6.76-13.28-12.41-21.16-13.83-6.12-17.69 11.67-39.31 15.61-59.45 21.34-114.56 25.18-245.31 30.46-361.99 30.36-191.39.45-383.13-10.13-572-42.21 277.31 36.42 560.77 44.96 837.82 2.23 104.21-15.4 195.11-42.74 260.97-61.22a7.57 7.57 0 0 0 5.54-9.05Z" fill="#01AC20"></path></svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-green-100 max-w-2xl mx-auto mb-8 sm:mb-12">
                Search for any artist and explore their albums powered by Spotify
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-12">
                <input
                  type="text"
                  placeholder="Search For an Artist or Album"
                  className="w-full sm:w-96 h-12 px-5 rounded-full text-white bg-white/10 border border-white/20 backdrop-blur-md outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder:text-gray-300"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && search()}
                  disabled={isLoading || authError}
                />
                <button
                  onClick={search}
                  disabled={isLoading || authError}
                  className="w-full sm:w-auto bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-8 py-3 rounded-full transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? "Searching..." : "Search"}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="max-w-2xl mx-auto" role="alert">
                  <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-2xl p-4 sm:p-6 text-center">
                    <p className="text-red-300 text-sm sm:text-base font-medium mb-2">
                      {error}
                    </p>
                    {error.includes("No artist found") && (
                      <p className="text-red-200 text-xs sm:text-sm">
                        💡 Tip: Try using the full artist name or check for typos
                      </p>
                    )}
                    {authError && (
                      <p className="text-red-200 text-xs sm:text-sm mt-2">
                        🔑 Make sure your Spotify API credentials are correctly configured
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Bubble Loader */}
              {isLoading && (
                <div className="flex justify-center items-center" role="status" aria-live="polite">
                  <div className="flex gap-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full bg-green-500"
                        style={{
                          animation: `bubble 1.4s infinite ease-in-out ${i * 0.16}s`,
                        }}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="sr-only">Loading albums...</span>
                  <style>{`
          @keyframes bubble {
            0%, 80%, 100% {
              transform: scale(0);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        // RESULTS PAGE
        <div
          className="min-h-screen pt-20 pb-12 transition-all duration-700"
          style={{
            background: `linear-gradient(to bottom, ${backgroundColor}50 0%, #12121233 100%)`
          }}
        >
          {/* Back Button */}
          <button
            onClick={handleGoBack}
            className="fixed top-6 left-6 z-20 w-12 h-12 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Go back to home"
          >


            <svg xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 25 25"
              width="30"
              height="30"
              fill="none"
              stroke="black"
              strokeWidth="2"
            >
              <path d="M32 15H3.41l8.29-8.29-1.41-1.42-10 10a1 1 0 0 0 0 1.41l10 10 1.41-1.41L3.41 17H32z" data-name="4-Arrow Left" />
            </svg>
          </button>

          {/* Search Bar (Sticky) */}
          <div className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black to-transparent pt-4 pb-6 px-4">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-center items-center gap-3">
              <input
                type="text"
                placeholder="Search For an Artist or Album"
                className="w-full sm:flex-1 max-w-96 h-12 px-5 rounded-full text-black outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    search();
                  }
                }}
                disabled={isLoading || authError}
                aria-label="Search for an artist or album"
              />
              <button
                onClick={search}
                disabled={isLoading || authError}
                className="w-full sm:w-auto bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isLoading ? "Searching for artist" : "Search"}
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* Results Container */}
          <div
            className="container mx-auto sm:px-6 lg:px-8 py-8 space-y-8"
          >
            {/* Error Message */}
            {error && (
              <div className="max-w-2xl mx-auto mb-8" role="alert">
                <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-2xl p-4 sm:p-6 text-center">
                  <p className="text-red-300 text-sm sm:text-base font-medium mb-2">
                    {error}
                  </p>
                  {error.includes("No artist found") && (
                    <p className="text-red-200 text-xs sm:text-sm">
                      💡 Tip: Try using the full artist name or check for typos
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Bubble Loader */}
            {isLoading && (
              <div className="flex justify-center items-center h-48" role="status" aria-live="polite">
                <div className="flex gap-3">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-green-500"
                      style={{
                        animation: `bubble 1.4s infinite ease-in-out ${i * 0.16}s`,
                      }}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="sr-only">Loading albums...</span>
                <style>{`
                  @keyframes bubble {
                    0%, 80%, 100% {
                      transform: scale(0);
                      opacity: 0.5;
                    }
                    40% {
                      transform: scale(1);
                      opacity: 1;
                    }
                  }
                `}</style>
              </div>
            )}

            {/* Empty Results Message */}
            {!isLoading && albums.length === 0 && !error && (
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-8 sm:p-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                    No Results Found
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base mb-4">
                    We couldn't find any albums for your search.
                  </p>
                  <div className="text-left bg-gray-900 bg-opacity-50 rounded-xl p-4 sm:p-6 text-sm sm:text-base">
                    <p className="text-green-400 font-semibold mb-2">💡 Search Tips:</p>
                    <ul className="text-gray-300 space-y-2">
                      <li>• Double-check the spelling of the artist name</li>
                      <li>• Try using the artist's full name</li>
                      <li>• Search for popular songs or albums by the artist</li>
                      <li>• Make sure the artist is available on Spotify</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Albums Grid */}
            {!isLoading && albums.length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 sm:gap-5" role="list">
                {albums.map((album, index) => (
                  <div
                    key={album.id}
                    className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 group"
                    role="listitem"
                  >
                    <img
                      src={album.images[0]?.url}
                      alt={`${album.name} album cover`}
                      className="w-full h-full object-cover"
                      loading={index < 6 ? "eager" : "lazy"}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 flex flex-col items-center justify-center p-3 sm:p-4 opacity-0 group-hover:opacity-100">
                      <h3 className="text-white font-semibold text-center mb-1 sm:mb-2 text-sm sm:text-base line-clamp-2">
                        {album.name}
                      </h3>
                      <p className="text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4">
                        {album.release_date}
                      </p>
                      <a
                        href={album.external_urls.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-green-500 to-green-400 text-black font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-black"
                        aria-label={`Listen to ${album.name} on Spotify`}
                      >
                        Listen 🎧
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default App;
