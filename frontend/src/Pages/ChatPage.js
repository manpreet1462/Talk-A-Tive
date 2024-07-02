import { useState } from "react";
import ChatBox from "../Components/ChatBox";
import MyChats from "../Components/MyChats";
import SideDrawer from "../Components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import { Box } from '@chakra-ui/react';

const ChatPage = () => {
  const { user } = ChatState();
  const [fetchAgain, setFetchAgain] = useState(false);

  return (
    <div style={{ width: '100%' }}>
      {user && <SideDrawer />}
      <Box
        display="flex"
        justifyContent="space-between"
        w="100%"
        h="91.5vh"
        p="10px"
        mt="10px"
      >
        {user && <MyChats fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
        {user && <ChatBox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />}
      </Box>
    </div>
  );
}

export default ChatPage;
