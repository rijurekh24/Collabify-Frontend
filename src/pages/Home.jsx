import React, { useState } from "react";
import { v4 as uuidV4 } from "uuid";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button, TextField, Box, Typography, Link } from "@mui/material";
import { Icon } from "@iconify/react";

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
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          textAlign={"center"}
          gap={1}
        >
          <Icon icon="ic:outline-code" height={"45"} color="#C084FC"></Icon>
          <Typography
            color="white"
            sx={{
              fontSize: "30px",
              fontWeight: 600,
            }}
          >
            Collabify
          </Typography>
        </Box>
        <Typography
          sx={{ color: "#aaa", letterSpacing: "2px", wordSpacing: "3px" }}
        >
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
            bgcolor: "",
            marginBottom: 2,
            "& .MuiInputBase-input": {
              color: "white",
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "gray",
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "white",
            },
            "& .MuiInput-underline:hover:before": {
              borderBottomColor: "white",
            },
            "& .MuiInput-underline:hover:after": {
              borderBottomColor: "white",
            },
          }}
          InputLabelProps={{
            style: { color: "#888" },
          }}
          InputProps={{
            style: { color: "white" },
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
            "& .MuiInputBase-input": {
              color: "white",
            },
            "& .MuiInput-underline:before": {
              borderBottomColor: "gray",
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "white",
            },
            "& .MuiInput-underline:hover:before": {
              borderBottomColor: "white",
            },
            "& .MuiInput-underline:hover:after": {
              borderBottomColor: "white",
            },
          }}
          InputLabelProps={{
            style: { color: "#888" },
          }}
          InputProps={{
            style: { color: "white" },
            disableUnderline: false,
          }}
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            variant="contained"
            onClick={joinRoom}
            fullWidth
            sx={{
              padding: 1.5,
              bgcolor: "#dabcff",
              borderRadius: "10px",
              mb: 2,
              color: "black",
            }}
          >
            Join Room
          </Button>

          <Typography variant="body1" align="center" color="#ccc">
            Dont't have an invite? create your&nbsp;
            <Link
              href=""
              onClick={createNewRoom}
              sx={{
                cursor: "pointer",
                textDecoration: "none",
                color: "#34D399",
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
