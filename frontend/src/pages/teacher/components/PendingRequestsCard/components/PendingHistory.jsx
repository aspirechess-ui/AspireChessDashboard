import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  Badge,
  Avatar,
  Spinner,
  Separator,
  Icon,
} from "@chakra-ui/react";
import {
  LuCalendar,
  LuUser,
  LuFileText,
  LuArrowUpDown,
  LuClock,
} from "react-icons/lu";
import classJoinRequestService from "../../../../../services/classJoinRequests";

// Truncated Text Component with Read More functionality
const TruncatedText = ({ children, maxLength = 100, ...textProps }) => {
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

const PendingHistory = ({ colorMode, classData }) => {
  const [historyRequests, setHistoryRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest

  // Fetch request history
  const fetchRequestHistory = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch approved and rejected requests
      const [approvedResponse, rejectedResponse] = await Promise.all([
        classJoinRequestService.getClassRequests(classData._id, {
          status: "approved",
          limit: 100,
        }),
        classJoinRequestService.getClassRequests(classData._id, {
          status: "rejected",
          limit: 100,
        }),
      ]);

      const allRequests = [
        ...(approvedResponse.data || []),
        ...(rejectedResponse.data || []),
      ];

      setHistoryRequests(allRequests);
    } catch (error) {
      console.error("Error fetching request history:", error);
      setError("Failed to fetch request history");
    } finally {
      setLoading(false);
    }
  }, [classData._id]);

  useEffect(() => {
    if (classData?._id) {
      fetchRequestHistory();
    }
  }, [fetchRequestHistory, classData._id]);

  // Sort requests based on selected order
  const sortedRequests = React.useMemo(() => {
    const sorted = [...historyRequests].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt);
      const dateB = new Date(b.updatedAt || b.createdAt);

      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  }, [historyRequests, sortOrder]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return { color: "green", text: "Approved" };
      case "rejected":
        return { color: "red", text: "Rejected" };
      default:
        return { color: "gray", text: status };
    }
  };

  if (loading) {
    return (
      <Box p="6" textAlign="center">
        <Spinner size="lg" color="orange.500" />
        <Text mt="3" color={colorMode === "dark" ? "gray.400" : "gray.600"}>
          Loading request history...
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header with Sort Options */}
      <VStack spacing={{ base: 3, md: 0 }} align="stretch">
        <HStack
          justify="space-between"
          p={{ base: "3", md: "4" }}
          borderBottomWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          flexDirection={{ base: "column", md: "row" }}
          align={{ base: "start", md: "center" }}
          spacing={{ base: 3, md: 0 }}
        >
          <HStack spacing={2}>
            <Icon
              size={{ base: "md", md: "lg" }}
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              <LuClock />
            </Icon>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="semibold"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Request History
            </Text>
            <Badge
              colorPalette="orange"
              variant="subtle"
              size={{ base: "xs", md: "sm" }}
            >
              {historyRequests.length}
            </Badge>
          </HStack>

          <HStack
            spacing={2}
            w={{ base: "full", md: "auto" }}
            justify={{ base: "space-between", md: "flex-end" }}
          >
            <HStack spacing={1}>
              <Icon
                size="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                <LuArrowUpDown />
              </Icon>
              <Text
                fontSize="xs"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                display={{ base: "block", md: "none" }}
              >
                Sort:
              </Text>
            </HStack>
            <HStack spacing={1}>
              <Button
                size={{ base: "xs", md: "sm" }}
                variant={sortOrder === "newest" ? "solid" : "outline"}
                colorPalette="orange"
                onClick={() => setSortOrder("newest")}
                fontSize="xs"
              >
                Newest First
              </Button>
              <Button
                size={{ base: "xs", md: "sm" }}
                variant={sortOrder === "oldest" ? "solid" : "outline"}
                colorPalette="orange"
                onClick={() => setSortOrder("oldest")}
                fontSize="xs"
              >
                Oldest First
              </Button>
              {/* Refresh Button */}
              {historyRequests.length > 0 && (
                <Button
                  size={{ base: "xs", md: "sm" }}
                  variant="outline"
                  onClick={fetchRequestHistory}
                  disabled={loading}
                  colorPalette="orange"
                  fontSize="xs"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              )}
            </HStack>
          </HStack>
        </HStack>
      </VStack>

      {/* Error Alert */}
      {error && (
        <Box p="4">
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Box>
      )}

      {/* Request History List with Scroll */}
      <Box
        flex="1"
        overflow="auto"
        maxH={{ base: "300px", md: "400px" }}
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
        {sortedRequests.length === 0 ? (
          <Box p={{ base: "4", md: "6" }} textAlign="center">
            <Icon
              size={{ base: "xl", md: "2xl" }}
              color={colorMode === "dark" ? "gray.600" : "gray.400"}
            >
              <LuFileText />
            </Icon>
            <Text
              mt="3"
              fontSize={{ base: "sm", md: "md" }}
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              No request history found
            </Text>
            <Text
              fontSize={{ base: "xs", md: "sm" }}
              color={colorMode === "dark" ? "gray.500" : "gray.500"}
            >
              Approved and rejected requests will appear here
            </Text>
          </Box>
        ) : (
          <VStack spacing={0} align="stretch">
            {sortedRequests.map((request, index) => {
              const statusInfo = getStatusInfo(request.status);
              const studentName = request.studentId?.userDetails
                ? `${request.studentId.userDetails.firstName} ${request.studentId.userDetails.lastName}`
                : request.studentId?.email || "Unknown Student";

              return (
                <React.Fragment key={request._id}>
                  <Box
                    p={{ base: "3", md: "4" }}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.700" : "gray.50",
                    }}
                  >
                    <VStack spacing={{ base: 2, md: 3 }} align="stretch">
                      {/* Header Row - Student Info and Status */}
                      <HStack spacing={{ base: 2, md: 3 }} align="start">
                        {/* Student Avatar */}
                        <Avatar.Root
                          size={{ base: "xs", md: "sm" }}
                          colorPalette="orange"
                          flexShrink={0}
                        >
                          <Avatar.Fallback name={studentName} />
                          <Avatar.Image
                            src={
                              request.studentId?.userDetails?.profileImageUrl
                            }
                          />
                        </Avatar.Root>

                        {/* Student Name and Status */}
                        <VStack align="start" spacing={1} flex="1" minW="0">
                          <HStack spacing={2} align="center" flexWrap="wrap">
                            <Text
                              fontWeight="medium"
                              fontSize={{ base: "sm", md: "md" }}
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                              noOfLines={1}
                            >
                              {studentName}
                            </Text>
                            <Badge
                              colorPalette={statusInfo.color}
                              variant="subtle"
                              size={{ base: "xs", md: "sm" }}
                            >
                              {statusInfo.text}
                            </Badge>
                          </HStack>

                          <Text
                            fontSize={{ base: "xs", md: "sm" }}
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                            noOfLines={1}
                          >
                            {request.studentId?.email}
                          </Text>
                        </VStack>

                        {/* Date - Hidden on mobile, shown on larger screens */}
                        <VStack
                          align="end"
                          spacing={1}
                          display={{ base: "none", md: "flex" }}
                          flexShrink={0}
                        >
                          <HStack spacing={1}>
                            <Icon
                              size="xs"
                              color={
                                colorMode === "dark" ? "gray.500" : "gray.400"
                              }
                            >
                              <LuCalendar />
                            </Icon>
                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "dark" ? "gray.500" : "gray.400"
                              }
                            >
                              {formatDate(
                                request.updatedAt || request.createdAt
                              )}
                            </Text>
                          </HStack>
                        </VStack>
                      </HStack>

                      {/* Messages Section */}
                      <VStack
                        align="start"
                        spacing={2}
                        pl={{ base: "0", md: "10" }}
                      >
                        {request.requestMessage && (
                          <Box w="full">
                            <TruncatedText
                              fontSize={{ base: "xs", md: "sm" }}
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                              bg={colorMode === "dark" ? "gray.800" : "gray.50"}
                              p={{ base: "2", md: "3" }}
                              borderRadius="md"
                              w="full"
                              maxLength={80}
                            >
                              "{request.requestMessage}"
                            </TruncatedText>
                          </Box>
                        )}

                        {request.reviewMessage && (
                          <Box w="full">
                            <TruncatedText
                              fontSize={{ base: "xs", md: "sm" }}
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                              bg={
                                statusInfo.color === "green"
                                  ? colorMode === "dark"
                                    ? "green.900"
                                    : "green.50"
                                  : colorMode === "dark"
                                  ? "red.900"
                                  : "red.50"
                              }
                              p={{ base: "2", md: "3" }}
                              borderRadius="md"
                              w="full"
                              maxLength={80}
                            >
                              Teacher: "{request.reviewMessage}"
                            </TruncatedText>
                          </Box>
                        )}

                        {/* Date on mobile */}
                        <HStack
                          spacing={1}
                          display={{ base: "flex", md: "none" }}
                          justify="flex-end"
                          w="full"
                        >
                          <Icon
                            size="xs"
                            color={
                              colorMode === "dark" ? "gray.500" : "gray.400"
                            }
                          >
                            <LuCalendar />
                          </Icon>
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.500" : "gray.400"
                            }
                          >
                            {formatDate(request.updatedAt || request.createdAt)}
                          </Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </Box>

                  {/* Separator between items */}
                  {index < sortedRequests.length - 1 && (
                    <Separator
                      color={colorMode === "dark" ? "gray.700" : "gray.200"}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default PendingHistory;
