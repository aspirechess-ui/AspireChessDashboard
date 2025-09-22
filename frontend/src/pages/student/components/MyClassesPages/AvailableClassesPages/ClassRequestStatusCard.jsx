import React from "react";
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Badge,
  Dialog,
  Portal,
  Box,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  LuClock,
  LuCheck,
  LuX,
  LuCalendar,
  LuUser,
  LuMessageSquare,
  LuBookOpen,
} from "react-icons/lu";
import { useColorMode } from "../../../../../components/ui/color-mode";

const ClassRequestStatusCard = ({ isOpen, onClose, request }) => {
  const { colorMode } = useColorMode();

  if (!request) return null;

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
        return "Pending Review";
      case "approved":
        return "Request Approved";
      case "rejected":
        return "Request Rejected";
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const InfoItem = ({ icon, label, value, fullWidth = false }) => (
    <Box
      gridColumn={fullWidth ? "1 / -1" : "auto"}
      bg={colorMode === "dark" ? "gray.700" : "gray.50"}
      p={{ base: "3", md: "4" }}
      borderRadius="md"
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
    >
      <HStack spacing={{ base: "2", md: "3" }} align="start">
        <Box
          color={colorMode === "dark" ? "#0d9488" : "#0f766e"}
          flexShrink="0"
          mt="1"
        >
          {icon}
        </Box>
        <VStack align="start" spacing="1" flex="1">
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            fontWeight="medium"
            color={colorMode === "dark" ? "gray.300" : "gray.700"}
          >
            {label}
          </Text>
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color={colorMode === "dark" ? "white" : "gray.900"}
            wordBreak="break-word"
            lineHeight="1.4"
          >
            {value || "Not specified"}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            maxW={{ base: "95vw", md: "2xl" }}
            mx={{ base: "2", md: "4" }}
            maxH={{ base: "90vh", md: "90vh" }}
            overflow="hidden"
            display="flex"
            flexDirection="column"
          >
            <Dialog.Header p={{ base: "4", md: "6" }} flexShrink={0}>
              <VStack align="start" spacing={{ base: 2, md: 2 }} w="full">
                <HStack justify="space-between" w="full">
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
                      minW="auto"
                      p="2"
                    >
                      <LuX />
                    </Button>
                  </Dialog.CloseTrigger>
                </HStack>

                {/* Status Badge */}
                <Badge
                  colorPalette={getStatusColor(request.status)}
                  variant="subtle"
                  size={{ base: "sm", md: "md" }}
                  px={3}
                  py={1}
                >
                  <HStack spacing={2}>
                    {getStatusIcon(request.status)}
                    <Text
                      fontWeight="medium"
                      fontSize={{ base: "xs", md: "sm" }}
                    >
                      {getStatusText(request.status)}
                    </Text>
                  </HStack>
                </Badge>
              </VStack>
            </Dialog.Header>

            <Dialog.Body
              overflowY="auto"
              p={{ base: "4", md: "6" }}
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
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                {/* Class Information */}
                <Card.Root
                  bg={colorMode === "dark" ? "gray.750" : "white"}
                  borderWidth="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <Card.Header
                    pb={{ base: "2", md: "2" }}
                    borderBottomWidth="1px"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    p={{ base: "3", md: "4" }}
                  >
                    <HStack>
                      <LuBookOpen
                        color={colorMode === "dark" ? "#0d9488" : "#0f766e"}
                        size={16}
                      />
                      <Text
                        fontWeight="semibold"
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        Class Information
                      </Text>
                    </HStack>
                  </Card.Header>
                  <Card.Body
                    pt={{ base: "3", md: "4" }}
                    p={{ base: "3", md: "4" }}
                  >
                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      gap={{ base: "3", md: "4" }}
                      w="full"
                    >
                      <InfoItem
                        icon={<LuBookOpen size={14} />}
                        label="Class Name"
                        value={request.classId?.className}
                      />
                      <InfoItem
                        icon={<LuUser size={14} />}
                        label="Teacher"
                        value={request.classId?.teacherId?.email || "Unknown"}
                      />
                      <InfoItem
                        icon={<LuBookOpen size={14} />}
                        label="Description"
                        value={request.classId?.description}
                        fullWidth
                      />
                    </SimpleGrid>
                  </Card.Body>
                </Card.Root>

                {/* Request Information */}
                <Card.Root
                  bg={colorMode === "dark" ? "gray.750" : "white"}
                  borderWidth="1px"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                >
                  <Card.Header
                    pb={{ base: "2", md: "2" }}
                    borderBottomWidth="1px"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    p={{ base: "3", md: "4" }}
                  >
                    <HStack>
                      <LuMessageSquare
                        color={colorMode === "dark" ? "#0d9488" : "#0f766e"}
                        size={16}
                      />
                      <Text
                        fontWeight="semibold"
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        Request Information
                      </Text>
                    </HStack>
                  </Card.Header>
                  <Card.Body
                    pt={{ base: "3", md: "4" }}
                    p={{ base: "3", md: "4" }}
                  >
                    <SimpleGrid
                      columns={{ base: 1, md: 2 }}
                      gap={{ base: "3", md: "4" }}
                      w="full"
                    >
                      <InfoItem
                        icon={<LuCalendar size={14} />}
                        label="Request Date"
                        value={formatDate(request.createdAt)}
                      />
                      <InfoItem
                        icon={<LuCalendar size={14} />}
                        label="Review Date"
                        value={
                          request.reviewedAt
                            ? formatDate(request.reviewedAt)
                            : "Not reviewed yet"
                        }
                      />
                      <InfoItem
                        icon={<LuMessageSquare size={14} />}
                        label="Your Message"
                        value={request.requestMessage || "No message provided"}
                        fullWidth
                      />
                      {request.reviewMessage && (
                        <InfoItem
                          icon={<LuUser size={14} />}
                          label="Teacher's Response"
                          value={request.reviewMessage}
                          fullWidth
                        />
                      )}
                    </SimpleGrid>
                  </Card.Body>
                </Card.Root>

                {/* Status Information */}
                {request.status === "pending" && (
                  <Box
                    bg={colorMode === "dark" ? "orange.900" : "orange.50"}
                    borderWidth="1px"
                    borderColor={
                      colorMode === "dark" ? "orange.700" : "orange.200"
                    }
                    borderRadius="md"
                    p={{ base: "3", md: "4" }}
                  >
                    <HStack spacing={{ base: 2, md: 3 }} align="start">
                      <Box flexShrink="0">
                        <LuClock
                          color={colorMode === "dark" ? "#fed7aa" : "#ea580c"}
                          size={16}
                        />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Text
                          fontWeight="medium"
                          color={
                            colorMode === "dark" ? "orange.200" : "orange.800"
                          }
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          Request Under Review
                        </Text>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color={
                            colorMode === "dark" ? "orange.300" : "orange.700"
                          }
                          lineHeight="1.4"
                        >
                          Your join request is waiting for teacher approval. You
                          will be notified once it's reviewed.
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                {request.status === "approved" && (
                  <Box
                    bg={colorMode === "dark" ? "green.900" : "green.50"}
                    borderWidth="1px"
                    borderColor={
                      colorMode === "dark" ? "green.700" : "green.200"
                    }
                    borderRadius="md"
                    p={{ base: "3", md: "4" }}
                  >
                    <HStack spacing={{ base: 2, md: 3 }} align="start">
                      <Box flexShrink="0">
                        <LuCheck
                          color={colorMode === "dark" ? "#bbf7d0" : "#16a34a"}
                          size={16}
                        />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Text
                          fontWeight="medium"
                          color={
                            colorMode === "dark" ? "green.200" : "green.800"
                          }
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          Request Approved!
                        </Text>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color={
                            colorMode === "dark" ? "green.300" : "green.700"
                          }
                          lineHeight="1.4"
                        >
                          Congratulations! Your join request has been approved.
                          You can now access the class.
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}

                {request.status === "rejected" && (
                  <Box
                    bg={colorMode === "dark" ? "red.900" : "red.50"}
                    borderWidth="1px"
                    borderColor={colorMode === "dark" ? "red.700" : "red.200"}
                    borderRadius="md"
                    p={{ base: "3", md: "4" }}
                  >
                    <HStack spacing={{ base: 2, md: 3 }} align="start">
                      <Box flexShrink="0">
                        <LuX
                          color={colorMode === "dark" ? "#fecaca" : "#dc2626"}
                          size={16}
                        />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Text
                          fontWeight="medium"
                          color={colorMode === "dark" ? "red.200" : "red.800"}
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          Request Rejected
                        </Text>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color={colorMode === "dark" ? "red.300" : "red.700"}
                          lineHeight="1.4"
                        >
                          Your join request was rejected.{" "}
                          {request.reviewMessage
                            ? "Please check the teacher's response above."
                            : "You may try requesting again or contact the teacher for more information."}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer
              p={{ base: "4", md: "6" }}
              flexShrink={0}
              borderTopWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <Button
                variant="outline"
                onClick={onClose}
                color={colorMode === "dark" ? "gray.300" : "gray.700"}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                size={{ base: "md", md: "md" }}
                w={{ base: "full", md: "auto" }}
                minW={{ base: "0", md: "100px" }}
              >
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ClassRequestStatusCard;
