import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography, Link } from "@mui/material";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUserName] = useState("");

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    console.log(id);
    setRoomId(id);
    toast.success("Created a new room");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("ROOM ID & USERNAME ARE REQUIRED");
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === "Enter") {
      joinRoom();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        backgroundPosition: "center",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "rgba(230, 230, 230, 0.2)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom color="black" fontWeight={700}>
          Join a Coding Room
        </Typography>

        <TextField
          fullWidth
          variant="standard"
          label="Enter Room Id"
          onChange={(e) => setRoomId(e.target.value)}
          value={roomId}
          onKeyUp={handleInputEnter}
          sx={{
            bgcolor: "backgroundColor.secondary",
            marginBottom: 2,
            "& .MuiInput-underline:before": {
              borderBottomColor: "black)",
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "black",
            },
          }}
          InputLabelProps={{
            style: { color: "#888" },
          }}
          InputProps={{
            style: { color: "black" },
            disableUnderline: false,
          }}
        />

        <TextField
          fullWidth
          variant="standard"
          label="Enter Username"
          onChange={(e) => setUserName(e.target.value)}
          value={username}
          onKeyUp={handleInputEnter}
          sx={{
            marginBottom: 2,
            bgcolor: "backgroundColor.secondary",
            "& .MuiInput-underline:before": {
              borderBottomColor: "black)",
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "black",
            },
          }}
          InputLabelProps={{
            style: { color: "#888" },
          }}
          InputProps={{
            style: { color: "black" },
            disableUnderline: false,
          }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            variant="contained"
            onClick={joinRoom}
            fullWidth
            sx={{ padding: 1.5, bgcolor: "black", borderRadius: "10px", mb: 2 }}
          >
            Join Room
          </Button>

          <Typography variant="body1" align="center" color="#333">
            Dont't have an invite? create your&nbsp;
            <Link
              href=""
              onClick={createNewRoom}
              sx={{
                cursor: "pointer",
                textDecoration: "none",
                color: "black",
                fontWeight: 600,
              }}
            >
              New Room
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
