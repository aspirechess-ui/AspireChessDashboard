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
  Spinner,
  Center,
  Alert,
  Breadcrumb,
} from "@chakra-ui/react";
import {
  LuUsers,
  LuArrowLeft,
  LuChevronRight,
  LuClipboardList,
  LuEye,
  LuMegaphone,
  LuSettings,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import classService from "../../../services/classes.js";
import AttendanceRecordTable from "./classPages/AttendanceRecord.jsx";
import MarkAttendanceCard from "./MarkAttendanceCard.jsx";
import Members from "./classPages/Members.jsx";
import ClassAnnouncement from "./classPages/ClassAnnouncement.jsx";
import MainClassSettings from "./classPages/MainClassSettings.jsx";
import ViewAttendance from "./classPages/ViewAttendance.jsx";

const ViewClass = () => {
  const { colorMode } = useColorMode();
  const { batchName, className } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState(null);
  const [alert] = useState(null); // For success/error alerts

  // Get classId from location state if available
  const classId = location.state?.classId;

  const fetchClassData = useCallback(async () => {
    try {
      setLoading(true);

      // Try to get class by name and batch first
      let response;
      if (batchName && className) {
        response = await classService.getClassByName(batchName, className);
      } else if (classId) {
        // Fallback to ID if available
        response = await classService.getClass(classId);
      } else {
        throw new Error("No class identifier provided");
      }

      if (response.success) {
        console.log("Class data received:", response.data);
        console.log(
          "Current enrolled students count:",
          response.data.data?.currentEnrolledStudents
        );
        console.log(
          "Enrolled students array length:",
          response.data.data?.enrolledStudents?.length
        );
        setClassData(response.data.data);
        setError(null);
      } else {
        throw new Error(response.message || "Failed to fetch class data");
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
      setError(error.message || "Failed to fetch class data");
    } finally {
      setLoading(false);
    }
  }, [batchName, className, classId]);

  useEffect(() => {
    if ((batchName && className) || classId) {
      fetchClassData();
    }
  }, [batchName, className, classId, fetchClassData]);

  const handleBackToBatch = () => {
    const encodedBatchName = encodeURIComponent(batchName);
    navigate(`/teacher/classes/batch/${encodedBatchName}`);
  };

  const getVisibilityColor = (visibility) => {
    switch (visibility) {
      case "open":
        return "green";
      case "unlisted":
        return "orange";
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
          <Text>Loading class data...</Text>
        </VStack>
      </Center>
    );
  }

  if (error || !classData) {
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
              <Alert.Title>Class Not Found!</Alert.Title>
              <Alert.Description>
                {error ||
                  "The requested class could not be found or you don't have permission to view it."}
              </Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <Button
            variant="outline"
            onClick={handleBackToBatch}
            color={colorMode === "dark" ? "gray.300" : "gray.700"}
            borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
          >
            <HStack spacing="2">
              <LuArrowLeft />
              <Text>Back to Batch</Text>
            </HStack>
          </Button>
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
      <VStack align="stretch" spacing={6}>
        {/* Breadcrumb Navigation */}
        <Box>
          <Breadcrumb.Root
            fontSize="sm"
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
          >
            <Breadcrumb.List gap="2">
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  onClick={() => navigate("/teacher/classes")}
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
                <Breadcrumb.Link
                  onClick={handleBackToBatch}
                  cursor="pointer"
                  _hover={{ color: "#0d9488" }}
                >
                  {classData.linkedBatch?.batchName || batchName}
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
                  {classData.className}
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
          onClick={handleBackToBatch}
          mb="4"
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          _hover={{ color: "#0d9488" }}
          alignSelf="flex-start"
        >
          <HStack spacing="2">
            <LuArrowLeft color="#0d9488" size="16" />
            <Text>Back to {classData.linkedBatch?.batchName || "Batch"}</Text>
          </HStack>
        </Button>

        {/* Header */}
        <Box>
          <HStack spacing={3} mb={2}>
            <Heading
              size="lg"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              {classData.className}
            </Heading>
            <Badge colorPalette={getVisibilityColor(classData.visibility)}>
              {getVisibilityText(classData.visibility)}
            </Badge>
          </HStack>

          {classData.description && (
            <Text color={colorMode === "dark" ? "gray.300" : "gray.600"} mb={3}>
              {classData.description}
            </Text>
          )}

          <HStack
            spacing={1}
            fontSize="sm"
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
          >
            <LuUsers size={16} />
            <Text>
              {classData.currentEnrolledStudents || 0} /{" "}
              {classData.maxStudents || "∞"} students
            </Text>
          </HStack>
        </Box>

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
              <LuEye />
              Attendance Records
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
              <LuClipboardList />
              View Attendance
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
              Members
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === 3
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === 3 ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab(3)}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === 3
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === 3
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === 3
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
              <LuMegaphone />
              Announcements
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === 4
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === 4 ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab(4)}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === 4
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === 4
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === 4
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
              <LuSettings />
              Class Settings
            </Button>
          </HStack>
        </Box>

        {/* Tab Content */}
        <Box mt="6">
          {/* Attendance Record Tab */}
          {activeTab === 0 && (
            <VStack align="stretch" spacing={6}>
              <AttendanceRecordTable
                classId={classData?._id || classId}
                classData={classData}
              />
            </VStack>
          )}

          {/* View Attendance Tab */}
          {activeTab === 1 && <ViewAttendance classData={classData} />}

          {/* Members Tab */}
          {activeTab === 2 && (
            <Members classData={classData} onRefresh={fetchClassData} />
          )}

          {/* Announcements Tab */}
          {activeTab === 3 && <ClassAnnouncement classData={classData} />}

          {/* Class Settings Tab */}
          {activeTab === 4 && (
            <MainClassSettings
              classData={classData}
              onUpdate={(updatedData) => {
                setClassData((prev) => ({ ...prev, ...updatedData }));
                // Optionally show success message
              }}
              onDelete={() => {
                // Navigate back to batch view after deletion
                handleBackToBatch();
              }}
            />
          )}
        </Box>
      </VStack>
    </Box>
  );
};

export default ViewClass;
