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
    <Flex h="100vh" bg={colorMode === "dark" ? "gray.900" : "gray.50"}>
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
      >
        {/* Mobile Menu Button */}
        <IconButton
          position="absolute"
          top="4"
          left="4"
          zIndex="10"
          size="sm"
          variant="outline"
          display={{ base: "flex", md: "none" }}
          onClick={() => setSidebarOpen(true)}
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          _hover={{
            bg: colorMode === "dark" ? "gray.700" : "gray.50",
          }}
        >
          <LuAlignLeft />
        </IconButton>

        {/* Theme Toggle */}
        <Box position="absolute" top="4" right="4" zIndex="10">
          <ThemeToggle />
        </Box>

        {/* Page Content */}
        <Box minH="100vh" pt="16" pb="8">
          {children}
        </Box>
      </Box>
    </Flex>
  );
};

export default DashboardLayout;
