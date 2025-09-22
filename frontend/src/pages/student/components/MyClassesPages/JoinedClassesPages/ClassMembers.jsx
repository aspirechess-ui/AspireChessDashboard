import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  Spinner,
  Center,
  Alert,
  Card,
  Table,
  useBreakpointValue,
  SimpleGrid,
  Button,
} from "@chakra-ui/react";
import { LuUser, LuGraduationCap, LuMail, LuPhone } from "react-icons/lu";
import { useColorMode } from "../../../../../components/ui/color-mode";
import ViewUserCard from "../../../../../components/ViewUserCard";
import studentService from "../../../../../services/student";

const ClassMembers = ({ classData }) => {
  const { colorMode } = useColorMode();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserCard, setShowUserCard] = useState(false);
  const [detailedClassData, setDetailedClassData] = useState(null);

  // Responsive breakpoints
  const showMobileCards = useBreakpointValue({ base: true, lg: false });

  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!classData?._id) {
          setError("Class ID not available");
          return;
        }

        // Fetch detailed class data with populated student information
        const result = await studentService.getClassDetails(classData._id);

        if (result.success && result.data) {
          setDetailedClassData(result.data);

          // Extract enrolled students with populated userDetails
          if (
            result.data.enrolledStudents &&
            Array.isArray(result.data.enrolledStudents)
          ) {
            const studentsWithRole = result.data.enrolledStudents.map(
              (student) => ({
                ...student,
                role: "student",
              })
            );
            setStudents(studentsWithRole);
          } else {
            setStudents([]);
          }
        } else {
          // Fallback to using the passed classData if detailed fetch fails
          console.warn("Failed to fetch detailed class data, using fallback");
          const allMembers = [];

          if (
            classData?.enrolledStudents &&
            Array.isArray(classData.enrolledStudents)
          ) {
            const studentMembers = classData.enrolledStudents.map(
              (student) => ({
                ...student,
                role: "student",
              })
            );
            allMembers.push(...studentMembers);
          }

          const onlyStudents = allMembers.filter(
            (member) => member.role === "student"
          );
          setStudents(onlyStudents);
        }
      } catch (error) {
        console.error("Error loading class members:", error);
        setError("Failed to load class members");

        // Fallback to using the passed classData
        try {
          const allMembers = [];
          if (
            classData?.enrolledStudents &&
            Array.isArray(classData.enrolledStudents)
          ) {
            const studentMembers = classData.enrolledStudents.map(
              (student) => ({
                ...student,
                role: "student",
              })
            );
            allMembers.push(...studentMembers);
          }
          const onlyStudents = allMembers.filter(
            (member) => member.role === "student"
          );
          setStudents(onlyStudents);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [classData]);

  const handleMemberClick = (member) => {
    // Enhanced member object with class information like in BatchMembers
    const enhancedMember = {
      ...member,
      assignedBatch: {
        batchName:
          (detailedClassData || classData)?.linkedBatch?.batchName ||
          (detailedClassData || classData)?.className,
        batchId:
          (detailedClassData || classData)?.linkedBatch?._id ||
          (detailedClassData || classData)?._id,
      },
      batchName:
        (detailedClassData || classData)?.linkedBatch?.batchName ||
        (detailedClassData || classData)?.className,
    };
    console.log("Enhanced member for ViewUserCard:", enhancedMember);
    setSelectedUser(enhancedMember);
    setShowUserCard(true);
  };

  const handleCloseUserCard = () => {
    setSelectedUser(null);
    setShowUserCard(false);
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
            Loading class members...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Error Loading Members</Alert.Title>
          <Alert.Description>{error}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    );
  }

  if (students.length === 0) {
    return (
      <Box p="8" textAlign="center">
        <VStack spacing={4}>
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
              No Students Found
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              This class doesn't have any students enrolled yet.
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <VStack align="start" spacing={2}>
        <Text
          fontSize="lg"
          fontWeight="semibold"
          color={colorMode === "dark" ? "white" : "gray.900"}
        >
          Class Members
        </Text>
        <Text
          fontSize="sm"
          color={colorMode === "dark" ? "gray.400" : "gray.600"}
        >
          {students.length} student{students.length !== 1 ? "s" : ""} enrolled
          in this class
        </Text>
      </VStack>

      {/* Students List */}
      {students.length > 0 ? (
        showMobileCards ? (
          // Mobile Card View
          <SimpleGrid columns={1} spacing={4}>
            {students.map((student) => (
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
                onClick={() => handleMemberClick(student)}
              >
                <Card.Body p="4">
                  <VStack spacing={4} align="stretch">
                    {/* Student Header */}
                    <HStack spacing={3}>
                      <Avatar.Root size="md">
                        {student.userDetails?.profileImageUrl && (
                          <Avatar.Image
                            key={`mobile-avatar-${student._id}`}
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
                              }${student.userDetails.lastName?.charAt(0) || ""}`
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
                        <Badge colorPalette="green" variant="subtle" size="sm">
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
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                          isTruncated
                        >
                          {student.email}
                        </Text>
                      </HStack>

                      {student.userDetails?.phoneNumber && (
                        <HStack key={`mobile-phone-${student._id}`} spacing={2}>
                          <LuPhone
                            size={14}
                            color={colorMode === "dark" ? "#D1D5DB" : "#6B7280"}
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
              <Table.Header bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
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
                {students.map((student) => (
                  <Table.Row
                    key={student._id}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.700" : "gray.50",
                      cursor: "pointer",
                    }}
                    onClick={() => handleMemberClick(student)}
                  >
                    <Table.Cell py="4">
                      <HStack spacing={3}>
                        <Avatar.Root size="sm">
                          {student.userDetails?.profileImageUrl && (
                            <Avatar.Image
                              key={`desktop-avatar-${student._id}`}
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
                        <VStack align="start" spacing={1}>
                          <Text
                            fontWeight="medium"
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
                    </Table.Cell>
                    <Table.Cell py="4">
                      <VStack align="start" spacing={1}>
                        <HStack spacing={2}>
                          <LuMail
                            size={12}
                            color={colorMode === "dark" ? "#D1D5DB" : "#6B7280"}
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
                          <HStack
                            key={`desktop-phone-${student._id}`}
                            spacing={2}
                          >
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
                            key={`parent-name-${student._id}`}
                            fontSize="sm"
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.600"
                            }
                          >
                            {student.userDetails.parentName}
                          </Text>
                        )}
                        {student.userDetails?.parentPhoneNumber && (
                          <HStack
                            key={`parent-phone-${student._id}`}
                            spacing={1}
                          >
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
      ) : null}

      {/* View User Card Modal */}
      <ViewUserCard
        isOpen={showUserCard}
        onClose={handleCloseUserCard}
        user={selectedUser}
      />
    </VStack>
  );
};

export default ClassMembers;
