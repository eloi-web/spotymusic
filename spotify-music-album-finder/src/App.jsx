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
        setAccessToken(data.access_token);
      });
  }, []);

  async function search() {
    let artistParams = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + accessToken,
      },
    };

    // Get Artist
    const artistID = await fetch(
      "https://api.spotify.com/v1/search?q=" + searchInput + "&type=artist",
      artistParams
    )
      .then((result) => result.json())
      .then((data) => {
        return data.artists.items[0].id;
      });

    // Get Artist Albums
    await fetch(
      "https://api.spotify.com/v1/artists/" +
      artistID +
      "/albums?include_groups=album&market=US&limit=50",
      artistParams
    )
      .then((result) => result.json())
      .then((data) => {
        setAlbums(data.items);
      });
  }

  return (
    <>
      <Container>
        <InputGroup>
          <FormControl
            placeholder="Search For an Artist or Album"
            type="input"
            aria-label="Search for an Artist"
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                search();
              }
            }}
            onChange={(event) => setSearchInput(event.target.value)}
            style={{
              fontFamily: "Poppins, sans-serif",
              width: "300px",
              height: "40px",
              borderWidth: "0px",
              borderStyle: "solid",
              borderRadius: "30px",
              marginRight: "10px",
              paddingLeft: "10px",
            }}
          />
          <Button onClick={search}>Search</Button>
        </InputGroup>
      </Container>

      <Container>
        <Row
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "20px", // spacing between cards
            padding: "20px",
          }}
        >
          {albums.map((album) => {
            return (
              <Card key={album.id} className="card" style={{
                position: "relative",
                width: "220px",
                height: "220px",
                borderRadius: "20px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.3s ease",
              }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <Card.Img
                  src={album.images[0].url}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                <div className="card-overlay">
                  <h3 style={{ fontFamily: "montserrat, sans-serif", fontWeight: "600", fontSize: "16px", marginBottom: "10px" }}>
                    {album.name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#b3b3b3", marginBottom: "15px" }}>
                    {album.release_date}
                  </p>
                  <Button
                    href={album.external_urls.spotify}
                    style={{
                      fontFamily: "montserrat, sans-serif",
                      background: "linear-gradient(135deg, #1DB954 0%, #1ed760 100%)",
                      color: "black",
                      fontWeight: "bold",
                      fontSize: "14px",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      border: "none",
                    }}
                  >
                    Listen 🎧
                  </Button>
                </div>
              </Card>



            );
          })}
        </Row>
      </Container>
    </>
  );
}

export default App;
