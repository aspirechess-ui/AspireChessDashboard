import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  InputGroup,
  Spinner,
  Alert,
  Flex,
  IconButton,
} from "@chakra-ui/react";

import {
  FaPlus,
  FaSearch,
  FaUsers,
  FaUserCheck,
  FaGraduationCap,
} from "react-icons/fa";
import { MdApps, MdList } from "react-icons/md";
import { useColorMode } from "../../../components/ui/color-mode";
import { Tooltip } from "../../../components/ui/tooltip";
import CreateUserCard from "../components/CreateUserCard";
import ViewUserCard from "../../../components/ViewUserCard";
import DeletePrompt from "../../../components/DeletePrompt";
import ManageUsersTable from "../components/ManageUsersTable";
import { adminService, authService } from "../../../services/api";

const ManageUsers = () => {
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("card"); // "card" or "list"

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null); // For success/error alerts

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getUsers({
        limit: 50, // Get more users for better demo
      });

      if (response.success) {
        setUsers(response.users);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for modals
  const handleCreateUser = async (userData) => {
    console.log("handleCreateUser called with:", userData);
    try {
      // Use the admin service to create user
      const response = await adminService.createUser(userData);
      console.log("Admin service response:", response);

      if (response.success) {
        // Refresh users list
        await fetchUsers();
        setShowCreateModal(false);

        // Show success message
        setAlert({
          type: "success",
          title: "User Created Successfully",
          description: `${userData.role} account for ${userData.firstName} ${userData.lastName} has been created.`,
        });
        setTimeout(() => setAlert(null), 4000);
      }
    } catch (error) {
      console.error("Error creating user:", error);

      // Show error message - don't create user locally
      setAlert({
        type: "error",
        title: "Failed to Create User",
        description:
          error.message ||
          "An unexpected error occurred while creating the user.",
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleDeleteUser = (user) => {
    // Prevent admin from deleting their own account
    const currentUser = authService.getCurrentUser();
    if (
      currentUser &&
      user.email === currentUser.email &&
      user.role === "admin"
    ) {
      setAlert({
        type: "error",
        title: "Cannot Delete Own Account",
        description:
          "You cannot delete your own admin account from here. Please use the profile settings to manage your account.",
      });
      setTimeout(() => setAlert(null), 5000);
      return;
    }

    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    setDeleteLoading(true);
    try {
      // Use the admin service to delete user
      const response = await adminService.deleteUser(selectedUser._id);

      if (response.success) {
        // Refresh users list
        await fetchUsers();
        setShowDeleteModal(false);
        setSelectedUser(null);

        // Show success message
        const isStudent = selectedUser.role === "student";
        setAlert({
          type: "success",
          title: "User Permanently Deleted",
          description: `User ${selectedUser.userDetails?.firstName} ${
            selectedUser.userDetails?.lastName
          } has been permanently removed from the system.${
            isStudent
              ? " They have also been removed from their enrolled batch."
              : ""
          }`,
        });
        setTimeout(() => setAlert(null), 4000);
      }
    } catch (error) {
      console.error("Error deleting user:", error);

      // Show error message
      setAlert({
        type: "error",
        title: "Failed to Delete User",
        description:
          error.message ||
          "An unexpected error occurred while deleting the user.",
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.userDetails?.firstName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.userDetails?.lastName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" || user.role === activeTab;

    return matchesSearch && matchesTab;
  });

  const getUsersByRole = (role) => {
    return users.filter((user) => user.role === role);
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="50vh">
        <VStack spacing="4">
          <Spinner size="xl" color="teal.500" />
          <Text>Loading users...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      p={{ base: "4", md: "6" }}
      maxW="full"
      minH="100vh"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      <VStack spacing="6" align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="4">
          <Box>
            <Heading
              size="lg"
              mb="2"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Manage Users
            </Heading>
            <Text
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              fontSize="md"
            >
              Create and manage admin and teacher accounts
            </Text>
          </Box>
          <Button
            colorPalette="teal"
            leftIcon={<FaPlus />}
            onClick={() => setShowCreateModal(true)}
          >
            Create User
          </Button>
        </Flex>

        {/* Error Alert */}
        {error && (
          <Alert.Root
            status="warning"
            rounded="md"
            bg={colorMode === "dark" ? "orange.900" : "orange.50"}
            borderColor={colorMode === "dark" ? "orange.700" : "orange.200"}
          >
            <Alert.Indicator />
            <Alert.Title
              color={colorMode === "dark" ? "orange.200" : "orange.800"}
              fontSize="sm"
            >
              Unable to fetch live data. Showing sample data for demonstration.
            </Alert.Title>
          </Alert.Root>
        )}

        {/* Success/Error Alert */}
        {alert && (
          <Alert.Root
            status={alert.type}
            rounded="md"
            bg={
              alert.type === "success"
                ? colorMode === "dark"
                  ? "green.900"
                  : "green.50"
                : colorMode === "dark"
                ? "red.900"
                : "red.50"
            }
            borderColor={
              alert.type === "success"
                ? colorMode === "dark"
                  ? "green.700"
                  : "green.200"
                : colorMode === "dark"
                ? "red.700"
                : "red.200"
            }
          >
            <Alert.Indicator />
            <Box>
              <Alert.Title
                color={
                  alert.type === "success"
                    ? colorMode === "dark"
                      ? "green.200"
                      : "green.800"
                    : colorMode === "dark"
                    ? "red.200"
                    : "red.800"
                }
                fontSize="sm"
                fontWeight="semibold"
              >
                {alert.title}
              </Alert.Title>
              {alert.description && (
                <Alert.Description
                  color={
                    alert.type === "success"
                      ? colorMode === "dark"
                        ? "green.300"
                        : "green.700"
                      : colorMode === "dark"
                      ? "red.300"
                      : "red.700"
                  }
                  fontSize="sm"
                  mt="1"
                >
                  {alert.description}
                </Alert.Description>
              )}
            </Box>
          </Alert.Root>
        )}

        {/* Search and View Toggle */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4">
            <Flex gap="4" align="center">
              <InputGroup flex="1" startElement={<FaSearch />}>
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  name="search-users-input"
                  data-form-type="search"
                  data-lpignore="true"
                  data-1p-ignore="true"
                />
              </InputGroup>

              {/* View Toggle */}
              <HStack spacing="1" flexShrink="0">
                <Tooltip content="Card View">
                  <IconButton
                    size="sm"
                    variant={viewMode === "card" ? "solid" : "outline"}
                    colorPalette="teal"
                    onClick={() => setViewMode("card")}
                    color={
                      viewMode === "card"
                        ? "white"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "gray.600"
                    }
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  >
                    <MdApps />
                  </IconButton>
                </Tooltip>
                <Tooltip content="List View">
                  <IconButton
                    size="sm"
                    variant={viewMode === "list" ? "solid" : "outline"}
                    colorPalette="teal"
                    onClick={() => setViewMode("list")}
                    color={
                      viewMode === "list"
                        ? "white"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "gray.600"
                    }
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  >
                    <MdList />
                  </IconButton>
                </Tooltip>
              </HStack>
            </Flex>
          </Card.Body>
        </Card.Root>

        {/* Tabs */}
        <Box
          overflowX="auto"
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
          }}
        >
          <HStack
            minW="max-content"
            bg={colorMode === "dark" ? "gray.900" : "gray.50"}
            whiteSpace="nowrap"
            px={{ base: "2", md: "0" }}
            borderBottom="1px solid"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            spacing="0"
          >
            <Button
              variant="ghost"
              color={
                activeTab === "all"
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === "all" ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab("all")}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === "all"
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === "all"
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === "all"
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: "-1px",
                      left: "0",
                      right: "0",
                      height: "3px",
                      bg: "#0d9488",
                      borderRadius: "2px 2px 0 0",
                    }
                  : {}
              }
            >
              <FaUsers />
              All ({users.length})
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === "admin"
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === "admin" ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab("admin")}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === "admin"
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === "admin"
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === "admin"
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: "-1px",
                      left: "0",
                      right: "0",
                      height: "3px",
                      bg: "#0d9488",
                      borderRadius: "2px 2px 0 0",
                    }
                  : {}
              }
            >
              <FaUserCheck />
              Admins ({getUsersByRole("admin").length})
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === "teacher"
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === "teacher" ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab("teacher")}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === "teacher"
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === "teacher"
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === "teacher"
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: "-1px",
                      left: "0",
                      right: "0",
                      height: "3px",
                      bg: "#0d9488",
                      borderRadius: "2px 2px 0 0",
                    }
                  : {}
              }
            >
              <FaUsers />
              Teachers ({getUsersByRole("teacher").length})
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === "student"
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === "student" ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab("student")}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === "student"
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === "student"
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === "student"
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: "-1px",
                      left: "0",
                      right: "0",
                      height: "3px",
                      bg: "#0d9488",
                      borderRadius: "2px 2px 0 0",
                    }
                  : {}
              }
            >
              <FaGraduationCap />
              Students ({getUsersByRole("student").length})
            </Button>
          </HStack>
        </Box>

        {/* Tab Content */}
        <Box mt="6">
          <ManageUsersTable
            users={
              activeTab === "all" ? filteredUsers : getUsersByRole(activeTab)
            }
            viewMode={viewMode}
            activeTab={activeTab}
            onViewUser={handleViewUser}
            onDeleteUser={handleDeleteUser}
          />
        </Box>
      </VStack>

      {/* Modals */}
      <CreateUserCard
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      <ViewUserCard
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        user={selectedUser}
      />

      <DeletePrompt
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteUser}
        title="Delete User Account"
        description={
          selectedUser?.role === "student"
            ? "Are you sure you want to delete this student account? This will permanently remove the user, all associated data, and remove them from their enrolled batch."
            : "Are you sure you want to delete this user account? This will permanently remove the user and all associated data."
        }
        itemName={
          selectedUser
            ? `${selectedUser.userDetails?.firstName} ${selectedUser.userDetails?.lastName} (${selectedUser.email})`
            : ""
        }
        isLoading={deleteLoading}
        confirmText="Delete User"
      />
    </Box>
  );
};

export default ManageUsers;
