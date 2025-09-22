import React, { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  Spinner,
  Center,
  Box,
  Alert,
  Table,
  Dialog,
  Portal,
} from "@chakra-ui/react";
import { LuClock, LuCheck, LuX, LuEye, LuRefreshCw } from "react-icons/lu";
import { useColorMode } from "../../../../../components/ui/color-mode";
import studentService from "../../../../../services/student";
import ClassRequestStatusCard from "./ClassRequestStatusCard";

const ClassJoinRequestStatus = ({ isOpen, onClose }) => {
  const { colorMode } = useColorMode();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showStatusCard, setShowStatusCard] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await studentService.getMyJoinRequests();

      if (response.success) {
        setRequests(response.data);
      } else {
        setError(response.message || "Failed to fetch join requests");
      }
    } catch (error) {
      console.error("Error fetching join requests:", error);
      setError("Failed to load join requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <LuClock size={12} />;
      case "approved":
        return <LuCheck size={12} />;
      case "rejected":
        return <LuX size={12} />;
      default:
        return <LuClock size={12} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowStatusCard(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={({ open }) => !open && onClose()}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={{ base: "2", md: "4" }}
          >
            <Dialog.Content
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              maxW={{ base: "95vw", md: "4xl" }}
              w={{ base: "95vw", md: "full" }}
              mx="auto"
              maxH={{ base: "90vh", md: "80vh" }}
              minW={{ base: "0", md: "600px" }}
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <Dialog.Header pb="4" px={{ base: "4", md: "6" }} flexShrink={0}>
                <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                  {/* Close button row */}
                  <HStack justify="flex-end" w="full">
                    <Dialog.CloseTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        color={colorMode === "dark" ? "gray.400" : "gray.500"}
                        _hover={{
                          bg: colorMode === "dark" ? "gray.700" : "gray.100",
                        }}
                        minW="auto"
                        px="2"
                      >
                        <LuX />
                      </Button>
                    </Dialog.CloseTrigger>
                  </HStack>

                  {/* Title and refresh button row */}
                  <VStack
                    spacing={{ base: 3, md: 0 }}
                    direction={{ base: "column", md: "row" }}
                    w="full"
                    align={{ base: "stretch", md: "center" }}
                    justify={{ base: "flex-start", md: "space-between" }}
                  >
                    <Dialog.Title
                      color={colorMode === "dark" ? "blue.300" : "blue.600"}
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="semibold"
                      textAlign={{ base: "center", md: "left" }}
                    >
                      Join Request Status
                    </Dialog.Title>
                    <Button
                      size={{ base: "sm", md: "sm" }}
                      variant="outline"
                      leftIcon={<LuRefreshCw />}
                      onClick={fetchRequests}
                      disabled={loading}
                      colorPalette="teal"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.300"
                      }
                      _hover={{
                        bg: colorMode === "dark" ? "gray.700" : "gray.50",
                      }}
                      w={{ base: "full", md: "auto" }}
                    >
                      Refresh
                    </Button>
                  </VStack>
                </VStack>
              </Dialog.Header>

              <Dialog.Body
                overflowY="auto"
                px={{ base: "4", md: "6" }}
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
                {loading ? (
                  <Center h="200px">
                    <VStack spacing={4}>
                      <Spinner size="lg" color="#0d9488" />
                      <Text
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        Loading your requests...
                      </Text>
                    </VStack>
                  </Center>
                ) : error ? (
                  <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Error Loading Requests</Alert.Title>
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                ) : requests.length === 0 ? (
                  <Box p="8" textAlign="center">
                    <VStack spacing={4}>
                      <Box
                        p={3}
                        bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                        borderRadius="full"
                      >
                        <LuClock
                          size={32}
                          color={colorMode === "dark" ? "#9CA3AF" : "#6B7280"}
                        />
                      </Box>
                      <VStack spacing={2} textAlign="center">
                        <Text
                          fontWeight="semibold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          No Join Requests
                        </Text>
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          You haven't sent any join requests yet.
                        </Text>
                      </VStack>
                    </VStack>
                  </Box>
                ) : (
                  <Box>
                    {/* Desktop Table View */}
                    <Box
                      display={{ base: "none", md: "block" }}
                      bg={colorMode === "dark" ? "gray.800" : "white"}
                      borderWidth="1px"
                      borderColor={
                        colorMode === "dark" ? "gray.700" : "gray.200"
                      }
                      borderRadius="lg"
                      overflow="hidden"
                    >
                      <Table.Root variant="simple" size="sm">
                        <Table.Header
                          bg={colorMode === "dark" ? "gray.750" : "gray.50"}
                        >
                          <Table.Row>
                            <Table.ColumnHeader
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                              fontWeight="semibold"
                            >
                              Class Name
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                              fontWeight="semibold"
                            >
                              Request Date
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                              fontWeight="semibold"
                            >
                              Status
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                              fontWeight="semibold"
                            >
                              Reviewed Date
                            </Table.ColumnHeader>
                            <Table.ColumnHeader
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.700"
                              }
                              fontWeight="semibold"
                            >
                              Action
                            </Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {requests.map((request) => (
                            <Table.Row
                              key={request._id}
                              _hover={{
                                bg:
                                  colorMode === "dark" ? "gray.700" : "gray.50",
                              }}
                            >
                              <Table.Cell>
                                <Text
                                  fontWeight="medium"
                                  color={
                                    colorMode === "dark" ? "white" : "gray.900"
                                  }
                                >
                                  {request.classId?.className ||
                                    "Unknown Class"}
                                </Text>
                              </Table.Cell>
                              <Table.Cell>
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                >
                                  {formatDate(request.createdAt)}
                                </Text>
                              </Table.Cell>
                              <Table.Cell>
                                <Badge
                                  colorPalette={getStatusColor(request.status)}
                                  variant="subtle"
                                  size="sm"
                                >
                                  <HStack spacing={1}>
                                    {getStatusIcon(request.status)}
                                    <Text>{getStatusText(request.status)}</Text>
                                  </HStack>
                                </Badge>
                              </Table.Cell>
                              <Table.Cell>
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                >
                                  {request.reviewedAt
                                    ? formatDate(request.reviewedAt)
                                    : "-"}
                                </Text>
                              </Table.Cell>
                              <Table.Cell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  leftIcon={<LuEye />}
                                  onClick={() => handleViewRequest(request)}
                                  colorPalette="teal"
                                >
                                  View
                                </Button>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    </Box>

                    {/* Mobile Card View */}
                    <VStack
                      spacing={3}
                      display={{ base: "flex", md: "none" }}
                      align="stretch"
                    >
                      {requests.map((request) => (
                        <Card.Root
                          key={request._id}
                          bg={colorMode === "dark" ? "gray.700" : "white"}
                          borderWidth="1px"
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.200"
                          }
                          shadow="sm"
                        >
                          <Card.Body p="4">
                            <VStack spacing={3} align="stretch">
                              {/* Class Name */}
                              <HStack justify="space-between" align="start">
                                <VStack align="start" spacing={0} flex="1">
                                  <Text
                                    fontSize="xs"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.400"
                                        : "gray.500"
                                    }
                                    textTransform="uppercase"
                                    fontWeight="medium"
                                  >
                                    Class Name
                                  </Text>
                                  <Text
                                    fontWeight="medium"
                                    color={
                                      colorMode === "dark"
                                        ? "white"
                                        : "gray.900"
                                    }
                                    fontSize="sm"
                                  >
                                    {request.classId?.className ||
                                      "Unknown Class"}
                                  </Text>
                                </VStack>
                                <Badge
                                  colorPalette={getStatusColor(request.status)}
                                  variant="subtle"
                                  size="sm"
                                >
                                  <HStack spacing={1}>
                                    {getStatusIcon(request.status)}
                                    <Text fontSize="xs">
                                      {getStatusText(request.status)}
                                    </Text>
                                  </HStack>
                                </Badge>
                              </HStack>

                              {/* Dates */}
                              <HStack justify="space-between">
                                <VStack align="start" spacing={0} flex="1">
                                  <Text
                                    fontSize="xs"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.400"
                                        : "gray.500"
                                    }
                                    textTransform="uppercase"
                                    fontWeight="medium"
                                  >
                                    Request Date
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.300"
                                        : "gray.600"
                                    }
                                  >
                                    {formatDate(request.createdAt)}
                                  </Text>
                                </VStack>
                                <VStack align="start" spacing={0} flex="1">
                                  <Text
                                    fontSize="xs"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.400"
                                        : "gray.500"
                                    }
                                    textTransform="uppercase"
                                    fontWeight="medium"
                                  >
                                    Reviewed Date
                                  </Text>
                                  <Text
                                    fontSize="sm"
                                    color={
                                      colorMode === "dark"
                                        ? "gray.300"
                                        : "gray.600"
                                    }
                                  >
                                    {request.reviewedAt
                                      ? formatDate(request.reviewedAt)
                                      : "-"}
                                  </Text>
                                </VStack>
                              </HStack>

                              {/* Action Button */}
                              <Button
                                size="sm"
                                variant="outline"
                                leftIcon={<LuEye />}
                                onClick={() => handleViewRequest(request)}
                                colorPalette="teal"
                                w="full"
                              >
                                View Details
                              </Button>
                            </VStack>
                          </Card.Body>
                        </Card.Root>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Request Status Card */}
      <ClassRequestStatusCard
        isOpen={showStatusCard}
        onClose={() => setShowStatusCard(false)}
        request={selectedRequest}
      />
    </>
  );
};

export default ClassJoinRequestStatus;
