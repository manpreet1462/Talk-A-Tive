import React, { useState, useEffect } from 'react';
import { ChatState } from '../Context/ChatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../config/ChatLogics';
import ProfileModal from './miscellaneous/ProfileModal';
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal';
import axios from 'axios';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const { user, selectedChat, setSelectedChat, chats, setChats } = ChatState();

  // Function to send a new message
  const sendMessage = async (event) => {
    if (event.key === "Enter" && newMessage) {
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          }
        };

        const { data } = await axios.post('/api/message', {
          content: newMessage,
          chatId: selectedChat._id,
        }, config);

        // Update messages state with the new message
        setMessages([...messages, data]);
        setNewMessage(''); // Clear the input field after sending the message

        // Optionally, setFetchAgain to trigger re-fetching messages or handling updates
        setFetchAgain(!fetchAgain);
      } catch (error) {
        toast({
          title: 'Error Occurred!',
          description: 'Failed to send the Message',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'bottom',
        });
      }
    }
  };

  // Function to handle typing in the input field
  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    // Typing Indicator Logic
  };

  // Fetch messages when selectedChat or fetchAgain changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedChat) {
        try {
          setLoading(true);
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`
            }
          };
          const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
          setMessages(data);
        } catch (error) {
          toast({
            title: 'Error Occurred!',
            description: 'Failed to fetch the messages',
            status: 'error',
            duration: 5000,
            isClosable: true,
            position: 'bottom',
          });
        }
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedChat, fetchAgain, user.token, toast]);

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: '28px', md: '30px' }}
            pb={3}
            px={2}
            w={'100%'}
            fontFamily={'Work sans'}
            display={'flex'}
            justifyContent={{ base: 'space-between' }}
            alignItems={'center'}
          >
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat('')}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                  chats={chats}
                  setChats={setChats}
                />
              </>
            )}
          </Text>
          <Box
            display={'flex'}
            flexDir={'column'}
            justifyContent={'flex-end'}
            p={3}
            bg={'#E8E8E8'}
            w={'100%'}
            h={'100%'}
            borderRadius={'lg'}
            overflowY={'scroll'} // Ensure the messages are scrollable
          >
            {loading ? (
              <Spinner
                size={'xl'}
                w={20}
                h={20}
                alignSelf={'center'}
                margin={'auto'}
              />
            ) : (
              <div>
                {messages.map((message, index) => (
                  <div key={index}>
                    <Text>{message.content}</Text>
                  </div>
                ))}
              </div>
            )}
            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
              <Input
                variant={'filled'}
                bg={'#E0E0E0'}
                placeholder='Enter a message..'
                onChange={typingHandler}
                value={newMessage}
                size='md' // Ensure the input field is visible
              />
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display={'flex'} alignItems={'center'} justifyContent={'center'} height={'100%'}>
          <Text fontSize={'3xl'} pb={3} fontFamily={'Work sans'}>
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
