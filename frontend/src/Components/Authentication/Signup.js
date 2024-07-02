import {
  Button,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  useToast,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min';

const Signup = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pic, setPic] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const history=useHistory();

  const handleClick = () => setShow(!show);

  const postDetails = (pics) => {
    setLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please select an image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
      return;
    }


    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "TALK-A-TIVE");
      data.append("cloud_name", "ddjb3ecc2");

      fetch("https://api.cloudinary.com/v1_1/ddjb3ecc2/image/upload", {
        method: 'post',
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            throw new Error(data.error.message);
          }
          setPic(data.url.toString());
          console.log("Image URL:", data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.error("Image upload error:", err);
          toast({
            title: "Image upload failed",
            description: err.message,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "bottom",
          });
          setLoading(false);
        });

    } else {
      toast({
        title: "Please select a valid image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };
  const submitHandler= async()=>{
    setLoading(true);
    if(!name || !email || !password || !confirmPassword){
      toast({
        title:"Please fill all the fields",
        status: "warning",
        duration: 5000,
        isClosable:true,
        position:"bottom"
      })  
      setLoading(false);
      return;
    }
    if(password !== confirmPassword){
      toast({
        title:"Passwords do not match",
        status: "warning",
        duration: 5000,
        isClosable:true,
        position:"bottom"
      })
      return;
    }
    try {
      const config={
        headers:{
          "Content-type":"application/json",
        },
      };
      const {data}=await axios.post("/api/user",{name,email,password,pic},config);
      toast({
        title:"Registration is Successful",
        status: "success",
        duration: 5000,
        isClosable:true,
        position:"bottom"
      });
      localStorage.setItem('userInfo',JSON.stringify(data))
      setLoading(false)
      history.push("/chats")
    } catch (error) {
      toast({
        title:"Error Occured!",
        description:error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable:true,
        position:"bottom"
      })
      setLoading(false);

      
    }

  }

  return (
    <VStack spacing="5px" color="black">
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input placeholder="Enter Your Name" onChange={(e) => setName(e.target.value)} />
      </FormControl>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input id='unique' placeholder="Enter Your Email" onChange={(e) => setEmail(e.target.value)} />
      </FormControl>
      <FormControl id="password" isRequired>
        <InputGroup size="md">
          <FormLabel>Password</FormLabel>
          <Input
            id='unique1'
            placeholder="Enter Your Password"
            type={show ? "text" : "password"}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="confirm-password" isRequired>
        <InputGroup size="md">
          <FormLabel>Confirm Password</FormLabel>
          <Input
            placeholder="Confirm Password"
            type={show ? "text" : "password"}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel>Upload your Picture</FormLabel>
        <Input type="file" p={1.5} accept="image/*" onChange={(e) => postDetails(e.target.files[0])} />
      </FormControl>
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default Signup;
