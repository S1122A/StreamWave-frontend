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
  Container,
  Alert,
  AlertIcon,
  Radio,
  RadioGroup
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../config/auth';




const ConsumerSignupAlt = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      await AuthService.register(name, email, password, role);

      toast({
        title: 'Account Created Successfully',
        description: 'Please login with your new credentials',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed');
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
              Join StreamWave
            </Heading>

            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color="gray.200" fontWeight="medium">
                    Full Name
                  </FormLabel>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
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
                    placeholder="Create a strong password (min 8 characters)"
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
                    Confirm Password
                  </FormLabel>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
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
                    Account Type
                  </FormLabel>
                  <RadioGroup value={role} onChange={setRole}>
                    <VStack align="start" spacing={3}>
                      <Radio value="consumer" colorScheme="purple">
                        <Box>
                          <Text fontWeight="medium" color="gray.100">
                            Consumer
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            Watch, like, and comment on videos
                          </Text>
                        </Box>
                      </Radio>

                      <Radio value="creator" colorScheme="purple">
                        <Box>
                          <Text fontWeight="medium" color="gray.100">
                            Creator
                          </Text>
                          <Text fontSize="sm" color="gray.400">
                            Upload and manage your own videos
                          </Text>
                        </Box>
                      </Radio>
                    </VStack>
                  </RadioGroup>
                </FormControl>

                {error && (
                  <Alert status="error" borderRadius="lg">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  bgGradient="linear(to-r, purple.400, cyan.300)"
                  color="black"
                  width="full"
                  size="lg"
                  isLoading={loading}
                  loadingText="Creating Account..."
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                  }}
                  fontWeight="bold"
                >
                  Create Account
                </Button>
              </VStack>
            </form>

            <Text textAlign="center" color="gray.300">
              Already have an account?{' '}
              <ChakraLink
                as={Link}
                to="/login"
                color="purple.200"
                fontWeight="semibold"
                _hover={{ color: 'purple.300' }}
              >
                Login here
              </ChakraLink>
            </Text>
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default ConsumerSignupAlt;
