import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Separator,
  IconButton,
  Avatar,
  Menu,
  Portal,
} from "@chakra-ui/react";
import {
  LuLayoutDashboard,
  LuUsers,
  LuGraduationCap,
  LuBookOpen,
  LuMegaphone,
  LuAlignLeft,
  LuClipboardList,
  LuSettings,
  LuLogOut,
} from "react-icons/lu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useColorMode } from "./ui/color-mode";

const Sidebar = ({
  userRole = "admin",
  isOpen,
  onToggle,
  isCollapsed = false,
  onCollapse,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("User data in sidebar:", parsedUser);
        setUser(parsedUser);

        // Fetch user details including profile image
        fetchUserDetails();
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const fetchUserDetails = async () => {
    try {
      // Import the userService
      const { userService } = await import("../services/users.js");

      const response = await userService.getProfile();
      console.log("User profile fetched:", response);

      if (response.success) {
        setUserDetails(response.userDetails);
        console.log(
          "Profile image URL:",
          response.userDetails?.profileImageUrl
        );
      } else {
        console.error("Failed to fetch user profile:", response.message);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Define menu items for each role (removed Settings from here)
  const menuItems = {
    admin: [
      // {
      //   label: "Dashboard",
      //   icon: LuLayoutDashboard,
      //   path: "/admin/dashboard",
      // },
      {
        label: "Manage Users",
        icon: LuUsers,
        path: "/admin/manage-users",
      },
      {
        label: "Manage Batches",
        icon: LuGraduationCap,
        path: "/admin/manage-batches",
      },
      // {
      //   label: "Manage Classes",
      //   icon: LuBookOpen,
      //   path: "/admin/manage-classes",
      // },
      {
        label: "Announcements",
        icon: LuMegaphone,
        path: "/admin/announcements",
      },
    ],
    teacher: [
      // {
      //   label: "Dashboard",
      //   icon: LuLayoutDashboard,
      //   path: "/teacher/dashboard",
      // },
      {
        label: "My Classes",
        icon: LuBookOpen,
        path: "/teacher/classes",
      },
      // {
      //   label: "Attendance",
      //   icon: LuClipboardList,
      //   path: "/teacher/attendance",
      // },
      {
        label: "Announcements",
        icon: LuMegaphone,
        path: "/teacher/announcements",
      },
    ],
    student: [
      {
        label: "My Classes",
        icon: LuBookOpen,
        path: "/student/classes",
      },
      {
        label: "Announcements",
        icon: LuMegaphone,
        path: "/student/announcements",
      },
    ],
  };

  const currentMenuItems = menuItems[userRole] || menuItems.admin;

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    const details = userDetails || user;
    if (!details) return "U";

    const firstName = details.firstName || "";
    const lastName = details.lastName || "";
    return (
      (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() ||
      user?.email?.charAt(0).toUpperCase() ||
      "U"
    );
  };

  // Get user display name - prioritize name over email
  const getUserDisplayName = () => {
    const details = userDetails || user;
    if (!details) return "User";

    // First try fullName if available
    if (details.fullName && details.fullName.trim()) {
      return details.fullName;
    }

    // Then try firstName + lastName
    if (details.firstName && details.lastName) {
      return `${details.firstName} ${details.lastName}`;
    }

    // Then try just firstName
    if (details.firstName && details.firstName.trim()) {
      return details.firstName;
    }

    // Only show email if no name is available
    return user?.email?.split("@")[0] || "User";
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    return userDetails?.profileImageUrl || null;
  };

  // Get user designation
  const getUserDesignation = (role) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "teacher":
        return "Teacher";
      case "student":
        return "Student";
      default:
        return "User";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Handle menu item click - close sidebar on mobile
  const handleMenuItemClick = () => {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth < 768 && isOpen) {
      onToggle();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <Box
          position="fixed"
          inset="0"
          bg="blackAlpha.600"
          zIndex="999"
          display={{ base: "block", md: "none" }}
          onClick={onToggle}
        />
      )}

      <Box
        as="nav"
        position="fixed"
        left={{ base: isOpen ? "0" : "-100%", md: "0" }}
        top="0"
        h={{ base: "100dvh", md: "100vh" }}
        maxH={{ base: "100dvh", md: "100vh" }}
        w={{ base: "280px", md: isCollapsed ? "16" : "64" }}
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderRight="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow="lg"
        zIndex="1002"
        transition="all 0.3s ease"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <VStack spacing="0" align="stretch" flex="1">
          {/* Header */}
          <Box
            p="4"
            borderBottom="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <HStack justify="space-between">
              {!isCollapsed && (
                <VStack align="start" spacing="0">
                  <Text fontSize="lg" fontWeight="bold" color="teal.500">
                    Chess Academy
                  </Text>
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    textTransform="capitalize"
                  >
                    {userRole} Panel
                  </Text>
                </VStack>
              )}
              {/* Mobile toggle button */}
              <IconButton
                size="sm"
                variant="ghost"
                onClick={onToggle}
                display={{ base: "flex", md: "none" }}
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
                _hover={{
                  bg: colorMode === "dark" ? "gray.700" : "gray.100",
                  color: colorMode === "dark" ? "white" : "gray.900",
                }}
              >
                <LuAlignLeft />
              </IconButton>
              {/* Desktop collapse button */}
              <IconButton
                size="sm"
                variant="ghost"
                onClick={onCollapse}
                display={{ base: "none", md: "flex" }}
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
                _hover={{
                  bg: colorMode === "dark" ? "gray.700" : "gray.100",
                  color: colorMode === "dark" ? "white" : "gray.900",
                }}
              >
                <LuAlignLeft />
              </IconButton>
            </HStack>
          </Box>

          {/* Navigation Menu */}
          <Box 
            flex="1" 
            overflow="hidden"
            minH="0"
          >
            <VStack spacing="1" p="4" align="stretch">
              {currentMenuItems.map((item) => {
              const Icon = item.icon;
              // Special handling for "My Classes" in teacher role - make it active for any /classes route
              const isTeacherClassesItem =
                userRole === "teacher" && item.path === "/teacher/classes";
              // Special handling for "My Classes" in student role - make it active for any /classes route
              const isStudentClassesItem =
                userRole === "student" && item.path === "/student/classes";
              const isActive = isTeacherClassesItem
                ? location.pathname.startsWith("/teacher/classes")
                : isStudentClassesItem
                ? location.pathname.startsWith("/student/classes")
                : location.pathname === item.path;

              return (
                <Button
                  key={item.path}
                  as={Link}
                  to={item.path}
                  onClick={handleMenuItemClick}
                  variant={isActive ? "solid" : "ghost"}
                  colorPalette={isActive ? "teal" : "gray"}
                  justify={isCollapsed ? "center" : "flex-start"}
                  h="12"
                  px="3"
                  fontSize="sm"
                  fontWeight={isActive ? "semibold" : "medium"}
                  color={
                    isActive
                      ? "white"
                      : colorMode === "dark"
                      ? "gray.200"
                      : "gray.700"
                  }
                  _hover={{
                    bg: isActive
                      ? undefined
                      : colorMode === "dark"
                      ? "gray.700"
                      : "gray.100",
                    color: isActive
                      ? "white"
                      : colorMode === "dark"
                      ? "white"
                      : "gray.900",
                  }}
                >
                  <HStack
                    spacing={isCollapsed ? "0" : "3"}
                    w="full"
                    justify={isCollapsed ? "center" : "flex-start"}
                  >
                    <Icon size="18" />
                    {!isCollapsed && <Text>{item.label}</Text>}
                  </HStack>
                </Button>
              );
            })}
            </VStack>
          </Box>
        </VStack>
        
        <Separator />
        
        {/* User Profile with Dropdown */}
        <Box p="4">
            <Menu.Root>
              <Menu.Trigger asChild>
                <Button
                  variant="ghost"
                  justify={isCollapsed ? "center" : "flex-start"}
                  h="auto"
                  p="2"
                  fontSize="sm"
                  w="full"
                  maxW="100%"
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                  }}
                  _focus={{
                    outline: "none",
                    boxShadow: "none",
                  }}
                  _active={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                    outline: "none",
                    boxShadow: "none",
                  }}
                >
                  {isCollapsed ? (
                    <Avatar.Root size="sm" shape="full">
                      {getProfileImageUrl() ? (
                        <Avatar.Image
                          src={getProfileImageUrl()}
                          alt={getUserDisplayName()}
                          onError={(e) => {
                            console.error(
                              "Failed to load profile image:",
                              getProfileImageUrl()
                            );
                            e.target.style.display = "none";
                          }}
                          onLoad={() => {
                            console.log(
                              "Profile image loaded successfully:",
                              getProfileImageUrl()
                            );
                          }}
                        />
                      ) : null}
                      <Avatar.Fallback name={getUserInitials()}>
                        {getUserInitials()}
                      </Avatar.Fallback>
                    </Avatar.Root>
                  ) : (
                    <HStack spacing="2" w="full" minW="0" maxW="100%">
                      <Avatar.Root size="sm" shape="full" flexShrink="0">
                        {getProfileImageUrl() ? (
                          <Avatar.Image
                            src={getProfileImageUrl()}
                            alt={getUserDisplayName()}
                            onError={(e) => {
                              console.error(
                                "Failed to load profile image:",
                                getProfileImageUrl()
                              );
                              e.target.style.display = "none";
                            }}
                            onLoad={() => {
                              console.log(
                                "Profile image loaded successfully:",
                                getProfileImageUrl()
                              );
                            }}
                          />
                        ) : null}
                        <Avatar.Fallback name={getUserInitials()}>
                          {getUserInitials()}
                        </Avatar.Fallback>
                      </Avatar.Root>

                      <VStack
                        align="start"
                        spacing="0"
                        flex="1"
                        minW="0"
                        overflow="hidden"
                      >
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          lineHeight="1.2"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          isTruncated
                          maxW="100%"
                        >
                          {getUserDisplayName()}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={colorMode === "dark" ? "gray.400" : "gray.500"}
                          lineHeight="1.2"
                          isTruncated
                          maxW="100%"
                        >
                          {getUserDesignation(userRole)}
                        </Text>
                        {userRole === "student" && user?.batchName && (
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.500" : "gray.400"
                            }
                            lineHeight="1.2"
                            isTruncated
                            maxW="100%"
                          >
                            {user.batchName}
                          </Text>
                        )}
                      </VStack>
                    </HStack>
                  )}
                </Button>
              </Menu.Trigger>

              <Portal>
                <Menu.Positioner>
                  <Menu.Content
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    shadow="lg"
                    minW="200px"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    <Menu.Item
                      value="settings"
                      onSelect={() => {
                        const settingsPath =
                          userRole === "admin"
                            ? "/admin/settings"
                            : userRole === "teacher"
                            ? "/teacher/settings"
                            : "/student/settings";
                        navigate(settingsPath);
                        handleMenuItemClick(); // Close sidebar on mobile
                      }}
                      bg={colorMode === "dark" ? "gray.800" : "white"}
                      _hover={{
                        bg: colorMode === "dark" ? "gray.700" : "gray.50",
                      }}
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      <HStack>
                        <LuSettings size="16" />
                        <Text
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          Settings
                        </Text>
                      </HStack>
                    </Menu.Item>

                    <Menu.Separator
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                    />

                    <Menu.Item
                      value="logout"
                      onSelect={() => {
                        handleLogout();
                        handleMenuItemClick(); // Close sidebar on mobile
                      }}
                      bg={colorMode === "dark" ? "gray.800" : "white"}
                      _hover={{
                        bg: colorMode === "dark" ? "red.900" : "red.50",
                      }}
                      color="red.500"
                    >
                      <HStack>
                        <LuLogOut size="16" />
                        <Text color="red.500">Logout</Text>
                      </HStack>
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
        </Box>
      </Box>
    </>
  );
};

export default Sidebar;
