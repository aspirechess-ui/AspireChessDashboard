import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Textarea,
  Alert,
  Dialog,
  Portal,
  Switch,
  SimpleGrid,
} from "@chakra-ui/react";
import { Field } from "../../../components/ui/field";
import {
  LuUsers,
  LuCalendar,
  LuFile,
  LuPlus,
  LuX,
  LuSettings,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import batchService from "../../../services/batches";

const CreateBatchCard = ({ isOpen, onClose, onSubmit }) => {
  const { colorMode } = useColorMode();
  const [formData, setFormData] = useState({
    batchName: "",
    description: "",
    hasStudentLimit: false,
    maxStudents: 30,
    academicYear: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.batchName.trim()) {
      newErrors.batchName = "Batch name is required";
    } else if (formData.batchName.length > 100) {
      newErrors.batchName = "Batch name cannot exceed 100 characters";
    }

    if (!formData.academicYear.trim()) {
      newErrors.academicYear = "Academic year is required";
    }

    if (formData.hasStudentLimit) {
      if (!formData.maxStudents || formData.maxStudents < 1) {
        newErrors.maxStudents = "Maximum students must be at least 1";
      } else if (formData.maxStudents > 1000) {
        newErrors.maxStudents = "Maximum students cannot exceed 1000";
      }
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = {
        batchName: formData.batchName,
        description: formData.description,
        hasStudentLimit: formData.hasStudentLimit,
        academicYear: formData.academicYear,
      };

      // Only include maxStudents if hasStudentLimit is true
      if (formData.hasStudentLimit) {
        submitData.maxStudents = formData.maxStudents;
      }

      console.log("Sending batch data:", submitData);
      const response = await batchService.createBatch(submitData);

      if (response.success) {
        // Reset form
        setFormData({
          batchName: "",
          description: "",
          hasStudentLimit: false,
          maxStudents: 30,
          academicYear: "",
        });
        setErrors({});

        // Call parent callback
        onSubmit();
        handleClose();
      }
    } catch (error) {
      console.error("Error creating batch:", error);
      setErrors({
        submit: error.message || "Failed to create batch. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Common input styling for consistent dark/light mode appearance
  const inputStyles = {
    color: colorMode === "dark" ? "white" : "gray.900",
    bg: colorMode === "dark" ? "gray.700" : "white",
    borderColor: colorMode === "dark" ? "gray.600" : "gray.300",
    _placeholder: {
      color: colorMode === "dark" ? "gray.400" : "gray.500",
    },
    _focus: {
      borderColor: "#0d9488",
      boxShadow: `0 0 0 1px #0d9488`,
    },
    _hover: {
      borderColor: colorMode === "dark" ? "gray.500" : "gray.400",
    },
  };

  const handleClose = () => {
    setFormData({
      batchName: "",
      description: "",
      hasStudentLimit: false,
      maxStudents: 30,
      academicYear: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => !open && handleClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            maxW={{ base: "95vw", md: "3xl" }}
            maxH={{ base: "90vh", md: "85vh" }}
            mx="4"
            overflow="hidden"
          >
            <Dialog.Header
              pb="4"
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack justify="space-between" align="center">
                <HStack spacing="3">
                  <Box
                    p="2"
                    bg={colorMode === "dark" ? "teal.900" : "teal.50"}
                    rounded="md"
                    color={colorMode === "dark" ? "teal.300" : "teal.600"}
                  >
                    <LuPlus />
                  </Box>
                  <VStack align="start" spacing="1">
                    <Dialog.Title
                      fontSize="lg"
                      fontWeight="semibold"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      Create New Batch
                    </Dialog.Title>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    >
                      Add a new batch for student enrollment
                    </Text>
                  </VStack>
                </HStack>
                <Button
                  size="sm"
                  variant="ghost"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  onClick={handleClose}
                >
                  <LuX />
                </Button>
              </HStack>
            </Dialog.Header>

            <Dialog.Body py="6" overflowY="auto">
              <VStack spacing="6" align="stretch">
                {/* Submit Error */}
                {errors.submit && (
                  <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{errors.submit}</Alert.Title>
                    </Alert.Content>
                  </Alert.Root>
                )}

                {/* Basic Information */}
                <Box>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb="4"
                  >
                    Basic Information
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                    <Field
                      required
                      invalid={!!errors.batchName}
                      label={
                        <HStack>
                          <LuUsers
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Batch Name *
                          </Text>
                        </HStack>
                      }
                      errorText={errors.batchName}
                    >
                      <Input
                        value={formData.batchName}
                        onChange={(e) =>
                          handleInputChange("batchName", e.target.value)
                        }
                        placeholder="e.g., Advanced Chess 2025"
                        {...inputStyles}
                      />
                    </Field>

                    <Field
                      required
                      invalid={!!errors.academicYear}
                      label={
                        <HStack>
                          <LuCalendar
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Academic Year *
                          </Text>
                        </HStack>
                      }
                      helperText="Put the academic year in the YYYY-YYYY format, eg 2025-2026"
                      errorText={errors.academicYear}
                    >
                      <Input
                        value={formData.academicYear}
                        onChange={(e) =>
                          handleInputChange("academicYear", e.target.value)
                        }
                        placeholder="e.g., 2025-2026"
                        {...inputStyles}
                      />
                    </Field>
                  </SimpleGrid>
                </Box>

                {/* Student Limit Configuration */}
                <Box>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb="4"
                  >
                    Student Limit Configuration
                  </Text>
                  <VStack spacing="4" align="stretch">
                    <Field
                      label={
                        <HStack>
                          <LuSettings
                            color={colorMode === "dark" ? "white" : "gray.500"}
                          />
                          <Text
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Set Maximum Student Limit
                          </Text>
                        </HStack>
                      }
                      helperText="Enable this to set a maximum number of students for this batch"
                    >
                      <HStack spacing="3">
                        <Switch.Root
                          checked={formData.hasStudentLimit}
                          onCheckedChange={(details) =>
                            handleInputChange(
                              "hasStudentLimit",
                              details.checked
                            )
                          }
                        >
                          <Switch.HiddenInput />
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                        </Switch.Root>
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                          fontSize="sm"
                        >
                          {formData.hasStudentLimit ? "Enabled" : "Disabled"}
                        </Text>
                      </HStack>
                    </Field>

                    {/* Max Students - Only show if toggle is enabled */}
                    {formData.hasStudentLimit && (
                      <Field
                        required
                        invalid={!!errors.maxStudents}
                        label={
                          <HStack>
                            <LuUsers
                              color={
                                colorMode === "dark" ? "white" : "gray.500"
                              }
                            />
                            <Text
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                            >
                              Maximum Students *
                            </Text>
                          </HStack>
                        }
                        errorText={errors.maxStudents}
                        helperText="Set the maximum number of students allowed in this batch"
                      >
                        <Input
                          type="number"
                          value={formData.maxStudents}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleInputChange(
                              "maxStudents",
                              value === "" ? "" : parseInt(value) || 0
                            );
                          }}
                          placeholder="e.g., 30"
                          min={1}
                          max={1000}
                          {...inputStyles}
                        />
                      </Field>
                    )}
                  </VStack>
                </Box>

                {/* Additional Information */}
                <Box>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb="4"
                  >
                    Additional Information
                  </Text>
                  <Field
                    invalid={!!errors.description}
                    label={
                      <HStack>
                        <LuFile
                          color={colorMode === "dark" ? "white" : "gray.500"}
                        />
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Description (Optional)
                        </Text>
                      </HStack>
                    }
                    helperText={`${formData.description.length}/500 characters`}
                    errorText={errors.description}
                  >
                    <Textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Brief description of the batch..."
                      rows={3}
                      {...inputStyles}
                    />
                  </Field>
                </Box>

                {/* Info Box */}
                <Box
                  p="4"
                  bg={colorMode === "dark" ? "blue.900" : "blue.50"}
                  borderColor={colorMode === "dark" ? "blue.700" : "blue.200"}
                  borderWidth="1px"
                  rounded="md"
                >
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "blue.200" : "blue.800"}
                    fontWeight="medium"
                    mb="2"
                  >
                    📝 Note:
                  </Text>
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "blue.300" : "blue.700"}
                  >
                    A unique signup code will be automatically generated for
                    this batch. Students can use this code to register and will
                    be automatically assigned to this batch.
                  </Text>
                </Box>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              pt="4"
              borderTopWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack
                spacing="3"
                w="full"
                justify="end"
                flexDirection={{ base: "column-reverse", sm: "row" }}
              >
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  w={{ base: "full", sm: "auto" }}
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                >
                  Cancel
                </Button>
                <Button
                  colorPalette="teal"
                  onClick={handleSubmit}
                  loading={loading}
                  loadingText="Creating..."
                  w={{ base: "full", sm: "auto" }}
                  leftIcon={<LuPlus />}
                >
                  Create Batch
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CreateBatchCard;
