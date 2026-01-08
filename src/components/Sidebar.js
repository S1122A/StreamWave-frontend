import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Icon,
  Text,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  useToast,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  Tag,
  TagLabel,
  TagCloseButton,
} from "@chakra-ui/react";
import {
  FaChartBar,
  FaVideo,
  FaHome,
  FaSignOutAlt,
  FaCloudUploadAlt,
  FaUsers,
  FaTachometerAlt,
  FaHeart,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import AuthService from "../config/auth";
import axiosInstance from "../config/axios";
import { ENDPOINTS } from "../config/api";

const SidebarItem = ({ icon, label, to, onClick }) => (
  <Flex
    as={to ? Link : "button"}
    to={to}
    onClick={onClick}
    alignItems="center"
    width="full"
    p={4}
    borderRadius="xl"
    cursor="pointer"
    transition="all .25s ease"
    bg="transparent"
    color="gray.300"
    _hover={{
      bg: "rgba(0, 255, 170, .12)",
      color: "white",
      transform: "translateX(6px)",
      boxShadow: "0 0 12px rgba(0,255,170,.35)",
    }}
  >
    <Icon as={icon} mr={3} />
    <Text fontWeight="medium">{label}</Text>
  </Flex>
);

const Sidebar = () => {
  const [user] = useState(AuthService.getCurrentUser());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // upload state...
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState({});

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = "/login";
  };

  // (validation + upload logic remains unchanged)

  return (
    <Box
      width={{ base: "full", md: "280px" }}
      minH="100vh"
      bg="linear-gradient(165deg, #0b0f1a 0%, #0a0a12 60%, #050509 100%)"
      borderRight="1px solid rgba(255,255,255,0.08)"
      boxShadow="0 0 25px rgba(0,0,0,.45)"
      p={6}
    >
      <VStack spacing={7} align="stretch">
        <Heading
          size="lg"
          textAlign="center"
          fontWeight="extrabold"
          letterSpacing="widest"
          bgGradient="linear(to-r, #5bfffc, #38ffa6)"
          bgClip="text"
        >
          StreamWave
        </Heading>

        {/* Consumer */}
        {user?.role === "consumer" && (
          <>
            <SidebarItem icon={FaHome} label="Home" to="/consumer/home" />
            <SidebarItem icon={FaHeart} label="Liked Videos" to="/consumer/liked" />
          </>
        )}

        {/* Creator */}
        {user?.role === "creator" && (
          <>
            <SidebarItem
              icon={FaTachometerAlt}
              label="Creator Dashboard"
              to="/creator/dashboard"
            />
            <SidebarItem icon={FaVideo} label="My Videos" to="/creator/my-videos" />
          </>
        )}

        {/* Admin */}
        {user?.role === "admin" && (
          <>
            <SidebarItem
              icon={FaTachometerAlt}
              label="Admin Dashboard"
              to="/admin/dashboard"
            />
            <SidebarItem icon={FaUsers} label="User Management" to="/admin/dashboard" />
            <SidebarItem icon={FaCloudUploadAlt} label="Upload Video" onClick={onOpen} />
            <SidebarItem icon={FaChartBar} label="Analytics" to="/analytics" />
          </>
        )}

        <Box pt={4}>
          <SidebarItem icon={FaSignOutAlt} label="Logout" onClick={handleLogout} />
        </Box>
      </VStack>

      {/* Upload Modal — dark / neon */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent
          bg="#0f101a"
          border="1px solid rgba(0,255,170,.25)"
          boxShadow="0 0 20px rgba(0,255,170,.35)"
          borderRadius="2xl"
        >
          <ModalHeader
            bgGradient="linear(to-r,#3bffa8,#72fff6)"
            bgClip="text"
            fontWeight="bold"
          >
            Upload Video
          </ModalHeader>
          <ModalCloseButton color="whiteAlpha.700" />
          <ModalBody pb={6}>
            {/* form remains same, just dark fields */}
            {/* ... keep your form, add dark theme styles as needed */}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;
