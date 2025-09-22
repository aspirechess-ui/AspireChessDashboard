import React, { useState } from "react";
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Textarea,
  Dialog,
  Portal,
  Alert,
  Badge,
} from "@chakra-ui/react";
import { LuSend, LuX, LuClock, LuInfo } from "react-icons/lu";
import { useColorMode } from "../../../../../components/ui/color-mode";
import classJoinRequestService from "../../../../../services/classJoinRequests";

const ClassJoinRequestCard = ({
  isOpen,
  onClose,
  classData,
  onRequestSent,
}) => {
  const { colorMode } = useColorMode();
  const [requestMessage, setRequestMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Function to check request eligibility
  const checkRequestEligibility = React.useCallback(async () => {
    if (!isOpen || !classData) return;

    try {
      setCheckingEligibility(true);
      setError(""); // Clear any previous errors when checking eligibility
      const response = await classJoinRequestService.canRequestToJoin(
        classData._id
      );
      setRequestStatus(response);
    } catch (error) {
      console.error("Error checking request eligibility:", error);
      setError(error.message);
    } finally {
      setCheckingEligibility(false);
    }
  }, [isOpen, classData]);

  // Check if student can send a request when dialog opens
  React.useEffect(() => {
    checkRequestEligibility();
  }, [checkRequestEligibility]);

  const handleSubmitRequest = async () => {
    if (!classData) return;

    try {
      setLoading(true);
      setError("");

      const response = await classJoinRequestService.createJoinRequest(
        classData._id,
        requestMessage
      );

      if (response.success) {
        if (onRequestSent) {
          onRequestSent();
        }
        onClose();
        setRequestMessage("");
        setRequestStatus(null);
      } else {
        setError(response.message || "Failed to send join request");
        // Re-check eligibility in case the status has changed
        await checkRequestEligibility();
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      setError(
        error.message || "Failed to send join request. Please try again."
      );
      // Re-check eligibility when request fails (especially for timeout errors)
      await checkRequestEligibility();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRequestMessage("");
    setError("");
    setRequestStatus(null);
    setCheckingEligibility(false); // Reset checking state when closing
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={({ open }) => !open && handleClose()}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner
          display="flex"
          alignItems="center"
          justifyContent="center"
          p="4"
        >
          <Dialog.Content
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            maxW="md"
            w="full"
            mx="4"
            my="4"
            borderRadius="lg"
          >
            <Dialog.Header>
              <Dialog.Title color={colorMode === "dark" ? "white" : "gray.900"}>
                Request to Join Class
              </Dialog.Title>
              <Dialog.CloseTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  onClick={handleClose}
                >
                  <LuX />
                </Button>
              </Dialog.CloseTrigger>
            </Dialog.Header>

            <Dialog.Body>
              <VStack spacing={4} align="stretch">
                {error && (
                  <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                )}

                {checkingEligibility ? (
                  <Alert.Root status="info">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>
                        Checking request eligibility...
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                ) : requestStatus && !requestStatus.canRequest ? (
                  <Alert.Root status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>
                        <VStack align="start" spacing={2}>
                          <Text>{requestStatus.reason}</Text>
                          {requestStatus.timeLeft && (
                            <HStack spacing={1}>
                              <LuClock size={12} />
                              <Text fontSize="xs">
                                Wait time: {requestStatus.timeLeft} minute
                                {requestStatus.timeLeft !== 1 ? "s" : ""}
                              </Text>
                            </HStack>
                          )}
                          {requestStatus.timeLeft && (
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={checkRequestEligibility}
                              disabled={checkingEligibility}
                              colorPalette="orange"
                            >
                              {checkingEligibility
                                ? "Checking..."
                                : "Check Again"}
                            </Button>
                          )}
                        </VStack>
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                ) : (
                  <>
                    {requestStatus?.pendingRequestsCount > 0 && (
                      <Alert.Root status="info">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Description>
                            <VStack align="start" spacing={1}>
                              <Text>
                                You have {requestStatus.pendingRequestsCount}{" "}
                                pending request
                                {requestStatus.pendingRequestsCount !== 1
                                  ? "s"
                                  : ""}{" "}
                                for this class.
                              </Text>
                              <Text
                                fontSize="xs"
                                color={
                                  colorMode === "dark" ? "gray.400" : "gray.600"
                                }
                              >
                                You can send additional requests, but there's a
                                10-minute cooldown between requests.
                              </Text>
                            </VStack>
                          </Alert.Description>
                        </Alert.Content>
                      </Alert.Root>
                    )}

                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    >
                      You are requesting to join "{classData?.className}".
                      Please provide a message to the teacher explaining why
                      you'd like to join this class.
                    </Text>

                    <VStack align="start" spacing={2}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color={colorMode === "dark" ? "white" : "gray.900"}
                      >
                        Message to Teacher (Optional)
                      </Text>
                      <Textarea
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        placeholder="Hi, I would like to join this class because..."
                        bg={colorMode === "dark" ? "gray.700" : "white"}
                        borderColor={
                          colorMode === "dark" ? "gray.600" : "gray.300"
                        }
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        _placeholder={{
                          color: colorMode === "dark" ? "gray.400" : "gray.500",
                        }}
                        _focus={{
                          borderColor: "#0d9488",
                          boxShadow: "0 0 0 1px #0d9488",
                        }}
                        maxLength={500}
                        resize="none"
                        rows={4}
                      />
                      <Text
                        fontSize="xs"
                        color={colorMode === "dark" ? "gray.400" : "gray.500"}
                      >
                        {requestMessage.length}/500 characters
                      </Text>
                    </VStack>

                    {requestStatus?.pendingRequestsCount > 0 && (
                      <Alert.Root status="info" variant="subtle">
                        <Alert.Indicator />
                        <Alert.Content>
                          <Alert.Description>
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm">
                                <strong>Note:</strong> If any of your requests
                                gets approved, all other pending requests will
                                be automatically rejected.
                              </Text>
                            </VStack>
                          </Alert.Description>
                        </Alert.Content>
                      </Alert.Root>
                    )}
                  </>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <HStack spacing={3}>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={loading}
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  colorPalette="orange"
                  onClick={handleSubmitRequest}
                  loading={loading}
                  loadingText="Sending..."
                  disabled={
                    loading ||
                    checkingEligibility ||
                    (requestStatus && !requestStatus.canRequest)
                  }
                  leftIcon={<LuSend />}
                >
                  Send Request
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ClassJoinRequestCard;
