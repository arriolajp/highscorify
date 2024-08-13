import '../App.css';
import {useEffect, useState} from "react";
import Axios from "axios";

export function Home(){
  const CLIENT_ID="611973d560d1464fb5a4db10d6b19a78";
  const REDIRECT_URI="https://master.d1djejxyh5xexr.amplifyapp.com";
  // const REDIRECT_URI="http://localhost:3000"
  //host https://master.d1djejxyh5xexr.amplifyapp.com
  const AUTH_ENDPOINT="https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE="token";
  const SCOPE = "user-top-read";

  const[token, setToken]=useState("");
  const [tracks,setTracks]=useState([]);
  const [artists, setArtists]=useState([]);
  const [genres,setGenres]=useState({}); 
  const [genreLen, setGenreLen] = useState(0); 
  const [settings, setSettings] = useState({
    selectedMetric: "top-tracks",
    selectedPeriod: "short_term",
    selectedLimit: 10,
  });

  const logout=()=>{
    setToken("");
    window.localStorage.removeItem("token");
  };

  const getTracks=async ()=>{
    const res=await Axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=${settings.selectedLimit}&time_range=${settings.selectedPeriod}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    .then((res)=>{
      setTracks(res.data.items);
      console.log(res.data.items); 

    })
    .catch((err)=>{
      console.error(err);
    });
  };

  const getArtists=async()=>{
    const res=await Axios.get(`https://api.spotify.com/v1/me/top/artists?limit=${settings.selectedLimit}&time_range=${settings.selectedPeriod}`,{
      headers:{
        Authorization: `Bearer ${token}`
      }
    })
    .then((res)=>{
      setArtists(res.data.items);
      console.log(res.data.items);
    });
  };

  const getGenres=async()=>{
    const res=await Axios.get(`https://api.spotify.com/v1/me/top/artists?limit=50&time_range=${settings.selectedPeriod}`,{
      headers:{
        Authorization:`Bearer ${token}`
      }
    })
    .then((res)=>{
      const genresArray = res.data.items.flatMap(artist => artist.genres);
      const genreDict = genresArray.reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {});
      // Convert the dictionary to an array of [genre, count] pairs
      const genreArray = Object.entries(genreDict);

      // Sort the array by the count in descending order
      const sortedGenresArray = genreArray.sort((a, b) => b[1] - a[1]);

      // Grab the top 10 items from the sorted array
      const top10GenresArray = sortedGenresArray.slice(0, 10);

      // Convert the top 10 array back to an object
      const top10GenresDict = Object.fromEntries(top10GenresArray);
      setGenreLen(genreArray.length);
      setGenres(top10GenresDict);
    });
    
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  useEffect(()=>{
    const hash=window.location.hash;
    let token=window.localStorage.getItem("token");

    if(!token&&hash){
      token=hash.substring(1).split("&").find(elem=>elem.startsWith("access_token")).split("=")[1];
    
      window.localStorage.setItem("token",token);
      
    }
    setToken(token);
    
  },[]);

  useEffect(() => {
    if (token) {
      if(settings.selectedMetric==="top-tracks"){
        getTracks();
      }else if(settings.selectedMetric==="top-artists"){
        getArtists();
      }else if(settings.selectedMetric==="top-genres"){
        getGenres();
      }
    }
  }, [token,settings]);
  return(
  <div className="App">
      <header className={`App-header ${token ? "logged-in" : "logged-out"}`}>
       
        {!token && (
          <h1>
            HIGHSCORIFY
            <span className="header-description">
              Top Track Generator
            </span>
          </h1>
          
        )
        }
        {!token &&(
        <a 
          className="spotify-link"
          href={`${AUTH_ENDPOINT}/?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
          >
            <button className="spotify-login-button">
              Login To Spotify
            </button>
          </a>
        )
        }
      </header>
      {token&&(
        <div className="hero">
          <div className="highscorify-container">
            <h1>HIGHSCORIFY</h1>
            <h2>
              {settings.selectedPeriod === "short_term" && <span>Last Month</span>}
              {settings.selectedPeriod === "medium_term" && <span>Last Six Months</span>}
              {settings.selectedPeriod === "long_term" && <span>Last Year</span>}
            </h2>
            <table>
              <thead>
                <tr>
                  <th>RANK</th>
                  <th>NAME</th>
                  <th>SCORE</th>
                </tr>
              </thead>
              <tbody>
                {settings.selectedMetric==="top-tracks"&&tracks.map((track,index) => (
                  <tr key={track.id}>
                    <td className="rank">{index+1}</td>
                    <td className="name">{track.name} - {track.artists.map(artist => artist.name).join(", ")}</td>
                    <td className="score">{formatDuration(track.duration_ms)}</td>
                  </tr>
                ))}
                {settings.selectedMetric==="top-artists"&&artists.map((artist,index) => (
                  <tr key={artist.id}>
                    <td className="rank">{index+1}</td>
                    <td className="name">{artist.name}</td>
                    <td className="score">{artist.popularity}</td>
                  </tr>
                ))}
                {settings.selectedMetric === "top-genres" &&Object.entries(genres).map(([genre, count], index) => (
                <tr key={index}>
                  <td className="rank">{index + 1}</td>
                  <td className="name">{genre}</td>
                  <td className="score">{genreLen ? (count / genreLen).toFixed(2) : 'N/A'}</td>
                </tr>
              ))}
                
              </tbody>
            </table>
          </div>
          <div className="options">
            <div className="leaderboard-settings">Leaderboard Settings</div>
            <table>
              <thead className="leaderboard-head">
                <th>Metric</th>
                <th>Time Period</th>
                <th>Length</th>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <button onClick={()=>setSettings({ ...settings, selectedMetric: "top-tracks" })}>
                    {settings.selectedMetric === "top-tracks" && <span className="icon">→</span>}
                      Top Tracks
                    </button>
                  </td>
                  <td>
                    <button onClick={()=>setSettings({ ...settings, selectedPeriod: "short_term" })}>
                    {settings.selectedPeriod === "short_term" && <span className="icon">→</span>}
                      Last Month
                    </button>
                  </td>
                  <td>
                    <button onClick={()=>setSettings({ ...settings, selectedLimit: 10 })}>
                    {settings.selectedLimit === 10 && <span className="icon">→</span>}
                      Top 10
                    </button>
                  </td>
                </tr>
                <tr>
                <td>
                    <button onClick={()=>setSettings({ ...settings, selectedMetric: "top-artists" })}>
                    {settings.selectedMetric === "top-artists" && <span className="icon">→</span>}
                      Top Artists
                    </button>
                  </td>
                  <td>
                    <button onClick={()=>setSettings({ ...settings, selectedPeriod: "medium_term" })}>
                    {settings.selectedPeriod === "medium_term" && <span className="icon">→</span>}
                      Last Six Months
                    </button>
                  </td>
                  <td>
                    <button onClick={()=>setSettings({ ...settings, selectedLimit: 50 })}>
                    {settings.selectedLimit === 50 && <span className="icon">→</span>}
                      Top 50
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <button onClick={()=>setSettings({ ...settings, selectedMetric: "top-genres" })}>
                    {settings.selectedMetric === "top-genres" && <span className="icon">→</span>}
                      Top Genres
                    </button>
                  </td>
                  <td>
                    <button onClick={()=>setSettings({ ...settings, selectedPeriod: "long_term" })}>
                    {settings.selectedPeriod === "long_term" && <span className="icon">→</span>}
                      Last Year
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <button className="logout-button" onClick={logout}>Logout</button>
            
          </div>
          <div>
            <footer>
              Made by JP Arriola
            </footer>
          </div>
        </div>
          )
        }
    </div>
  );

}