import React, { useState, useRef, useEffect } from "react";
import ACTIONS from "../Action";
import Client from "../components/Client";
import Edit from "../components/Edit";
import { initSocket } from "../socket";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Drawer,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Icon } from "@iconify/react";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();
  const [clients, setClients] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();

      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      socketRef.current.on(
        ACTIONS.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current,
            socketId,
          });
        }
      );

      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId !== socketId);
        });
      });

      socketRef.current.on("RECEIVE_MESSAGE", (message) => {
        console.log(message);
        setMessages((prevMessages) => [...prevMessages, message]);
        if (message.username !== location.state?.username) {
          if (!sidebarOpen) {
            toast.info(`New message from ${message.message.username}`);
          }
        }
      });
    };
    init();
    return () => {
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.off("RECEIVE_MESSAGE");
      socketRef.current.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (chatMessage.trim()) {
      const message = {
        username: location.state?.username,
        message: chatMessage,
      };

      socketRef.current.emit("SEND_MESSAGE", {
        roomId,
        message,
      });

      setChatMessage("");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the room id");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  const inputClicked = () => {
    const inputArea = document.getElementById("input");
    inputArea.placeholder = "Enter your input here";
    inputArea.value = "";
    inputArea.disabled = false;
    const inputLabel = document.getElementById("inputLabel");
    const outputLabel = document.getElementById("outputLabel");
    inputLabel.classList.remove("notClickedLabel");
    inputLabel.classList.add("clickedLabel");
    outputLabel.classList.remove("clickedLabel");
    outputLabel.classList.add("notClickedLabel");
  };

  const outputClicked = () => {
    const inputArea = document.getElementById("input");
    inputArea.placeholder =
      "You output will apear here, Click 'Run code' to see it";
    inputArea.value = "";
    inputArea.disabled = true;
    const inputLabel = document.getElementById("inputLabel");
    const outputLabel = document.getElementById("outputLabel");
    inputLabel.classList.remove("clickedLabel");
    inputLabel.classList.add("notClickedLabel");
    outputLabel.classList.remove("notClickedLabel");
    outputLabel.classList.add("clickedLabel");
  };

  const runCode = () => {
    const lang = document.getElementById("languageOptions").value;
    const input = document.getElementById("input").value;
    const code = codeRef.current;

    toast.loading("Running Code....");

    const encodedParams = new URLSearchParams();
    encodedParams.set("LanguageChoice", lang);
    encodedParams.set("Program", code);
    encodedParams.set("Input", input);

    const options = {
      method: "POST",
      url: "https://code-compiler.p.rapidapi.com/v2",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": "9541690c23msh7065443581cb668p124512jsn5cb8782c5339",
        "X-RapidAPI-Host": "code-compiler.p.rapidapi.com",
      },
      data: encodedParams,
    };

    axios
      .request(options)
      .then(function (response) {
        let message = response.data.Result;
        if (message === null) {
          message = response.data.Errors;
        }
        outputClicked();
        document.getElementById("input").value = message;
        toast.dismiss();
        toast.success("Code compilation complete");
      })
      .catch(function (error) {
        toast.dismiss();
        toast.error("Code compilation unsuccessful");
        document.getElementById("input").value =
          "Something went wrong, Please check your code and input.";
      });
  };

  return (
    <Box display={"flex"}>
      {/* left section */}
      <Box
        flex={1}
        height={"100vh"}
        display="flex"
        flexDirection="column"
        borderRight={"4px solid #1F2937"}
      >
        <Box px={1}>
          <Box display={"flex"} alignItems={"center"} gap={1}>
            <Icon icon="prime:users" color="#60A5FA" height={35} />
            <h3 style={{ color: "white" }}>Participants</h3>
          </Box>
          <Box className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </Box>
        </Box>

        <Box display={"flex"} flexDirection={"column"} marginTop={"auto"} p={1}>
          <Button
            sx={{
              display: "flex",
              alignItems: "center",
              color: "white",
              bgcolor: "#34D399",
              borderRadius: 5,
              fontWeight: 600,
              fontSize: "14px",
              width: "100%",
              mb: 1,
            }}
            className="btn copyBtn"
            onClick={copyRoomId}
          >
            <Icon
              icon="ant-design:copy-filled"
              height={20}
              style={{ marginRight: "8px", color: "white" }}
            />
            Copy ROOM ID
          </Button>

          <Button
            sx={{
              display: "flex",
              alignItems: "center",
              color: "white",
              bgcolor: "#EF4444",
              borderRadius: 5,
              fontWeight: 600,
              fontSize: "14px",
              width: "100%",
            }}
            className="btn leaveBtn"
            onClick={leaveRoom}
          >
            <Icon
              icon="material-symbols:logout"
              height={20}
              style={{ marginRight: "8px", color: "white" }}
            />
            Leave
          </Button>
        </Box>
      </Box>

      {/* middle section */}
      <Box flex={4} borderRight={"4px solid #1F2937"} height={"100vh"}>
        <Box
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          px={1}
          height={"60px"}
        >
          <Box display={"flex"} alignItems={"center"} gap={1}>
            <Icon icon="material-symbols:code" color="#C084FC" height={35} />
            <h2 style={{ color: "#fff", display: "inline" }}>Collabify</h2>
          </Box>
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            gap={2}
          >
            <label
              htmlFor="languageOptions"
              style={{ fontWeight: 600, fontSize: "15px", color: "white" }}
            >
              <select
                id="languageOptions"
                defaultValue="7"
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: "#fff",
                  backgroundColor: "#2e2e2e",
                  borderRadius: "20px",
                  width: "160px",
                  fontWeight: 600,
                  fontSize: "14px",
                  padding: "9px 16px ",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <option value="6">C (gcc)</option>
                <option value="7">C++ (gcc)</option>
                <option value="4">Java</option>
                <option value="5">Python</option>
                <option value="17">Javascript</option>
              </select>
            </label>

            <Button
              sx={{
                display: "flex",
                alignItems: "center",
                color: "white",
                bgcolor: "#3B82F6",
                borderRadius: 5,
                width: "160px",
                fontWeight: 600,
                fontSize: "13px",
              }}
              className="btn runBtn"
              onClick={runCode}
            >
              <Icon
                icon="ant-design:play-circle-filled"
                height={22}
                style={{ marginRight: "8px", color: "white" }}
              />
              Run Code
            </Button>
          </Box>
        </Box>

        <Edit
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />
      </Box>

      {/* right section */}
      <Box flex={2} height={"100vh"}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="stretch"
          height="100%"
          sx={{ backgroundColor: "#282A36" }}
        >
          <Box
            display="flex"
            alignItems="center"
            sx={{
              height: "60px",
            }}
          >
            <label
              id="inputLabel"
              className="clickedLabel"
              onClick={inputClicked}
              style={{
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                padding: "8px 10px",
                backgroundColor: "#4CAF50",
                textAlign: "center",
                flex: 1,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              INPUT
            </label>
            <label
              id="outputLabel"
              className="notClickedLabel"
              onClick={outputClicked}
              style={{
                flex: 1,
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                padding: "8px 10px",
                backgroundColor: "#FF5722",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              OUTPUT
            </label>
          </Box>

          <textarea
            id="input"
            placeholder="Enter your input here"
            style={{
              flex: 1,
              width: "100%",
              padding: "12px",
              backgroundColor: "#111827",
              color: "#fff",
              border: "none",
              resize: "none",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.outline = "none")}
            onBlur={(e) => (e.target.style.outline = "none")}
          />
        </Box>

        {/* <Button
          variant="contained"
          color="primary"
          onClick={toggleSidebar}
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            borderRadius: "50%",
          }}
        >
        </Button> */}
        <Icon
          onClick={toggleSidebar}
          icon="quill:chat"
          height={30}
          style={{
            marginRight: "8px",
            color: "white",
            position: "fixed",
            bottom: 20,
            right: 20,
            backgroundColor: "#0288D1 ",
            padding: "10px",
            borderRadius: "50%",
            cursor: "pointer",
          }}
        />

        {/* Sidebar (Drawer) */}
        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={toggleSidebar}
          variant="temporary"
          sx={{
            width: 300,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 400,
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#111827",
            },
          }}
        >
          <Box
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Box
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "10px",
                wordWrap: "break-word",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  className="message"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems:
                      msg.username === "currentUser"
                        ? "flex-end"
                        : "flex-start",
                    padding: "8px",
                    backgroundColor:
                      msg.username === "currentUser" ? "#0288D1" : "#444",
                    borderRadius: "12px",
                    maxWidth: "100%",
                    wordWrap: "break-word",
                    color: "white",
                    marginLeft: msg.username === "currentUser" ? "auto" : "0",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "bold",
                      color:
                        msg.username === "currentUser" ? "#fff" : "#0288D1",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    {msg.username}
                  </div>

                  <div
                    style={{
                      fontSize: "16px",
                      color: "white",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.message.message}
                  </div>
                </Box>
              ))}
            </Box>

            {/* Chat Input */}
            <Box
              style={{
                padding: "10px",
                position: "relative",
                flexShrink: 0,
              }}
            >
              <TextField
                fullWidth
                variant="standard"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                multiline
                minRows={1}
                maxRows={4}
                sx={{
                  whiteSpace: "normal",
                  wordWrap: "break-word",
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
                  disableUnderline: false,
                  style: { color: "white" },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        color="primary"
                        onClick={sendMessage}
                        disabled={!chatMessage.trim()}
                      >
                        <Icon icon="akar-icons:send" height={24} color="gray" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>
        </Drawer>
      </Box>
    </Box>
  );
};

export default EditorPage;
