import React, { useState, useEffect } from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { LuAlignLeft } from "react-icons/lu";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import LoadingSpinner from "../components/LoadingSpinner";
import { useColorMode } from "../components/ui/color-mode";

const DashboardLayout = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed for mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Desktop collapse state
  const { colorMode } = useColorMode();

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch {
        // Invalid JSON - this should be handled by ProtectedRoute
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  if (!user) {
    return <LoadingSpinner message="Initializing..." />;
  }

  return (
    <Flex 
      h="100vh" 
      maxH="100vh"
      w="100vw"
      maxW="100vw"
      overflow="hidden"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      {/* Sidebar */}
      <Sidebar
        userRole={user.role}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isCollapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <Box
        flex="1"
        ml={{ base: "0", md: sidebarCollapsed ? "16" : "64" }}
        overflow="auto"
        position="relative"
        bg={colorMode === "dark" ? "gray.900" : "gray.50"}
        transition="margin-left 0.3s ease"
        w={{ base: "100vw", md: "auto" }}
        maxW={{ base: "100vw", md: "none" }}
      >
        {/* Mobile Header Bar */}
        <Flex
          position="sticky"
          top="0"
          left="0"
          right="0"
          zIndex="10"
          h="16"
          px="4"
          align="center"
          justify="space-between"
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderBottomWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          display={{ base: "flex", md: "none" }}
        >
          {/* Mobile Menu Button */}
          <IconButton
            size="sm"
            variant="outline"
            onClick={() => setSidebarOpen(true)}
            bg="transparent"
            borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
            _hover={{
              bg: colorMode === "dark" ? "gray.700" : "gray.50",
            }}
          >
            <LuAlignLeft />
          </IconButton>

          {/* Theme Toggle */}
          <ThemeToggle />
        </Flex>

        {/* Desktop Theme Toggle */}
        <Box 
          position="absolute" 
          top="4" 
          right="4" 
          zIndex="10"
          display={{ base: "none", md: "block" }}
        >
          <ThemeToggle />
        </Box>

        {/* Page Content */}
        <Box 
          minH={{ base: "calc(100vh - 4rem)", md: "100vh" }}
          pt={{ base: "0", md: "16" }} 
          pb="8"
          px={{ base: "4", md: "0" }}
          w="full"
          maxW="100%"
          overflow="hidden"
        >
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
