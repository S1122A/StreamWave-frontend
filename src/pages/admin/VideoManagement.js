import React, { useState, useEffect } from "react";
import {
    Box,
    VStack,
    HStack,
    Text,
    Heading,
    Spinner,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalCloseButton,
    ModalBody,
    useDisclosure,
    Image,
    useToast,
    FormControl,
    FormLabel,
    Select,
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Stat,
    StatLabel,
    StatNumber,
    Divider,
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
    Grid,
} from "@chakra-ui/react";
import { FaVideo, FaEye, FaThumbsUp, FaComment, FaTrash } from "react-icons/fa";
import axiosInstance from "../../config/axios";
import { ENDPOINTS } from "../../config/api";

const VideoManagement = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [creators, setCreators] = useState([]);
    const [genres, setGenres] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalVideos: 0,
        limit: 10,
    });
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        order: "desc",
        creator: "",
        genre: "",
    });

    const {
        isOpen: isVideoStatsOpen,
        onOpen: onVideoStatsOpen,
        onClose: onVideoStatsClose,
    } = useDisclosure();

    // Delete Video State
    const [videoToDelete, setVideoToDelete] = useState(null);
    const {
        isOpen: isDeleteDialogOpen,
        onOpen: onDeleteDialogOpen,
        onClose: onDeleteDialogClose,
    } = useDisclosure();
    const cancelRef = React.useRef();
    const toast = useToast();

    const fetchVideos = async () => {
        try {
            setLoading(true);

            // Convert filters to query string
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await axiosInstance.get(
                `${ENDPOINTS.VIDEOS.LIST}?${queryParams.toString()}`
            );

            const videoData = response.data || {};

            setVideos(videoData.videos || []);

            setPagination({
                currentPage: videoData.pagination?.currentPage || 1,
                totalPages: videoData.pagination?.totalPages || 1,
                totalVideos: videoData.pagination?.totalVideos || 0,
                limit: videoData.pagination?.limit || filters.limit,
            });

            setLoading(false);
        } catch (error) {
            console.error("Error fetching videos:", error);

            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to load videos";

            toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });

            setLoading(false);
        }
    };

    const fetchAllCreatorsAndGenres = async () => {
        try {
            // Fetch all videos without filters to get complete list of creators and genres
            const response = await axiosInstance.get(
                `${ENDPOINTS.VIDEOS.LIST}?limit=1000`
            );
            const allVideos = response.data.videos || [];

            const uniqueCreators = [
                ...new Set(
                    allVideos.map((video) => video.uploadedBy?.name).filter(Boolean)
                ),
            ];
            const uniqueGenres = [
                ...new Set(allVideos.map((video) => video.genre).filter(Boolean)),
            ];

            setCreators(uniqueCreators);
            setGenres(uniqueGenres);
        } catch (error) {
            console.error("Error fetching creators and genres:", error);
        }
    };

    const handleVideoSelect = async (videoId) => {
        try {
            const response = await axiosInstance.get(ENDPOINTS.VIDEOS.STATS(videoId));
            setSelectedVideo(response.data);
            onVideoStatsOpen();
        } catch (error) {
            console.error("Error fetching video stats:", error);

            const errorMessage =
                error.response?.data?.details ||
                error.response?.data?.error ||
                "Failed to fetch video statistics";

            toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleDeleteVideo = async () => {
        if (!videoToDelete) return;

        try {
            await axiosInstance.delete(ENDPOINTS.VIDEOS.DELETE(videoToDelete));

            toast({
                title: "Video Deleted",
                description: "The video has been successfully deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Refresh video list after deletion
            fetchVideos();

            // Close delete confirmation dialog
            onDeleteDialogClose();
            setVideoToDelete(null);
        } catch (error) {
            console.error("Delete video error:", error);
            toast({
                title: "Delete Failed",
                description: error.response?.data?.error || "Failed to delete video",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        fetchVideos();
    }, [filters]);

    useEffect(() => {
        fetchAllCreatorsAndGenres();
    }, []);

    const handlePageChange = (newPage) => {
        setFilters((prev) => ({ ...prev, page: newPage }));
    };

    const handleLimitChange = (event) => {
        setFilters((prev) => ({
            ...prev,
            limit: parseInt(event.target.value),
            page: 1,
        }));
    };

    const handleSortChange = (event) => {
        const [sortBy, order] = event.target.value.split("|");
        setFilters((prev) => ({
            ...prev,
            sortBy,
            order,
            page: 1,
        }));
    };

    const handleCreatorFilterChange = (event) => {
        setFilters((prev) => ({
            ...prev,
            creator: event.target.value,
            page: 1,
        }));
    };

    const handleGenreFilterChange = (event) => {
        setFilters((prev) => ({
            ...prev,
            genre: event.target.value,
            page: 1,
        }));
    };

    if (loading) {
        return (
            <Flex justify="center" align="center" py={20}>
                <VStack spacing={4}>
                    <Spinner size="xl" color="brand.primary" />
                    <Text color="brand.text" fontSize="lg">
                        Loading videos...
                    </Text>
                </VStack>
            </Flex>
        );
    }
    console.log(pagination);
    return (
        <Box
            bg="white"
            p={6}
            borderRadius="xl"
            boxShadow="md"
            borderWidth={1}
            borderColor="gray.100"
        >
            <VStack spacing={6} align="stretch">
                <Flex justify="space-between" align="center">
                    <Heading size="md" color="brand.text">
                        Video Management
                    </Heading>
                    <Text fontSize="sm" color="gray.600">
                        {pagination.totalVideos} videos total
                    </Text>
                </Flex>

                {/* Video Filters */}
                <Flex
                    direction={{ base: "column", md: "row" }}
                    gap={{ base: 3, md: 4 }}
                    wrap="wrap"
                >
                    <FormControl maxW={{ base: "full", md: "200px" }}>
                        <FormLabel fontSize="sm">Sort By</FormLabel>
                        <Select
                            onChange={handleSortChange}
                            value={`${filters.sortBy}|${filters.order}`}
                            size="sm"
                        >
                            <option value="createdAt|desc">Most Recent</option>
                            <option value="createdAt|asc">Oldest First</option>
                            <option value="views|desc">Most Viewed</option>
                            <option value="views|asc">Least Viewed</option>
                            <option value="likes|desc">Most Liked</option>
                            <option value="likes|asc">Least Liked</option>
                            <option value="title|asc">Title A-Z</option>
                            <option value="title|desc">Title Z-A</option>
                        </Select>
                    </FormControl>

                    <FormControl maxW={{ base: "full", md: "180px" }}>
                        <FormLabel fontSize="sm">Filter by Creator</FormLabel>
                        <Select
                            onChange={handleCreatorFilterChange}
                            value={filters.creator}
                            size="sm"
                            placeholder="All Creators"
                        >
                            {creators.map((creator) => (
                                <option key={creator} value={creator}>
                                    {creator}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl maxW={{ base: "full", md: "150px" }}>
                        <FormLabel fontSize="sm">Filter by Genre</FormLabel>
                        <Select
                            onChange={handleGenreFilterChange}
                            value={filters.genre}
                            size="sm"
                            placeholder="All Genres"
                        >
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre.charAt(0).toUpperCase() + genre.slice(1)}
                                </option>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl maxW={{ base: "full", md: "120px" }}>
                        <FormLabel fontSize="sm">Per Page</FormLabel>
                        <Select
                            onChange={handleLimitChange}
                            value={filters.limit}
                            size="sm"
                        >
                            <option value={5}>5 Videos</option>
                            <option value={10}>10 Videos</option>
                            <option value={20}>20 Videos</option>
                        </Select>
                    </FormControl>
                </Flex>

                {/* Video Table */}
                <Box
                    bg="white"
                    borderRadius="lg"
                    overflow="hidden"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                >
                    <TableContainer>
                        <Table variant="simple" size={{ base: "sm", md: "md" }}>
                            <Thead bg="gray.50">
                                <Tr>
                                    <Th
                                        color="brand.text"
                                        fontWeight="semibold"
                                        display={{ base: "none", md: "table-cell" }}
                                    >
                                        Thumbnail
                                    </Th>
                                    <Th color="brand.text" fontWeight="semibold">
                                        Title
                                    </Th>
                                    <Th
                                        color="brand.text"
                                        fontWeight="semibold"
                                        display={{ base: "none", md: "table-cell" }}
                                    >
                                        Creator
                                    </Th>
                                    <Th
                                        color="brand.text"
                                        fontWeight="semibold"
                                        display={{ base: "none", lg: "table-cell" }}
                                    >
                                        Genre
                                    </Th>
                                    <Th color="brand.text" fontWeight="semibold">
                                        Views
                                    </Th>
                                    <Th
                                        color="brand.text"
                                        fontWeight="semibold"
                                        display={{ base: "none", md: "table-cell" }}
                                    >
                                        Likes
                                    </Th>
                                    <Th
                                        color="brand.text"
                                        fontWeight="semibold"
                                        display={{ base: "none", lg: "table-cell" }}
                                    >
                                        Uploaded
                                    </Th>
                                    <Th color="brand.text" fontWeight="semibold">
                                        Actions
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {videos.map((video) => (
                                    <Tr
                                        key={video._id}
                                        _hover={{ bg: "gray.50" }}
                                        cursor="pointer"
                                        onClick={() => handleVideoSelect(video._id)}
                                    >
                                        <Td display={{ base: "none", md: "table-cell" }}>
                                            <Image
                                                src={video.thumbnail}
                                                alt={video.title}
                                                objectFit="cover"
                                                boxSize="50px"
                                                borderRadius="md"
                                                fallbackSrc="/placeholder.png"
                                            />
                                        </Td>
                                        <Td>
                                            <VStack align="start" spacing={0}>
                                                <Text
                                                    fontWeight="medium"
                                                    color="brand.text"
                                                    noOfLines={1}
                                                >
                                                    {video.title}
                                                </Text>
                                                <Text
                                                    fontSize="xs"
                                                    color="gray.500"
                                                    display={{ base: "block", lg: "none" }}
                                                >
                                                    {video.genre || "General"}
                                                </Text>
                                            </VStack>
                                        </Td>
                                        <Td display={{ base: "none", md: "table-cell" }}>
                                            <Text fontSize="sm" color="gray.600">
                                                {video.uploadedBy?.name || "Unknown Creator"}
                                            </Text>
                                        </Td>
                                        <Td display={{ base: "none", lg: "table-cell" }}>
                                            <Badge colorScheme="blue" size="sm">
                                                {video.genre || "General"}
                                            </Badge>
                                        </Td>
                                        <Td>
                                            <HStack spacing={1}>
                                                <Icon as={FaEye} color="brand.primary" size="sm" />
                                                <Text fontSize="sm">{video.views || 0}</Text>
                                            </HStack>
                                        </Td>
                                        <Td display={{ base: "none", md: "table-cell" }}>
                                            <HStack spacing={1}>
                                                <Icon as={FaThumbsUp} color="red.500" size="sm" />
                                                <Text fontSize="sm">{video.likes || 0}</Text>
                                            </HStack>
                                        </Td>
                                        <Td display={{ base: "none", lg: "table-cell" }}>
                                            <Text fontSize="sm" color="gray.600">
                                                {video.createdAt
                                                    ? new Date(video.createdAt).toLocaleDateString()
                                                    : "Unknown"}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <Button
                                                leftIcon={<FaTrash />}
                                                colorScheme="red"
                                                variant="outline"
                                                size="xs"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setVideoToDelete(video._id);
                                                    onDeleteDialogOpen();
                                                }}
                                                _hover={{ bg: "red.50" }}
                                            >
                                                Delete
                                            </Button>
                                        </Td>
                                    </Tr>
                                ))}

                                {/* Empty State Row */}
                                {videos.length === 0 && !loading && (
                                    <Tr>
                                        <Td colSpan={7}>
                                            <Flex
                                                direction="column"
                                                align="center"
                                                justify="center"
                                                py={10}
                                                textAlign="center"
                                            >
                                                <Icon as={FaVideo} size="2xl" color="gray.300" mb={3} />
                                                <Heading size="md" color="gray.500" mb={2}>
                                                    No videos found
                                                </Heading>
                                                <Text color="gray.400" fontSize="sm">
                                                    Videos uploaded by users will appear here
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Video Pagination */}
                {pagination.totalPages > 1 && (
                    <Flex justify="center" align="center" gap={4}>
                        <Button
                            size="sm"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            isDisabled={pagination.currentPage === 1}
                            variant="outline"
                            borderColor="brand.primary"
                            color="brand.primary"
                        >
                            Previous
                        </Button>
                        <Text fontSize="sm" color="gray.600" px={4}>
                            Page {pagination.currentPage} of {pagination.totalPages} (
                            {pagination.totalVideos} total videos)
                        </Text>
                        <Button
                            size="sm"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            isDisabled={pagination.currentPage === pagination.totalPages}
                            variant="outline"
                            borderColor="brand.primary"
                            color="brand.primary"
                        >
                            Next
                        </Button>
                    </Flex>
                )}
            </VStack>

            {/* Video Stats Modal */}
            <Modal
                isOpen={isVideoStatsOpen}
                onClose={onVideoStatsClose}
                size={{ base: "full", md: "xl" }}
            >
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader color="brand.primary" fontWeight="bold">
                        Video Statistics
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedVideo && (
                            <VStack spacing={6} align="stretch">
                                {/* Video Details */}
                                <Box>
                                    <Heading size="lg" color="brand.text" mb={4}>
                                        Video Details
                                    </Heading>
                                    <Flex
                                        direction={{ base: "column", md: "row" }}
                                        gap={{ base: 3, md: 4 }}
                                    >
                                        <Image
                                            src={selectedVideo.video.thumbnail}
                                            boxSize="200px"
                                            objectFit="cover"
                                            borderRadius="xl"
                                            fallbackSrc="/placeholder.png"
                                        />
                                        <VStack align="start" spacing={3} flex={1}>
                                            <Text>
                                                <strong>Title:</strong> {selectedVideo.video.title}
                                            </Text>
                                            <Text>
                                                <strong>Description:</strong>{" "}
                                                {selectedVideo.video.description}
                                            </Text>
                                            <Text>
                                                <strong>Uploaded By:</strong>{" "}
                                                {selectedVideo.video.uploaderName}
                                            </Text>
                                            <Text>
                                                <strong>Upload Date:</strong>{" "}
                                                {new Date(
                                                    selectedVideo.video.createdAt
                                                ).toLocaleDateString()}
                                            </Text>
                                        </VStack>
                                    </Flex>
                                </Box>

                                <Divider />

                                {/* Performance Statistics */}
                                <Box>
                                    <Heading size="lg" color="brand.text" mb={4}>
                                        Performance
                                    </Heading>
                                    <Grid
                                        templateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }}
                                        gap={{ base: 4, md: 6 }}
                                    >
                                        <Stat
                                            textAlign="center"
                                            p={4}
                                            bg="gray.50"
                                            borderRadius="lg"
                                        >
                                            <StatLabel>
                                                <Icon as={FaEye} color="brand.primary" mr={2} />
                                                Views
                                            </StatLabel>
                                            <StatNumber color="brand.text">
                                                {selectedVideo.video.views}
                                            </StatNumber>
                                        </Stat>
                                        <Stat
                                            textAlign="center"
                                            p={4}
                                            bg="gray.50"
                                            borderRadius="lg"
                                        >
                                            <StatLabel>
                                                <Icon as={FaThumbsUp} color="red.500" mr={2} />
                                                Likes
                                            </StatLabel>
                                            <StatNumber color="brand.text">
                                                {selectedVideo.video.likes}
                                            </StatNumber>
                                        </Stat>
                                        <Stat
                                            textAlign="center"
                                            p={4}
                                            bg="gray.50"
                                            borderRadius="lg"
                                        >
                                            <StatLabel>
                                                <Icon as={FaComment} color="brand.primary" mr={2} />
                                                Comments
                                            </StatLabel>
                                            <StatNumber color="brand.text">
                                                {selectedVideo.comments.length}
                                            </StatNumber>
                                        </Stat>
                                    </Grid>
                                </Box>

                                <Divider />

                                {/* Recent Comments */}
                                <Box>
                                    <Heading size="lg" color="brand.text" mb={4}>
                                        Recent Comments
                                    </Heading>
                                    {selectedVideo.comments.length > 0 ? (
                                        <VStack
                                            align="stretch"
                                            spacing={3}
                                            maxH={{ base: "200px", md: "300px" }}
                                            overflowY="auto"
                                        >
                                            {selectedVideo.comments.map((comment) => (
                                                <Box
                                                    key={comment._id}
                                                    borderWidth="1px"
                                                    borderRadius="lg"
                                                    p={4}
                                                    bg="gray.50"
                                                    borderColor="gray.200"
                                                >
                                                    <HStack justify="space-between" mb={2}>
                                                        <Text fontWeight="semibold" color="brand.text">
                                                            {comment.userName}
                                                        </Text>
                                                        <Text fontSize="sm" color="gray.500">
                                                            {new Date(comment.createdAt).toLocaleString()}
                                                        </Text>
                                                    </HStack>
                                                    <Text color="gray.700">{comment.text}</Text>
                                                </Box>
                                            ))}
                                        </VStack>
                                    ) : (
                                        <Flex align="center" justify="center" py={8}>
                                            <VStack spacing={2}>
                                                <Icon as={FaComment} size="2xl" color="gray.300" />
                                                <Text color="gray.500">No comments yet</Text>
                                            </VStack>
                                        </Flex>
                                    )}
                                </Box>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            bg="brand.primary"
                            color="white"
                            _hover={{ bg: "#009A45" }}
                            onClick={onVideoStatsClose}
                        >
                            Close
                        </Button>
                    </ModalFooter>
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
                            Are you sure you want to delete this video? This action cannot be
                            undone.
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
                                onClick={handleDeleteVideo}
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
    );
};

export default VideoManagement;
