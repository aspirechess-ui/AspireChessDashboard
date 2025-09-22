import React, { useState } from "react";
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import { useColorMode } from "../../../components/ui/color-mode";
import Batches from "../components/Batches";
import SignUpCodes from "../components/SignUpCodes";
import ActivityLog from "../components/ActivityLog";
import CreateBatchCard from "../components/CreateBatchCard";

const ManageBatches = () => {
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState("batches");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleBatchCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
    setShowCreateModal(false);
  };

  return (
    <Box
      p={{ base: "4", md: "6" }}
      maxW="full"
      minH="100vh"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      <VStack spacing="6" align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="4">
          <Box>
            <Heading
              size="lg"
              mb="2"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Manage Batches
            </Heading>
            <Text
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              fontSize="md"
            >
              Create and manage student batches with signup codes
            </Text>
          </Box>
          {activeTab === "batches" && (
            <Button
              colorPalette="teal"
              leftIcon={<FaPlus />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Batch
            </Button>
          )}
        </Flex>

        {/* Tabs */}
        <Box
          overflowX="auto"
          css={{
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
          }}
        >
          <HStack
            minW="max-content"
            bg={colorMode === "dark" ? "gray.900" : "gray.50"}
            whiteSpace="nowrap"
            px={{ base: "2", md: "0" }}
            borderBottom="1px solid"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            spacing="0"
          >
            <Button
              variant="ghost"
              color={
                activeTab === "batches"
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === "batches" ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab("batches")}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === "batches"
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === "batches"
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === "batches"
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: "-1px",
                      left: "0",
                      right: "0",
                      height: "3px",
                      bg: "#0d9488",
                      borderRadius: "2px 2px 0 0",
                    }
                  : {}
              }
            >
              Batches
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === "signup-codes"
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === "signup-codes" ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab("signup-codes")}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === "signup-codes"
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === "signup-codes"
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === "signup-codes"
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: "-1px",
                      left: "0",
                      right: "0",
                      height: "3px",
                      bg: "#0d9488",
                      borderRadius: "2px 2px 0 0",
                    }
                  : {}
              }
            >
              Signup Codes
            </Button>
            <Button
              variant="ghost"
              color={
                activeTab === "activity-log"
                  ? "#0d9488"
                  : colorMode === "dark"
                  ? "gray.200"
                  : "gray.700"
              }
              fontWeight={activeTab === "activity-log" ? "semibold" : "normal"}
              px={{ base: "3", md: "4" }}
              py="3"
              fontSize={{ base: "sm", md: "md" }}
              onClick={() => setActiveTab("activity-log")}
              borderRadius="0"
              position="relative"
              _hover={{
                bg:
                  activeTab === "activity-log"
                    ? colorMode === "dark"
                      ? "teal.900"
                      : "teal.50"
                    : colorMode === "dark"
                    ? "gray.800"
                    : "gray.100",
                color:
                  activeTab === "activity-log"
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "white"
                    : "gray.900",
              }}
              _after={
                activeTab === "activity-log"
                  ? {
                      content: '""',
                      position: "absolute",
                      bottom: "-1px",
                      left: "0",
                      right: "0",
                      height: "3px",
                      bg: "#0d9488",
                      borderRadius: "2px 2px 0 0",
                    }
                  : {}
              }
            >
              Activity Log
            </Button>
          </HStack>
        </Box>

        {/* Tab Content */}
        <Box mt="6">
          {activeTab === "batches" && (
            <Batches refreshTrigger={refreshTrigger} />
          )}
          {activeTab === "signup-codes" && (
            <SignUpCodes refreshTrigger={refreshTrigger} />
          )}
          {activeTab === "activity-log" && (
            <ActivityLog refreshTrigger={refreshTrigger} />
          )}
        </Box>
      </VStack>

      {/* Create Batch Modal */}
      <CreateBatchCard
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleBatchCreated}
      />
    </Box>
  );
};

export default ManageBatches;
