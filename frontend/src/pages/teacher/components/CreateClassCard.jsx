import React, { useState, useEffect } from "react";
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
  Select,
  createListCollection,
} from "@chakra-ui/react";
import { Field } from "../../../components/ui/field";
import {
  LuUsers,
  LuCalendar,
  LuFile,
  LuPlus,
  LuX,
  LuSettings,
  LuEye,
  LuEyeOff,
  LuUserCheck,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import classService from "../../../services/classes";
import batchService from "../../../services/batches";

const CreateClassCard = ({ isOpen, onClose, onSubmit, batchId = null }) => {
  const { colorMode } = useColorMode();
  const [formData, setFormData] = useState({
    className: "",
    description: "",
    linkedBatch: "",
    visibility: "open",
    hasStudentLimit: false,
    maxStudents: 30,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [batches, setBatches] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Fetch available batches when component mounts (only if no specific batchId is provided)
  useEffect(() => {
    if (isOpen && !batchId) {
      fetchBatches();
    } else if (isOpen && batchId) {
      // If a specific batchId is provided, set it as the selected batch
      setFormData((prev) => ({
        ...prev,
        linkedBatch: batchId,
      }));
    }
  }, [isOpen, batchId]);

  const fetchBatches = async () => {
    setLoadingBatches(true);
    try {
      const response = await batchService.getBatchesForTeacher({ limit: 100 });
      if (response.success) {
        setBatches(response.data.batches || []);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      setErrors({
        batches: "Failed to load batches. Please try again.",
      });
    } finally {
      setLoadingBatches(false);
    }
  };

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

    if (!formData.className.trim()) {
      newErrors.className = "Class name is required";
    } else if (formData.className.length > 100) {
      newErrors.className = "Class name cannot exceed 100 characters";
    }

    if (!formData.linkedBatch && !batchId) {
      newErrors.linkedBatch = "Please select a batch";
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
        className: formData.className,
        description: formData.description,
        linkedBatch: batchId || formData.linkedBatch,
        visibility: formData.visibility,
        hasStudentLimit: formData.hasStudentLimit,
      };

      // Only include maxStudents if hasStudentLimit is true
      if (formData.hasStudentLimit) {
        submitData.maxStudents = parseInt(formData.maxStudents) || 30;
      }
      // Don't include maxStudents if hasStudentLimit is false (unlimited)

      console.log("Sending class data:", submitData);
      const response = await classService.createClass(submitData);

      if (response.success) {
        // Reset form
        setFormData({
          className: "",
          description: "",
          linkedBatch: "",
          visibility: "open",
          hasStudentLimit: false,
          maxStudents: 30,
        });
        setErrors({});

        // Call parent callback
        onSubmit();
        handleClose();
      }
    } catch (error) {
      console.error("Error creating class:", error);
      setErrors({
        submit: error.message || "Failed to create class. Please try again.",
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
      className: "",
      description: "",
      linkedBatch: "",
      visibility: "open",
      hasStudentLimit: false,
      maxStudents: 30,
    });
    setErrors({});
    onClose();
  };

  const getVisibilityIcon = (visibility) => {
    const iconColor = colorMode === "dark" ? "white" : "gray.600";
    switch (visibility) {
      case "open":
        return <LuEye color={iconColor} />;
      case "unlisted":
        return <LuEyeOff color={iconColor} />;
      case "request_to_join":
        return <LuUserCheck color={iconColor} />;
      default:
        return <LuEye color={iconColor} />;
    }
  };

  const getVisibilityDescription = (visibility) => {
    switch (visibility) {
      case "open":
        return "Anyone can join this class";
      case "unlisted":
        return "Only people with the link can join";
      case "request_to_join":
        return "Students must request to join";
      default:
        return "";
    }
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
                      Create New Class
                    </Dialog.Title>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    >
                      Add a new class for student enrollment
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

                {/* Batch Loading Error */}
                {errors.batches && (
                  <Alert.Root status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{errors.batches}</Alert.Title>
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
                      invalid={!!errors.className}
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
                            Class Name
                          </Text>
                        </HStack>
                      }
                      errorText={errors.className}
                    >
                      <Input
                        value={formData.className}
                        onChange={(e) =>
                          handleInputChange("className", e.target.value)
                        }
                        placeholder="e.g., Advanced Chess Tactics"
                        {...inputStyles}
                      />
                    </Field>

                    {!batchId && (
                      <Field
                        required
                        invalid={!!errors.linkedBatch}
                        label={
                          <HStack>
                            <LuCalendar
                              color={
                                colorMode === "dark" ? "white" : "gray.500"
                              }
                            />
                            <Text
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                            >
                              Select Batch *
                            </Text>
                          </HStack>
                        }
                        helperText="Choose which batch this class belongs to"
                        errorText={errors.linkedBatch}
                      >
                        <Select.Root
                          collection={createListCollection({
                            items: batches.map((batch) => ({
                              label: `${batch.batchName} (${batch.academicYear})`,
                              value: batch._id,
                            })),
                          })}
                          value={
                            formData.linkedBatch ? [formData.linkedBatch] : []
                          }
                          onValueChange={(details) =>
                            handleInputChange(
                              "linkedBatch",
                              details.value[0] || ""
                            )
                          }
                          disabled={loadingBatches}
                          size="sm"
                          width="100%"
                        >
                          <Select.HiddenSelect />
                          <Select.Label
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.700"
                            }
                          >
                            Select Batch
                          </Select.Label>
                          <Select.Control
                            bg={colorMode === "dark" ? "gray.700" : "white"}
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.300"
                            }
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            _hover={{
                              borderColor:
                                colorMode === "dark" ? "gray.500" : "gray.400",
                            }}
                            _focus={{
                              borderColor: "#0d9488",
                              boxShadow: `0 0 0 1px #0d9488`,
                            }}
                          >
                            <Select.Trigger>
                              <Select.ValueText
                                placeholder={
                                  loadingBatches
                                    ? "Loading batches..."
                                    : "Select a batch"
                                }
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              />
                            </Select.Trigger>
                            <Select.IndicatorGroup>
                              <Select.Indicator
                                color={
                                  colorMode === "dark" ? "gray.300" : "gray.500"
                                }
                              />
                            </Select.IndicatorGroup>
                          </Select.Control>
                          <Select.Positioner>
                            <Select.Content
                              zIndex={9999}
                              bg={colorMode === "dark" ? "gray.800" : "white"}
                              borderColor={
                                colorMode === "dark" ? "gray.700" : "gray.200"
                              }
                              shadow="lg"
                            >
                              {batches.map((batch) => (
                                <Select.Item
                                  key={batch._id}
                                  item={{
                                    label: `${batch.batchName} (${batch.academicYear})`,
                                    value: batch._id,
                                  }}
                                  color={
                                    colorMode === "dark" ? "white" : "gray.900"
                                  }
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "gray.50",
                                  }}
                                >
                                  <HStack spacing="2">
                                    <LuCalendar
                                      color={
                                        colorMode === "dark"
                                          ? "white"
                                          : "gray.600"
                                      }
                                    />
                                    <Text
                                      color={
                                        colorMode === "dark"
                                          ? "white"
                                          : "gray.900"
                                      }
                                    >
                                      {batch.batchName} ({batch.academicYear})
                                    </Text>
                                  </HStack>
                                  <Select.ItemIndicator />
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select.Positioner>
                        </Select.Root>
                      </Field>
                    )}
                  </SimpleGrid>
                </Box>

                {/* Class Visibility */}
                <Box>
                  <Text
                    fontSize="md"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb="4"
                  >
                    Visibility Settings
                  </Text>
                  <Field
                    label={
                      <HStack>
                        {getVisibilityIcon(formData.visibility)}
                        <Text
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          Visibility Setting
                        </Text>
                      </HStack>
                    }
                    helperText={getVisibilityDescription(formData.visibility)}
                  >
                    <Select.Root
                      collection={createListCollection({
                        items: [
                          { label: "Open - Anyone can join", value: "open" },
                          {
                            label: "Unlisted - Only with link",
                            value: "unlisted",
                          },
                          {
                            label: "Request to Join - Approval needed",
                            value: "request_to_join",
                          },
                        ],
                      })}
                      value={[formData.visibility]}
                      onValueChange={(details) =>
                        handleInputChange("visibility", details.value[0])
                      }
                      size="sm"
                      width="100%"
                    >
                      <Select.HiddenSelect />
                      <Select.Label
                        color={colorMode === "dark" ? "gray.300" : "gray.700"}
                      >
                        Visibility Setting
                      </Select.Label>
                      <Select.Control
                        bg={colorMode === "dark" ? "gray.700" : "white"}
                        borderColor={
                          colorMode === "dark" ? "gray.600" : "gray.300"
                        }
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        _hover={{
                          borderColor:
                            colorMode === "dark" ? "gray.500" : "gray.400",
                        }}
                        _focus={{
                          borderColor: "#0d9488",
                          boxShadow: `0 0 0 1px #0d9488`,
                        }}
                      >
                        <Select.Trigger>
                          <Select.ValueText
                            placeholder="Select visibility"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.500"
                            }
                          />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Select.Positioner>
                        <Select.Content
                          zIndex={9999}
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.700" : "gray.200"
                          }
                          shadow="lg"
                        >
                          <Select.Item
                            item={{
                              label: "Open - Anyone can join",
                              value: "open",
                            }}
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            _hover={{
                              bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            }}
                          >
                            <HStack spacing="2">
                              <LuEye
                                color={
                                  colorMode === "dark" ? "white" : "gray.600"
                                }
                              />
                              <Text
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Open - Anyone can join
                              </Text>
                            </HStack>
                            <Select.ItemIndicator />
                          </Select.Item>
                          <Select.Item
                            item={{
                              label: "Unlisted - Only with link",
                              value: "unlisted",
                            }}
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            _hover={{
                              bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            }}
                          >
                            <HStack spacing="2">
                              <LuEyeOff
                                color={
                                  colorMode === "dark" ? "white" : "gray.600"
                                }
                              />
                              <Text
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Unlisted - Only with link
                              </Text>
                            </HStack>
                            <Select.ItemIndicator />
                          </Select.Item>
                          <Select.Item
                            item={{
                              label: "Request to Join - Approval needed",
                              value: "request_to_join",
                            }}
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            _hover={{
                              bg: colorMode === "dark" ? "gray.700" : "gray.50",
                            }}
                          >
                            <HStack spacing="2">
                              <LuUserCheck
                                color={
                                  colorMode === "dark" ? "white" : "gray.600"
                                }
                              />
                              <Text
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Request to Join - Approval needed
                              </Text>
                            </HStack>
                            <Select.ItemIndicator />
                          </Select.Item>
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  </Field>
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
                      helperText="Enable this to set a maximum number of students for this class"
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
                        helperText="Set the maximum number of students allowed in this class"
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
                      placeholder="Brief description of the class..."
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
                    Students from the selected batch will be able to join this
                    class based on the visibility setting you choose. Once
                    created, the batch cannot be changed.
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
                  Create Class
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default CreateClassCard;
