import React from "react";
import { HStack, VStack, Text, Button, Badge } from "@chakra-ui/react";
import { LuX, LuClock, LuUsers } from "react-icons/lu";

const PendingRequestsHeader = ({
  colorMode,
  pendingRequests,
  onClose,
  currentView,
  setCurrentView,
}) => {
  return (
    <VStack spacing={3} align="stretch">
      {/* Header with title and close button */}
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <HStack>
            <Text
              fontWeight="semibold"
              color={colorMode === "dark" ? "white" : "gray.900"}
              fontSize={{ base: "md", md: "lg" }}
            >
              Join Requests
            </Text>
            {currentView === "pending" && pendingRequests.length > 0 && (
              <Badge
                colorPalette="orange"
                variant="solid"
                size={{ base: "xs", md: "sm" }}
              >
                {pendingRequests.length}
              </Badge>
            )}
          </HStack>
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color={colorMode === "dark" ? "gray.400" : "gray.600"}
          >
            {currentView === "pending"
              ? "Review and approve student requests to join this class"
              : "View history of approved and rejected requests"}
          </Text>
        </VStack>

        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          color={colorMode === "dark" ? "gray.400" : "gray.600"}
        >
          <LuX />
        </Button>
      </HStack>

      {/* View Toggle Buttons */}
      <HStack spacing={1}>
        <Button
          size="sm"
          variant={currentView === "pending" ? "solid" : "outline"}
          colorPalette="orange"
          onClick={() => setCurrentView("pending")}
          leftIcon={<LuUsers />}
        >
          Pending
          {pendingRequests.length > 0 && (
            <Badge
              ml={2}
              colorPalette={currentView === "pending" ? "white" : "orange"}
              variant="subtle"
              size="xs"
            >
              {pendingRequests.length}
            </Badge>
          )}
        </Button>
        <Button
          size="sm"
          variant={currentView === "history" ? "solid" : "outline"}
          colorPalette="orange"
          onClick={() => setCurrentView("history")}
          leftIcon={<LuClock />}
        >
          History
        </Button>
      </HStack>
    </VStack>
  );
};

export default PendingRequestsHeader;
