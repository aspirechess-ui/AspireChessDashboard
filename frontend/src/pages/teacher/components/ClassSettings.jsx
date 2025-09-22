import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  SimpleGrid,
  Table,
  IconButton,
  Spinner,
  Center,
  Alert,
  Flex,
  Breadcrumb,
  InputGroup,
  Input,
  Menu,
  Portal,
} from "@chakra-ui/react";
import {
  LuPlus,
  LuUsers,
  LuArrowLeft,
  LuChevronRight,
  LuSearch,
} from "react-icons/lu";
import { FaEllipsisV, FaEye, FaTrash } from "react-icons/fa";
import { MdApps, MdList } from "react-icons/md";
import { useColorMode } from "../../../components/ui/color-mode";
import { Tooltip } from "../../../components/ui/tooltip";
import classService from "../../../services/classes.js";
import batchService from "../../../services/batches.js";
import CreateClassCard from "./CreateClassCard";
import DeletePrompt from "../../../components/DeletePrompt";
import BatchMembers from "./BatchMembers";
import BatchAnnouncement from "./BatchAnnouncement";

const ClassSettings = () => {
  const { colorMode } = useColorMode();
  const { batchName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [batch, setBatch] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [activeTab, setActiveTab] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null); // For success/error alerts

  // Create class modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchBatchClasses = useCallback(async () => {
    try {
      setLoading(true);

      let actualBatchId = batchId;

      // If we don't have batchId yet, try to get it from location state or find by name
      if (!actualBatchId) {
        if (location.state?.batchId) {
          // Use batchId from navigation state
          actualBatchId = location.state.batchId;
          setBatchId(actualBatchId);
        } else if (batchName) {
          // Find batch by name - we need to fetch all batches and find the matching one
          const batchesResponse = await batchService.getBatchesForTeacher({
            limit: 100,
          });
          if (batchesResponse.success) {
            const decodedBatchName = decodeURIComponent(batchName);
            const foundBatch = batchesResponse.data.find(
              (batch) => batch.batchName === decodedBatchName
            );
            if (foundBatch) {
              actualBatchId = foundBatch._id;
              setBatchId(actualBatchId);
            } else {
              throw new Error("Batch not found");
            }
          } else {
            throw new Error("Failed to fetch batches");
          }
        } else {
          throw new Error("No batch identifier provided");
        }
      }

      // Validate batchId format (basic MongoDB ObjectId validation)
      if (
        !actualBatchId ||
        actualBatchId.length !== 24 ||
        !/^[0-9a-fA-F]{24}$/.test(actualBatchId)
      ) {
        throw new Error("Invalid batch ID format");
      }

      const response = await classService.getClassesByBatch(actualBatchId);

      if (response.success) {
        setBatch(response.data.batch);
        setClasses(response.data.classes);
        setError(null); // Clear any previous errors
      } else {
        throw new Error(response.message || "Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching batch classes:", error);
      setError(error.message || "Failed to fetch batch classes");

      // Navigate back to classes page if invalid batchId or batch not found
      if (
        error.message.includes("Invalid batch ID") ||
        error.message.includes("Cast to ObjectId failed") ||
        error.message.includes("Batch not found")
      ) {
        setTimeout(() => navigate("/teacher/classes"), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [batchId, batchName, location.state, navigate]);

  useEffect(() => {
    if (batchName || batchId) {
      fetchBatchClasses();
    }
  }, [batchName, batchId, fetchBatchClasses]);

  const handleCreateClass = () => {
    fetchBatchClasses(); // Refresh the list after class creation
  };

  const handleViewClass = (classItem) => {
    const encodedBatchName = encodeURIComponent(batch?.batchName || batchName);
    const encodedClassName = encodeURIComponent(classItem.className);
    navigate(
      `/teacher/classes/batch/${encodedBatchName}/class/${encodedClassName}`,
      {
        state: {
          batchName: batch?.batchName,
          batchId: batchId,
          classId: classItem._id,
          className: classItem.className,
        },
      }
    );
  };

  const handleDeleteClass = (classItem) => {
    setSelectedClass(classItem);
    setShowDeleteModal(true);
  };

  const confirmDeleteClass = async () => {
    if (!selectedClass) return;

    setDeleteLoading(true);
    try {
      const response = await classService.deleteClass(selectedClass._id);
      if (response.success) {
        // Remove class from local state
        setClasses(classes.filter((c) => c._id !== selectedClass._id));
        setShowDeleteModal(false);
        setSelectedClass(null);

        // Show success message
        setAlert({
          type: "success",
          title: "Class Deleted Successfully",
          description: `Class "${selectedClass.className}" has been permanently removed. All enrolled students have been notified.`,
        });
        setTimeout(() => setAlert(null), 4000);
      }
    } catch (error) {
      console.error("Error deleting class:", error);

      // Show error message
      setAlert({
        type: "error",
        title: "Failed to Delete Class",
        description:
          error.message ||
          "An unexpected error occurred while deleting the class.",
      });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case "open":
        return "green";
      case "unlisted":
        return "yellow";
      case "request_to_join":
        return "blue";
      default:
        return "gray";
    }
  };

  const getVisibilityText = (visibility) => {
    switch (visibility) {
      case "open":
        return "Open";
      case "unlisted":
        return "Unlisted";
      case "request_to_join":
        return "Request to Join";
      default:
        return visibility;
    }
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="teal.500" />
          <Text>Loading classes...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box
        p={{ base: "4", md: "6" }}
        maxW="full"
        minH="100vh"
        bg={colorMode === "dark" ? "gray.900" : "gray.50"}
      >
        <VStack spacing={6} align="center" justify="center" minH="400px">
          <Alert.Root status="error" maxW="md">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error Loading Batch</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <Button
            variant="outline"
            onClick={() => navigate("/teacher/classes")}
            color={colorMode === "dark" ? "gray.300" : "gray.700"}
            borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
          >
            <HStack spacing="2">
              <LuArrowLeft />
              <Text>Back to Classes</Text>
            </HStack>
          </Button>
        </VStack>
      </Box>
    );
  }

  const handleBackToBatches = () => {
    navigate("/teacher/classes");
  };

  const filteredClasses = classes.filter(
    (classItem) =>
      classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (classItem.description &&
        classItem.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box
      p={{ base: "4", md: "6" }}
      maxW="full"
      minH="100vh"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      <VStack align="stretch" spacing={6}>
        {/* Breadcrumb */}
        <Box>
          <Breadcrumb.Root
            fontSize="sm"
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
          >
            <Breadcrumb.List gap="2">
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  onClick={handleBackToBatches}
                  cursor="pointer"
                  _hover={{ color: "#0d9488" }}
                >
                  Batches
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator>
                <LuChevronRight
                  color={colorMode === "dark" ? "#6B7280" : "#9CA3AF"}
                />
              </Breadcrumb.Separator>
              <Breadcrumb.Item>
                <Breadcrumb.CurrentLink
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {batch?.batchName || "Batch Classes"}
                </Breadcrumb.CurrentLink>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Box>

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

        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={handleBackToBatches}
          mb="4"
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          _hover={{ color: "#0d9488" }}
          alignSelf="flex-start"
        >
          <HStack spacing="2">
            <LuArrowLeft color="#0d9488" size="16" />
            <Text>Back to Batches</Text>
          </HStack>
        </Button>

        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="4">
          <Box>
            <Heading
              size="lg"
              mb="2"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              {batch?.batchName || "Batch Classes"}
            </Heading>
            <Text
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              fontSize="md"
            >
              Create and manage classes
            </Text>
          </Box>
          <Button
            colorPalette="teal"
            leftIcon={<LuPlus />}
            onClick={
              activeTab === 0
                ? () => setIsCreateOpen(true)
                : activeTab === 1
                ? () => {
                    // TODO: Implement add member functionality
                    console.log("Add member clicked");
                  }
                : () => {
                    // TODO: Implement create announcement functionality
                    console.log("Create announcement clicked");
                  }
            }
          >
            {activeTab === 0
              ? "Create Class"
              : activeTab === 1
              ? "Add Member"
              : "Create Announcement"}
          </Button>
        </Flex>

        {/* Search and View Toggle - Only show on Manage Classes tab */}
        {activeTab === 0 && (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            shadow={colorMode === "dark" ? "lg" : "sm"}
          >
            <Card.Body p="4">
              <Flex gap="4" align="center">
                <InputGroup flex="1" startElement={<LuSearch />}>
                  <Input
                    placeholder="Search classes..."
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
                    name="search-classes-input"
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
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.300"
                      }
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
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.300"
                      }
                    >
                      <MdList />
                    </IconButton>
                  </Tooltip>
                </HStack>
              </Flex>
            </Card.Body>
          </Card.Root>
        )}

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
                activeTab === 0
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === 0 ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab(0)}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === 0
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === 0
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === 0
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
              <LuUsers />
              Manage Classes
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === 1
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === 1 ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab(1)}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === 1
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === 1
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === 1
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
              <LuUsers />
              Members
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === 2
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === 2 ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab(2)}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === 2
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === 2
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === 2
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
              <LuUsers />
              Announcements
            </Button>
          </HStack>
        </Box>

        {/* Tab Content */}
        <Box mt="6">
          {activeTab === 0 && (
            <Box>
              {/* Classes List */}
              {filteredClasses.length === 0 ? (
                <Card.Root
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  borderWidth="1px"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                >
                  <Card.Body p="8" textAlign="center">
                    <Box display="flex" justifyContent="center" mb="4">
                      <LuUsers
                        size="48"
                        color={colorMode === "dark" ? "#4A5568" : "#A0AEC0"}
                      />
                    </Box>
                    <Text
                      fontSize="lg"
                      fontWeight="medium"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    >
                      {classes.length === 0
                        ? "No Classes Yet!"
                        : "No classes found"}
                    </Text>
                    <Text
                      mt="2"
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    >
                      {classes.length === 0
                        ? "Create your first class for this batch to get started."
                        : "Try adjusting your search"}
                    </Text>
                  </Card.Body>
                </Card.Root>
              ) : viewMode === "card" ? (
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 3 }}
                  spacing={6}
                  gap="6"
                >
                  {filteredClasses.map((classItem) => (
                    <Card.Root
                      key={classItem._id}
                      bg={colorMode === "dark" ? "gray.800" : "white"}
                      borderWidth="1px"
                      borderColor={
                        colorMode === "dark" ? "gray.700" : "gray.200"
                      }
                      shadow={colorMode === "dark" ? "lg" : "sm"}
                      _hover={{
                        shadow: colorMode === "dark" ? "xl" : "md",
                        transform: "translateY(-2px)",
                        cursor: "pointer",
                      }}
                      transition="all 0.2s"
                      onClick={() => handleViewClass(classItem)}
                    >
                      <Card.Body p={6}>
                        <VStack align="stretch" spacing={4}>
                          <HStack justify="space-between">
                            <Heading
                              size="md"
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                            >
                              {classItem.className}
                            </Heading>
                            <HStack spacing="2">
                              <Badge
                                colorPalette={getVisibilityColor(
                                  classItem.visibility
                                )}
                                size="sm"
                              >
                                {getVisibilityText(classItem.visibility)}
                              </Badge>
                              <Menu.Root>
                                <Menu.Trigger asChild>
                                  <IconButton
                                    size="xs"
                                    variant="ghost"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.300"
                                        : "gray.600"
                                    }
                                    _hover={{
                                      bg:
                                        colorMode === "dark"
                                          ? "gray.700"
                                          : "gray.100",
                                      color:
                                        colorMode === "dark"
                                          ? "gray.200"
                                          : "gray.700",
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <FaEllipsisV />
                                  </IconButton>
                                </Menu.Trigger>
                                <Portal>
                                  <Menu.Positioner>
                                    <Menu.Content
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.800"
                                          : "white"
                                      }
                                      borderColor={
                                        colorMode === "dark"
                                          ? "gray.700"
                                          : "gray.200"
                                      }
                                      shadow="lg"
                                    >
                                      <Menu.Item
                                        value="view"
                                        color={
                                          colorMode === "dark"
                                            ? "white"
                                            : "gray.900"
                                        }
                                        _hover={{
                                          bg:
                                            colorMode === "dark"
                                              ? "gray.700"
                                              : "gray.50",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewClass(classItem);
                                        }}
                                      >
                                        <FaEye />
                                        View
                                      </Menu.Item>
                                      <Menu.Item
                                        value="delete"
                                        color="red.500"
                                        _hover={{
                                          bg:
                                            colorMode === "dark"
                                              ? "red.900"
                                              : "red.50",
                                          color: "red.600",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteClass(classItem);
                                        }}
                                      >
                                        <FaTrash />
                                        Delete
                                      </Menu.Item>
                                    </Menu.Content>
                                  </Menu.Positioner>
                                </Portal>
                              </Menu.Root>
                            </HStack>
                          </HStack>

                          {classItem.description && (
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.600"
                              }
                              noOfLines={2}
                            >
                              {classItem.description}
                            </Text>
                          )}

                          <VStack align="stretch" spacing={2}>
                            <HStack>
                              <LuUsers
                                size={16}
                                color={
                                  colorMode === "dark" ? "#D1D5DB" : "#6B7280"
                                }
                              />
                              <Text
                                fontSize="sm"
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                {classItem.currentEnrolledStudents} /{" "}
                                {classItem.maxStudents || "∞"} students
                              </Text>
                            </HStack>
                          </VStack>
                        </VStack>
                      </Card.Body>
                    </Card.Root>
                  ))}
                </SimpleGrid>
              ) : (
                <Box
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  borderWidth="1px"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                  borderRadius="lg"
                  overflow="hidden"
                  shadow={colorMode === "dark" ? "lg" : "sm"}
                >
                  <Table.Root variant="simple" size="sm">
                    <Table.Header
                      bg={colorMode === "dark" ? "gray.750" : "gray.50"}
                    >
                      <Table.Row>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                        >
                          Class Name
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                          display={{ base: "none", sm: "table-cell" }}
                        >
                          Visibility
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                          display={{ base: "none", md: "table-cell" }}
                        >
                          Students
                        </Table.ColumnHeader>

                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                          w="40px"
                        >
                          Actions
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredClasses.map((classItem) => (
                        <Table.Row
                          key={classItem._id}
                          _hover={{
                            bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            cursor: "pointer",
                          }}
                          onClick={() => handleViewClass(classItem)}
                        >
                          <Table.Cell>
                            <VStack align="start" spacing="0" minW="0" flex="1">
                              <Text
                                fontWeight="semibold"
                                fontSize="sm"
                                color={colorMode === "dark" ? "white" : "black"}
                                isTruncated
                              >
                                {classItem.className}
                              </Text>
                              {classItem.description && (
                                <Text
                                  fontSize="xs"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                  isTruncated
                                >
                                  {classItem.description}
                                </Text>
                              )}
                              {/* Mobile-only info */}
                              <HStack
                                spacing="2"
                                display={{ base: "flex", sm: "none" }}
                                wrap="wrap"
                              >
                                <Badge
                                  colorPalette={getVisibilityColor(
                                    classItem.visibility
                                  )}
                                  size="xs"
                                >
                                  {getVisibilityText(classItem.visibility)}
                                </Badge>
                                <Text
                                  fontSize="xs"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.400"
                                      : "gray.500"
                                  }
                                >
                                  {classItem.currentEnrolledStudents}/
                                  {classItem.maxStudents || "∞"} students
                                </Text>
                              </HStack>
                            </VStack>
                          </Table.Cell>
                          <Table.Cell
                            display={{ base: "none", sm: "table-cell" }}
                          >
                            <Badge
                              colorPalette={getVisibilityColor(
                                classItem.visibility
                              )}
                              size="xs"
                            >
                              {getVisibilityText(classItem.visibility)}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell
                            display={{ base: "none", md: "table-cell" }}
                          >
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.600"
                              }
                            >
                              {classItem.currentEnrolledStudents}/
                              {classItem.maxStudents || "∞"}
                            </Text>
                          </Table.Cell>

                          <Table.Cell>
                            <Menu.Root>
                              <Menu.Trigger asChild>
                                <IconButton
                                  size="xs"
                                  variant="ghost"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.400"
                                      : "gray.500"
                                  }
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "gray.100",
                                    color:
                                      colorMode === "dark"
                                        ? "gray.200"
                                        : "gray.700",
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <FaEllipsisV />
                                </IconButton>
                              </Menu.Trigger>
                              <Portal>
                                <Menu.Positioner>
                                  <Menu.Content
                                    bg={
                                      colorMode === "dark"
                                        ? "gray.800"
                                        : "white"
                                    }
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "gray.200"
                                    }
                                    shadow="lg"
                                  >
                                    <Menu.Item
                                      value="view"
                                      color={
                                        colorMode === "dark"
                                          ? "white"
                                          : "gray.900"
                                      }
                                      _hover={{
                                        bg:
                                          colorMode === "dark"
                                            ? "gray.700"
                                            : "gray.50",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewClass(classItem);
                                      }}
                                    >
                                      <FaEye />
                                      View
                                    </Menu.Item>
                                    <Menu.Item
                                      value="delete"
                                      color="red.500"
                                      _hover={{
                                        bg:
                                          colorMode === "dark"
                                            ? "red.900"
                                            : "red.50",
                                        color: "red.600",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteClass(classItem);
                                      }}
                                    >
                                      <FaTrash />
                                      Delete
                                    </Menu.Item>
                                  </Menu.Content>
                                </Menu.Positioner>
                              </Portal>
                            </Menu.Root>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Box>
          )}

          {activeTab === 1 && (
            <BatchMembers
              batchId={batchId}
              batchName={batch?.batchName || batchName}
            />
          )}

          {activeTab === 2 && <BatchAnnouncement batch={batch} />}
        </Box>
      </VStack>

      {/* Create Class Modal */}
      <CreateClassCard
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateClass}
        batchId={batchId}
      />

      {/* Delete Class Modal */}
      <DeletePrompt
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedClass(null);
        }}
        onConfirm={confirmDeleteClass}
        title="Delete Class"
        description="Are you sure you want to delete this class? All enrolled students will be removed and this action cannot be undone."
        itemName={selectedClass?.className}
        isLoading={deleteLoading}
        confirmText="Delete Class"
        cancelText="Cancel"
      />
    </Box>
  );
};

export default ClassSettings;
