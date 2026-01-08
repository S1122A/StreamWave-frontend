import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from '../../components/Sidebar';

const ConsumerLayout = ({ children }) => {
  return (
    <Flex 
      minH="100vh" 
      bg="linear-gradient(135deg, #F7FAFC 0%, #FFFFFF 100%)"
    >
      {/* Sidebar Panel */}
      <Box 
        as="aside"
        bg="whiteAlpha.900"
        borderRight="1px solid"
        borderColor="gray.200"
        boxShadow="xl"
        backdropFilter="blur(8px)"
        minW="260px"
        maxW="260px"
        position="sticky"
        top="0"
      >
        <Sidebar />
      </Box>

      {/* Main Content */}
      <Box 
        flex={1}
        px={{ base: 4, md: 8 }}
        py={6}
        overflowY="auto"
      >
        <Box
          bg="white"
          borderRadius="2xl"
          borderWidth="1px"
          borderColor="gray.200"
          boxShadow="xl"
          minH="calc(100vh - 48px)"
          p={{ base: 4, md: 8 }}
        >
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default ConsumerLayout;
