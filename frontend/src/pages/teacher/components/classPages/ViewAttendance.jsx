import React, { useState, useEffect, useCallback } from "react";
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Spinner,
  Center,
  Box,
} from "@chakra-ui/react";
import { LuClipboardList } from "react-icons/lu";
import { useColorMode } from "../../../../components/ui/color-mode";
import attendanceService from "../../../../services/attendance.js";
import MarkAttendanceCard from "../MarkAttendanceCard.jsx";
import OverallAttendance from "./OverallAttendance.jsx";
import IndividualAttendance from "./IndividualAttendance.jsx";

const ViewAttendance = ({ classData }) => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [hasAttendance, setHasAttendance] = useState(false);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Check if attendance records exist for this class
  const checkAttendanceExists = useCallback(async () => {
    try {
      setLoading(true);
      const response = await attendanceService.getClassAttendance(
        classData._id,
        {
          limit: 1, // Just check if any records exist
        }
      );

      if (response.success && response.data.attendanceRecords.length > 0) {
        setHasAttendance(true);
      } else {
        setHasAttendance(false);
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
      setHasAttendance(false);
    } finally {
      setLoading(false);
    }
  }, [classData._id]);

  useEffect(() => {
    if (classData?._id) {
      checkAttendanceExists();
    }
  }, [classData, checkAttendanceExists]);

  const handleAttendanceMarked = () => {
    setShowMarkAttendance(false);
    // Refresh attendance data
    checkAttendanceExists();
  };

  if (loading) {
    return (
      <Center h="200px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#0d9488" />
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            Loading attendance data...
          </Text>
        </VStack>
      </Center>
    );
  }

  // Show Mark Attendance Card
  if (showMarkAttendance) {
    return (
      <MarkAttendanceCard
        classData={classData}
        onSave={handleAttendanceMarked}
        onCancel={() => setShowMarkAttendance(false)}
      />
    );
  }

  // No attendance records - show start button
  if (!hasAttendance) {
    return (
      <VStack align="stretch" spacing={6}>
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
          p={8}
        >
          <VStack spacing={6} align="center">
            <Box
              p={4}
              bg={colorMode === "dark" ? "teal.900" : "teal.50"}
              borderRadius="full"
            >
              <LuClipboardList
                size={32}
                color={colorMode === "dark" ? "#5eead4" : "#0d9488"}
              />
            </Box>
            <VStack spacing={2} textAlign="center">
              <Text
                fontSize="xl"
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                No Attendance Records
              </Text>
              <Text
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
                maxW="md"
                lineHeight="1.6"
              >
                Start marking attendance for your students in this class. You
                can record attendance for specific dates and sessions.
              </Text>
            </VStack>
            <Button
              size="lg"
              bg="#0d9488"
              color="white"
              _hover={{
                bg: "#0f766e",
              }}
              _active={{
                bg: "#134e4a",
              }}
              leftIcon={<LuClipboardList />}
              onClick={() => setShowMarkAttendance(true)}
              px={8}
              py={6}
              fontSize="md"
              fontWeight="semibold"
            >
              Start Marking Attendance
            </Button>
          </VStack>
        </Card.Root>
      </VStack>
    );
  }

  // Has attendance records - show tabs
  return (
    <VStack align="stretch" spacing={6}>
      {/* Tab Navigation */}
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
              activeTab === 0
                ? "#0d9488"
                : colorMode === "dark"
                ? "gray.200"
                : "gray.700"
            }
            fontWeight={activeTab === 0 ? "semibold" : "normal"}
            px={{ base: "3", md: "4" }}
            py="3"
            fontSize={{ base: "sm", md: "md" }}
            onClick={() => setActiveTab(0)}
            borderRadius="0"
            position="relative"
            _after={
              activeTab === 0
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
            Overall Attendance
          </Button>
          <Button
            variant="ghost"
            color={
              activeTab === 1
                ? "#0d9488"
                : colorMode === "dark"
                ? "gray.200"
                : "gray.700"
            }
            fontWeight={activeTab === 1 ? "semibold" : "normal"}
            px={{ base: "3", md: "4" }}
            py="3"
            fontSize={{ base: "sm", md: "md" }}
            onClick={() => setActiveTab(1)}
            borderRadius="0"
            position="relative"
            _after={
              activeTab === 1
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
            Individual Attendance
          </Button>
        </HStack>
      </Box>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <OverallAttendance
            classData={classData}
            onMarkAttendance={() => setShowMarkAttendance(true)}
          />
        )}
        {activeTab === 1 && <IndividualAttendance classData={classData} />}
      </Box>
    </VStack>
  );
};

export default ViewAttendance;
