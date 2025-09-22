import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  Badge,
  Alert,
  Select,
  Input,
  Spinner,
  Center,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  LuCalendar,
  LuChartBar,
  LuTrendingUp,
  LuRefreshCw,
  LuFilter,
} from "react-icons/lu";
import { useColorMode } from "../../../../../components/ui/color-mode";
import AttendanceOverview from "./AttendanceComponents/AttendanceOverview";
import AttendanceCharts from "./AttendanceComponents/AttendanceCharts";
import AttendanceRecords from "./AttendanceComponents/AttendanceRecords";
import DateRangeFilter from "./AttendanceComponents/DateRangeFilter";
import attendanceService from "../../../../../services/attendance";

const StudentAttendance = ({ classData }) => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
    preset: "all", // 'all', 'week', 'month', 'custom'
  });
  const [refreshing, setRefreshing] = useState(false);

  // Responsive settings
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Date presets
  const getDatePresets = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      all: { startDate: null, endDate: null },
      week: {
        startDate: oneWeekAgo.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      },
      month: {
        startDate: oneMonthAgo.toISOString().split("T")[0],
        endDate: now.toISOString().split("T")[0],
      },
    };
  };

  // Fetch attendance data
  const fetchAttendanceData = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...filters,
        limit: 100, // Get more records for better analytics
      };

      console.log("Fetching attendance data with params:", params);

      // Fetch attendance records
      const attendanceResponse =
        await attendanceService.getStudentClassAttendance(
          classData._id,
          params
        );

      // Fetch attendance statistics
      const statsResponse = await attendanceService.getStudentAttendanceStats(
        classData._id,
        params
      );

      console.log("Attendance response:", attendanceResponse);
      console.log("Stats response:", statsResponse);

      if (attendanceResponse.success) {
        setAttendanceData(attendanceResponse.data.attendanceRecords || []);
      } else {
        throw new Error(
          attendanceResponse.message || "Failed to fetch attendance records"
        );
      }

      if (statsResponse.success) {
        setAttendanceStats(statsResponse.data);
      } else {
        console.warn(
          "Failed to fetch attendance stats:",
          statsResponse.message
        );
        // Set default stats if API fails
        setAttendanceStats({
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          excusedCount: 0,
          attendancePercentage: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError(error.message || "Failed to load attendance data");
      setAttendanceData([]);
      setAttendanceStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle date filter changes
  const handleDateFilterChange = (newFilter) => {
    console.log("Date filter changed:", newFilter);
    setDateFilter(newFilter);

    const presets = getDatePresets();
    let filterParams = {};

    if (newFilter.preset !== "all") {
      if (newFilter.preset === "custom") {
        filterParams = {
          startDate: newFilter.startDate,
          endDate: newFilter.endDate,
        };
      } else {
        filterParams = presets[newFilter.preset];
      }
    }

    fetchAttendanceData(filterParams);
  };

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    const presets = getDatePresets();
    let filterParams = {};

    if (dateFilter.preset !== "all") {
      if (dateFilter.preset === "custom") {
        filterParams = {
          startDate: dateFilter.startDate,
          endDate: dateFilter.endDate,
        };
      } else {
        filterParams = presets[dateFilter.preset];
      }
    }

    fetchAttendanceData(filterParams);
  };

  // Load initial data
  useEffect(() => {
    if (classData?._id) {
      console.log("Loading attendance for class:", classData._id);
      fetchAttendanceData();
    }
  }, [classData?._id]);

  if (!classData) {
    return (
      <Center h="400px">
        <VStack spacing={3}>
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            No class data available
          </Text>
        </VStack>
      </Center>
    );
  }

  if (loading && !refreshing) {
    return (
      <Center h="400px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#0d9488" />
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            Loading attendance data...
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
            <Alert.Title>Error Loading Attendance</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <Button
          mt={4}
          leftIcon={<LuRefreshCw />}
          onClick={handleRefresh}
          colorPalette="teal"
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Header */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Card.Header p={{ base: 4, md: 6 }}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="start">
                <VStack align="start" spacing={1}>
                  <Heading
                    size={{ base: "md", md: "lg" }}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Attendance Overview
                  </Heading>
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    {classData.className} • Track your class attendance
                  </Text>
                </VStack>
                <Button
                  leftIcon={<LuRefreshCw />}
                  onClick={handleRefresh}
                  isLoading={refreshing}
                  loadingText={isMobile ? "..." : "Refreshing"}
                  size="sm"
                  variant="outline"
                  colorPalette="teal"
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                    borderColor: "#0d9488",
                    color: colorMode === "dark" ? "white" : "gray.900",
                  }}
                  _active={{
                    bg: colorMode === "dark" ? "gray.600" : "gray.200",
                  }}
                  px={{ base: 3, md: 4 }}
                  minW={{ base: "auto", md: "100px" }}
                >
                  {isMobile ? <Text fontSize="xs">Refresh</Text> : "Refresh"}
                </Button>
              </HStack>

              {/* Date Filter */}
              <DateRangeFilter
                currentFilter={dateFilter}
                onFilterChange={handleDateFilterChange}
              />
            </VStack>
          </Card.Header>
        </Card.Root>

        {/* Stats Overview */}
        {attendanceStats && (
          <AttendanceOverview
            stats={attendanceStats}
            loading={refreshing}
            dateFilter={dateFilter}
          />
        )}

        {/* Charts */}
        {attendanceData.length > 0 && (
          <AttendanceCharts
            attendanceData={attendanceData}
            stats={attendanceStats}
            loading={refreshing}
          />
        )}

        {/* Records Table */}
        <AttendanceRecords
          attendanceData={attendanceData}
          loading={refreshing}
        />
      </VStack>
    </Box>
  );
};

export default StudentAttendance;
