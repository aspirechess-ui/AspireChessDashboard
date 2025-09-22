import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  Card,
  Badge,
  Heading,
} from "@chakra-ui/react";
import { LuTrash, LuUsers, LuEye, LuCalendar, LuLogOut } from "react-icons/lu";
import { useColorMode } from "../../../../../components/ui/color-mode";
import DeletePrompt from "../../../../../components/DeletePrompt";
import studentService from "../../../../../services/student";
import { useNavigate } from "react-router-dom";

const StudentClassSettings = ({ classData }) => {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleLeaveClass = async () => {
    try {
      setLeaveLoading(true);

      const response = await studentService.leaveClass(classData._id);

      if (response.success) {
        setAlert({
          type: "success",
          title: "Left Class Successfully",
          description: "You have been removed from this class.",
        });

        // Redirect to classes page after a delay
        setTimeout(() => {
          navigate("/student/classes");
        }, 1500);
      } else {
        setAlert({
          type: "error",
          title: "Failed to Leave Class",
          description:
            response.message || "An error occurred while leaving the class.",
        });
      }
    } catch (error) {
      console.error("Error leaving class:", error);
      setAlert({
        type: "error",
        title: "Error",
        description: "Failed to leave class. Please try again.",
      });
    } finally {
      setLeaveLoading(false);
      setShowLeaveConfirm(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  // Auto-hide alerts after 5 seconds
  React.useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (!classData) {
    return (
      <Box p="8" textAlign="center">
        <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
          No class data available
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Alert */}
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
            borderWidth="1px"
          >
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{alert.title}</Alert.Title>
              <Alert.Description>{alert.description}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}

        {/* Class Information */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Card.Header
            p="6"
            borderBottomWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Heading
              size="lg"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Class Information
            </Heading>
          </Card.Header>
          <Card.Body p="6">
            <VStack spacing={4} align="stretch">
              {/* Class Name */}
              <HStack justify="space-between" align="start">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  minW="120px"
                >
                  Class Name:
                </Text>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  fontWeight="medium"
                  flex="1"
                  textAlign="right"
                >
                  {classData.className}
                </Text>
              </HStack>

              {/* Description */}
              <HStack justify="space-between" align="start">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  minW="120px"
                >
                  Description:
                </Text>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  flex="1"
                  textAlign="right"
                >
                  {classData.description || "No description provided"}
                </Text>
              </HStack>

              {/* Visibility */}
              <HStack justify="space-between" align="center">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  minW="120px"
                >
                  Visibility:
                </Text>
                <Badge
                  colorPalette={getVisibilityColor(classData.visibility)}
                  variant="subtle"
                  size="sm"
                >
                  <HStack spacing={1}>
                    <LuEye
                      size={12}
                      color={colorMode === "dark" ? "#D1D5DB" : "#6B7280"}
                    />
                    <Text>{getVisibilityText(classData.visibility)}</Text>
                  </HStack>
                </Badge>
              </HStack>

              {/* Students */}
              <HStack justify="space-between" align="center">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  minW="120px"
                >
                  Students:
                </Text>
                <HStack spacing={1}>
                  <LuUsers
                    size={14}
                    color={colorMode === "dark" ? "#D1D5DB" : "#6B7280"}
                  />
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    fontWeight="medium"
                  >
                    {classData.currentEnrolledStudents || 0}
                    {classData.maxStudents && ` / ${classData.maxStudents}`}
                  </Text>
                </HStack>
              </HStack>

              {/* Created Date */}
              <HStack justify="space-between" align="center">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  minW="120px"
                >
                  Created:
                </Text>
                <HStack spacing={1}>
                  <LuCalendar
                    size={14}
                    color={colorMode === "dark" ? "#D1D5DB" : "#6B7280"}
                  />
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  >
                    {formatDate(classData.createdAt)}
                  </Text>
                </HStack>
              </HStack>

              {/* Status */}
              <HStack justify="space-between" align="center">
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  minW="120px"
                >
                  Status:
                </Text>
                <Badge
                  colorPalette={classData.isActive ? "green" : "red"}
                  variant="subtle"
                  size="sm"
                >
                  {classData.isActive ? "Active" : "Inactive"}
                </Badge>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Leave Class Section */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "red.700" : "red.200"}
        >
          <Card.Header
            p="6"
            borderBottomWidth="1px"
            borderColor={colorMode === "dark" ? "red.700" : "red.200"}
          >
            <Heading size="md" color="red.500">
              Leave Class
            </Heading>
          </Card.Header>
          <Card.Body p="6">
            <VStack spacing={4} align="stretch">
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                If you leave this class, you will no longer have access to its
                content, announcements, or attendance records. You would need to
                request to join again if the class requires approval.
              </Text>

              <Alert.Root status="warning">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>Warning</Alert.Title>
                  <Alert.Description>
                    This action cannot be undone. Make sure you want to leave
                    this class before proceeding.
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>

              <Button
                colorPalette="red"
                leftIcon={<LuLogOut />}
                onClick={() => setShowLeaveConfirm(true)}
                size="sm"
                alignSelf="start"
              >
                Leave Class
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Leave Class Confirmation Modal */}
        <DeletePrompt
          isOpen={showLeaveConfirm}
          onClose={() => setShowLeaveConfirm(false)}
          onConfirm={handleLeaveClass}
          title="Leave Class"
          description="Are you sure you want to leave this class? You will lose access to all class content and would need to request to join again."
          itemName={classData.className}
          isLoading={leaveLoading}
          confirmText="Leave Class"
          confirmButtonProps={{
            colorPalette: "red",
            leftIcon: <LuLogOut />,
          }}
        />
      </VStack>
    </Box>
  );
};

export default StudentClassSettings;
