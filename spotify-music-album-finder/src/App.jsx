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
    <div className="min-h-screen bg-black">
      <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-12">
        <div className="absolute inset-0 bg-black" />

         {/* Back Arrow - Only show after search */}
        {hasSearched && (
          <button
            onClick={handleGoBack}
            className="absolute top-6 left-6 z-20 w-12 h-12 rounded-full bg-black bg-opacity-70 hover:bg-opacity-90 flex items-center justify-center transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-label="Go back to home"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
        )}

        {/* Content Container with a gradient Image Box */}
        <div className="relative z-10 max-w-5xl mx-auto">
          <div 
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{
              border: '2px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <img 
              src="/path-to-your-gradient-image.jpg" 
              alt="Gradient background"
              className="w-full h-auto"
            />
        
      {/* Overlay Content on Image */}
            <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center p-8 sm:p-12">
              <div className="w-full max-w-3xl">
        {/* Onboarding Text */}
        {!hasSearched && (
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-5"
              style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "normal",
              fontDisplay: "swap",
              fontWeight: '400',
              }}>
              Discover Your Favorite
              <span className="relative inline-block ml-2 sm:ml-3">
                    Albums
                    <svg
                      className="absolute left-0 -bottom-1 sm:-bottom-2 w-full h-4 sm:h-5 pointer-events-none"
                      viewBox="0 0 300 20"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M5,15 Q75,5 150,12 T295,10"
                        stroke="#1DB954"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        style={{
                          filter: "url(#roughen)"
                        }}
                      />
                      <defs>
                        <filter id="roughen">
                          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                        </filter>
                      </defs>
                    </svg>
                  </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              Search for any artist and explore their complete discography powered by Spotify
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
          <input
            type="text"
            placeholder="Search For an Artist or Album"
            className="w-full sm:w-96 h-12 px-5 rounded-full text-black outline-none focus:ring-2 focus:ring-green-500 transition-shadow"
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

       {/* Main Content Area */}
      <div 
        className="transition-all duration-700"
        style={{
          background: `linear-gradient(to bottom, ${backgroundColor}20 0%, #121212 100%)`
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

            
        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 px-4" role="alert">
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
        {!isLoading && hasSearched && albums.length === 0 && !error && (
          <div className="max-w-2xl mx-auto text-center px-4">
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
          <div className="flex flex-wrap justify-center gap-4 sm:gap-5 px-4" role="list">
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
            {/* Additional Content Section */}
              <div className="max-w-5xl mx-auto mt-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-3">🎵</div>
                    <h3 className="text-xl font-bold text-white mb-2">Discover More</h3>
                    <p className="text-white text-sm opacity-90">
                      Explore millions of songs and albums from artists around the world
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-3">📱</div>
                    <h3 className="text-xl font-bold text-white mb-2">Listen Anywhere</h3>
                    <p className="text-white text-sm opacity-90">
                      Stream music on your phone, computer, or any connected device
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-center">
                    <div className="text-4xl mb-3">💎</div>
                    <h3 className="text-xl font-bold text-white mb-2">Premium Quality</h3>
                    <p className="text-white text-sm opacity-90">
                      Enjoy high-quality audio and an ad-free listening experience
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
