import React, { useState } from 'react';
import {
  Box,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  useToast,
  Link as ChakraLink,
  Container
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../config/auth';

const LoginAlt = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await AuthService.login(email, password);

      if (!response) {
        throw new Error('Login response is undefined');
      }

      toast({
        title: 'Login Successful',
        description: `Welcome back, ${response.name || 'User'}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (response.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (response.role === 'creator') {
        navigate('/creator/dashboard');
      } else if (response.role === 'consumer') {
        navigate('/consumer/home');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid credentials',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="linear-gradient(135deg, #0f1535 0%, #1c2048 100%)"
    >
      <Container maxW="md">
        <Box
          p={10}
          borderWidth={1}
          borderRadius="2xl"
          boxShadow="2xl"
          bg="linear-gradient(165deg, #111729, #0c1222)"
          borderColor="purple.700"
        >
          <VStack spacing={8}>
            <Heading
              size="xl"
              textAlign="center"
              fontWeight="extrabold"
              bgGradient="linear(to-r, purple.300, cyan.300)"
              bgClip="text"
            >
              Welcome to StreamWave
            </Heading>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color="gray.200" fontWeight="medium">
                    Email
                  </FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    size="lg"
                    bg="#0f1530"
                    borderColor="purple.600"
                    color="white"
                    _focus={{
                      borderColor: 'purple.300',
                      boxShadow: '0 0 0 1px #a78bfa'
                    }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel color="gray.200" fontWeight="medium">
                    Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    size="lg"
                    bg="#0f1530"
                    borderColor="purple.600"
                    color="white"
                    _focus={{
                      borderColor: 'purple.300',
                      boxShadow: '0 0 0 1px #a78bfa'
                    }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  bgGradient="linear(to-r, purple.400, cyan.300)"
                  color="black"
                  width="full"
                  size="lg"
                  isLoading={loading}
                  loadingText="Logging in..."
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                  }}
                  fontWeight="bold"
                >
                  Login
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" color="gray.300">
              Don't have an account?{' '}
              <ChakraLink
                as={Link}
                to="/signup"
                color="purple.200"
                fontWeight="semibold"
                _hover={{ color: 'purple.300' }}
              >
                Sign up here
              </ChakraLink>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginAlt;
