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
    Input,
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
    Badge,
    Divider,
    Icon,
    Flex,
    InputGroup,
    InputLeftElement,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
    Avatar,
} from "@chakra-ui/react";
import {
    FaUsers,
    FaSearch,
    FaTrash,
    FaEdit,
    FaPlus,
    FaCalendar,
    FaEnvelope,
    FaFilter,
} from "react-icons/fa";
import axiosInstance from "../../config/axios";
import { ENDPOINTS } from "../../config/api";

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [usersPagination, setUsersPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        limit: 10,
    });
    const [userFilters, setUserFilters] = useState({
        page: 1,
        limit: 10,
        role: "",
        search: "",
    });
    const [searchInput, setSearchInput] = useState("");

    const {
        isOpen: isUserModalOpen,
        onOpen: onUserModalOpen,
        onClose: onUserModalClose,
    } = useDisclosure();

    // Delete User State
    const [userToDelete, setUserToDelete] = useState(null);
    const {
        isOpen: isDeleteUserDialogOpen,
        onOpen: onDeleteUserDialogOpen,
        onClose: onDeleteUserDialogClose,
    } = useDisclosure();
    const cancelRef = React.useRef();
    const toast = useToast();

    // New User State
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "consumer",
    });
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const params = new URLSearchParams({
                page: userFilters.page,
                limit: userFilters.limit,
                ...(userFilters.role && { role: userFilters.role }),
                ...(userFilters.search && { search: userFilters.search }),
            });

            const response = await axiosInstance.get(
                `${ENDPOINTS.AUTH.USERS}?${params.toString()}`
            );

            const userData = response.data || {};
            setUsers(userData.users || []);

            setUsersPagination({
                currentPage: userData?.currentPage || 1,
                totalPages: userData?.totalPages || 1,
                totalUsers: userData?.total || 0,
                limit: userData.pagination?.limit || userFilters.limit,
            });

            setUsersLoading(false);
        } catch (error) {
            console.error("Error fetching users:", error);

            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                "Failed to load users";

            toast({
                title: "Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });

            setUsersLoading(false);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        onUserModalOpen();
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await axiosInstance.delete(ENDPOINTS.AUTH.DELETE_USER(userToDelete));

            toast({
                title: "User Deleted",
                description: "The user has been successfully deleted.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            fetchUsers();
            onDeleteUserDialogClose();
            setUserToDelete(null);
        } catch (error) {
            console.error("Delete user error:", error);
            toast({
                title: "Delete Failed",
                description: error.response?.data?.error || "Failed to delete user",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            setIsCreatingUser(true);
            await axiosInstance.post(ENDPOINTS.AUTH.REGISTER, newUser);

            toast({
                title: "User Created",
                description: "New user has been successfully created.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            setNewUser({ name: "", email: "", password: "", role: "consumer" });
            fetchUsers();
            onUserModalClose();
        } catch (error) {
            console.error("Create user error:", error);
            toast({
                title: "Creation Failed",
                description: error.response?.data?.error || "Failed to create user",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsCreatingUser(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [userFilters]);

    const handleUserPageChange = (newPage) => {
        setUserFilters((prev) => ({ ...prev, page: newPage }));
    };

    const handleUserLimitChange = (event) => {
        setUserFilters((prev) => ({
            ...prev,
            limit: parseInt(event.target.value),
            page: 1,
        }));
    };

    const handleRoleFilterChange = (event) => {
        setUserFilters((prev) => ({
            ...prev,
            role: event.target.value,
            page: 1,
        }));
    };

    const handleSearchInputChange = (event) => {
        setSearchInput(event.target.value);
    };

    const handleFilterClick = () => {
        setUserFilters((prev) => ({
            ...prev,
            search: searchInput,
            page: 1,
        }));
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case "admin":
                return "red";
            case "creator":
                return "blue";
            case "user":
                return "green";
            default:
                return "gray";
        }
    };

    if (usersLoading) {
        return (
            <Flex justify="center" align="center" py={20}>
                <VStack spacing={4}>
                    <Spinner size="xl" color="brand.primary" />
                    <Text color="brand.text" fontSize="lg">
                        Loading users...
                    </Text>
                </VStack>
            </Flex>
        );
    }

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
                        User Management
                    </Heading>
                    <HStack spacing={3}>
                        <Text fontSize="sm" color="gray.600">
                            {usersPagination.totalUsers} users total
                        </Text>
                        <Button
                            leftIcon={<FaPlus />}
                            bg="brand.primary"
                            color="white"
                            size="sm"
                            onClick={() => {
                                setSelectedUser(null);
                                setNewUser({
                                    username: "",
                                    email: "",
                                    password: "",
                                    role: "user",
                                });
                                onUserModalOpen();
                            }}
                            _hover={{ bg: "#009A45" }}
                        >
                            Add User
                        </Button>
                    </HStack>
                </Flex>

                {/* User Filters */}
                <HStack spacing={4} justify="space-between" wrap="wrap">
                    <FormControl maxW="400px">
                        <FormLabel fontSize="sm">Search Users</FormLabel>
                        <HStack spacing={2}>
                            <InputGroup size="sm">
                                <InputLeftElement pointerEvents="none">
                                    <Icon as={FaSearch} color="gray.400" />
                                </InputLeftElement>
                                <Input
                                    placeholder="Search by username or email..."
                                    value={searchInput}
                                    onChange={handleSearchInputChange}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleFilterClick();
                                        }
                                    }}
                                />
                            </InputGroup>
                            <Button
                                leftIcon={<FaFilter />}
                                colorScheme="blue"
                                size="sm"
                                onClick={handleFilterClick}
                                _hover={{ bg: "blue.600" }}
                            >
                                Filter
                            </Button>
                        </HStack>
                    </FormControl>

                    <HStack spacing={3}>
                        <FormControl maxW="150px">
                            <FormLabel fontSize="sm">Filter by Role</FormLabel>
                            <Select
                                onChange={handleRoleFilterChange}
                                value={userFilters.role}
                                size="sm"
                            >
                                <option value="">All Roles</option>
                                <option value="consumer">Consumer</option>
                                <option value="creator">Creator</option>
                                <option value="admin">Admin</option>
                                <option value="user">User</option>
                            </Select>
                        </FormControl>

                        <FormControl maxW="120px">
                            <FormLabel fontSize="sm">Per Page</FormLabel>
                            <Select
                                onChange={handleUserLimitChange}
                                value={userFilters.limit}
                                size="sm"
                            >
                                <option value={5}>5 Users</option>
                                <option value={10}>10 Users</option>
                            </Select>
                        </FormControl>
                    </HStack>
                </HStack>

                {/* User Table */}
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
                                    <Th color="brand.text" fontWeight="semibold">
                                        Name
                                    </Th>
                                    <Th
                                        color="brand.text"
                                        fontWeight="semibold"
                                        display={{ base: "none", md: "table-cell" }}
                                    >
                                        Email
                                    </Th>
                                    <Th color="brand.text" fontWeight="semibold">
                                        Role
                                    </Th>
                                    <Th
                                        color="brand.text"
                                        fontWeight="semibold"
                                        display={{ base: "none", lg: "table-cell" }}
                                    >
                                        Joined
                                    </Th>
                                    <Th color="brand.text" fontWeight="semibold">
                                        Actions
                                    </Th>
                                </Tr>
                            </Thead>
                            <Tbody>
                                {users.map((user) => (
                                    <Tr key={user._id} _hover={{ bg: "gray.50" }}>
                                        <Td>
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="medium" color="brand.text">
                                                    {user.name || user.username}
                                                </Text>
                                                <Text
                                                    fontSize="sm"
                                                    color="gray.600"
                                                    display={{ base: "block", md: "none" }}
                                                >
                                                    {user.email}
                                                </Text>
                                            </VStack>
                                        </Td>
                                        <Td display={{ base: "none", md: "table-cell" }}>
                                            <Text color="gray.600">{user.email}</Text>
                                        </Td>
                                        <Td>
                                            <Badge
                                                colorScheme={getRoleBadgeColor(user.role)}
                                                size="sm"
                                                textTransform="capitalize"
                                            >
                                                {user.role}
                                            </Badge>
                                        </Td>
                                        <Td display={{ base: "none", lg: "table-cell" }}>
                                            <Text fontSize="sm" color="gray.600">
                                                {user.createdAt
                                                    ? new Date(user.createdAt).toLocaleDateString()
                                                    : "Unknown"}
                                            </Text>
                                        </Td>
                                        <Td>
                                            <HStack spacing={1}>
                                                <Button
                                                    leftIcon={<FaEdit />}
                                                    colorScheme="blue"
                                                    variant="outline"
                                                    size="xs"
                                                    onClick={() => handleUserSelect(user)}
                                                    _hover={{ bg: "blue.50" }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    leftIcon={<FaTrash />}
                                                    colorScheme="red"
                                                    variant="outline"
                                                    size="xs"
                                                    onClick={() => {
                                                        setUserToDelete(user._id);
                                                        onDeleteUserDialogOpen();
                                                    }}
                                                    _hover={{ bg: "red.50" }}
                                                >
                                                    Delete
                                                </Button>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                ))}

                                {/* Empty State Row */}
                                {users.length === 0 && !usersLoading && (
                                    <Tr>
                                        <Td colSpan={5}>
                                            <Flex
                                                direction="column"
                                                align="center"
                                                justify="center"
                                                py={10}
                                                textAlign="center"
                                            >
                                                <Icon as={FaUsers} size="2xl" color="gray.300" mb={3} />
                                                <Heading size="md" color="gray.500" mb={2}>
                                                    No users found
                                                </Heading>
                                                <Text color="gray.400" fontSize="sm">
                                                    {userFilters.search || userFilters.role
                                                        ? "Try adjusting your search or filter criteria"
                                                        : "Registered users will appear here"}
                                                </Text>
                                            </Flex>
                                        </Td>
                                    </Tr>
                                )}
                            </Tbody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* User Pagination */}
                {usersPagination.totalPages > 1 && (
                    <Flex justify="center" align="center" gap={4}>
                        <Button
                            size="sm"
                            onClick={() =>
                                handleUserPageChange(usersPagination.currentPage - 1)
                            }
                            isDisabled={usersPagination.currentPage === 1}
                            variant="outline"
                            borderColor="brand.primary"
                            color="brand.primary"
                        >
                            Previous
                        </Button>
                        <Text fontSize="sm" color="gray.600" px={4}>
                            Page {usersPagination.currentPage} of {usersPagination.totalPages}{" "}
                            ({usersPagination.totalUsers} total users)
                        </Text>
                        <Button
                            size="sm"
                            onClick={() =>
                                handleUserPageChange(usersPagination.currentPage + 1)
                            }
                            isDisabled={
                                usersPagination.currentPage === usersPagination.totalPages
                            }
                            variant="outline"
                            borderColor="brand.primary"
                            color="brand.primary"
                        >
                            Next
                        </Button>
                    </Flex>
                )}
            </VStack>

            {/* User Modal (View/Create) */}
            <Modal
                isOpen={isUserModalOpen}
                onClose={onUserModalClose}
                size={{ base: "full", md: "lg" }}
            >
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader color="brand.primary" fontWeight="bold">
                        {selectedUser ? "User Details" : "Create New User"}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {selectedUser ? (
                            <VStack spacing={6} align="stretch">
                                {/* User Profile */}
                                <Flex align="center" gap={4}>
                                    <Avatar
                                        size="xl"
                                        name={selectedUser.username}
                                        src={selectedUser.profilePicture}
                                    />
                                    <VStack align="start" spacing={2}>
                                        <Heading size="lg" color="brand.text">
                                            {selectedUser.username}
                                        </Heading>
                                        <Badge
                                            colorScheme={getRoleBadgeColor(selectedUser.role)}
                                            size="lg"
                                            textTransform="capitalize"
                                        >
                                            {selectedUser.role}
                                        </Badge>
                                    </VStack>
                                </Flex>

                                <Divider />

                                {/* User Information */}
                                <VStack align="stretch" spacing={4}>
                                    <Box>
                                        <Text fontWeight="semibold" color="brand.text" mb={2}>
                                            Contact Information
                                        </Text>
                                        <VStack align="stretch" spacing={2} pl={4}>
                                            <HStack>
                                                <Icon as={FaEnvelope} color="brand.primary" />
                                                <Text>{selectedUser.email}</Text>
                                            </HStack>
                                            <HStack>
                                                <Icon as={FaCalendar} color="gray.500" />
                                                <Text>
                                                    Joined{" "}
                                                    {new Date(
                                                        selectedUser.createdAt
                                                    ).toLocaleDateString()}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </Box>

                                    <Box>
                                        <Text fontWeight="semibold" color="brand.text" mb={2}>
                                            Account Status
                                        </Text>
                                        <VStack align="stretch" spacing={2} pl={4}>
                                            <HStack>
                                                <Text>Role:</Text>
                                                <Badge
                                                    colorScheme={getRoleBadgeColor(selectedUser.role)}
                                                >
                                                    {selectedUser.role}
                                                </Badge>
                                            </HStack>
                                            <HStack>
                                                <Text>Account ID:</Text>
                                                <Text fontSize="sm" color="gray.600">
                                                    {selectedUser._id}
                                                </Text>
                                            </HStack>
                                        </VStack>
                                    </Box>
                                </VStack>
                            </VStack>
                        ) : (
                            <VStack spacing={4} align="stretch">
                                <FormControl isRequired>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        value={newUser.name}
                                        onChange={(e) =>
                                            setNewUser((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="Enter full name"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) =>
                                            setNewUser((prev) => ({ ...prev, email: e.target.value }))
                                        }
                                        placeholder="Enter email address"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Password</FormLabel>
                                    <Input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) =>
                                            setNewUser((prev) => ({
                                                ...prev,
                                                password: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter password"
                                    />
                                </FormControl>

                                <FormControl>
                                    <FormLabel>Role</FormLabel>
                                    <Select
                                        value={newUser.role}
                                        onChange={(e) =>
                                            setNewUser((prev) => ({ ...prev, role: e.target.value }))
                                        }
                                    >
                                        <option value="consumer">Consumer</option>
                                        <option value="creator">Creator</option>
                                        <option value="admin">Admin</option>
                                    </Select>
                                </FormControl>
                            </VStack>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="outline" mr={3} onClick={onUserModalClose}>
                            {selectedUser ? "Close" : "Cancel"}
                        </Button>
                        {!selectedUser && (
                            <Button
                                bg="brand.primary"
                                color="white"
                                _hover={{ bg: "#009A45" }}
                                onClick={handleCreateUser}
                                isLoading={isCreatingUser}
                                loadingText="Creating..."
                            >
                                Create User
                            </Button>
                        )}
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Delete User Confirmation Dialog */}
            <AlertDialog
                isOpen={isDeleteUserDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={onDeleteUserDialogClose}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent borderRadius="xl">
                        <AlertDialogHeader
                            fontSize="lg"
                            fontWeight="bold"
                            color="brand.text"
                        >
                            Delete User
                        </AlertDialogHeader>
                        <AlertDialogBody color="gray.600">
                            Are you sure you want to delete this user? This action cannot be
                            undone and will remove all associated data.
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button
                                ref={cancelRef}
                                onClick={onDeleteUserDialogClose}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDeleteUser}
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

export default UserManagement;
