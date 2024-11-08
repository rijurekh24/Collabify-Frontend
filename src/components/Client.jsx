import { Box } from "@mui/material";
import React from "react";
import Avatar from "react-avatar";

const Client = ({ username }) => {
  return (
    <Box my={1}>
      <Avatar name={username} size={35} round="50%" />
      <span style={{ color: "white", marginLeft: "8px", fontSize: "18px" }}>
        {username}
      </span>
    </Box>
  );
};

export default Client;
