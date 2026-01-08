import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Flex, 
  Icon, 
  Button,
  useToast,
  Avatar,
  HStack,
  FormControl,
  Textarea,
  Spinner,
  Container,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  AspectRatio
} from '@chakra-ui/react';
import { 
  FaEye, 
  FaComment, 
  FaThumbsUp,
  FaPaperPlane,
  FaHeart,
  FaSignOutAlt,
  FaUser,
  FaHome
} from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import AuthService from '../../config/auth';
import { ENDPOINTS } from '../../config/api';

const ConsumerVideoDetails = () => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const { videoId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const token = AuthService.getToken();
        const response = await axiosInstance.get(
          ENDPOINTS.VIDEOS.DETAILS(videoId),
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setVideo(response.data);

        const currentUser = AuthService.getCurrentUser();
        setIsLiked(
          Array.isArray(response.data.likes)
            ? response.data.likes.includes(currentUser?._id)
            : false
        );

        setLoading(false);
      } catch (error) {
        setError(error.message || 'Could not fetch video details');
        toast({
          title: "Error",
          description: "Could not fetch video details",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  const handleLikeVideo = async () => {
    try {
      const token = AuthService.getToken();
      const response = await axiosInstance.post(
        ENDPOINTS.VIDEOS.LIKE(videoId),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideo(prev => ({
        ...prev,
        likes: response.data.likes,
        totalLikes: response.data.totalLikes
      }));

      setIsLiked(!isLiked);

      toast({
        title: isLiked ? "Unliked" : "Liked",
        status: "success",
        duration: 1800,
        isClosable: true
      });
    } catch {
      toast({
        title: "Error",
        description: "Could not like/unlike video",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const token = AuthService.getToken();

      await axiosInstance.post(
        ENDPOINTS.COMMENTS.ADD,
        { text: newComment, videoId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const refreshed = await axiosInstance.get(
        ENDPOINTS.VIDEOS.DETAILS(videoId),
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVideo(refreshed.data);
      setNewComment('');
    } catch {
      toast({
        title: "Error",
        description: "Could not post comment",
        status: "error"
      });
    }
  };

  if (loading)
    return (
      <Flex minH="100vh" bg="#070B16" align="center" justify="center">
        <VStack>
          <Spinner size="xl" color="purple.400" />
          <Text color="gray.300">Loading video...</Text>
        </VStack>
      </Flex>
    );

  if (error || !video)
    return (
      <Flex minH="100vh" bg="#070B16" align="center" justify="center">
        <VStack spacing={4}>
          <Text color="red.400" fontSize="xl">{error || "Video not found"}</Text>
          <Button colorScheme="purple" onClick={() => navigate('/consumer/home')}>
            Back to Home
          </Button>
        </VStack>
      </Flex>
    );

  return (
    <Box minH="100vh" bg="radial-gradient(circle at top, #151B2D, #070B16 60%)">
      {/* Top Bar */}
      <Box
        bg="rgba(10,14,28,.9)"
        borderBottom="1px solid rgba(124,58,237,.4)"
        boxShadow="0 0 14px rgba(124,58,237,.3)"
        px={8}
        py={4}
        backdropFilter="blur(12px)"
      >
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="purple.300">StreamWave</Heading>

          <HStack spacing={4}>
            <Button
              leftIcon={<FaHome />}
              variant="ghost"
              color="purple.300"
              _hover={{ bg: "purple.600", color: "white" }}
              onClick={() => navigate('/consumer/home')}
            >
              Home
            </Button>

            <Button
              leftIcon={<FaHeart />}
              variant="ghost"
              color="purple.300"
              _hover={{ bg: "purple.600", color: "white" }}
              onClick={() => navigate('/consumer/liked')}
            >
              Liked Videos
            </Button>

            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaUser />}
                variant="ghost"
                color="purple.300"
              />
              <MenuList bg="#0B1020" borderColor="purple.500">
                <MenuItem
                  icon={<FaSignOutAlt />}
                  onClick={handleLogout}
                  _hover={{ bg: "purple.600", color: "white" }}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      <Container maxW="container.xl" py={10}>
        <Flex direction={{ base: "column", lg: "row" }} gap={8}>
          
          {/* LEFT — Player & Info */}
          <Box flex={1}>
            <Box
              borderRadius="2xl"
              overflow="hidden"
              boxShadow="0 0 28px rgba(124,58,237,.4)"
              border="1px solid rgba(124,58,237,.5)"
              bg="#0B1020"
            >
              <AspectRatio ratio={16/9}>
                <video
                  src={video.video.url}
                  controls
                  poster={video.video.thumbnail}
                  style={{ width: "100%", height: "100%" }}
                />
              </AspectRatio>
            </Box>

            <Box
              mt={6}
              p={6}
              borderRadius="2xl"
              bg="rgba(18,22,38,.85)"
              border="1px solid rgba(124,58,237,.4)"
              boxShadow="0 0 18px rgba(124,58,237,.25)"
              backdropFilter="blur(10px)"
            >
              <VStack align="start" spacing={4}>
                <Heading size="lg" color="white">
                  {video.video.title}
                </Heading>

                {video.video.description && (
                  <Text color="gray.300">{video.video.description}</Text>
                )}

                <HStack spacing={6} color="gray.300">
                  <HStack><FaEye /><Text>{video.video.views || 0}</Text></HStack>
                  <HStack><FaComment /><Text>{video.comments?.length || 0}</Text></HStack>
                  <HStack><FaThumbsUp /><Text>{video.video.likes || 0}</Text></HStack>
                </HStack>

                <Divider borderColor="purple.700" />

                <Button
                  leftIcon={<FaThumbsUp />}
                  onClick={handleLikeVideo}
                  size="lg"
                  bg={isLiked ? "purple.500" : "transparent"}
                  color={isLiked ? "white" : "purple.300"}
                  border="2px solid purple"
                  _hover={{ bg: "purple.600" }}
                >
                  {isLiked ? "Liked" : "Like"}
                </Button>
              </VStack>
            </Box>
          </Box>

          {/* RIGHT — Comments */}
          <Box
            width={{ base: "100%", lg: "400px" }}
            bg="rgba(18,22,38,.85)"
            border="1px solid rgba(124,58,237,.4)"
            boxShadow="0 0 20px rgba(124,58,237,.35)"
            borderRadius="2xl"
            p={6}
            backdropFilter="blur(10px)"
            maxH="640px"
            overflowY="auto"
          >
            <Heading size="lg" color="white">
              Comments ({video.comments?.length || 0})
            </Heading>

            <FormControl mt={4}>
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                bg="#0B1020"
                color="white"
                borderColor="purple.500"
              />
              <Button
                mt={3}
                colorScheme="purple"
                leftIcon={<FaPaperPlane />}
                onClick={handleAddComment}
              >
                Post Comment
              </Button>
            </FormControl>

            <Divider my={4} borderColor="purple.700" />

            <VStack align="stretch" spacing={4}>
              {video.comments?.length ? (
                video.comments.map((c, i) => (
                  <Box
                    key={i}
                    bg="#0B1020"
                    p={4}
                    borderRadius="lg"
                    border="1px solid rgba(124,58,237,.35)"
                  >
                    <HStack spacing={3}>
                      <Avatar size="sm" name={c.user?.name} />
                      <Text color="white" fontWeight="bold">
                        {c.user?.name || "User"}
                      </Text>
                    </HStack>
                    <Text mt={2} color="gray.300">{c.text}</Text>
                  </Box>
                ))
              ) : (
                <Text color="gray.400">No comments yet</Text>
              )}
            </VStack>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default ConsumerVideoDetails;
