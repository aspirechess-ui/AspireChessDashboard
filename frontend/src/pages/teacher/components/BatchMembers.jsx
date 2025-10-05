import React, { useState, useEffect, useCallback } from "react";
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
  Table,
  Spinner,
  Center,
  Box,
  useBreakpointValue,
  SimpleGrid,
  Alert,
} from "@chakra-ui/react";
import {
  LuSearch,
  LuUsers,
  LuMail,
  LuPhone,
  LuGraduationCap,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import ViewUserCard from "../../../components/ViewUserCard";
import batchService from "../../../services/batches";
import { normalizeUserImageUrl } from "../../../utils/imageUrl";

const BatchMembers = ({ batchId, batchName }) => {
  const { colorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [batchStudents, setBatchStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Responsive breakpoints
  const showMobileCards = useBreakpointValue({ base: true, lg: false });

  // Filter batch students based on search term
  const filteredStudents = batchStudents.filter(
    (student) =>
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.userDetails?.firstName &&
        `${student.userDetails.firstName} ${student.userDetails.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  // Fetch batch students
  const fetchBatchStudents = useCallback(async () => {
    if (!batchId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await batchService.getBatchStudents(batchId);

      if (response.success) {
        // Normalize image URLs on the frontend
        const normalizedStudents = (response.data.students || []).map(student => 
          normalizeUserImageUrl(student)
        );
        setBatchStudents(normalizedStudents);
      } else {
        setError(response.message || "Failed to fetch batch students");
      }
    } catch (error) {
      console.error("Error fetching batch students:", error);
      setError("Failed to load batch students");
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    fetchBatchStudents();
  }, [fetchBatchStudents]);

  const handleViewProfile = (student) => {
    // Enhanced student object with batch information
    const enhancedStudent = {
      ...student,
      assignedBatch: {
        batchName: batchName,
        batchId: batchId,
      },
      batchName: batchName,
    };
    setSelectedUserForProfile(enhancedStudent);
    setShowUserProfile(true);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUserForProfile(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#0d9488" />
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            Loading batch members...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Card.Root
        bg={colorMode === "dark" ? "red.900" : "red.50"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "red.700" : "red.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
        p={6}
      >
        <VStack spacing={3} align="center">
          <Text
            fontWeight="semibold"
            color={colorMode === "dark" ? "red.200" : "red.800"}
          >
            Error Loading Batch Members
          </Text>
          <Text
            fontSize="sm"
            color={colorMode === "dark" ? "red.300" : "red.600"}
            textAlign="center"
          >
            {error}
          </Text>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchBatchStudents}
            borderColor={colorMode === "dark" ? "red.500" : "red.300"}
            color={colorMode === "dark" ? "red.300" : "red.600"}
            _hover={{
              bg: colorMode === "dark" ? "red.800" : "red.100",
            }}
          >
            Try Again
          </Button>
        </VStack>
      </Card.Root>
    );
  }

  return (
    <>
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <VStack align="start" spacing={2}>
          <Text
            fontSize="lg"
            fontWeight="semibold"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Batch Members
          </Text>
          <Text
            fontSize="sm"
            color={colorMode === "dark" ? "gray.400" : "gray.600"}
          >
            All students enrolled in {batchName} batch
          </Text>
        </VStack>

        {/* Search Bar */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4">
            <VStack spacing={4} align="stretch">
              <InputGroup startElement={<LuSearch />}>
                <Input
                  placeholder="Search students by name or email..."
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

              <HStack justify="space-between" align="center">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  {filteredStudents.length} of {batchStudents.length} student
                  {batchStudents.length !== 1 ? "s" : ""}{" "}
                  {searchTerm && "found"}
                </Text>
                <Badge colorPalette="teal" variant="subtle" size="sm">
                  <HStack spacing={1}>
                    <LuUsers size={12} />
                    <Text>{batchStudents.length} Total</Text>
                  </HStack>
                </Badge>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Students List */}
        {filteredStudents.length > 0 ? (
          showMobileCards ? (
            // Mobile Card View
            <SimpleGrid columns={1} spacing={4}>
              {filteredStudents.map((student) => (
                <Card.Root
                  key={student._id}
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  borderWidth="1px"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                  shadow={colorMode === "dark" ? "lg" : "sm"}
                  _hover={{
                    borderColor: "#0d9488",
                    shadow: "md",
                    cursor: "pointer",
                  }}
                  transition="all 0.2s"
                  onClick={() => handleViewProfile(student)}
                >
                  <Card.Body p="4">
                    <VStack spacing={4} align="stretch">
                      {/* Student Header */}
                      <HStack spacing={3}>
                        <Avatar.Root size="md">
                          {student.userDetails?.profileImageUrl && (
                            <Avatar.Image
                              src={student.userDetails.profileImageUrl}
                              alt={
                                student.userDetails
                                  ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                  : student.email
                              }
                            />
                          )}
                          <Avatar.Fallback
                            name={
                              student.userDetails
                                ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                : student.email
                            }
                          >
                            {student.userDetails
                              ? `${
                                  student.userDetails.firstName?.charAt(0) || ""
                                }${
                                  student.userDetails.lastName?.charAt(0) || ""
                                }`
                              : student.email?.charAt(0).toUpperCase()}
                          </Avatar.Fallback>
                        </Avatar.Root>

                        <VStack align="start" spacing={1} flex="1">
                          <Text
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {student.userDetails
                              ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                              : "Name not set"}
                          </Text>
                          <Badge
                            colorPalette="green"
                            variant="subtle"
                            size="sm"
                          >
                            Student
                          </Badge>
                        </VStack>
                      </HStack>

                      {/* Student Details */}
                      <VStack spacing={2} align="stretch">
                        <HStack spacing={2}>
                          <LuMail
                            size={14}
                            color={colorMode === "dark" ? "#D1D5DB" : "#6B7280"}
                          />
                          <Text
                            fontSize="sm"
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.600"
                            }
                            isTruncated
                          >
                            {student.email}
                          </Text>
                        </HStack>

                        {student.userDetails?.phoneNumber && (
                          <HStack spacing={2}>
                            <LuPhone
                              size={14}
                              color={
                                colorMode === "dark" ? "#D1D5DB" : "#6B7280"
                              }
                            />
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.600"
                              }
                            >
                              {student.userDetails.phoneNumber}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </SimpleGrid>
          ) : (
            // Desktop Table View
            <Card.Root
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              shadow={colorMode === "dark" ? "lg" : "sm"}
              overflow="hidden"
            >
              <Table.Root variant="simple">
                <Table.Header
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                >
                  <Table.Row>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      fontWeight="semibold"
                      py="3"
                    >
                      Student
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      fontWeight="semibold"
                      py="3"
                    >
                      Contact
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      fontWeight="semibold"
                      py="3"
                    >
                      Date of Birth
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                      fontWeight="semibold"
                      py="3"
                    >
                      Parent/Guardian
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredStudents.map((student) => (
                    <Table.Row
                      key={student._id}
                      bg={colorMode === "dark" ? "gray.800" : "white"}
                      _hover={{
                        bg: colorMode === "dark" ? "gray.700" : "gray.50",
                        cursor: "pointer",
                      }}
                      onClick={() => handleViewProfile(student)}
                    >
                      <Table.Cell py="4">
                        <HStack spacing={3}>
                          <Avatar.Root size="sm">
                            {student.userDetails?.profileImageUrl && (
                              <Avatar.Image
                                src={student.userDetails.profileImageUrl}
                                alt={
                                  student.userDetails
                                    ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                    : student.email
                                }
                              />
                            )}
                            <Avatar.Fallback
                              name={
                                student.userDetails
                                  ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                  : student.email
                              }
                            >
                              {student.userDetails
                                ? `${
                                    student.userDetails.firstName?.charAt(0) ||
                                    ""
                                  }${
                                    student.userDetails.lastName?.charAt(0) ||
                                    ""
                                  }`
                                : student.email?.charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                          </Avatar.Root>
                          <VStack align="start" spacing={1}>
                            <Text
                              fontWeight="medium"
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                            >
                              {student.userDetails
                                ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                : "Name not set"}
                            </Text>
                            <Badge
                              colorPalette="green"
                              variant="subtle"
                              size="sm"
                            >
                              Student
                            </Badge>
                          </VStack>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell py="4">
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <LuMail
                              size={12}
                              color={
                                colorMode === "dark" ? "#D1D5DB" : "#6B7280"
                              }
                            />
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.600"
                              }
                            >
                              {student.email}
                            </Text>
                          </HStack>
                          {student.userDetails?.phoneNumber && (
                            <HStack spacing={2}>
                              <LuPhone
                                size={12}
                                color={
                                  colorMode === "dark" ? "#D1D5DB" : "#6B7280"
                                }
                              />
                              <Text
                                fontSize="sm"
                                color={
                                  colorMode === "dark" ? "gray.300" : "gray.600"
                                }
                              >
                                {student.userDetails.phoneNumber}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Table.Cell>
                      <Table.Cell py="4">
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                        >
                          {formatDate(student.userDetails?.dateOfBirth)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell py="4">
                        <VStack align="start" spacing={1}>
                          {student.userDetails?.parentName && (
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.600"
                              }
                            >
                              {student.userDetails.parentName}
                            </Text>
                          )}
                          {student.userDetails?.parentPhoneNumber && (
                            <HStack spacing={1}>
                              <LuPhone
                                size={12}
                                color={
                                  colorMode === "dark" ? "#D1D5DB" : "#6B7280"
                                }
                              />
                              <Text
                                fontSize="xs"
                                color={
                                  colorMode === "dark" ? "gray.400" : "gray.500"
                                }
                              >
                                {student.userDetails.parentPhoneNumber}
                              </Text>
                            </HStack>
                          )}
                        </VStack>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card.Root>
          )
        ) : (
          // No Students Found
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            shadow={colorMode === "dark" ? "lg" : "sm"}
            p={8}
          >
            <VStack spacing={4} align="center">
              <Box
                p={3}
                bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                borderRadius="full"
              >
                <LuGraduationCap
                  size={32}
                  color={colorMode === "dark" ? "#9CA3AF" : "#6B7280"}
                />
              </Box>
              <VStack spacing={2} textAlign="center">
                <Text
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {searchTerm ? "No Students Found" : "No Students in Batch"}
                </Text>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  {searchTerm
                    ? "Try adjusting your search terms to find students."
                    : "This batch doesn't have any students enrolled yet."}
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
          </Card.Root>
        )}
      </VStack>

      {/* User Profile Modal */}
      <ViewUserCard
        isOpen={showUserProfile}
        onClose={handleCloseUserProfile}
        user={selectedUserForProfile}
      />
    </>
  );
};

export default BatchMembers;
