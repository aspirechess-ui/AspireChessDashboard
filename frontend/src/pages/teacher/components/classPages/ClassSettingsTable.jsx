import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  SimpleGrid,
  NativeSelect,
} from "@chakra-ui/react";
import { Field } from "../../../../components/ui/field";
import { useColorMode } from "../../../../components/ui/color-mode";

const ClassSettingsTable = ({
  classData,
  formData,
  handleInputChange,
  errors,
}) => {
  const { colorMode } = useColorMode();

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

  return (
    <VStack align="stretch" spacing={6}>
      {/* Basic Information */}
      <Box
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
        borderRadius="md"
        overflow="hidden"
      >
        <Box
          p="4"
          borderBottomWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          bg={colorMode === "dark" ? "gray.750" : "gray.50"}
        >
          <Text
            fontWeight="semibold"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Basic Information
          </Text>
        </Box>
        <Box p="6">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Field
              label={
                <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                  Class Name *
                </Text>
              }
              errorText={errors.className}
              invalid={!!errors.className}
            >
              <Input
                value={formData.className || ""}
                onChange={(e) => handleInputChange("className", e.target.value)}
                placeholder="Enter class name"
                {...inputStyles}
              />
            </Field>

            <Field
              label={
                <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                  Description
                </Text>
              }
              errorText={errors.description}
              invalid={!!errors.description}
            >
              <Textarea
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter class description"
                rows={3}
                {...inputStyles}
              />
            </Field>

            <Field
              label={
                <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                  Batch
                </Text>
              }
            >
              <Text
                color={colorMode === "dark" ? "white" : "gray.900"}
                p="2"
                bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                borderRadius="md"
                fontSize="sm"
              >
                {classData?.linkedBatch?.batchName || "Not set"}
              </Text>
            </Field>

            <Field
              label={
                <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                  Academic Year
                </Text>
              }
            >
              <Text
                color={colorMode === "dark" ? "white" : "gray.900"}
                p="2"
                bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                borderRadius="md"
                fontSize="sm"
              >
                {classData?.linkedBatch?.academicYear || "Not set"}
              </Text>
            </Field>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Visibility & Access */}
      <Box
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
        borderRadius="md"
        overflow="hidden"
      >
        <Box
          p="4"
          borderBottomWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          bg={colorMode === "dark" ? "gray.750" : "gray.50"}
        >
          <Text
            fontWeight="semibold"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Visibility & Access
          </Text>
        </Box>
        <Box p="6">
          <Field
            label={
              <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                Class Visibility *
              </Text>
            }
            errorText={errors.visibility}
            invalid={!!errors.visibility}
          >
            <VStack align="stretch" spacing={2}>
              <NativeSelect.Root
                size="md"
                variant="outline"
                invalid={!!errors.visibility}
                colorPalette="teal"
              >
                <NativeSelect.Field
                  placeholder="Select visibility"
                  value={formData.visibility || ""}
                  onChange={(e) =>
                    handleInputChange("visibility", e.target.value)
                  }
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  _focus={{
                    borderColor: "#0d9488",
                    boxShadow: `0 0 0 1px #0d9488`,
                  }}
                >
                  <option value="open">Open - Anyone can join</option>
                  <option value="unlisted">
                    Unlisted - Hidden from listings
                  </option>
                  <option value="request_to_join">
                    Request to Join - Approval required
                  </option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
              >
                {formData.visibility === "open" &&
                  "Students can join this class automatically without approval."}
                {formData.visibility === "unlisted" &&
                  "Class is hidden from public listings. Students need an invite link."}
                {formData.visibility === "request_to_join" &&
                  "Students can request to join, but need teacher approval."}
              </Text>
            </VStack>
          </Field>
        </Box>
      </Box>

      {/* Enrollment Settings */}
      <Box
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
        borderRadius="md"
        overflow="hidden"
      >
        <Box
          p="4"
          borderBottomWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          bg={colorMode === "dark" ? "gray.750" : "gray.50"}
        >
          <Text
            fontWeight="semibold"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Enrollment Settings
          </Text>
        </Box>
        <Box p="6">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Field
              label={
                <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                  Maximum Students
                </Text>
              }
              errorText={errors.maxStudents}
              invalid={!!errors.maxStudents}
            >
              <Input
                type="number"
                value={formData.maxStudents || ""}
                onChange={(e) =>
                  handleInputChange("maxStudents", e.target.value)
                }
                placeholder="Leave empty for unlimited"
                min={1}
                {...inputStyles}
              />
            </Field>

            <Field
              label={
                <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                  Current Enrollment
                </Text>
              }
            >
              <Text
                color={colorMode === "dark" ? "white" : "gray.900"}
                p="2"
                bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                borderRadius="md"
                fontSize="sm"
              >
                {classData?.currentEnrolledStudents || 0}
              </Text>
            </Field>
          </SimpleGrid>
        </Box>
      </Box>

      {/* Class Status */}
      <Box
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
        borderRadius="md"
        overflow="hidden"
      >
        <Box
          p="4"
          borderBottomWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          bg={colorMode === "dark" ? "gray.750" : "gray.50"}
        >
          <Text
            fontWeight="semibold"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Class Status
          </Text>
        </Box>
        <Box p="6">
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            <Box gridColumn={{ base: "1", md: "1 / -1" }}>
              <HStack justify="space-between" w="full">
                <VStack align="start" spacing={1}>
                  <Text
                    fontWeight="medium"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  >
                    Active Status
                  </Text>
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  >
                    Inactive classes are hidden from students
                  </Text>
                </VStack>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isActive || false}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                    style={{
                      marginRight: "8px",
                      width: "20px",
                      height: "20px",
                      accentColor: "#0d9488",
                    }}
                  />
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </Text>
                </label>
              </HStack>
            </Box>

            <Field
              label={
                <Text color={colorMode === "dark" ? "gray.300" : "gray.700"}>
                  Created
                </Text>
              }
            >
              <Text
                color={colorMode === "dark" ? "white" : "gray.900"}
                p="2"
                bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                borderRadius="md"
                fontSize="sm"
              >
                {new Date(classData?.createdAt).toLocaleDateString()}
              </Text>
            </Field>
          </SimpleGrid>
        </Box>
      </Box>
    </VStack>
  );
};

export default ClassSettingsTable;
