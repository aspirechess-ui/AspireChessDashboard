import React, { useState } from "react";
import { Box, VStack, HStack, Text, Heading, Button } from "@chakra-ui/react";
import { useColorMode } from "../../../components/ui/color-mode";
import { ProfileSettings, AccountSettings } from "../../common";
import LichessSettings from "./LichessSettings";

const StudentSettings = () => {
  const { colorMode } = useColorMode();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    {
      id: "profile",
      label: "Profile Settings",
      component: <ProfileSettings userRole="student" />,
    },
    {
      id: "lichess",
      label: "Lichess Settings",
      component: <LichessSettings />,
    },
    {
      id: "account",
      label: "Account Settings",
      component: <AccountSettings />,
    },
    // Future tabs can be added here
    // { id: "preferences", label: "Learning Preferences", component: <LearningPreferences /> },
    // { id: "notifications", label: "Notifications", component: <NotificationSettings /> },
  ];

  return (
    <Box
      p={{ base: "4", md: "6" }}
      maxW="full"
      minH="100vh"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      <VStack spacing="6" align="stretch">
        {/* Header */}
        <Box>
          <Heading
            size="lg"
            mb="2"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Student Settings
          </Heading>
          <Text
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
            fontSize="md"
          >
            Manage your student profile and learning preferences
          </Text>
        </Box>

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
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                color={
                  activeTab === tab.id
                    ? "#0d9488"
                    : colorMode === "dark"
                    ? "gray.200"
                    : "gray.700"
                }
                fontWeight={activeTab === tab.id ? "semibold" : "normal"}
                px={{ base: "3", md: "4" }}
                py="3"
                fontSize={{ base: "sm", md: "md" }}
                onClick={() => setActiveTab(tab.id)}
                borderRadius="0"
                position="relative"
                _hover={{
                  bg:
                    activeTab === tab.id
                      ? colorMode === "dark"
                        ? "teal.900"
                        : "teal.50"
                      : colorMode === "dark"
                      ? "gray.800"
                      : "gray.100",
                  color:
                    activeTab === tab.id
                      ? "#0d9488"
                      : colorMode === "dark"
                      ? "white"
                      : "gray.900",
                }}
                _after={
                  activeTab === tab.id
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
                {tab.label}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* Tab Content */}
        <Box mt="6">{tabs.find((tab) => tab.id === activeTab)?.component}</Box>
      </VStack>
    </Box>
  );
};

export default StudentSettings;
