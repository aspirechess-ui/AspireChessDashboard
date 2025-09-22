import React from "react";
import {
  VStack,
  HStack,
  Text,
  Button,
  Dialog,
  Textarea,
} from "@chakra-ui/react";
import { LuX } from "react-icons/lu";

const RejectDialog = ({
  colorMode,
  showRejectDialog,
  cancelReject,
  requestToReject,
  selectedRequests,
  rejectReason,
  setRejectReason,
  confirmReject,
  processing,
}) => {
  const isBulkOperation =
    requestToReject === null && selectedRequests.length > 0;
  const isProcessing = isBulkOperation
    ? selectedRequests.some((id) => processing[id] === "rejecting")
    : processing[requestToReject] === "rejecting";

  return (
    <Dialog.Root
      open={showRejectDialog}
      onOpenChange={({ open }) => !open && cancelReject()}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Dialog.Content
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          maxW="md"
          mx="4"
        >
          <Dialog.Header>
            <Dialog.Title color={colorMode === "dark" ? "white" : "gray.900"}>
              Reject {isBulkOperation ? "Requests" : "Request"}
            </Dialog.Title>
            <Dialog.CloseTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
                onClick={cancelReject}
              >
                <LuX />
              </Button>
            </Dialog.CloseTrigger>
          </Dialog.Header>

          <Dialog.Body>
            <VStack spacing={4} align="stretch">
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                {isBulkOperation
                  ? `Are you sure you want to reject ${selectedRequests.length} request(s)?`
                  : "Are you sure you want to reject this request?"}{" "}
                Please provide a reason for rejection.
              </Text>

              <VStack align="start" spacing={2}>
                <Text
                  fontSize="sm"
                  fontWeight="medium"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Reason for Rejection *
                </Text>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a reason for rejecting this request..."
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                  _focus={{
                    borderColor: "#dc2626",
                    boxShadow: "0 0 0 1px #dc2626",
                  }}
                  maxLength={500}
                  resize="none"
                  rows={4}
                  required
                />
                <Text
                  fontSize="xs"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                >
                  {rejectReason.length}/500 characters
                </Text>
              </VStack>
            </VStack>
          </Dialog.Body>

          <Dialog.Footer>
            <HStack spacing={3}>
              <Button
                variant="outline"
                onClick={cancelReject}
                disabled={isProcessing}
                color={colorMode === "dark" ? "gray.300" : "gray.700"}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                colorPalette="red"
                onClick={confirmReject}
                loading={isProcessing}
                loadingText="Rejecting..."
                disabled={!rejectReason.trim()}
              >
                <LuX />
                Reject {isBulkOperation ? "All" : "Request"}
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default RejectDialog;
