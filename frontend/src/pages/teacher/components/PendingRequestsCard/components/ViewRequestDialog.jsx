import React, { useState } from "react";
import {
  VStack,
  HStack,
  Text,
  Button,
  Dialog,
  Avatar,
  Box,
  Alert,
  Badge,
  Portal,
} from "@chakra-ui/react";
import { LuX, LuCheck, LuInfo } from "react-icons/lu";

// TruncatedText component for handling long messages
const TruncatedText = ({ children, maxLength = 200, ...textProps }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!children || children.length <= maxLength) {
    return <Text {...textProps}>{children}</Text>;
  }

  const truncatedText = children.slice(0, maxLength) + "...";

  return (
    <Box>
      <Text {...textProps}>{isExpanded ? children : truncatedText}</Text>
      <Button
        size="xs"
        variant="ghost"
        colorPalette="blue"
        onClick={() => setIsExpanded(!isExpanded)}
        mt="1"
        p="0"
        h="auto"
        fontSize="xs"
      >
        {isExpanded ? "Read less" : "Read more"}
      </Button>
    </Box>
  );
};

const ViewRequestDialog = ({
  colorMode,
  viewingRequest,
  setViewingRequest,
  handleApproveRequest,
  handleSingleReject,
  processing,
  filteredRequests = [],
}) => {
  // Get student's other requests count
  const getStudentRequestCount = () => {
    if (!viewingRequest?.studentId?._id) return 0;
    return filteredRequests.filter(
      (req) => req.studentId?._id === viewingRequest.studentId._id
    ).length;
  };

  const studentRequestCount = getStudentRequestCount();
  return (
    <Dialog.Root
      open={!!viewingRequest}
      onOpenChange={({ open }) => !open && setViewingRequest(null)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            maxW={{ base: "95vw", md: "md" }}
            maxH={{ base: "90vh", md: "85vh" }}
            mx="4"
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Dialog.Header
              p={{ base: "4", md: "6" }}
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              flexShrink={0}
            >
              <HStack justify="space-between" align="center">
                <Dialog.Title
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="semibold"
                >
                  Join Request Details
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    onClick={() => setViewingRequest(null)}
                    minW="auto"
                    p="2"
                  >
                    <LuX />
                  </Button>
                </Dialog.CloseTrigger>
              </HStack>
            </Dialog.Header>

            <Dialog.Body
              p={{ base: "4", md: "6" }}
              overflow="auto"
              flex="1"
              css={{
                "&::-webkit-scrollbar": {
                  width: "4px",
                },
                "&::-webkit-scrollbar-track": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: colorMode === "dark" ? "#4A5568" : "#CBD5E0",
                  borderRadius: "24px",
                },
              }}
            >
              <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                {/* Multiple Requests Warning */}
                {studentRequestCount > 1 && (
                  <Alert.Root status="info" variant="subtle">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title fontSize={{ base: "sm", md: "md" }}>
                        Multiple Requests
                      </Alert.Title>
                      <Alert.Description fontSize={{ base: "xs", md: "sm" }}>
                        This student has {studentRequestCount} pending requests
                        for this class. If you approve this request, all other
                        pending requests from this student will be automatically
                        rejected.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}

                <VStack align="start" spacing={2}>
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="medium"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Student Information
                  </Text>
                  <HStack spacing={{ base: 2, md: 3 }}>
                    <Avatar.Root size={{ base: "sm", md: "md" }}>
                      <Avatar.Fallback
                        name={
                          viewingRequest?.studentId?.userDetails?.firstName &&
                          viewingRequest?.studentId?.userDetails?.lastName
                            ? `${viewingRequest.studentId.userDetails.firstName} ${viewingRequest.studentId.userDetails.lastName}`
                            : viewingRequest?.studentId?.email || "Student"
                        }
                      />
                      <Avatar.Image
                        src={
                          viewingRequest?.studentId?.userDetails
                            ?.profileImageUrl
                        }
                      />
                    </Avatar.Root>
                    <VStack align="start" spacing={0} flex="1">
                      <Text
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        fontSize={{ base: "sm", md: "md" }}
                        fontWeight="medium"
                      >
                        {viewingRequest?.studentId?.userDetails?.firstName &&
                        viewingRequest?.studentId?.userDetails?.lastName
                          ? `${viewingRequest.studentId.userDetails.firstName} ${viewingRequest.studentId.userDetails.lastName}`
                          : viewingRequest?.studentId?.email ||
                            "Unknown Student"}
                      </Text>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                      >
                        {viewingRequest?.studentId?.email}
                      </Text>
                    </VStack>
                  </HStack>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="medium"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Message from Student
                  </Text>
                  <Box
                    p={{ base: 3, md: 4 }}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    borderRadius="md"
                    w="full"
                    minH="60px"
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  >
                    {viewingRequest?.requestMessage ? (
                      <TruncatedText
                        maxLength={150}
                        fontSize={{ base: "xs", md: "sm" }}
                        color={colorMode === "dark" ? "gray.200" : "gray.700"}
                        whiteSpace="pre-wrap"
                        lineHeight="1.5"
                      >
                        {viewingRequest.requestMessage}
                      </TruncatedText>
                    ) : (
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color={colorMode === "dark" ? "gray.400" : "gray.500"}
                        fontStyle="italic"
                        textAlign="center"
                        py="2"
                      >
                        No message provided
                      </Text>
                    )}
                  </Box>
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text
                    fontSize={{ base: "sm", md: "md" }}
                    fontWeight="medium"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Request Date
                  </Text>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    {viewingRequest &&
                      new Date(viewingRequest.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                  </Text>
                </VStack>
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              p={{ base: "4", md: "6" }}
              flexShrink={0}
              borderTopWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              bg={colorMode === "dark" ? "gray.800" : "white"}
            >
              <HStack
                spacing={{ base: 3, md: 3 }}
                w="full"
                justify={{ base: "stretch", md: "flex-end" }}
              >
                <Button
                  variant="solid"
                  colorPalette="green"
                  onClick={() => {
                    handleApproveRequest(viewingRequest._id);
                    setViewingRequest(null);
                  }}
                  disabled={processing[viewingRequest?._id]}
                  size={{ base: "md", md: "md" }}
                  flex={{ base: "1", md: "none" }}
                  minW={{ base: "0", md: "100px" }}
                >
                  <LuCheck />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  colorPalette="red"
                  onClick={() => {
                    handleSingleReject(viewingRequest._id);
                    setViewingRequest(null);
                  }}
                  disabled={processing[viewingRequest?._id]}
                  size={{ base: "md", md: "md" }}
                  flex={{ base: "1", md: "none" }}
                  minW={{ base: "0", md: "100px" }}
                >
                  <LuX />
                  Reject
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ViewRequestDialog;
