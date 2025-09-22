import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Alert,
  Badge,
  List,
  ListItem,
} from "@chakra-ui/react";
import { LuCheck, LuX, LuInfo, LuUsers } from "react-icons/lu";

const BulkOperationResult = ({ result, colorMode }) => {
  if (!result) return null;

  const { data, message } = result;
  const hasRejectedDueToCapacity = data?.rejected > 0;
  const hasAlreadyEnrolled = data?.alreadyEnrolled > 0;

  return (
    <Box p="4" flexShrink={0}>
      {/* Main Success Alert */}
      <Alert.Root
        status={
          hasRejectedDueToCapacity || hasAlreadyEnrolled ? "warning" : "success"
        }
        mb={3}
      >
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>
            Bulk Operation {data?.approved > 0 ? "Completed" : "Result"}
          </Alert.Title>
          <Alert.Description>{message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>

      {/* Detailed Results */}
      {data && (
        <VStack spacing={3} align="stretch">
          {/* Success Statistics */}
          <HStack spacing={4} wrap="wrap">
            {data.approved > 0 && (
              <Badge colorPalette="green" variant="subtle" size="sm">
                <HStack spacing={1}>
                  <LuCheck size={12} />
                  <Text>{data.approved} Approved</Text>
                </HStack>
              </Badge>
            )}
            {data.rejected > 0 && (
              <Badge colorPalette="red" variant="subtle" size="sm">
                <HStack spacing={1}>
                  <LuX size={12} />
                  <Text>{data.rejected} Rejected</Text>
                </HStack>
              </Badge>
            )}
            {data.alreadyEnrolled > 0 && (
              <Badge colorPalette="blue" variant="subtle" size="sm">
                <HStack spacing={1}>
                  <LuUsers size={12} />
                  <Text>{data.alreadyEnrolled} Already Enrolled</Text>
                </HStack>
              </Badge>
            )}
          </HStack>

          {/* Capacity Information */}
          {data.capacity && (
            <Box
              p="3"
              bg={colorMode === "dark" ? "gray.700" : "gray.50"}
              borderRadius="md"
              borderLeftWidth="3px"
              borderLeftColor="teal.500"
            >
              <HStack spacing={2}>
                <LuInfo size={16} />
                <VStack align="start" spacing={1}>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Class Capacity Status
                  </Text>
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  >
                    Current: {data.capacity.current}
                    {data.capacity.max !== "Unlimited" &&
                      ` / ${data.capacity.max}`}
                    {data.capacity.available !== "Unlimited" &&
                      ` • Available: ${data.capacity.available}`}
                  </Text>
                </VStack>
              </HStack>
            </Box>
          )}

          {/* Student Lists */}
          {data.details && (
            <VStack spacing={3} align="stretch">
              {/* Approved Students */}
              {data.details.approvedStudents?.length > 0 && (
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb={2}
                  >
                    ✅ Successfully Approved
                  </Text>
                  <List.Root
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    variant="plain"
                  >
                    {data.details.approvedStudents.map((student, index) => (
                      <List.Item key={index}>• {student.studentName}</List.Item>
                    ))}
                  </List.Root>
                </Box>
              )}

              {/* Rejected Students (Due to Capacity) */}
              {data.details.rejectedStudents?.length > 0 && (
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb={2}
                  >
                    ⚠️ Rejected Due to Capacity
                  </Text>
                  <List.Root
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    variant="plain"
                  >
                    {data.details.rejectedStudents.map((student, index) => (
                      <List.Item key={index}>• {student.studentName}</List.Item>
                    ))}
                  </List.Root>
                </Box>
              )}

              {/* Already Enrolled Students */}
              {data.details.alreadyEnrolledStudents?.length > 0 && (
                <Box>
                  <Text
                    fontSize="sm"
                    fontWeight="medium"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    mb={2}
                  >
                    ℹ️ Already Enrolled
                  </Text>
                  <List.Root
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    variant="plain"
                  >
                    {data.details.alreadyEnrolledStudents.map(
                      (student, index) => (
                        <List.Item key={index}>
                          • {student.studentName}
                        </List.Item>
                      )
                    )}
                  </List.Root>
                </Box>
              )}
            </VStack>
          )}
        </VStack>
      )}
    </Box>
  );
};

export default BulkOperationResult;
