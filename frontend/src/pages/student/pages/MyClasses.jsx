import React, { useState } from "react";
import {
  VStack,
  HStack,
  Text,
  Box,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { LuBookOpen, LuSearch, LuEye } from "react-icons/lu";
import { MdApps, MdList } from "react-icons/md";
import { useColorMode } from "../../../components/ui/color-mode";
import { Tooltip } from "../../../components/ui/tooltip";
import JoinedClasses from "../components/MyClassesPages/JoinedClasses";
import AvailableClasses from "../components/MyClassesPages/AvailableClasses";
import ClassJoinRequestStatus from "../components/MyClassesPages/AvailableClassesPages/ClassJoinRequestStatus";

const MyClasses = () => {
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState("card"); // "card" or "list"
  const [showRequestStatus, setShowRequestStatus] = useState(false);

  const tabs = [
    { id: 0, label: "Joined Classes", icon: LuBookOpen },
    { id: 1, label: "Available Classes", icon: LuSearch },
  ];

  return (
    <Box
      p={{ base: "4", md: "6" }}
      maxW="full"
      minH="100vh"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      <VStack align="stretch" spacing={6}>
        {/* Header */}
        <VStack align="start" spacing={2}>
          <HStack justify="space-between" w="full" align="center">
            <VStack align="start" spacing={2}>
              <Text fontSize="2xl" fontWeight="bold" color="#0d9488">
                My Classes
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                Manage your enrolled classes and discover new ones
              </Text>
            </VStack>

            {/* Request Status - only show for Available Classes tab */}
            {activeTab === 1 && (
              <Button
                leftIcon={<LuEye />}
                variant="outline"
                colorPalette="teal"
                onClick={() => setShowRequestStatus(true)}
                color={colorMode === "dark" ? "gray.300" : "gray.700"}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                _hover={{
                  bg: colorMode === "dark" ? "gray.700" : "gray.100",
                }}
                size="sm"
              >
                Request Status
              </Button>
            )}
          </HStack>
        </VStack>

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
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  color={
                    isActive
                      ? "#0d9488"
                      : colorMode === "dark"
                      ? "gray.200"
                      : "gray.700"
                  }
                  fontWeight={isActive ? "semibold" : "normal"}
                  px={{ base: "3", md: "4" }}
                  py="3"
                  fontSize={{ base: "sm", md: "md" }}
                  onClick={() => setActiveTab(tab.id)}
                  borderRadius="0"
                  position="relative"
                  _hover={{
                    bg: isActive
                      ? colorMode === "dark"
                        ? "teal.900"
                        : "teal.50"
                      : colorMode === "dark"
                      ? "gray.800"
                      : "gray.100",
                    color: isActive
                      ? "#0d9488"
                      : colorMode === "dark"
                      ? "white"
                      : "gray.900",
                  }}
                  _after={
                    isActive
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
                  <HStack spacing={2}>
                    <Icon size={16} />
                    <Text>{tab.label}</Text>
                  </HStack>
                </Button>
              );
            })}
          </HStack>
        </Box>

        {/* Tab Content */}
        <Box mt="6">
          {activeTab === 0 && (
            <JoinedClasses viewMode={viewMode} setViewMode={setViewMode} />
          )}
          {activeTab === 1 && (
            <AvailableClasses viewMode={viewMode} setViewMode={setViewMode} />
          )}
        </Box>
      </VStack>

      {/* Request Status Modal */}
      <ClassJoinRequestStatus
        isOpen={showRequestStatus}
        onClose={() => setShowRequestStatus(false)}
      />
    </Box>
  );
};

export default MyClasses;
