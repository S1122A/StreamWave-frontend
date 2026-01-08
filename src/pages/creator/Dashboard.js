import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Image,
} from "@chakra-ui/react";
import { FaPlus, FaEye, FaHeart, FaComment, FaVideo } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../config/axios";
import { ENDPOINTS } from "../../config/api";

const CreatorDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [uploadForm, setUploadForm] = useState({
    title: "",
    description: "",
    genre: "General",
    metadata: "",
    videoFile: null,
    thumbnailFile: null,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentVideos();
  }, []);

  useEffect(() => {
    return () => thumbnailPreview && URL.revokeObjectURL(thumbnailPreview);
  }, [thumbnailPreview]);

  const fetchDashboardData = async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.CREATOR.DASHBOARD_STATS);
      setDashboardStats(res.data);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        status: "error",
      });
    }
  };

  const fetchRecentVideos = async () => {
    try {
      const res = await axiosInstance.get(
        `${ENDPOINTS.CREATOR.VIDEOS}?page=1&limit=5`
      );
      setRecentVideos(res.data.videos);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.videoFile) {
      toast({
        title: "Error",
        description: "Title and video file are required",
        status: "error",
      });
      return;
    }

    const formData = new FormData();
    Object.entries(uploadForm).forEach(([k, v]) => v && formData.append(k === "videoFile" ? "video" : k === "thumbnailFile" ? "thumbnail" : k, v));

    try {
      setUploading(true);
      await axiosInstance.post(ENDPOINTS.CREATOR.VIDEOS, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) =>
          setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });

      toast({ title: "Uploaded", description: "Video uploaded successfully", status: "success" });

      setUploadForm({
        title: "",
        description: "",
        genre: "General",
        metadata: "",
        videoFile: null,
        thumbnailFile: null,
      });
      setThumbnailPreview(null);
      setUploadProgress(0);
      onClose();
      fetchDashboardData();
      fetchRecentVideos();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err.response?.data?.details || "Something went wrong",
        status: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const genres = [
    "Action","Comedy","Drama","Horror","Romance","Sci-Fi","Documentary",
    "Music","Sports","Gaming","Education","General",
  ];

  if (loading && !dashboardStats) {
    return (
      <Flex minH="100vh" bg="gray.950">
        <Sidebar />
        <Box flex="1">
          <Flex align="center" justify="center" h="70vh">
            <Spinner size="xl" color="#00FFA3" />
          </Flex>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh"
      bg="linear-gradient(135deg,#05060A 0%,#0B1220 40%,#111B2E 100%)"
    >
      <Sidebar />

      <Box flex="1" px={8} py={6}>
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">

            {/* HEADER */}
            <Flex justify="space-between" align="center">
              <Box>
                <Heading
                  size="lg"
                  bgGradient="linear(to-r,#00FFA3,#00C2FF)"
                  bgClip="text"
                >
                  StreamWave Creator Dashboard
                </Heading>
                <Text color="gray.400">
                  Control your content — track performance in real-time
                </Text>
              </Box>

              <Button
                leftIcon={<FaPlus />}
                bg="#00FFA3"
                color="black"
                _hover={{ bg: "#00FFC8" }}
                size="lg"
                onClick={onOpen}
              >
                Upload Video
              </Button>
            </Flex>

            {/* STATS */}
            {dashboardStats && (
              <Grid templateColumns="repeat(auto-fit,minmax(220px,1fr))" gap={6}>
                {[
                  {
                    label: "Total Videos",
                    value: dashboardStats.overview.totalVideos,
                    icon: <FaVideo />,
                  },
                  {
                    label: "Total Views",
                    value: dashboardStats.overview.totalViews.toLocaleString(),
                    icon: <FaEye />,
                  },
                  {
                    label: "Total Likes",
                    value: dashboardStats.overview.totalLikes.toLocaleString(),
                    icon: <FaHeart />,
                  },
                  {
                    label: "Total Comments",
                    value: dashboardStats.overview.totalComments.toLocaleString(),
                    icon: <FaComment />,
                  },
                ].map((s, i) => (
                  <Card
                    key={i}
                    bg="blackAlpha.900"
                    border="1px solid rgba(0,255,163,.25)"
                    boxShadow="0 0 18px rgba(0,255,163,.15)"
                  >
                    <CardBody>
                      <Stat>
                        <StatLabel color="gray.400">{s.label}</StatLabel>
                        <StatNumber color="#00FFA3">{s.value}</StatNumber>
                        <StatHelpText color="gray.500">{s.icon} Live stats</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            )}

            {/* RECENT VIDEOS */}
            <Card bg="blackAlpha.900" border="1px solid rgba(0,255,163,.2)">
              <CardHeader>
                <Heading size="md" color="#00C2FF">
                  My Recent Videos
                </Heading>
              </CardHeader>

              <CardBody>
                {loading ? (
                  <Flex justify="center" py={6}>
                    <Spinner color="#00FFA3" />
                  </Flex>
                ) : recentVideos.length === 0 ? (
                  <Alert status="info" bg="blackAlpha.700" color="white">
                    <AlertIcon />
                    No videos yet — upload your first one!
                  </Alert>
                ) : (
                  <Table color="gray.200">
                    <Thead>
                      <Tr>
                        <Th>Video</Th>
                        <Th>Views</Th>
                        <Th>Likes</Th>
                        <Th>Comments</Th>
                        <Th>Created</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {recentVideos.map((v) => (
                        <Tr key={v._id}>
                          <Td>
                            <HStack>
                              <Image
                                src={v.thumbnail || "/placeholder.png"}
                                boxSize="60px"
                                borderRadius="md"
                                objectFit="cover"
                              />
                              <Box>
                                <Text fontWeight="bold" color="white">
                                  {v.title}
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                  {v.description || "No description"}
                                </Text>
                              </Box>
                            </HStack>
                          </Td>
                          <Td>{v.views || 0}</Td>
                          <Td>{v.likes || 0}</Td>
                          <Td>{v.comments || 0}</Td>
                          <Td>
                            {new Date(v.createdAt).toLocaleDateString()}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Container>

        {/* UPLOAD MODAL */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent bg="gray.900" color="white">
            <ModalHeader>Upload New Video</ModalHeader>
            <ModalCloseButton />

            <ModalBody pb={6}>
              <form onSubmit={handleUpload}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      bg="gray.800"
                      value={uploadForm.title}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, title: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      bg="gray.800"
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, description: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      bg="gray.800"
                      value={uploadForm.genre}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, genre: e.target.value })
                      }
                    >
                      {genres.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Video File</FormLabel>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, videoFile: e.target.files[0] })
                      }
                    />
                  </FormControl>

                  {uploading && (
                    <Box w="100%">
                      <Text fontSize="sm">Uploading… {uploadProgress}%</Text>
                      <Box bg="gray.700" borderRadius="md">
                        <Box
                          bg="#00FFA3"
                          h="8px"
                          w={`${uploadProgress}%`}
                        />
                      </Box>
                    </Box>
                  )}

                  <HStack justify="flex-end" w="100%">
                    <Button onClick={onClose}>Cancel</Button>
                    <Button
                      type="submit"
                      bg="#00FFA3"
                      color="black"
                      _hover={{ bg: "#00FFC8" }}
                      isLoading={uploading}
                    >
                      Upload
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  );
};

export default CreatorDashboard;
