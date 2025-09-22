import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Spinner,
  Center,
  Alert,
  Breadcrumb,
  InputGroup,
  Input,
  Badge,
} from "@chakra-ui/react";
import {
  LuSearch,
  LuChevronRight,
  LuUsers,
  LuBell,
  LuCalendar,
  LuSettings,
  LuArrowLeft,
} from "react-icons/lu";
import { useColorMode } from "../../../../../components/ui/color-mode";

// Import tab components
import StudentAttendance from "./StudentAttendance";
import ClassMembers from "./ClassMembers";
import StudentClassAnnouncement from "./StudentClassAnnouncement";
import StudentClassSettings from "./StudentClassSettings";

const ClassPage = () => {
  const { colorMode } = useColorMode();
  const { className } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const handleBackToClasses = () => {
    navigate("/student/classes");
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    // Get class data from navigation state or fetch it
    if (location.state?.classData) {
      setClassData(location.state.classData);
      setLoading(false);
    } else if (className) {
      // If no state, we could fetch the class data here
      // For now, we'll redirect back to classes
      navigate("/student/classes");
    } else {
      setError("No class data available");
      setLoading(false);
    }
  }, [className, location.state, navigate]);

  if (loading) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="xl" color="#0d9488" />
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            Loading class...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={6}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Error</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <Button mt={4} onClick={handleBackToClasses}>
          Back to Classes
        </Button>
      </Box>
    );
  }

  const tabs = [
    {
      id: 0,
      label: "Attendance",
      icon: LuCalendar,
      component: <StudentAttendance classData={classData} />,
    },
    {
      id: 1,
      label: "Members",
      icon: LuUsers,
      component: <ClassMembers classData={classData} />,
    },
    {
      id: 2,
      label: "Announcements",
      icon: LuBell,
      component: <StudentClassAnnouncement classData={classData} />,
    },
    {
      id: 3,
      label: "Settings",
      icon: LuSettings,
      component: <StudentClassSettings classData={classData} />,
    },
  ];

  return (
    <Box
      p={{ base: "4", md: "6" }}
      maxW="full"
      minH="100vh"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      <VStack align="stretch" spacing={6}>
        {/* Breadcrumb */}
        <Box>
          <Breadcrumb.Root
            fontSize="sm"
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
          >
            <Breadcrumb.List gap="2">
              <Breadcrumb.Item>
                <Breadcrumb.Link
                  onClick={handleBackToClasses}
                  cursor="pointer"
                  _hover={{ color: "#0d9488" }}
                >
                  Classes
                </Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator>
                <LuChevronRight
                  color={colorMode === "dark" ? "#6B7280" : "#9CA3AF"}
                />
              </Breadcrumb.Separator>
              <Breadcrumb.Item>
                <Breadcrumb.CurrentLink
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {classData?.className || className}
                </Breadcrumb.CurrentLink>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </Box>

        {/* Back Button */}
        <Box ml="4">
          <HStack spacing={2}>
            <Box
              color="#0d9488"
              fontSize="lg"
              cursor="pointer"
              onClick={handleBackToClasses}
              _hover={{
                color: "#0f766e",
              }}
            >
              <LuArrowLeft size={20} />
            </Box>
            <Button
              variant="ghost"
              onClick={handleBackToClasses}
              size="sm"
              color={colorMode === "dark" ? "white" : "black"}
              _hover={{
                bg: colorMode === "dark" ? "gray.700" : "gray.100",
              }}
              pl="0"
              fontWeight="medium"
            >
              Back to Classes
            </Button>
          </HStack>
        </Box>

        {/* Header */}
        <VStack align="start" spacing={4}>
          <VStack align="start" spacing={2}>
            <Heading
              size="xl"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              {classData?.className}
            </Heading>
            {classData?.description && (
              <Text
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
                fontSize="sm"
              >
                {classData.description}
              </Text>
            )}
          </VStack>

          {/* Class Stats */}
          <HStack spacing={6} wrap="wrap">
            <HStack spacing={2}>
              <LuUsers
                size={16}
                color={colorMode === "dark" ? "#D1D5DB" : "#6B7280"}
              />
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                {classData?.currentEnrolledStudents || 0} Students
                {classData?.maxStudents && ` (Max: ${classData.maxStudents})`}
              </Text>
            </HStack>

            {classData?.schedule && (
              <HStack spacing={2}>
                <LuCalendar size={16} />
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  {classData.schedule.days?.join(", ")} at{" "}
                  {formatTime(classData.schedule.startTime)}
                </Text>
              </HStack>
            )}

            <Badge colorPalette="green" variant="subtle" size="sm">
              Joined
            </Badge>
          </HStack>
        </VStack>

        {/* Tabs - Following MyClasses.jsx pattern */}
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

        {/* Search Bar - Only show for Members tab */}
        {activeTab === 1 && (
          <Box maxW="400px">
            <InputGroup startElement={<LuSearch />}>
              <Input
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={colorMode === "dark" ? "gray.700" : "white"}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                color={colorMode === "dark" ? "white" : "gray.900"}
                _placeholder={{
                  color: colorMode === "dark" ? "gray.400" : "gray.500",
                }}
                _focus={{
                  borderColor: "#0d9488",
                  boxShadow: "0 0 0 1px #0d9488",
                }}
              />
            </InputGroup>
          </Box>
        )}

        {/* Tab Content */}
        <Box>{tabs.find((tab) => tab.id === activeTab)?.component}</Box>
      </VStack>
    </Box>
  );
};

export default ClassPage;
