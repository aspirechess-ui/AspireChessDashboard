import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  Textarea,
  Card,
  Alert,
  Spinner,
  Badge,
  NativeSelect,
} from "@chakra-ui/react";
import {
  LuPlus,
  LuSend,
  LuX,
  LuMegaphone,
  LuUsers,
  LuGraduationCap,
  LuBookOpen,
} from "react-icons/lu";
import { Field } from "../../components/ui/field";
import { useColorMode } from "../../components/ui/color-mode";
import announcementService from "../../services/announcements.js";

const CreateAnnouncement = ({
  isOpen,
  onClose,
  onSuccess,
  presetType = null,
  presetBatch = null,
  presetClass = null,
  contextTitle = null,
}) => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targets, setTargets] = useState({ batches: [], classes: [] });
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: presetType || "academy",
    targetBatch: presetBatch || "",
    targetClass: presetClass || "",
  });

  const [errors, setErrors] = useState({});

  // Fetch available targets when component mounts
  useEffect(() => {
    if (isOpen) {
      fetchTargets();
      // Reset form when opening
      setFormData({
        title: "",
        content: "",
        type: presetType || "academy",
        targetBatch: presetBatch || "",
        targetClass: presetClass || "",
      });
      setErrors({});
      setAlert(null);
    }
  }, [isOpen, presetType, presetBatch, presetClass]);

  const fetchTargets = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getTargets();
      if (response.success) {
        console.log("Setting targets:", response.data);
        console.log("Batches data:", response.data.batches);
        console.log("Classes data:", response.data.classes);
        setTargets(response.data);
      } else {
        setAlert({
          type: "error",
          title: "Error",
          description: "Failed to fetch available targets",
        });
      }
    } catch (error) {
      console.error("Error fetching targets:", error);
      setAlert({
        type: "error",
        title: "Error",
        description: "Failed to fetch available targets",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear alert
    if (alert) setAlert(null);
  };

  const handleTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      type,
      targetBatch: type === "academy" ? "" : prev.targetBatch,
      targetClass: type === "class" ? prev.targetClass : "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (formData.type === "batch" && !formData.targetBatch) {
      newErrors.targetBatch = "Please select a batch";
    }

    if (formData.type === "class" && !formData.targetClass) {
      newErrors.targetClass = "Please select a class";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setAlert({
        type: "error",
        title: "Validation Error",
        description: "Please fix the errors below",
      });
      return;
    }

    try {
      setSubmitting(true);

      const announcementData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        type: formData.type,
      };

      if (formData.type === "batch") {
        announcementData.targetBatch = formData.targetBatch;
      }

      if (formData.type === "class") {
        announcementData.targetClass = formData.targetClass;
      }

      const response = await announcementService.createAnnouncement(
        announcementData
      );

      if (response.success) {
        setAlert({
          type: "success",
          title: "Success",
          description: "Announcement created successfully",
        });

        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess(response.data);
        }, 1500);
      } else {
        setAlert({
          type: "error",
          title: "Error",
          description: response.message || "Failed to create announcement",
        });
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      setAlert({
        type: "error",
        title: "Error",
        description: "Failed to create announcement",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "academy":
        return <LuMegaphone />;
      case "batch":
        return <LuGraduationCap />;
      case "class":
        return <LuBookOpen />;
      default:
        return <LuMegaphone />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "academy":
        return "purple";
      case "batch":
        return "blue";
      case "class":
        return "green";
      default:
        return "gray";
    }
  };

  const getClassesForBatch = () => {
    if (!formData.targetBatch) return [];
    const filteredClasses =
      targets.classes?.filter(
        (cls) => cls.linkedBatch?._id === formData.targetBatch
      ) || [];
    console.log(
      "Filtered classes for batch:",
      formData.targetBatch,
      filteredClasses
    );
    return filteredClasses;
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset="0"
      bg={colorMode === "dark" ? "blackAlpha.800" : "blackAlpha.600"}
      zIndex="overlay"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={{ base: "2", md: "4" }}
      onClick={onClose} // Close on backdrop click
    >
      <Card.Root
        maxW={{ base: "100vw", sm: "md", md: "lg", lg: "xl" }}
        w="full"
        bg={colorMode === "dark" ? "gray.800" : "white"}
        shadow="2xl"
        maxH={{ base: "100vh", md: "90vh" }}
        overflow="hidden"
        m={{ base: "0", md: "4" }}
        borderRadius={{ base: "0", md: "lg" }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <Card.Header
          p={{ base: "4", md: "6" }}
          borderBottom="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing="1" flex="1">
              <HStack>
                <LuPlus color="#0d9488" />
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Create Announcement
                </Text>
              </HStack>
              {contextTitle && (
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  {contextTitle}
                </Text>
              )}
            </VStack>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              _hover={{
                bg: colorMode === "dark" ? "gray.700" : "gray.100",
              }}
            >
              <LuX />
            </Button>
          </HStack>
        </Card.Header>

        <Card.Body p={{ base: "4", md: "6" }} overflow="auto">
          <VStack spacing={{ base: "4", md: "6" }} align="stretch">
            {/* Alert */}
            {alert && (
              <Alert.Root status={alert.type}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>{alert.title}</Alert.Title>
                  {alert.description && (
                    <Alert.Description>{alert.description}</Alert.Description>
                  )}
                </Alert.Content>
              </Alert.Root>
            )}

            {loading ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                py="8"
              >
                <VStack spacing="4">
                  <Spinner size="lg" color="teal.500" />
                  <Text>Loading...</Text>
                </VStack>
              </Box>
            ) : (
              <VStack spacing="6" align="stretch">
                {/* Announcement Type Selection */}
                {!presetType && (
                  <Field label="Announcement Type" required>
                    <HStack spacing="3" wrap="wrap">
                      {["academy", "batch", "class"].map((type) => (
                        <Button
                          key={type}
                          variant={formData.type === type ? "solid" : "outline"}
                          colorPalette={getTypeColor(type)}
                          size="sm"
                          onClick={() => handleTypeChange(type)}
                          flex={{ base: "1", sm: "0" }}
                          minW={{ base: "0", sm: "auto" }}
                          bg={
                            formData.type === type
                              ? `${getTypeColor(type)}.500`
                              : colorMode === "dark"
                              ? "gray.700"
                              : "white"
                          }
                          borderColor={
                            formData.type === type
                              ? `${getTypeColor(type)}.500`
                              : colorMode === "dark"
                              ? "gray.600"
                              : "gray.200"
                          }
                          color={
                            formData.type === type
                              ? "white"
                              : colorMode === "dark"
                              ? "white"
                              : "gray.900"
                          }
                          _hover={{
                            bg:
                              formData.type === type
                                ? `${getTypeColor(type)}.600`
                                : colorMode === "dark"
                                ? "gray.600"
                                : "gray.50",
                            borderColor:
                              formData.type === type
                                ? `${getTypeColor(type)}.600`
                                : colorMode === "dark"
                                ? "gray.500"
                                : "gray.300",
                          }}
                        >
                          <HStack spacing={{ base: "1", sm: "2" }}>
                            {getTypeIcon(type)}
                            <Text
                              textTransform="capitalize"
                              fontSize={{ base: "xs", sm: "sm" }}
                            >
                              {type}
                            </Text>
                          </HStack>
                        </Button>
                      ))}
                    </HStack>
                  </Field>
                )}

                {presetType && (
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb="2"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Announcement Type
                    </Text>
                    <Badge colorPalette={getTypeColor(presetType)} size="md">
                      <HStack spacing="1">
                        {getTypeIcon(presetType)}
                        <Text textTransform="capitalize">{presetType}</Text>
                      </HStack>
                    </Badge>
                  </Box>
                )}

                {/* Batch Selection */}
                {(formData.type === "batch" || formData.type === "class") &&
                  !presetBatch && (
                    <Field
                      label="Select Batch"
                      required
                      invalid={!!errors.targetBatch}
                      errorText={errors.targetBatch}
                    >
                      <NativeSelect.Root
                        value={formData.targetBatch || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          handleInputChange("targetBatch", value);
                          if (formData.type === "class") {
                            handleInputChange("targetClass", "");
                          }
                        }}
                        size={{ base: "sm", md: "md" }}
                        width="100%"
                      >
                        <NativeSelect.Field
                          bg={colorMode === "dark" ? "gray.700" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.200"
                          }
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _hover={{
                            borderColor:
                              colorMode === "dark" ? "gray.500" : "gray.300",
                          }}
                          _focus={{
                            borderColor: "teal.500",
                            boxShadow: "0 0 0 1px teal.500",
                          }}
                        >
                          <option
                            value=""
                            style={{
                              backgroundColor:
                                colorMode === "dark" ? "#2D3748" : "white",
                              color:
                                colorMode === "dark" ? "#A0AEC0" : "#718096",
                            }}
                          >
                            Choose a batch
                          </option>
                          {targets.batches?.map((batch) => (
                            <option
                              key={batch._id}
                              value={batch._id}
                              style={{
                                backgroundColor:
                                  colorMode === "dark" ? "#2D3748" : "white",
                                color:
                                  colorMode === "dark" ? "white" : "#1A202C",
                              }}
                            >
                              {batch.batchName} - {batch.academicYear}
                            </option>
                          )) || []}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field>
                  )}

                {/* Class Selection */}
                {formData.type === "class" && !presetClass && (
                  <Field
                    label="Select Class"
                    required
                    invalid={!!errors.targetClass}
                    errorText={errors.targetClass}
                  >
                    <NativeSelect.Root
                      value={formData.targetClass || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        handleInputChange("targetClass", value);
                      }}
                      disabled={!formData.targetBatch}
                      size={{ base: "sm", md: "md" }}
                      width="100%"
                    >
                      <NativeSelect.Field
                        bg={colorMode === "dark" ? "gray.700" : "white"}
                        borderColor={
                          colorMode === "dark" ? "gray.600" : "gray.200"
                        }
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        _hover={{
                          borderColor:
                            colorMode === "dark" ? "gray.500" : "gray.300",
                        }}
                        _focus={{
                          borderColor: "teal.500",
                          boxShadow: "0 0 0 1px teal.500",
                        }}
                        _disabled={{
                          bg: colorMode === "dark" ? "gray.800" : "gray.100",
                          color: colorMode === "dark" ? "gray.500" : "gray.400",
                          cursor: "not-allowed",
                        }}
                      >
                        <option
                          value=""
                          style={{
                            backgroundColor:
                              colorMode === "dark" ? "#2D3748" : "white",
                            color: colorMode === "dark" ? "#A0AEC0" : "#718096",
                          }}
                        >
                          Choose a class
                        </option>
                        {getClassesForBatch().map((cls) => (
                          <option
                            key={cls._id}
                            value={cls._id}
                            style={{
                              backgroundColor:
                                colorMode === "dark" ? "#2D3748" : "white",
                              color: colorMode === "dark" ? "white" : "#1A202C",
                            }}
                          >
                            {cls.className}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field>
                )}

                {/* Title */}
                <Field
                  label="Title"
                  required
                  invalid={!!errors.title}
                  errorText={errors.title}
                >
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter announcement title"
                    maxLength={200}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                    _focus={{
                      borderColor: "teal.500",
                      boxShadow: "0 0 0 1px teal.500",
                    }}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.300",
                    }}
                  />
                </Field>

                {/* Content */}
                <Field
                  label="Content"
                  required
                  invalid={!!errors.content}
                  errorText={errors.content}
                >
                  <Textarea
                    value={formData.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    placeholder="Enter announcement content"
                    rows={6}
                    maxLength={2000}
                    resize="vertical"
                    data-gramm="false"
                    data-gramm_editor="false"
                    data-enable-grammarly="false"
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                    _focus={{
                      borderColor: "teal.500",
                      boxShadow: "0 0 0 1px teal.500",
                    }}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.300",
                    }}
                  />
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    textAlign="right"
                    mt="1"
                  >
                    {formData.content.length}/2000
                  </Text>
                </Field>
              </VStack>
            )}
          </VStack>
        </Card.Body>

        <Card.Footer
          p={{ base: "4", md: "6" }}
          borderTop="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <VStack spacing="3" w="full" display={{ base: "flex", sm: "none" }}>
            <Button
              bg="#0d9488"
              color="white"
              _hover={{ bg: "#0f766e" }}
              onClick={handleSubmit}
              loading={submitting}
              loadingText="Creating..."
              disabled={loading}
              w="full"
            >
              <LuSend />
              Create Announcement
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              w="full"
              borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              _hover={{
                bg: colorMode === "dark" ? "gray.700" : "gray.50",
                borderColor: colorMode === "dark" ? "gray.500" : "gray.300",
              }}
            >
              Cancel
            </Button>
          </VStack>
          <HStack
            spacing="3"
            w="full"
            justify="flex-end"
            display={{ base: "none", sm: "flex" }}
          >
            <Button
              variant="outline"
              onClick={onClose}
              disabled={submitting}
              borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              _hover={{
                bg: colorMode === "dark" ? "gray.700" : "gray.50",
                borderColor: colorMode === "dark" ? "gray.500" : "gray.300",
              }}
            >
              Cancel
            </Button>
            <Button
              bg="#0d9488"
              color="white"
              _hover={{ bg: "#0f766e" }}
              onClick={handleSubmit}
              loading={submitting}
              loadingText="Creating..."
              disabled={loading}
            >
              <LuSend />
              Create Announcement
            </Button>
          </HStack>
        </Card.Footer>
      </Card.Root>
    </Box>
  );
};

export default CreateAnnouncement;
