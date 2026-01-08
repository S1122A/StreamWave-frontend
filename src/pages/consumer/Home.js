import React, { useState, useEffect } from 'react';
import { 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Image, 
  Flex, 
  Icon, 
  Grid, 
  GridItem,
  Button,
  useToast,
  HStack,
  Select,
  Spinner,
  Container,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton
} from '@chakra-ui/react';
import { 
  FaEye, 
  FaComment, 
  FaVideo,
  FaHeart,
  FaSignOutAlt,
  FaUser
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axios';
import AuthService from '../../config/auth';
import { ENDPOINTS } from '../../config/api';

const VideoCard = ({ video, onClick }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="2xl"
      overflow="hidden"
      bg="linear-gradient(165deg, #0f1530, #0b1224)"
      borderColor="purple.700"
      boxShadow="xl"
      transition="all .3s ease"
      _hover={{
        transform: 'translateY(-6px)',
        boxShadow: '2xl',
        borderColor: 'cyan.300',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      {/* Thumbnail */}
      <Box position="relative">
        <Image
          src={video.thumbnail}
          alt={video.title}
          objectFit="cover"
          width="full"
          height="200px"
          fallbackSrc="/placeholder.png"
          onError={(e) => (e.target.src = '/placeholder.png')}
        />

        <Box
          position="absolute"
          top={2}
          right={2}
          bg="blackAlpha.700"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="sm"
        >
          <Icon as={FaVideo} />
        </Box>
      </Box>

      {/* Details */}
      <Box p={5}>
        <Heading
          size="md"
          mb={3}
          noOfLines={2}
          color="purple.200"
          fontWeight="semibold"
        >
          {video.title}
        </Heading>

        {/* Stats */}
        <HStack spacing={6} justifyContent="space-between">
          <VStack spacing={1} align="start">
            <HStack spacing={1}>
              <Icon as={FaEye} color="cyan.300" />
              <Text fontSize="sm" color="gray.300">
                {video.views || 0}
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.400">Views</Text>
          </VStack>

          <VStack spacing={1} align="start">
            <HStack spacing={1}>
              <Icon as={FaComment} color="cyan.300" />
              <Text fontSize="sm" color="gray.300">
                {video.comments?.length || 0}
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.400">Comments</Text>
          </VStack>

          <VStack spacing={1} align="start">
            <HStack spacing={1}>
              <Icon as={FaHeart} color="pink.400" />
              <Text fontSize="sm" color="gray.300">
                {video.likes || 0}
              </Text>
            </HStack>
            <Text fontSize="xs" color="gray.400">Likes</Text>
          </VStack>
        </HStack>

        <Text fontSize="xs" color="gray.500" mt={3}>
          {video.createdAt
            ? new Date(video.createdAt).toLocaleDateString()
            : 'Unknown Date'}
        </Text>
      </Box>
    </Box>
  );
};

const ConsumerHome = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVideos: 0,
    limit: 20
  });
  const [filters, setFilters] = useState({
    genre: '',
    search: ''
  });

  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/login';
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(ENDPOINTS.VIDEOS.LIST, {
        params: {
          page: pagination.currentPage,
          limit: filters.limit,
          sortBy: filters.sortBy,
          order: filters.order
        }
      });

      setVideos(response.data.videos);
      setPagination({
        currentPage: response.data.pagination?.currentPage || 1,
        totalPages: response.data.pagination?.totalPages || 1,
        totalVideos: response.data.pagination?.totalVideos || 0
      });
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch videos');
      setLoading(false);
      toast({
        title: 'Error',
        description: error,
        status: 'error',
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(newPage, prev.totalPages))
    }));
  };

  const handleSortChange = (e) => {
    const [sortBy, order] = e.target.value.split('|');
    setFilters(prev => ({
      ...prev,
      sortBy,
      order,
      page: 1
    }));
  };

  const handleLimitChange = (e) => {
    setFilters(prev => ({
      ...prev,
      limit: parseInt(e.target.value),
      page: 1
    }));
  };

  useEffect(() => {
    fetchVideos();
  }, [pagination.currentPage, filters]);

  const handleVideoClick = (videoId) => {
    navigate(`/consumer/video/${videoId}`);
  };

  if (loading) {
    return (
      <Box minH="100vh" bg="#0b1028">
        <Flex justify="center" align="center" height="100vh">
          <Spinner size="xl" color="purple.300" />
        </Flex>
      </Box>
    );
  }

  if (error) {
    return (
      <Box minH="100vh" bg="#0b1028">
        <Flex justify="center" align="center" height="100vh">
          <VStack>
            <Text color="red.400" fontSize="xl">Error: {error}</Text>
            <Button onClick={fetchVideos} colorScheme="purple">
              Retry
            </Button>
          </VStack>
        </Flex>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #0b1028 0%, #111735 100%)">
      {/* Top Bar */}
      <Box
        bg="#0f1530"
        boxShadow="lg"
        px={8}
        py={4}
        borderBottom="1px solid"
        borderColor="purple.700"
      >
        <Flex justify="space-between" align="center">
          <Heading
            size="lg"
            fontWeight="extrabold"
            bgGradient="linear(to-r, purple.300, cyan.300)"
            bgClip="text"
          >
            StreamWave
          </Heading>

          <HStack spacing={4}>
            <Button
              leftIcon={<FaHeart />}
              variant="outline"
              borderColor="purple.400"
              color="purple.200"
              _hover={{ bg: 'purple.500', color: 'white' }}
              onClick={() => navigate('/consumer/liked')}
            >
              Liked Videos
            </Button>

            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FaUser />}
                variant="outline"
                borderColor="purple.400"
                color="purple.200"
              />
              <MenuList bg="#0f1530" borderColor="purple.600">
                <MenuItem
                  icon={<FaSignOutAlt />}
                  onClick={handleLogout}
                  bg="transparent"
                  _hover={{ bg: 'purple.700', color: 'white' }}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="2xl" color="purple.200" mb={2} fontWeight="bold">
              Discover Videos
            </Heading>
            <Text color="gray.400" fontSize="lg">
              Explore trending content from creators worldwide
            </Text>
          </Box>

          {/* Filters */}
          <Flex
            direction={{ base: 'column', md: 'row' }}
            gap={4}
            bg="#0f1530"
            p={6}
            borderRadius="2xl"
            borderWidth="1px"
            borderColor="purple.700"
          >
            <HStack spacing={4} flex={1}>
              <Select
                placeholder="Sort By"
                maxW="200px"
                onChange={handleSortChange}
                bg="#0b1224"
                borderColor="purple.600"
                color="white"
              >
                <option value="createdAt|desc">Most Recent</option>
                <option value="createdAt|asc">Oldest First</option>
                <option value="views|desc">Most Viewed</option>
              </Select>

              <Select
                placeholder="Videos per Page"
                maxW="150px"
                onChange={handleLimitChange}
                value={filters.limit}
                bg="#0b1224"
                borderColor="purple.600"
                color="white"
              >
                <option value={20}>20 Videos</option>
                <option value={50}>50 Videos</option>
              </Select>
            </HStack>

            <Text color="gray.300" fontSize="sm">
              {pagination.totalVideos} videos found
            </Text>
          </Flex>

          {/* Grid */}
          <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={8}>
            {videos.map(video => (
              <GridItem key={video._id}>
                <VideoCard
                  video={video}
                  onClick={() => handleVideoClick(video._id)}
                />
              </GridItem>
            ))}
          </Grid>

          {/* Empty State */}
          {videos.length === 0 && (
            <Flex direction="column" align="center" py={20}>
              <Icon as={FaVideo} color="gray.500" boxSize={12} mb={4} />
              <Heading size="lg" color="gray.400">
                No videos found
              </Heading>
              <Text color="gray.500">
                Check back later for new content
              </Text>
            </Flex>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default ConsumerHome;
