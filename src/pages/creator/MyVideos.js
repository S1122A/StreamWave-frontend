import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  InputGroup,
  InputRightElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  FaPlus,
  FaEye,
  FaHeart,
  FaComment,
  FaEdit,
  FaTrash,
  FaChartLine,
  FaEllipsisV,
  FaSearch,
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import axiosInstance from "../../config/axios";
import { ENDPOINTS } from "../../config/api";

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoAnalytics, setVideoAnalytics] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [videoToDelete, setVideoToDelete] = useState(null);
  const {
    isOpen: isDeleteDialogOpen,
    onOpen: onDeleteDialogOpen,
    onClose: onDeleteDialogClose,
  } = useDisclosure();
  const cancelRef = React.useRef();

  const {
    isOpen: isUploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();
  const {
    isOpen: isAnalyticsOpen,
    onOpen: onAnalyticsOpen,
    onClose: onAnalyticsClose,
  } = useDisclosure();

  const toast = useToast();

  // Form states
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

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    genre: "General",
    metadata: "",
  });

  useEffect(() => {
    fetchVideos();
  }, [currentPage, selectedGenre]);

  // Cleanup thumbnail preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage);
      queryParams.append("limit", 10);

      // Add search term
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      // Add genre filter
      if (selectedGenre) {
        queryParams.append("genre", selectedGenre);
      }

      const response = await axiosInstance.get(
        `${ENDPOINTS.CREATOR.VIDEOS}?${queryParams.toString()}`
      );
      setVideos(response.data.videos);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast({
        title: "Error",
        description: "Failed to load videos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
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
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // File size validation
    const maxVideoSize = 10 * 1024 * 1024; // 10MB
    const maxThumbnailSize = 5 * 1024 * 1024; // 5MB

    if (uploadForm.videoFile.size > maxVideoSize) {
      toast({
        title: "Error",
        description: "Video file size must be less than 10MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (
      uploadForm.thumbnailFile &&
      uploadForm.thumbnailFile.size > maxThumbnailSize
    ) {
      toast({
        title: "Error",
        description: "Thumbnail file size must be less than 5MB",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", uploadForm.title);
    formData.append("description", uploadForm.description);
    formData.append("genre", uploadForm.genre);
    formData.append("metadata", uploadForm.metadata);
    formData.append("video", uploadForm.videoFile);
    if (uploadForm.thumbnailFile) {
      formData.append("thumbnail", uploadForm.thumbnailFile);
    }

    try {
      await axiosInstance.post(ENDPOINTS.CREATOR.VIDEOS, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      toast({
        title: "Success",
        description: "Video uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onUploadClose();
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
      fetchVideos();
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error",
        description: error.response?.data?.details || "Failed to upload video",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(
        `${ENDPOINTS.CREATOR.VIDEOS}/${selectedVideo._id}`,
        editForm
      );

      toast({
        title: "Success",
        description: "Video updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onEditClose();
      fetchVideos();
    } catch (error) {
      console.error("Error updating video:", error);
      toast({
        title: "Error",
        description: error.response?.data?.details || "Failed to update video",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async () => {
    if (!videoToDelete) return;

    try {
      await axiosInstance.delete(
        `${ENDPOINTS.CREATOR.VIDEOS}/${videoToDelete}`
      );
      toast({
        title: "Success",
        description: "Video deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchVideos();
      onDeleteDialogClose();
      setVideoToDelete(null);
    } catch (error) {
      console.error("Error deleting video:", error);
      toast({
        title: "Error",
        description: error.response?.data?.details || "Failed to delete video",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const openEditModal = (video) => {
    setSelectedVideo(video);
    setEditForm({
      title: video.title,
      description: video.description || "",
      genre: video.genre || "General",
      metadata: video.metadata || "",
    });
    onEditOpen();
  };

  const openAnalyticsModal = async (video) => {
    setSelectedVideo(video);
    try {
      const response = await axiosInstance.get(
        `${ENDPOINTS.CREATOR.VIDEOS}/${video._id}/analytics`
      );
      setVideoAnalytics(response.data);
      onAnalyticsOpen();
    } catch (error) {
      console.error("Error fetching video analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load video analytics",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchVideos();
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleGenreChange = (event) => {
    setSelectedGenre(event.target.value);
    setCurrentPage(1);
  };

  const genres = [
    "Action",
    "Comedy",
    "Drama",
    "Horror",
    "Romance",
    "Sci-Fi",
    "Documentary",
    "Music",
    "Sports",
    "Gaming",
    "Education",
    "General",
  ];

  if (loading && videos.length === 0) {
    return (
      <Flex minHeight="100vh" bg="gray.50">
        <Sidebar />
        <Box flex="1" p={8}>
          <Flex justify="center" align="center" height="50vh">
            <Spinner size="xl" color="brand.primary" />
          </Flex>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex minHeight="100vh" bg="gray.50">
      <Sidebar />
      <Box flex="1" p={8}>
        <Container maxW="7xl">
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="lg" color="brand.text" mb={2}>
                  My Videos
                </Heading>
                <Text color="gray.600">
                  Manage and track your video content
                </Text>
              </Box>
              <Button
                leftIcon={<FaPlus />}
                colorScheme="green"
                bg="brand.primary"
                onClick={onUploadOpen}
                size="lg"
              >
                Upload Video
              </Button>
            </Flex>

            {/* Search and Filter Bar */}
            <Card>
              <CardBody>
                <HStack spacing={4}>
                  <InputGroup flex={1}>
                    <Input
                      placeholder="Search videos by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      size="lg"
                    />
                    <InputRightElement width="4.5rem" height="100%">
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={handleSearch}
                        bg="brand.primary"
                        color="white"
                        _hover={{ bg: "#009A45" }}
                      >
                        <FaSearch />
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormControl maxW="200px">
                    <Select
                      placeholder="All Genres"
                      value={selectedGenre}
                      onChange={handleGenreChange}
                      size="lg"
                    >
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </HStack>
              </CardBody>
            </Card>

            {/* Videos Table */}
            <Card>
              <CardHeader>
                <Heading size="md" color="brand.text">
                  Video Management
                </Heading>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <Flex justify="center" py={8}>
                    <Spinner color="brand.primary" />
                  </Flex>
                ) : videos.length === 0 ? (
                  <Alert status="info">
                    <AlertIcon />
                    {searchTerm
                      ? "No videos found matching your search."
                      : 'No videos uploaded yet. Click "Upload Video" to get started!'}
                  </Alert>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Video</Th>
                        <Th>Genre</Th>
                        <Th>Views</Th>
                        <Th>Likes</Th>
                        <Th>Comments</Th>
                        <Th>Created</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {videos.map((video) => (
                        <Tr key={video._id}>
                          <Td>
                            <HStack>
                              <Image
                                src={video.thumbnail || "/placeholder.png"}
                                alt={video.title}
                                boxSize="60px"
                                objectFit="cover"
                                fallbackSrc="/placeholder.png"
                                onError={(e) => {
                                  e.target.src = "/placeholder.png";
                                }}
                                borderRadius="md"
                              />
                              <Box>
                                <Text fontWeight="semibold" noOfLines={1}>
                                  {video.title}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color="gray.500"
                                  noOfLines={1}
                                >
                                  {video.description || "No description"}
                                </Text>
                              </Box>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme="blue" variant="subtle">
                              {video.genre}
                            </Badge>
                          </Td>
                          <Td>{(video.views || 0).toLocaleString()}</Td>
                          <Td>{(video.likes || 0).toLocaleString()}</Td>
                          <Td>{(video.comments || 0).toLocaleString()}</Td>
                          <Td>
                            <Text fontSize="sm">
                              {new Date(video.createdAt).toLocaleDateString()}
                            </Text>
                          </Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                icon={<FaEllipsisV />}
                                variant="ghost"
                                size="sm"
                              />
                              <MenuList>
                                <MenuItem
                                  icon={<FaChartLine />}
                                  onClick={() => openAnalyticsModal(video)}
                                >
                                  View Analytics
                                </MenuItem>
                                <MenuItem
                                  icon={<FaEdit />}
                                  onClick={() => openEditModal(video)}
                                >
                                  Edit Video
                                </MenuItem>
                                <MenuItem
                                  icon={<FaTrash />}
                                  onClick={() => {
                                    setVideoToDelete(video._id);
                                    onDeleteDialogOpen();
                                  }}
                                  color="red.500"
                                >
                                  Delete Video
                                </MenuItem>
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <Flex justify="center" mt={6}>
                    <HStack>
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        size="sm"
                      >
                        Previous
                      </Button>
                      <Text px={4}>
                        Page {currentPage} of {totalPages}
                      </Text>
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        size="sm"
                      >
                        Next
                      </Button>
                    </HStack>
                  </Flex>
                )}
              </CardBody>
            </Card>
          </VStack>
        </Container>

        {/* Upload Video Modal */}
        <Modal isOpen={isUploadOpen} onClose={onUploadClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Upload New Video</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handleUpload}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={uploadForm.title}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, title: e.target.value })
                      }
                      placeholder="Enter video title"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={uploadForm.description}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter video description"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      value={uploadForm.genre}
                      onChange={(e) =>
                        setUploadForm({ ...uploadForm, genre: e.target.value })
                      }
                    >
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Metadata</FormLabel>
                    <Textarea
                      value={uploadForm.metadata}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          metadata: e.target.value,
                        })
                      }
                      placeholder="Additional metadata (tags, keywords, etc.)"
                      rows={3}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Video File</FormLabel>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          videoFile: e.target.files[0],
                        })
                      }
                    />
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Maximum file size: 10MB. Supported formats: MP4, AVI, MOV,
                      WMV
                    </Text>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Thumbnail Image (Optional)</FormLabel>
                    <Input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setUploadForm({ ...uploadForm, thumbnailFile: file });

                        // Create preview URL
                        if (file) {
                          // Clean up previous preview URL
                          if (thumbnailPreview) {
                            URL.revokeObjectURL(thumbnailPreview);
                          }
                          const previewUrl = URL.createObjectURL(file);
                          setThumbnailPreview(previewUrl);
                        } else {
                          if (thumbnailPreview) {
                            URL.revokeObjectURL(thumbnailPreview);
                          }
                          setThumbnailPreview(null);
                        }
                      }}
                    />
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Upload a custom thumbnail for your video. Maximum file
                      size: 5MB. Supported formats: JPG, PNG, WebP
                    </Text>

                    {thumbnailPreview && (
                      <Box mt={3}>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>
                          Preview:
                        </Text>
                        <Box
                          border="2px dashed"
                          borderColor="gray.300"
                          borderRadius="md"
                          p={2}
                          display="inline-block"
                        >
                          <img
                            src={thumbnailPreview}
                            alt="Thumbnail preview"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "150px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        </Box>
                      </Box>
                    )}
                  </FormControl>

                  {uploading && uploadProgress > 0 && (
                    <Box width="100%" mt={4}>
                      <Text fontSize="sm" mb={2}>
                        Uploading... {uploadProgress}%
                      </Text>
                      <Box bg="gray.200" borderRadius="md" overflow="hidden">
                        <Box
                          bg="brand.primary"
                          height="8px"
                          width={`${uploadProgress}%`}
                          transition="width 0.3s ease"
                        />
                      </Box>
                    </Box>
                  )}

                  <HStack width="100%" justify="flex-end" pt={4}>
                    <Button onClick={onUploadClose}>Cancel</Button>
                    <Button
                      type="submit"
                      colorScheme="green"
                      bg="brand.primary"
                      isLoading={uploading}
                      loadingText="Uploading..."
                    >
                      Upload Video
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Edit Video Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Video</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {selectedVideo && (
                <Box mb={6} p={4} bg="gray.50" borderRadius="lg">
                  <Flex direction={{ base: "column", md: "row" }} gap={4}>
                    <Image
                      src={selectedVideo.thumbnail || "/placeholder.png"}
                      alt={selectedVideo.title}
                      boxSize={{ base: "100%", md: "200px" }}
                      maxH="150px"
                      objectFit="cover"
                      borderRadius="md"
                      fallbackSrc="/placeholder.png"
                    />
                    <VStack align="start" spacing={2} flex={1}>
                      <Text fontWeight="bold" fontSize="lg" color="brand.text">
                        {selectedVideo.title}
                      </Text>
                      <Text fontSize="sm" color="gray.600" noOfLines={2}>
                        {selectedVideo.description || "No description"}
                      </Text>
                      <HStack spacing={4}>
                        <Text fontSize="sm" color="gray.500">
                          <FaEye
                            style={{ display: "inline", marginRight: "4px" }}
                          />
                          {selectedVideo.views || 0} views
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          <FaHeart
                            style={{ display: "inline", marginRight: "4px" }}
                          />
                          {selectedVideo.likes || 0} likes
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          <FaComment
                            style={{ display: "inline", marginRight: "4px" }}
                          />
                          {selectedVideo.comments || 0} comments
                        </Text>
                      </HStack>
                    </VStack>
                  </Flex>
                </Box>
              )}
              <form onSubmit={handleEdit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      placeholder="Enter video title"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Enter video description"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Genre</FormLabel>
                    <Select
                      value={editForm.genre}
                      onChange={(e) =>
                        setEditForm({ ...editForm, genre: e.target.value })
                      }
                    >
                      {genres.map((genre) => (
                        <option key={genre} value={genre}>
                          {genre}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Metadata</FormLabel>
                    <Textarea
                      value={editForm.metadata}
                      onChange={(e) =>
                        setEditForm({ ...editForm, metadata: e.target.value })
                      }
                      placeholder="Additional metadata (tags, keywords, etc.)"
                      rows={3}
                    />
                  </FormControl>

                  <HStack width="100%" justify="flex-end" pt={4}>
                    <Button onClick={onEditClose}>Cancel</Button>
                    <Button
                      type="submit"
                      colorScheme="green"
                      bg="brand.primary"
                    >
                      Update Video
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Analytics Modal */}
        <Modal isOpen={isAnalyticsOpen} onClose={onAnalyticsClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Video Analytics</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              {videoAnalytics && (
                <VStack spacing={6} align="stretch">
                  <Box>
                    <Heading size="md" mb={4}>
                      {videoAnalytics.video.title}
                    </Heading>
                    <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                      <Stat>
                        <StatLabel>Views</StatLabel>
                        <StatNumber>{videoAnalytics.video.views}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Likes</StatLabel>
                        <StatNumber>{videoAnalytics.video.likes}</StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Comments</StatLabel>
                        <StatNumber>
                          {videoAnalytics.engagement.totalComments}
                        </StatNumber>
                      </Stat>
                    </Grid>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={3}>
                      Recent Comments
                    </Heading>
                    {videoAnalytics.comments.length === 0 ? (
                      <Text color="gray.500">No comments yet</Text>
                    ) : (
                      <VStack
                        spacing={3}
                        align="stretch"
                        maxH="300px"
                        overflowY="auto"
                      >
                        {videoAnalytics.comments.slice(0, 5).map((comment) => (
                          <Box
                            key={comment.id}
                            p={3}
                            bg="gray.50"
                            borderRadius="md"
                          >
                            <HStack justify="space-between" mb={1}>
                              <Text fontWeight="semibold" fontSize="sm">
                                {comment.user}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </Text>
                            </HStack>
                            <Text fontSize="sm">{comment.text}</Text>
                          </Box>
                        ))}
                      </VStack>
                    )}
                  </Box>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Delete Video Confirmation Dialog */}
        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteDialogClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent borderRadius="xl">
              <AlertDialogHeader
                fontSize="lg"
                fontWeight="bold"
                color="brand.text"
              >
                Delete Video
              </AlertDialogHeader>
              <AlertDialogBody color="gray.600">
                Are you sure you want to delete this video? This action cannot
                be undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={onDeleteDialogClose}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleDelete}
                  ml={3}
                  _hover={{ bg: "red.600" }}
                >
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </Flex>
  );
};

export default MyVideos;
