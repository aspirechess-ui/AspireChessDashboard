import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  Card,
  Spinner,
} from "@chakra-ui/react";
import { LuSave, LuTrash } from "react-icons/lu";
import { useColorMode } from "../../../../components/ui/color-mode";
import ClassSettingsTable from "./ClassSettingsTable";
import classService from "../../../../services/classes.js";

const MainClassSettings = ({ classData, onUpdate, onDelete }) => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [formData, setFormData] = useState({
    className: classData?.className || "",
    description: classData?.description || "",
    visibility: classData?.visibility || "open",
    maxStudents: classData?.maxStudents || "",
    isActive: classData?.isActive !== false,
  });

  // Update form data when classData changes
  useEffect(() => {
    if (classData) {
      setFormData({
        className: classData.className || "",
        description: classData.description || "",
        visibility: classData.visibility || "open",
        maxStudents: classData.maxStudents || "",
        isActive: classData.isActive !== false,
      });
    }
  }, [classData]);

  const handleInputChange = (field, value) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.className?.trim()) {
      newErrors.className = "Class name is required";
    }

    if (!formData.visibility) {
      newErrors.visibility = "Visibility setting is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Validate before saving
    if (!validateForm()) {
      setAlert({
        type: "error",
        title: "Validation Error",
        description: "Please fix the errors below before saving.",
      });
      return;
    }

    try {
      setSaving(true);
      console.log("Updating class with data:", formData);

      // Prepare update data - only send fields that can be updated
      const updateData = {
        className: formData.className.trim(),
        description: formData.description?.trim() || "",
        visibility: formData.visibility,
        isActive: formData.isActive,
      };

      // Only include maxStudents if it has a value
      if (formData.maxStudents && formData.maxStudents > 0) {
        updateData.maxStudents = parseInt(formData.maxStudents);
      }

      const response = await classService.updateClass(
        classData._id,
        updateData
      );

      if (response.success) {
        setAlert({
          type: "success",
          title: "Settings Updated",
          description: "Class settings have been updated successfully.",
        });

        if (onUpdate) {
          onUpdate({ ...formData, ...response.data });
        }
      } else {
        throw new Error(response.message || "Failed to update class");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      setAlert({
        type: "error",
        title: "Update Failed",
        description:
          error.message || "Failed to update class settings. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      console.log("Deleting class:", classData._id);

      const response = await classService.deleteClass(classData._id);

      if (response.success) {
        setAlert({
          type: "success",
          title: "Class Deleted",
          description: "Class has been deleted successfully.",
        });

        // Wait a moment to show the success message before calling onDelete
        setTimeout(() => {
          if (onDelete) {
            onDelete();
          }
        }, 1500);
      } else {
        throw new Error(response.message || "Failed to delete class");
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      setAlert({
        type: "error",
        title: "Delete Failed",
        description:
          error.message || "Failed to delete class. Please try again.",
      });
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="50vh">
        <VStack spacing="4">
          <Spinner size="xl" color="teal.500" />
          <Text>Loading class settings...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <>
      <VStack spacing="6" align="stretch">
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

        {/* Class Settings Table */}
        <ClassSettingsTable
          classData={classData}
          formData={formData}
          handleInputChange={handleInputChange}
          errors={errors}
        />

        {/* Save Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            size="lg"
            bg="#0d9488"
            color="white"
            _hover={{
              bg: "#0f766e",
              transform: "translateY(-1px)",
            }}
            _active={{
              bg: "#134e4a",
              transform: "translateY(0)",
            }}
            shadow="lg"
            onClick={handleSave}
            loading={saving}
            loadingText="Saving..."
            px="8"
          >
            <LuSave />
            Save Settings
          </Button>
        </Box>

        {/* Danger Zone */}
        <Card.Root
          bg={colorMode === "dark" ? "red.900" : "red.50"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "red.700" : "red.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Header
            p="4"
            borderBottomWidth="1px"
            borderColor={colorMode === "dark" ? "red.700" : "red.200"}
          >
            <HStack>
              <LuTrash color="#EF4444" />
              <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "red.200" : "red.800"}
              >
                Danger Zone
              </Text>
            </HStack>
          </Card.Header>
          <Card.Body p="6">
            <VStack align="stretch" spacing={4}>
              {!showDeleteConfirm ? (
                <>
                  <Text color={colorMode === "dark" ? "red.300" : "red.700"}>
                    Deleting this class will permanently remove all associated
                    data including attendance records. This action cannot be
                    undone.
                  </Text>
                  <Button
                    leftIcon={<LuTrash />}
                    colorPalette="red"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    alignSelf="flex-start"
                  >
                    Delete Class
                  </Button>
                </>
              ) : (
                <>
                  <Alert.Root status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Are you absolutely sure?</Alert.Title>
                      <Alert.Description>
                        This will permanently delete the class "
                        {classData?.className}" and all its data. This action
                        cannot be undone.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                  <HStack spacing={4}>
                    <Button
                      leftIcon={<LuTrash />}
                      colorPalette="red"
                      onClick={handleDelete}
                      loading={loading}
                    >
                      Yes, Delete Class
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </HStack>
                </>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </>
  );
};

export default MainClassSettings;
