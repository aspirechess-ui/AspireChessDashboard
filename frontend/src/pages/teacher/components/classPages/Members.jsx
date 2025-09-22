import React, { useState, useEffect, useCallback } from "react";
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Avatar,
  Table,
  Alert,
  InputGroup,
  Input,
  IconButton,
  Menu,
  Portal,
  Badge,
  Box,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  LuPhone,
  LuMail,
  LuSearch,
  LuUserPlus,
  LuClipboardList,
  LuEye,
  LuUserX,
  LuArrowLeft,
  LuChartNoAxesColumnIncreasing,
} from "react-icons/lu";
import { FaEllipsisV } from "react-icons/fa";
import { useColorMode } from "../../../../components/ui/color-mode";
import classJoinRequestService from "../../../../services/classJoinRequests.js";
import classService from "../../../../services/classes.js";
import AddStudentsCard from "../AddStudentsCard.jsx";
import PendingRequestsCard from "../PendingRequestsCard/";
import DeletePrompt from "../../../../components/DeletePrompt.jsx";
import StudentIndividualAttendanceCard from "../StudentIndividualAttendanceCard.jsx";
import ViewUserCard from "../../../../components/ViewUserCard.jsx";

const Members = ({ classData, onRefresh }) => {
  const { colorMode } = useColorMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserForProfile, setSelectedUserForProfile] = useState(null);
  const [deletePrompt, setDeletePrompt] = useState({
    isOpen: false,
    student: null,
    isLoading: false,
  });

  // Responsive breakpoints
  const showMobileCards = useBreakpointValue({ base: true, lg: false });

  // Filter enrolled students based on search term
  const filteredStudents =
    classData.enrolledStudents?.filter(
      (student) =>
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.userDetails?.firstName &&
          `${student.userDetails.firstName} ${student.userDetails.lastName}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
    ) || [];

  // Fetch pending requests count for all classes
  const fetchPendingRequestsCount = useCallback(async () => {
    try {
      const requests = await classJoinRequestService.getPendingRequests(
        classData._id
      );
      setPendingRequestsCount(requests?.length || 0);
    } catch (error) {
      console.error("Error fetching pending requests count:", error);
      setPendingRequestsCount(0);
    }
  }, [classData._id]);

  useEffect(() => {
    fetchPendingRequestsCount();
  }, [fetchPendingRequestsCount]);

  const handleRemoveStudent = async (student) => {
    setDeletePrompt({
      isOpen: true,
      student: student,
      isLoading: false,
    });
  };

  const handleViewAttendance = (student) => {
    setSelectedStudent(student);
  };

  const handleViewProfile = (student) => {
    setSelectedUserForProfile(student);
    setShowUserProfile(true);
  };

  const handleCloseUserProfile = () => {
    setShowUserProfile(false);
    setSelectedUserForProfile(null);
  };

  const confirmRemoveStudent = async () => {
    if (!deletePrompt.student) return;

    setDeletePrompt((prev) => ({ ...prev, isLoading: true }));

    try {
      const result = await classService.removeStudentFromClass(
        classData._id,
        deletePrompt.student._id
      );
      if (result.success) {
        // Close the delete prompt
        setDeletePrompt({
          isOpen: false,
          student: null,
          isLoading: false,
        });
        // Refresh the class data
        if (onRefresh) {
          onRefresh();
        }
      }
    } catch (error) {
      console.error("Error removing student:", error);
      setDeletePrompt((prev) => ({ ...prev, isLoading: false }));
      // TODO: Show error toast/alert
    }
  };

  const cancelRemoveStudent = () => {
    setDeletePrompt({
      isOpen: false,
      student: null,
      isLoading: false,
    });
  };

  const handleStudentsAdded = () => {
    // Refresh the class data after students are added
    if (onRefresh) {
      onRefresh();
    }
  };

  const handleRequestProcessed = () => {
    // Refresh pending requests count and class data
    fetchPendingRequestsCount();
    if (onRefresh) {
      onRefresh();
    }
  };

  // Show Add Students Card
  if (showAddStudents) {
    return (
      <AddStudentsCard
        classData={classData}
        onClose={() => setShowAddStudents(false)}
        onStudentsAdded={handleStudentsAdded}
      />
    );
  }

  // Show Pending Requests Card
  if (showPendingRequests) {
    return (
      <PendingRequestsCard
        classData={classData}
        onClose={() => setShowPendingRequests(false)}
        onRequestProcessed={handleRequestProcessed}
      />
    );
  }

  // Show Individual Student Attendance
  if (selectedStudent) {
    return (
      <VStack align="stretch" spacing={6}>
        <Button
          variant="ghost"
          onClick={() => setSelectedStudent(null)}
          alignSelf="flex-start"
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          _hover={{ color: "#0d9488" }}
        >
          <HStack spacing="2">
            <LuArrowLeft color="#0d9488" size="16" />
            <Text>Back to Members</Text>
          </HStack>
        </Button>

        <StudentIndividualAttendanceCard
          student={selectedStudent}
          classData={classData}
          onBack={() => setSelectedStudent(null)}
        />
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header Section - Mobile Responsive */}
      <VStack align="stretch" spacing={4}>
        <VStack align="start" spacing={1}>
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            fontWeight="semibold"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Class Members
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            color={colorMode === "dark" ? "gray.400" : "gray.600"}
          >
            Manage students enrolled in this class
          </Text>
        </VStack>

        {/* Mobile: Stack buttons vertically, Desktop: Horizontal */}
        <Box
          overflowX="auto"
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
          }}
        >
          <HStack spacing={3} minW="max-content">
            <Button
              size={{ base: "sm", md: "md" }}
              bg="#0d9488"
              color="white"
              _hover={{
                bg: "#0f766e",
              }}
              _active={{
                bg: "#134e4a",
              }}
              leftIcon={<LuUserPlus />}
              onClick={() => setShowAddStudents(true)}
              fontSize={{ base: "sm", md: "md" }}
              px={{ base: "3", md: "4" }}
            >
              <Text display={{ base: "none", sm: "block" }}>Add Students</Text>
              <Text display={{ base: "block", sm: "none" }}>Add</Text>
            </Button>
            <Button
              size={{ base: "sm", md: "md" }}
              bg="white"
              color="#0d9488"
              borderWidth="1px"
              borderColor="#0d9488"
              _hover={{
                bg: "#f0fdfa",
                borderColor: "#0f766e",
              }}
              leftIcon={<LuClipboardList />}
              onClick={() => setShowPendingRequests(true)}
              fontSize={{ base: "sm", md: "md" }}
              px={{ base: "3", md: "4" }}
            >
              <Text display={{ base: "none", sm: "block" }}>
                Pending Requests
              </Text>
              <Text display={{ base: "block", sm: "none" }}>Requests</Text>
              {pendingRequestsCount > 0 && (
                <Badge
                  ml={2}
                  colorPalette="red"
                  variant="solid"
                  borderRadius="full"
                  px={2}
                  py={1}
                  fontSize="xs"
                >
                  {pendingRequestsCount}
                </Badge>
              )}
            </Button>
          </HStack>
        </Box>
      </VStack>

      {/* Search Bar */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
      >
        <Card.Body p="4">
          <InputGroup startElement={<LuSearch />}>
            <Input
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              color={colorMode === "dark" ? "white" : "gray.900"}
              _placeholder={{
                color: colorMode === "dark" ? "gray.400" : "gray.500",
              }}
            />
          </InputGroup>
        </Card.Body>
      </Card.Root>

      {/* Enrolled Students */}
      {filteredStudents.length > 0 ? (
        showMobileCards ? (
          // Mobile Card View
          <VStack spacing="4" align="stretch">
            <Text
              fontWeight="semibold"
              color={colorMode === "dark" ? "white" : "gray.900"}
              fontSize={{ base: "md", md: "lg" }}
              px="2"
            >
              Enrolled Students ({filteredStudents.length})
            </Text>
            {filteredStudents.map((student) => (
              <Card.Root
                key={student._id}
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                shadow={colorMode === "dark" ? "lg" : "sm"}
                _hover={{
                  borderColor: colorMode === "dark" ? "gray.600" : "gray.300",
                  shadow: "md",
                  cursor: "pointer",
                }}
                onClick={() => handleViewProfile(student)}
              >
                <Card.Body p="4">
                  <VStack spacing="3" align="stretch">
                    {/* Header with Avatar and Actions */}
                    <Flex justify="space-between" align="start">
                      <HStack spacing="3" flex="1" minW="0">
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
                        <VStack align="start" spacing="1" flex="1" minW="0">
                          <Text
                            fontWeight="semibold"
                            fontSize="md"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            isTruncated
                          >
                            {student.userDetails
                              ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                              : "Name not set"}
                          </Text>
                          <Text
                            fontSize="sm"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                          >
                            Student
                          </Text>
                        </VStack>
                      </HStack>
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.500"
                            }
                            _hover={{
                              bg:
                                colorMode === "dark" ? "gray.700" : "gray.100",
                              color:
                                colorMode === "dark" ? "gray.200" : "gray.700",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FaEllipsisV />
                          </IconButton>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content
                              bg={colorMode === "dark" ? "gray.800" : "white"}
                              borderColor={
                                colorMode === "dark" ? "gray.700" : "gray.200"
                              }
                              shadow="lg"
                            >
                              <Menu.Item
                                value="view"
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                                _hover={{
                                  bg:
                                    colorMode === "dark"
                                      ? "gray.700"
                                      : "gray.50",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProfile(student);
                                }}
                              >
                                <LuEye
                                  color={
                                    colorMode === "dark" ? "white" : "#374151"
                                  }
                                />
                                View Profile
                              </Menu.Item>
                              <Menu.Item
                                value="attendance"
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                                _hover={{
                                  bg:
                                    colorMode === "dark"
                                      ? "gray.700"
                                      : "gray.50",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewAttendance(student);
                                }}
                              >
                                <LuChartNoAxesColumnIncreasing
                                  color={
                                    colorMode === "dark" ? "white" : "#374151"
                                  }
                                />
                                View Attendance
                              </Menu.Item>
                              <Menu.Item
                                value="remove"
                                color="red.500"
                                _hover={{
                                  bg:
                                    colorMode === "dark" ? "red.900" : "red.50",
                                  color: "red.600",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveStudent(student);
                                }}
                              >
                                <LuUserX color="#ef4444" />
                                Remove from Class
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    </Flex>

                    {/* Contact Information */}
                    <VStack align="start" spacing="2" pl="1">
                      <HStack spacing="2">
                        <LuMail
                          size={16}
                          color={colorMode === "dark" ? "#9ca3af" : "#6b7280"}
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
                        <HStack spacing="2">
                          <LuPhone
                            size={16}
                            color={colorMode === "dark" ? "#9ca3af" : "#6b7280"}
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
          </VStack>
        ) : (
          // Desktop Table View
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            shadow={colorMode === "dark" ? "lg" : "sm"}
          >
            <Card.Header
              p="4"
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack justify="space-between">
                <Text
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Enrolled Students ({filteredStudents.length})
                </Text>
              </HStack>
            </Card.Header>
            <Box bg={colorMode === "dark" ? "gray.800" : "white"}>
              <Table.Root variant="simple">
                <Table.Header
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                >
                  <Table.Row>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    >
                      Student
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    >
                      Email
                    </Table.ColumnHeader>
                    <Table.ColumnHeader
                      color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    >
                      Phone
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
                  {filteredStudents.map((student) => (
                    <Table.Row
                      key={student._id}
                      bg={colorMode === "dark" ? "gray.800" : "white"}
                      _hover={{
                        bg: colorMode === "dark" ? "gray.600" : "gray.50",
                        cursor: "pointer",
                      }}
                      onClick={() => handleViewProfile(student)}
                    >
                      <Table.Cell>
                        <HStack>
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
                          <VStack align="start" spacing={0} minW="0" flex="1">
                            <Text
                              fontWeight="medium"
                              color={colorMode === "dark" ? "white" : "black"}
                              isTruncated
                            >
                              {student.userDetails
                                ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                : "Name not set"}
                            </Text>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.600"
                              }
                            >
                              Student
                            </Text>
                          </VStack>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <HStack>
                          <LuMail
                            size={16}
                            color={colorMode === "dark" ? "#d1d5db" : "#6b7280"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.600"
                            }
                            isTruncated
                          >
                            {student.email}
                          </Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        {student.userDetails?.phoneNumber ? (
                          <HStack>
                            <LuPhone
                              size={16}
                              color={
                                colorMode === "dark" ? "#d1d5db" : "#6b7280"
                              }
                            />
                            <Text
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.600"
                              }
                            >
                              {student.userDetails.phoneNumber}
                            </Text>
                          </HStack>
                        ) : (
                          <Text
                            color={
                              colorMode === "dark" ? "gray.500" : "gray.400"
                            }
                          >
                            Not provided
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Menu.Root>
                          <Menu.Trigger asChild>
                            <IconButton
                              size="xs"
                              variant="ghost"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.500"
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
                                bg={colorMode === "dark" ? "gray.800" : "white"}
                                borderColor={
                                  colorMode === "dark" ? "gray.700" : "gray.200"
                                }
                                shadow="lg"
                              >
                                <Menu.Item
                                  value="view"
                                  color={
                                    colorMode === "dark" ? "white" : "gray.900"
                                  }
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "gray.50",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProfile(student);
                                  }}
                                >
                                  <LuEye
                                    color={
                                      colorMode === "dark" ? "white" : "#374151"
                                    }
                                  />
                                  View Profile
                                </Menu.Item>
                                <Menu.Item
                                  value="attendance"
                                  color={
                                    colorMode === "dark" ? "white" : "gray.900"
                                  }
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "gray.50",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewAttendance(student);
                                  }}
                                >
                                  <LuChartNoAxesColumnIncreasing
                                    color={
                                      colorMode === "dark" ? "white" : "#374151"
                                    }
                                  />
                                  View Attendance
                                </Menu.Item>
                                <Menu.Item
                                  value="remove"
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
                                    handleRemoveStudent(student);
                                  }}
                                >
                                  <LuUserX color="#ef4444" />
                                  Remove from Class
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
          </Card.Root>
        )
      ) : (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>
              {classData.enrolledStudents?.length === 0
                ? "No Students Enrolled!"
                : "No students found"}
            </Alert.Title>
            <Alert.Description>
              {classData.enrolledStudents?.length === 0 ? (
                <>
                  No students have enrolled in this class yet.
                  {classData.visibility === "open" &&
                    " Students can join automatically."}
                  {classData.visibility === "unlisted" &&
                    " You can manually add students."}
                  {classData.visibility === "request_to_join" &&
                    " Students can request to join."}
                </>
              ) : (
                "Try adjusting your search terms."
              )}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      {/* Delete Confirmation Prompt */}
      <DeletePrompt
        isOpen={deletePrompt.isOpen}
        onClose={cancelRemoveStudent}
        onConfirm={confirmRemoveStudent}
        title="Remove Student from Class"
        description="Are you sure you want to remove this student from the class? They will lose access to all class materials and attendance records."
        itemName={
          deletePrompt.student?.userDetails
            ? `${deletePrompt.student.userDetails.firstName} ${deletePrompt.student.userDetails.lastName}`
            : deletePrompt.student?.email || ""
        }
        isLoading={deletePrompt.isLoading}
        confirmText="Remove Student"
        cancelText="Cancel"
      />

      {/* View User Profile Modal */}
      <ViewUserCard
        isOpen={showUserProfile}
        onClose={handleCloseUserProfile}
        user={selectedUserForProfile}
      />
    </VStack>
  );
};

export default Members;
