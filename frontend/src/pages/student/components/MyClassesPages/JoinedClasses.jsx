import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/lu";
import { MdApps, MdList } from "react-icons/md";
import { useColorMode } from "../../../../components/ui/color-mode";
import { Tooltip } from "../../../../components/ui/tooltip";
import studentService from "../../../../services/student";

const JoinedClasses = ({ viewMode = "card", setViewMode }) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [joinedClasses, setJoinedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter classes based on search term
  const filteredClasses = joinedClasses.filter(
    (classItem) =>
      classItem.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch joined classes
  useEffect(() => {
    const fetchJoinedClasses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await studentService.getJoinedClasses();

        if (response.success) {
          setJoinedClasses(response.data);
        } else {
          setError(response.message || "Failed to fetch joined classes");
        }
      } catch (error) {
        console.error("Error fetching joined classes:", error);
        setError("Failed to load joined classes");
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedClasses();
  }, []);

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
        return "orange";
      case "unlisted":
        return "gray";
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
      case "unlisted":
        return "Unlisted";
      default:
        return visibility;
    }
  };

  const handleViewClass = (classItem) => {
    navigate(`/student/classes/${encodeURIComponent(classItem.className)}`, {
      state: { classData: classItem },
    });
  };

  const renderCardView = () => (
    <SimpleGrid
      columns={{ base: 1, md: 2, xl: 3 }}
      spacing={{ base: 4, md: 6 }}
      gap="6"
    >
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
            cursor: "pointer",
          }}
          transition="all 0.2s"
          overflow="hidden"
          onClick={() => handleViewClass(classItem)}
          cursor="pointer"
        >
          <Card.Body p={{ base: "4", md: "6" }}>
            <VStack spacing={{ base: 3, md: 4 }} align="stretch">
              {/* Class Header */}
              <VStack align="start" spacing={2}>
                <VStack align="start" spacing={2} w="full">
                  <HStack justify="space-between" w="full" align="start">
                    <Text
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="bold"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      isTruncated
                      flex="1"
                    >
                      {classItem.className}
                    </Text>
                    <Badge
                      colorPalette={getVisibilityColor(classItem.visibility)}
                      variant="subtle"
                      size="sm"
                      flexShrink={0}
                    >
                      {getVisibilityText(classItem.visibility)}
                    </Badge>
                  </HStack>

                  {classItem.description && (
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      noOfLines={{ base: 2, md: 2 }}
                      w="full"
                    >
                      {classItem.description}
                    </Text>
                  )}
                </VStack>
              </VStack>

              {/* Class Info */}
              <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                {/* Enrollment Info */}
                <HStack spacing={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
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
                <HStack spacing={2} flexWrap={{ base: "wrap", md: "nowrap" }}>
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
        <Table.Header
          bg={colorMode === "dark" ? "gray.750" : "gray.50"}
          display={{ base: "none", md: "table-header-group" }}
        >
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
              display={{ base: "none", lg: "table-cell" }}
            >
              Description
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              fontWeight="semibold"
              display={{ base: "none", md: "table-cell" }}
            >
              Students
            </Table.ColumnHeader>
            <Table.ColumnHeader
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              fontWeight="semibold"
              display={{ base: "none", sm: "table-cell" }}
            >
              Status
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
              cursor="pointer"
              transition="background-color 0.2s"
            >
              {/* Mobile layout - single column with stacked content */}
              <Table.Cell display={{ base: "table-cell", md: "none" }} p={4}>
                <VStack align="start" spacing={3} w="full">
                  <HStack justify="space-between" w="full" align="start">
                    <VStack align="start" spacing={1} flex="1">
                      <Text
                        fontWeight="medium"
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        fontSize="sm"
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
                    <Badge
                      colorPalette={getVisibilityColor(classItem.visibility)}
                      variant="subtle"
                      size="sm"
                      flexShrink={0}
                    >
                      {getVisibilityText(classItem.visibility)}
                    </Badge>
                  </HStack>

                  {classItem.description && (
                    <Text
                      fontSize="xs"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      noOfLines={2}
                      w="full"
                    >
                      {classItem.description}
                    </Text>
                  )}

                  <HStack spacing={4} w="full">
                    <HStack spacing={1}>
                      <LuUsers size={12} />
                      <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        {classItem.currentEnrolledStudents || 0}
                        {classItem.maxStudents && ` / ${classItem.maxStudents}`}
                      </Text>
                    </HStack>
                  </HStack>
                </VStack>
              </Table.Cell>

              {/* Desktop layout - separate columns */}
              <Table.Cell display={{ base: "none", md: "table-cell" }}>
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

              <Table.Cell display={{ base: "none", lg: "table-cell" }}>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  noOfLines={2}
                  maxW="200px"
                >
                  {classItem.description || "No description"}
                </Text>
              </Table.Cell>

              <Table.Cell display={{ base: "none", md: "table-cell" }}>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  {classItem.currentEnrolledStudents || 0}
                  {classItem.maxStudents && ` / ${classItem.maxStudents}`}
                </Text>
              </Table.Cell>

              <Table.Cell display={{ base: "none", sm: "table-cell" }}>
                <Badge
                  colorPalette={getVisibilityColor(classItem.visibility)}
                  variant="subtle"
                  size="sm"
                >
                  {getVisibilityText(classItem.visibility)}
                </Badge>
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
            Loading your classes...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Error Loading Classes</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={{ base: 4, md: 6 }} p={{ base: 4, md: 6 }}>
      {/* Search Bar */}
      <VStack spacing={4} align="stretch">
        <VStack spacing={4} align="stretch">
          {/* Search Input and View Toggle Row */}
          <HStack
            spacing={{ base: 2, md: 4 }}
            align="center"
            justify="space-between"
            w="full"
          >
            <InputGroup
              startElement={<LuSearch />}
              flex="1"
              maxW={{ base: "calc(100% - 80px)", sm: "auto" }}
            >
              <Input
                placeholder="Search your classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={colorMode === "dark" ? "gray.700" : "white"}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                color={colorMode === "dark" ? "white" : "gray.900"}
                size={{ base: "md", md: "md" }}
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
            <HStack spacing={2} flexShrink={0}>
              <Tooltip content="Card View" positioning={{ placement: "top" }}>
                <IconButton
                  size={{ base: "sm", md: "sm" }}
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
                  size={{ base: "sm", md: "sm" }}
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

          {/* Stats Row */}
          <HStack
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={2}
          >
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              {filteredClasses.length} of {joinedClasses.length} class
              {joinedClasses.length !== 1 ? "es" : ""} {searchTerm && "found"}
            </Text>
            <Badge colorPalette="teal" variant="subtle" size="sm">
              <HStack spacing={1}>
                <LuBookOpen size={12} />
                <Text>{joinedClasses.length} Joined</Text>
              </HStack>
            </Badge>
          </HStack>
        </VStack>
      </VStack>{" "}
      {/* Classes List */}
      {filteredClasses.length > 0 ? (
        viewMode === "card" ? (
          renderCardView()
        ) : (
          renderListView()
        )
      ) : (
        // No Classes Found
        <Box p={{ base: 6, md: 8 }} textAlign="center">
          <VStack spacing={4}>
            <Box
              p={3}
              bg={colorMode === "dark" ? "gray.700" : "gray.100"}
              borderRadius="full"
            >
              <LuBookOpen
                size={32}
                color={colorMode === "dark" ? "#9CA3AF" : "#6B7280"}
              />
            </Box>
            <VStack spacing={2} textAlign="center">
              <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
                fontSize={{ base: "md", md: "lg" }}
              >
                {searchTerm ? "No Classes Found" : "No Joined Classes"}
              </Text>
              <Text
                fontSize={{ base: "sm", md: "sm" }}
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                maxW={{ base: "full", md: "md" }}
                px={{ base: 2, md: 0 }}
              >
                {searchTerm
                  ? "Try adjusting your search terms to find classes."
                  : "You haven't joined any classes yet. Check the Available Classes tab to find classes to join."}
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
  );
};

export default JoinedClasses;
