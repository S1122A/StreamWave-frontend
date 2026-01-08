import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Image,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Flex,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Card,
  CardBody,
  Badge,
} from "@chakra-ui/react";
import {
  FaEye,
  FaHeart,
  FaComment,
  FaPlay,
  FaSignOutAlt,
  FaUser,
  FaHome,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios";
import AuthService from "../../config/auth";
import { ENDPOINTS } from "../../config/api";

const VideoCard = ({ video, onClick }) => {
  return (
    <Card
      cursor="pointer"
      onClick={onClick}
      role="group"
      bg="rgba(18, 22, 38, 0.85)"
      borderRadius="2xl"
      border="1px solid rgba(124, 58, 237, 0.4)"
      boxShadow="0 0 18px rgba(124, 58, 237, 0.25)"
      backdropFilter="blur(10px)"
      overflow="hidden"
      transition="all .25s ease"
      _hover={{
        transform: "translateY(-6px) scale(1.01)",
        boxShadow: "0 0 28px rgba(124, 58, 237, 0.55)",
        borderColor: "purple.400",
      }}
    >
      <Box position="relative">
        <Image
          src={video.thumbnail || "/placeholder.png"}
          alt={video.title}
          height="200px"
          width="100%"
          objectFit="cover"
          onError={(e) => (e.target.src = "/placeholder.png")}
          opacity={0.9}
        />

        {/* Play Overlay */}
        <Box
          position="absolute"
          inset={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="blackAlpha.700"
          opacity={0}
          transition="opacity .25s"
          _groupHover={{ opacity: 1 }}
        >
          <Box
            bg="purple.400"
            p={3}
            borderRadius="full"
            boxShadow="0 0 20px rgba(124,58,237,.7)"
          >
            <FaPlay color="#0B0F1F" size={20} />
          </Box>
        </Box>

        {/* Badge */}
        <Badge
          position="absolute"
          top={3}
          left={3}
          bg="purple.500"
          color="white"
          borderRadius="full"
          px={3}
          py={1}
          fontWeight="semibold"
          boxShadow="0 0 10px rgba(124, 58, 237, .6)"
        >
          Liked
        </Badge>
      </Box>

      <CardBody p={5}>
        <VStack align="start" spacing={3}>
          <Heading size="sm" noOfLines={2} color="white">
            {video.title}
          </Heading>

          <Text fontSize="sm" color="gray.300" noOfLines={2}>
            {video.description || "No description available"}
          </Text>

          <HStack spacing={5} fontSize="sm" color="gray.300">
            <HStack>
              <FaEye />
              <Text>{video.views || 0}</Text>
            </HStack>
            <HStack>
              <FaHeart color="#ff4d6d" />
              <Text>{video.likes || 0}</Text>
            </HStack>
            <HStack>
              <FaComment />
              <Text>{video.comments || 0}</Text>
            </HStack>
          </HStack>

          <Text fontSize="xs" color="gray.400">
            By {video.uploadedBy?.name || "Unknown"}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

const LikedVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = "/login";
  };

  useEffect(() => {
    fetchLikedVideos();
  }, []);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(ENDPOINTS.CONSUMER.LIKED_VIDEOS);
      setVideos(res.data.videos || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load liked videos");
      toast({
        title: "Error",
        description: "Failed to load liked videos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (v) => {
    navigate(`/consumer/video/${v._id}`);
  };

  // Loading State
  if (loading) {
    return (
      <Flex minH="100vh" bg="#070B16" align="center" justify="center">
        <VStack spacing={3}>
          <Spinner size="xl" color="purple.400" />
          <Text color="gray.300">Loading your liked videos...</Text>
        </VStack>
      </Flex>
    );
  }

  // Error State
  if (error) {
    return (
      <Flex minH="100vh" bg="#070B16" align="center" justify="center">
        <VStack spacing={4}>
          <Text color="red.400" fontSize="xl">
            {error}
          </Text>
          <Button onClick={fetchLikedVideos} colorScheme="purple">
            Retry
          </Button>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bg="radial-gradient(circle at top, #151B2D, #070B16 60%)"
    >
      {/* Top Bar */}
      <Box
        bg="rgba(10, 14, 28, 0.9)"
        borderBottom="1px solid rgba(124,58,237,.4)"
        boxShadow="0 0 14px rgba(124,58,237,.3)"
        px={8}
        py={4}
        backdropFilter="blur(12px)"
      >
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="purple.300">
            StreamWave
          </Heading>

          <HStack spacing={4}>
            <Button
              leftIcon={<FaHome />}
              variant="ghost"
              color="purple.300"
              _hover={{ color: "white", bg: "purple.600" }}
              onClick={() => navigate("/consumer/home")}
            >
              Home
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

      {/* Content */}
      <Container maxW="container.xl" py={10}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading size="2xl" color="white" mb={2}>
              Your Liked Videos
            </Heading>
            <Text color="gray.400">
              All your favorite moments — in one glowing space
            </Text>
          </Box>

          {videos.length === 0 ? (
            <Alert
              status="info"
              borderRadius="2xl"
              bg="rgba(18, 22, 38, 0.8)"
              border="1px solid rgba(124,58,237,.4)"
            >
              <AlertIcon color="purple.300" />
              <VStack align="start" spacing={1}>
                <Text fontWeight="semibold" color="white">
                  No liked videos yet
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Like videos to see them appear here
                </Text>
              </VStack>
            </Alert>
          ) : (
            <>
              <Text color="gray.300" fontWeight="medium">
                {videos.length} liked video{videos.length !== 1 && "s"}
              </Text>

              <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={8}>
                {videos.map((v) => (
                  <VideoCard
                    key={v._id}
                    video={v}
                    onClick={() => handleVideoClick(v)}
                  />
                ))}
              </Grid>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default LikedVideos;
