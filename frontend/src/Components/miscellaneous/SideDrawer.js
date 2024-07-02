import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/hooks';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import React, { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../userAvatar/UserListItem';

const SideDrawer = () => {
  const { selectedChat, setSelectedChat, chats, setChats } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const { user } = ChatState();
  const history = useHistory();
  const toast = useToast();

  const logoutHandler = () => {
    localStorage.removeItem('userInfo');
    history.push('/');
  };

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left"
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      };
      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to Load the search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      });
      setLoading(false);
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`
        }
      };
      const { data } = await axios.post('/api/chat', { userId }, config);
      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      toast({
        title: "Error Fetching the Chat!",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left"
      });
      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} bg={'white'} w={'100%'} padding={'5px 10px 5px 10px'} borderWidth={'5px'}>
        <Tooltip label="Search user to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fa-solid fa-magnifying-glass" style={{ color: "black" }}></i>
            <Text display={{ base: 'none', md: 'flex' }} px="4">Search User</Text>
          </Button>
        </Tooltip>
        <Text fontSize={'2xl'} fontFamily={'Work sans'}>Talk-A-Tive</Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon fontSize={'2xl'} m={1} />
            </MenuButton>
            {/* <MenuList></MenuList> */}
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size={'sm'} cursor={'pointer'} name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth={'1px'}>Search users</DrawerHeader>
          <DrawerBody>
            <Box display={'flex'} pb={2}>
              <Input
                placeholder='Search by name or email'
                mr={2}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map(user => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {!loading && searchResult.length === 0 && (
              <Text>No users found</Text>
            )}
            {loadingChat && <Spinner ml='auto' display={'flex'} />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
