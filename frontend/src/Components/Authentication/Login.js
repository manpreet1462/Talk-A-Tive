import { Button, FormControl, FormLabel, Input, InputRightElement, InputGroup, VStack, HStack, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
const Login = () => {
    let [show, setShow] = useState(false)
    let [email, setEmail] = useState()
    let [password, setPassword] = useState()
    let [loading, setLoading] = useState(false)
    const toast=useToast()
    const history=useHistory();
    const handleClick = () => { setShow(!show) }
    const submitHandler = async() => {
            setLoading(true);
            if(!email || !password){
                toast({
                    title:"Kindly fill all the Fields",
                    status: "warning",
                    duration: 5000,
                    isClosable:true,
                    position:"bottom"
                  })
                  setLoading(false);
                  return;
            }
            try {
                const config={
                    headers:{
                        "Content-type":"application/json"
                    }
                };
                const {data}=await axios.post(
                    "/api/user/login",
                    {email,password},
                    config
                );
                toast({
                    title:"Login Successful",
                    status: "success",
                    duration: 5000,
                    isClosable:true,
                    position:"bottom"
                  });
                  localStorage.setItem("userInfo",JSON.stringify(data));
                  setLoading(false);
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
        <VStack spacing='5px' color="black">
            <FormControl id='email' isRequired>
                <FormLabel>Email</FormLabel>
                <Input placeholder='Enter Your Email' value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl id='password' isRequired>
                <FormLabel>Password</FormLabel>
                <InputGroup size='md'>
                    <Input placeholder='Enter Your Password' value={password} type={show ? "text" : 'password'} onChange={(e) => setPassword(e.target.value)} />
                    <InputRightElement width="4.5rem">
                        <HStack>
                            <Button h="1.75rem" size="sm" onClick={handleClick}>{show ? "Hide" : "Show"}</Button>
                        </HStack>
                    </InputRightElement>
                </InputGroup>
            </FormControl>

            <Button colorScheme='blue' width="100%" style={{ marginTop: 15 }} onClick={submitHandler} isLoading={loading}>Login</Button>
            <Button variant="solid"
                colorScheme='red'
                width="100%"
                onClick={() => {
                    setEmail("guest@gmail.com");
                    setPassword("123456");
                }}>Get User Credentials</Button>


        </VStack>
    )
}

export default Login
