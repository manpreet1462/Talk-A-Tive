import { ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../userAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../userAvatar/UserListItem';

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, chats, setChats, fetchMessages }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const toast = useToast();
  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleRename = async () => {
    if (!groupChatName) {
      return;
    }
    try {
      setRenameLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        '/api/chat/rename',
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data);

      const updatedChats = chats.map((chat) =>
        chat._id === data._id ? data : chat
      );
      setChats(updatedChats);

      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
      setGroupChatName('');
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setRenameLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/user?search=${query}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: 'Failed to load the search results',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
      setLoading(false);
    }
  };

  const handleAddUser = async (user1) => {
    if (selectedChat.users.find((u) => u._id === user1._id)) {
      toast({
        title: 'User already in the group!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: 'Only admins can add someone!',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        '/api/chat/groupadd',
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );
      setSelectedChat(data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };

  const handleRemove = async (user1) => {
    if (selectedChat.groupAdmin._id !== user._id && user1._id !== user._id) {
      toast({
        title: 'Only admins can remove someone',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        '/api/chat/groupremove',
        {
          chatId: selectedChat._id,
          userId: user1._id,
        },
        config
      );

      if (user1._id === user._id) {
        setSelectedChat();
      } else {
        setSelectedChat(data);
      }

      const updatedChats = user1._id === user._id ? chats.filter(chat => chat._id !== selectedChat._id) : chats.map(chat => chat._id === data._id ? data : chat);
      setChats(updatedChats);

      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Error Occurred!',
        description: error.response.data.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton display={{ base: 'flex' }} icon={<ViewIcon />} onClick={onOpen} />

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize={'35px'} fontFamily={'Work sans'} display={'flex'} justifyContent={'center'}>
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w={'100%'} display={'flex'} flexWrap={'wrap'} pb={3}>
              {selectedChat.users.map((u) => (
                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleRemove(u)} />
              ))}
            </Box>
            <FormControl display={'flex'}>
              <Input
                placeholder='Chat Name'
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button variant={'solid'} colorScheme='teal' ml={1} isLoading={renameLoading} onClick={handleRename}>
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input placeholder='Add users to group' mb={1} onChange={(e) => handleSearch(e.target.value)} />
            </FormControl>
            {loading ? (
              <Spinner size={'lg'} />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme='red'>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
