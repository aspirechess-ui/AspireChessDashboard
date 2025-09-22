import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Input,
  InputGroup,
  Badge,
  Avatar,
  Spinner,
  Center,
  Box,
  SimpleGrid,
  Alert,
  Table,
  IconButton,
} from "@chakra-ui/react";
import {
  LuSearch,
  LuUsers,
  LuCalendar,
  LuBookOpen,
  LuClock,
  LuUser,
  LuPlus,
  LuSend,
  LuX,
  LuEye,
} from "react-icons/lu";
import { MdApps, MdList } from "react-icons/md";
import { useColorMode } from "../../../../components/ui/color-mode";
import { Tooltip } from "../../../../components/ui/tooltip";
import studentService from "../../../../services/student";
import classJoinRequestService from "../../../../services/classJoinRequests";
import ClassJoinRequestCard from "./AvailableClassesPages/ClassJoinRequestCard";

const AvailableClasses = ({ viewMode = "card", setViewMode }) => {
  const { colorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestLoading, setRequestLoading] = useState({});

  // Join request modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Filter classes based on search term
  const filteredClasses = availableClasses.filter(
    (classItem) =>
      classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch available classes and requests
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching available classes and requests...");

      const [classesResponse, requestsResponse] = await Promise.all([
        studentService.getAvailableClasses(),
        studentService.getMyJoinRequests(),
      ]);

      console.log("Classes response:", classesResponse);
      console.log("Requests response:", requestsResponse);

      if (classesResponse.success) {
        console.log("Available classes data:", classesResponse.data);
        setAvailableClasses(classesResponse.data);
      } else {
        console.error("Failed to fetch classes:", classesResponse.message);
        setError(
          classesResponse.message || "Failed to fetch available classes"
        );
      }

      if (requestsResponse.success) {
        console.log("My requests data:", requestsResponse.data);
        setMyRequests(requestsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinOpenClass = async (classItem) => {
    try {
      setRequestLoading((prev) => ({ ...prev, [classItem._id]: true }));

      const response = await classJoinRequestService.createJoinRequest(
        classItem._id,
        "Direct join to open class"
      );

      if (response.success) {
        // Refresh data to update the UI
        await fetchData();
        setError(null); // Clear any previous errors
      }
    } catch (error) {
      console.error("Error joining class:", error);

      // Handle specific capacity-related errors
      if (error.message.includes("maximum capacity")) {
        setError("This class is full and has reached its maximum capacity.");
      } else if (error.message.includes("already enrolled")) {
        setError("You are already enrolled in this class.");
      } else {
        setError(error.message || "Failed to join class");
      }
    } finally {
      setRequestLoading((prev) => {
        const newState = { ...prev };
        delete newState[classItem._id];
        return newState;
      });
    }
  };

  const handleRequestToJoin = (classItem) => {
    setSelectedClass(classItem);
    setShowJoinModal(true);
  };

  const handleRequestSent = async () => {
    // Refresh data after request is sent
    await fetchData();
  };

  const getRequestForClass = (classId) => {
    return myRequests.find((request) => request.classId === classId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case "open":
        return "green";
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
      case "request_to_join":
        return "Request to Join";
      default:
        return visibility;
    }
  };

  const renderActionButton = (classItem) => {
    const existingRequest = getRequestForClass(classItem._id);
    const isLoading = requestLoading[classItem._id];
    const isClassFull =
      classItem.maxStudents &&
      classItem.currentEnrolledStudents >= classItem.maxStudents;

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return (
          <Badge colorPalette="orange" variant="subtle" size="sm" px={3} py={1}>
            <HStack spacing={1}>
              <LuClock size={12} />
              <Text>Request Pending</Text>
            </HStack>
          </Badge>
        );
      } else if (existingRequest.status === "approved") {
        return (
          <Badge colorPalette="green" variant="subtle" size="sm" px={3} py={1}>
            <HStack spacing={1}>
              <LuBookOpen size={12} />
              <Text>Joined</Text>
            </HStack>
          </Badge>
        );
      } else if (existingRequest.status === "rejected") {
        return (
          <Badge colorPalette="red" variant="subtle" size="sm" px={3} py={1}>
            <HStack spacing={1}>
              <LuX size={12} />
              <Text>Request Rejected</Text>
            </HStack>
          </Badge>
        );
      }
    }

    // Check if class is full
    if (isClassFull) {
      return (
        <Badge colorPalette="gray" variant="subtle" size="sm" px={3} py={1}>
          <HStack spacing={1}>
            <LuUsers size={12} />
            <Text>Class Full</Text>
          </HStack>
        </Badge>
      );
    }

    if (classItem.visibility === "open") {
      return (
        <Button
          variant="solid"
          colorPalette="green"
          size="sm"
          leftIcon={<LuPlus />}
          onClick={() => handleJoinOpenClass(classItem)}
          loading={isLoading}
          loadingText="Joining..."
          disabled={isLoading}
        >
          Join Class
        </Button>
      );
    } else if (classItem.visibility === "request_to_join") {
      return (
        <Button
          variant="outline"
          colorPalette="blue"
          size="sm"
          leftIcon={<LuSend />}
          onClick={() => handleRequestToJoin(classItem)}
          disabled={isLoading}
          color={colorMode === "dark" ? "blue.300" : "blue.600"}
          borderColor={colorMode === "dark" ? "blue.400" : "blue.500"}
          _hover={{
            bg: colorMode === "dark" ? "blue.900" : "blue.50",
            borderColor: colorMode === "dark" ? "blue.300" : "blue.600",
          }}
        >
          Request to Join
        </Button>
      );
    }

    return null;
  };

  const renderCardView = () => (
    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={6} gap="6">
      {filteredClasses.map((classItem) => (
        <Card.Root
          key={classItem._id}
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
          _hover={{
            borderColor: "#0d9488",
            shadow: colorMode === "dark" ? "xl" : "md",
            transform: "translateY(-2px)",
          }}
          transition="all 0.2s"
          overflow="hidden"
        >
          <Card.Body p="6">
            <VStack spacing={4} align="stretch">
              {/* Class Header */}
              <VStack align="start" spacing={2}>
                <HStack justify="space-between" w="full">
                  <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    isTruncated
                  >
                    {classItem.className}
                  </Text>
                  <Badge
                    colorPalette={getVisibilityColor(classItem.visibility)}
                    variant="subtle"
                    size="sm"
                  >
                    {getVisibilityText(classItem.visibility)}
                  </Badge>
                </HStack>

                {classItem.description && (
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    noOfLines={2}
                  >
                    {classItem.description}
                  </Text>
                )}
              </VStack>

              {/* Class Info */}
              <VStack spacing={3} align="stretch">
                {/* Enrollment Info */}
                <HStack spacing={2}>
                  <LuUsers
                    size={16}
                    color={colorMode === "dark" ? "#D1D5DB" : "#6B7280"}
                  />
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    fontWeight="medium"
                  >
                    Students: {classItem.currentEnrolledStudents || 0}
                    {classItem.maxStudents && ` / ${classItem.maxStudents}`}
                  </Text>
                </HStack>

                {/* Created Date */}
                <HStack spacing={2}>
                  <LuCalendar
                    size={16}
                    color={colorMode === "dark" ? "#D1D5DB" : "#6B7280"}
                  />
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  >
                    Created: {formatDate(classItem.createdAt)}
                  </Text>
                </HStack>
              </VStack>

              {/* Action Button */}
              <Box>{renderActionButton(classItem)}</Box>
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </SimpleGrid>
  );

  const renderListView = () => (
    <Box
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      borderRadius="lg"
      overflow="hidden"
    >
      <Table.Root variant="simple" size="sm">
        <Table.Header bg={colorMode === "dark" ? "gray.750" : "gray.50"}>
          <Table.Row>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              fontWeight="semibold"
            >
              Class Name
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              fontWeight="semibold"
            >
              Description
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              fontWeight="semibold"
            >
              Students
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              fontWeight="semibold"
            >
              Status
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              fontWeight="semibold"
            >
              Action
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {filteredClasses.map((classItem) => (
            <Table.Row
              key={classItem._id}
              _hover={{
                bg: colorMode === "dark" ? "gray.700" : "gray.50",
              }}
            >
              <Table.Cell>
                <VStack align="start" spacing={1}>
                  <Text
                    fontWeight="medium"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    {classItem.className}
                  </Text>
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  >
                    Created: {formatDate(classItem.createdAt)}
                  </Text>
                </VStack>
              </Table.Cell>
              <Table.Cell>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  noOfLines={2}
                  maxW="200px"
                >
                  {classItem.description || "No description"}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  {classItem.currentEnrolledStudents || 0}
                  {classItem.maxStudents && ` / ${classItem.maxStudents}`}
                </Text>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  colorPalette={getVisibilityColor(classItem.visibility)}
                  variant="subtle"
                  size="sm"
                >
                  {getVisibilityText(classItem.visibility)}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Box>{renderActionButton(classItem)}</Box>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#0d9488" />
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            Loading available classes...
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <>
      <VStack align="stretch" spacing={6} p={6}>
        {/* Error Alert */}
        {error && (
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        {/* Search Bar and Controls */}
        <VStack spacing={4} align="stretch">
          <HStack spacing={4} align="center" justify="space-between">
            <HStack spacing={3} flex="1">
              <InputGroup startElement={<LuSearch />} flex="1">
                <Input
                  placeholder="Search available classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                  _focus={{
                    borderColor: "#0d9488",
                    boxShadow: "0 0 0 1px #0d9488",
                  }}
                />
              </InputGroup>

              {/* View Mode Toggles */}
              <HStack spacing={2}>
                <Tooltip content="Card View" positioning={{ placement: "top" }}>
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
                    bg={viewMode === "card" ? "#0d9488" : "transparent"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    _hover={{
                      bg:
                        viewMode === "card"
                          ? "#0b7c6f"
                          : colorMode === "dark"
                          ? "gray.700"
                          : "gray.100",
                    }}
                  >
                    <MdApps />
                  </IconButton>
                </Tooltip>
                <Tooltip content="List View" positioning={{ placement: "top" }}>
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
                    bg={viewMode === "list" ? "#0d9488" : "transparent"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    _hover={{
                      bg:
                        viewMode === "list"
                          ? "#0b7c6f"
                          : colorMode === "dark"
                          ? "gray.700"
                          : "gray.100",
                    }}
                  >
                    <MdList />
                  </IconButton>
                </Tooltip>
              </HStack>
            </HStack>
          </HStack>

          <HStack justify="space-between" align="center">
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              {filteredClasses.length} of {availableClasses.length} class
              {availableClasses.length !== 1 ? "es" : ""}{" "}
              {searchTerm && "found"}
            </Text>
            <Badge colorPalette="blue" variant="subtle" size="sm">
              <HStack spacing={1}>
                <LuSearch size={12} />
                <Text>{availableClasses.length} Available</Text>
              </HStack>
            </Badge>
          </HStack>
        </VStack>

        {/* Classes List */}
        {filteredClasses.length > 0 ? (
          viewMode === "card" ? (
            renderCardView()
          ) : (
            renderListView()
          )
        ) : (
          // No Classes Found
          <Box p="8" textAlign="center">
            <VStack spacing={4}>
              <Box
                p={3}
                bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                borderRadius="full"
              >
                <LuSearch
                  size={32}
                  color={colorMode === "dark" ? "#9CA3AF" : "#6B7280"}
                />
              </Box>
              <VStack spacing={2} textAlign="center">
                <Text
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {searchTerm ? "No Classes Found" : "No Available Classes"}
                </Text>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  {searchTerm
                    ? "Try adjusting your search terms to find classes."
                    : "There are no available classes for your batch at the moment."}
                </Text>
              </VStack>
              {searchTerm && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                  }}
                >
                  Clear Search
                </Button>
              )}
            </VStack>
          </Box>
        )}
      </VStack>

      {/* Join Request Modal */}
      <ClassJoinRequestCard
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        classData={selectedClass}
        onRequestSent={handleRequestSent}
      />
    </>
  );
};

export default AvailableClasses;
