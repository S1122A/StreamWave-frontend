import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Heading,
  Spinner,
  Button,
  useToast,
  GridItem,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  Icon,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
} from "@chakra-ui/react";
import {
  FaVideo,
  FaUsers,
  FaEye,
  FaThumbsUp,
  FaComment,
  FaSignOutAlt,
  FaChartBar,
  FaUserPlus,
  FaPlay,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../config/axios";
import { ENDPOINTS } from "../../config/api";
import VideoManagement from "./VideoManagement";
import UserManagement from "./UserManagement";
import AuthService from "../../config/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [platformStats, setPlatformStats] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [videoPagination, setVideoPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVideos: 0,
    limit: 10,
  });
  const toast = useToast();

  // Logout handler
  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  // Fetch platform statistics
  const fetchPlatformStats = async () => {
    try {
      const response = await axiosInstance.get(ENDPOINTS.AUTH.PLATFORM_STATS);
      setPlatformStats(response.data);
    } catch (error) {
      console.error("Error fetching platform stats:", error);
    }
  };

  // Fetch recent videos for overview with pagination
  const fetchRecentVideos = async (page = 1) => {
    try {
      const response = await axiosInstance.get(
        `${ENDPOINTS.VIDEOS.LIST}?limit=10&page=${page}&sortBy=createdAt&order=desc`
      );
      setRecentVideos(response.data.videos || []);
      setVideoPagination({
        currentPage: response.data.pagination?.currentPage || 1,
        totalPages: response.data.pagination?.totalPages || 1,
        totalVideos: response.data.pagination?.totalVideos || 0,
        limit: response.data.pagination?.limit || 10,
      });
    } catch (error) {
      console.error("Error fetching recent videos:", error);
    }
  };

  const handleVideoPageChange = (newPage) => {
    fetchRecentVideos(newPage);
  };

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      await Promise.all([fetchPlatformStats(), fetchRecentVideos()]);
      setLoading(false);
    };

    initializeDashboard();
  }, []);

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverviewTab();
      case "videos":
        return <VideoManagement />;
      case "users":
        return <UserManagement />;
      default:
        return renderOverviewTab();
    }
  };

  // Overview tab content
  const renderOverviewTab = () => {
    if (loading) {
      return (
        <Flex justify="center" align="center" py={20}>
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.primary" />
            <Text color="brand.text" fontSize="lg">
              Loading dashboard...
            </Text>
          </VStack>
        </Flex>
      );
    }

    return (
      <VStack spacing={8} align="stretch">
        {/* Platform Statistics */}
        <Box>
          <Heading size="md" color="brand.text" mb={6}>
            Platform Analytics
          </Heading>
          <Grid
            templateColumns={{
              base: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(6, 1fr)",
            }}
            gap={{ base: 3, md: 4, lg: 6 }}
          >
            <GridItem>
              <Stat
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="md"
                borderWidth={1}
                borderColor="gray.100"
                textAlign="center"
              >
                <StatLabel>
                  <Icon as={FaVideo} color="brand.primary" mr={2} />
                  Total Videos
                </StatLabel>
                <StatNumber color="brand.text" fontSize="2xl">
                  {platformStats?.content?.totalVideos || 0}
                </StatNumber>
              </Stat>
            </GridItem>

            <GridItem>
              <Stat
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="md"
                borderWidth={1}
                borderColor="gray.100"
                textAlign="center"
              >
                <StatLabel>
                  <Icon as={FaComment} color="blue.500" mr={2} />
                  Total Comments
                </StatLabel>
                <StatNumber color="brand.text" fontSize="2xl">
                  {platformStats?.content?.totalComments || 0}
                </StatNumber>
              </Stat>
            </GridItem>

            <GridItem>
              <Stat
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="md"
                borderWidth={1}
                borderColor="gray.100"
                textAlign="center"
              >
                <StatLabel>
                  <Icon as={FaThumbsUp} color="red.500" mr={2} />
                  Total Likes
                </StatLabel>
                <StatNumber color="brand.text" fontSize="2xl">
                  {platformStats?.content?.totalLikes || 0}
                </StatNumber>
              </Stat>
            </GridItem>

            <GridItem>
              <Stat
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="md"
                borderWidth={1}
                borderColor="gray.100"
                textAlign="center"
              >
                <StatLabel>
                  <Icon as={FaUsers} color="purple.500" mr={2} />
                  Total Users
                </StatLabel>
                <StatNumber color="brand.text" fontSize="2xl">
                  {platformStats?.users?.total || 0}
                </StatNumber>
              </Stat>
            </GridItem>

            <GridItem>
              <Stat
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="md"
                borderWidth={1}
                borderColor="gray.100"
                textAlign="center"
              >
                <StatLabel>
                  <Icon as={FaPlay} color="orange.500" mr={2} />
                  Total Creators
                </StatLabel>
                <StatNumber color="brand.text" fontSize="2xl">
                  {platformStats?.users?.creators || 0}
                </StatNumber>
              </Stat>
            </GridItem>

            <GridItem>
              <Stat
                bg="white"
                p={6}
                borderRadius="xl"
                boxShadow="md"
                borderWidth={1}
                borderColor="gray.100"
                textAlign="center"
              >
                <StatLabel>
                  <Icon as={FaUserPlus} color="green.500" mr={2} />
                  Total Consumers
                </StatLabel>
                <StatNumber color="brand.text" fontSize="2xl">
                  {platformStats?.users?.consumers || 0}
                </StatNumber>
              </Stat>
            </GridItem>
          </Grid>
        </Box>

        {/* Video Performance Details */}
        <Box
          bg="white"
          borderRadius="xl"
          boxShadow="md"
          borderWidth="1px"
          borderColor="gray.100"
          overflow="hidden"
        >
          <Box p={6} borderBottomWidth="1px" borderColor="gray.100">
            <Heading size="md" color="brand.text" fontWeight="semibold">
              Video Performance Details
            </Heading>
            <Text color="gray.600" fontSize="sm" mt={1}>
              {videoPagination.totalVideos} videos total
            </Text>
          </Box>
          {recentVideos.length > 0 ? (
            <>
              <TableContainer>
                <Table variant="simple">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th color="brand.text" fontWeight="semibold">
                        Title
                      </Th>
                      <Th color="brand.text" fontWeight="semibold">
                        Creator
                      </Th>
                      <Th color="brand.text" fontWeight="semibold">
                        Views
                      </Th>
                      <Th color="brand.text" fontWeight="semibold">
                        Likes
                      </Th>
                      <Th color="brand.text" fontWeight="semibold">
                        Comments
                      </Th>
                      <Th color="brand.text" fontWeight="semibold">
                        Upload Date
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {recentVideos.map((video) => (
                      <Tr key={video._id} _hover={{ bg: "gray.50" }}>
                        <Td fontWeight="medium" color="brand.text" maxW="200px">
                          <Text noOfLines={1}>{video.title}</Text>
                        </Td>
                        <Td>
                          <Text color="gray.600">
                            {video.uploadedBy?.name || "Unknown Creator"}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="green" variant="subtle">
                            {(video.views || 0).toLocaleString()}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme="red" variant="subtle">
                            {(video.likes || 0).toLocaleString()}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" variant="subtle">
                            {(video.comments || 0).toLocaleString()}
                          </Badge>
                        </Td>
                        <Td color="gray.600">
                          {new Date(video.createdAt).toLocaleDateString()}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {/* Pagination Controls */}
              {videoPagination.totalPages > 1 && (
                <Box p={4} borderTopWidth="1px" borderColor="gray.100">
                  <Flex justify="center" align="center" gap={4}>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleVideoPageChange(videoPagination.currentPage - 1)
                      }
                      isDisabled={videoPagination.currentPage === 1}
                      variant="outline"
                      borderColor="brand.primary"
                      color="brand.primary"
                      _hover={{ bg: "brand.primary", color: "white" }}
                    >
                      Previous
                    </Button>
                    <Text fontSize="sm" color="gray.600" px={4}>
                      Page {videoPagination.currentPage} of{" "}
                      {videoPagination.totalPages}
                    </Text>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleVideoPageChange(videoPagination.currentPage + 1)
                      }
                      isDisabled={
                        videoPagination.currentPage ===
                        videoPagination.totalPages
                      }
                      variant="outline"
                      borderColor="brand.primary"
                      color="brand.primary"
                      _hover={{ bg: "brand.primary", color: "white" }}
                    >
                      Next
                    </Button>
                  </Flex>
                </Box>
              )}
            </>
          ) : (
            <Flex align="center" justify="center" py={12}>
              <VStack spacing={3}>
                <Icon as={FaVideo} size="3xl" color="gray.300" />
                <Heading size="md" color="gray.500">
                  No videos available
                </Heading>
                <Text color="gray.400" textAlign="center">
                  Video performance data will appear here once videos are
                  uploaded
                </Text>
              </VStack>
            </Flex>
          )}
        </Box>
      </VStack>
    );
  };

  return (
    <Box minHeight="100vh" bg="gray.50">
      {/* Header */}
      <Box
        bg="white"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={8}
        py={4}
      >
        <Flex justify="space-between" align="center">
          <Heading size="lg" color="brand.primary" fontWeight="bold">
            StreamWave
          </Heading>
          <Button
            leftIcon={<FaSignOutAlt />}
            colorScheme="red"
            variant="outline"
            onClick={handleLogout}
            size="sm"
          >
            Logout
          </Button>
        </Flex>
      </Box>

      {/* Main Content */}
      <Box p={{ base: 4, md: 8 }}>
        <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Tab Navigation */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            gap={{ base: 2, sm: 4 }}
            justify="center"
            wrap="wrap"
          >
            <Button
              leftIcon={<FaChartBar />}
              onClick={() => setActiveTab("overview")}
              bg={activeTab === "overview" ? "brand.primary" : "white"}
              color={activeTab === "overview" ? "white" : "brand.primary"}
              borderWidth={1}
              borderColor="brand.primary"
              size={{ base: "sm", md: "md" }}
              _hover={{
                bg: activeTab === "overview" ? "#009A45" : "brand.50",
              }}
            >
              Overview
            </Button>
            <Button
              leftIcon={<FaVideo />}
              onClick={() => setActiveTab("videos")}
              bg={activeTab === "videos" ? "brand.primary" : "white"}
              color={activeTab === "videos" ? "white" : "brand.primary"}
              borderWidth={1}
              borderColor="brand.primary"
              size={{ base: "sm", md: "md" }}
              _hover={{
                bg: activeTab === "videos" ? "#009A45" : "brand.50",
              }}
            >
              Videos
            </Button>
            <Button
              leftIcon={<FaUsers />}
              onClick={() => setActiveTab("users")}
              bg={activeTab === "users" ? "brand.primary" : "white"}
              color={activeTab === "users" ? "white" : "brand.primary"}
              borderWidth={1}
              borderColor="brand.primary"
              size={{ base: "sm", md: "md" }}
              _hover={{
                bg: activeTab === "users" ? "#009A45" : "brand.50",
              }}
            >
              Users
            </Button>
          </Flex>

          {/* Tab Content */}
          {renderTabContent()}
        </VStack>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
