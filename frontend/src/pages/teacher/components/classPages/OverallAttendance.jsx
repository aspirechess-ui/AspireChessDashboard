import React, { useState, useEffect, useCallback } from "react";
import {
  VStack,
  HStack,
  Text,
  Button,
  Card,
  SimpleGrid,
  Box,
  Badge,
  Table,
  Spinner,
  Center,
  Input,
  Alert,
} from "@chakra-ui/react";
import {
  LuCalendar,
  LuUsers,
  LuTrendingUp,
  LuTrendingDown,
  LuClipboardList,
  LuActivity,
  LuArrowUpDown,
  LuFilter,
  LuArrowDown,
  LuArrowUp,
} from "react-icons/lu";
import { useColorMode } from "../../../../components/ui/color-mode";
import attendanceService from "../../../../services/attendance.js";

const OverallAttendance = ({ classData, onMarkAttendance }) => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [dateError, setDateError] = useState("");

  // Fetch attendance statistics and recent records
  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse = await attendanceService.getAttendanceStats(
        classData._id
      );

      // Fetch recent attendance records
      const recordsResponse = await attendanceService.getClassAttendance(
        classData._id,
        {
          limit: 5,
          page: 1,
        }
      );

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (recordsResponse.success) {
        setRecentRecords(recordsResponse.data.attendanceRecords || []);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to load attendance data");
      // Set default values for development
      setStats({
        totalSessions: 0,
        averageAttendance: 0,
        totalStudents: classData.currentEnrolledStudents || 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        excusedCount: 0,
      });
      setRecentRecords([]);
    } finally {
      setLoading(false);
    }
  }, [classData._id, classData.currentEnrolledStudents]);

  useEffect(() => {
    if (classData?._id) {
      fetchAttendanceData();
    }
  }, [classData, fetchAttendanceData]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString || "N/A";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "green";
      case "absent":
        return "red";
      case "late":
        return "orange";
      case "excused":
        return "blue";
      case "final":
        return "green";
      case "draft":
        return "yellow";
      default:
        return "gray";
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Sort recent records
  const sortedRecentRecords = [...recentRecords].sort((a, b) => {
    const comparison = new Date(a.sessionDate) - new Date(b.sessionDate);
    return sortBy === "newest" ? -comparison : comparison;
  });

  // Date filtering functions
  const handleDateChange = (field, value) => {
    const newDateFilter = { ...dateFilter, [field]: value };
    setDateFilter(newDateFilter);

    // Validate dates only if both are provided
    if (newDateFilter.startDate && newDateFilter.endDate) {
      const startDate = new Date(newDateFilter.startDate);
      const endDate = new Date(newDateFilter.endDate);

      if (startDate > endDate) {
        setDateError("Start date cannot be greater than end date");
        return;
      } else {
        setDateError("");
      }
    } else {
      setDateError("");
    }

    // Fetch data with filter even if only one date is provided
    if (newDateFilter.startDate || newDateFilter.endDate) {
      fetchAttendanceDataWithFilter(newDateFilter);
    } else {
      // If both dates are cleared, fetch all data
      fetchAttendanceData();
    }
  };
  const fetchAttendanceDataWithFilter = async (filter) => {
    try {
      setLoading(true);

      const params = { limit: 5, page: 1 };
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;

      // Create filter object for stats - pass filter if any date is provided
      const statsFilter =
        filter.startDate || filter.endDate ? filter : undefined;

      // Fetch statistics with date filter
      const statsResponse = await attendanceService.getAttendanceStats(
        classData._id,
        statsFilter
      );

      // Fetch recent attendance records with date filter
      const recordsResponse = await attendanceService.getClassAttendance(
        classData._id,
        params
      );

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (recordsResponse.success) {
        setRecentRecords(recordsResponse.data.attendanceRecords || []);
      }
    } catch (error) {
      console.error("Error fetching filtered attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center h="300px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#0d9488" />
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            Loading attendance statistics...
          </Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Card.Root
        bg={colorMode === "dark" ? "red.900" : "red.50"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "red.700" : "red.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
        p={6}
      >
        <VStack spacing={3} align="center">
          <Text
            fontWeight="semibold"
            color={colorMode === "dark" ? "red.200" : "red.800"}
          >
            Error Loading Data
          </Text>
          <Text
            fontSize="sm"
            color={colorMode === "dark" ? "red.300" : "red.600"}
            textAlign="center"
          >
            {error}
          </Text>
        </VStack>
      </Card.Root>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header with Mark Attendance Button */}
      <HStack justify="space-between" align="start">
        <VStack align="start" spacing={1}>
          <Text
            fontSize="lg"
            fontWeight="semibold"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Overall Attendance Statistics
          </Text>
          <Text
            fontSize="sm"
            color={colorMode === "dark" ? "gray.400" : "gray.600"}
          >
            View comprehensive attendance data for this class
          </Text>
        </VStack>
        <Button
          size="sm"
          bg="#0d9488"
          color="white"
          _hover={{
            bg: "#0f766e",
          }}
          _active={{
            bg: "#134e4a",
          }}
          leftIcon={<LuClipboardList />}
          onClick={onMarkAttendance}
        >
          Mark Attendance
        </Button>
      </HStack>

      {/* Date Filter */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
      >
        <Card.Body p="4">
          <VStack spacing="4" align="stretch">
            <HStack spacing="2" align="center">
              <LuFilter size={16} color="#0d9488" />
              <Text
                fontSize="md"
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Filter by Date Range
              </Text>
            </HStack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="4">
              <VStack align="start" spacing="2">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  From Date
                </Text>
                <Input
                  type="date"
                  value={dateFilter.startDate}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _hover={{
                    borderColor: colorMode === "dark" ? "gray.500" : "gray.400",
                  }}
                  _focus={{
                    borderColor: "#0d9488",
                    boxShadow: "0 0 0 1px #0d9488",
                  }}
                />
              </VStack>

              <VStack align="start" spacing="2">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  To Date
                </Text>
                <Input
                  type="date"
                  value={dateFilter.endDate}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                  bg={colorMode === "dark" ? "gray.700" : "white"}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _hover={{
                    borderColor: colorMode === "dark" ? "gray.500" : "gray.400",
                  }}
                  _focus={{
                    borderColor: "#0d9488",
                    boxShadow: "0 0 0 1px #0d9488",
                  }}
                />
              </VStack>
            </SimpleGrid>

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setDateFilter({ startDate: "", endDate: "" });
                setDateError("");
                fetchAttendanceData();
              }}
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
              _hover={{
                bg: colorMode === "dark" ? "gray.700" : "gray.100",
              }}
              alignSelf={{ base: "stretch", md: "flex-start" }}
            >
              Clear Filters
            </Button>

            {dateError && (
              <Alert.Root status="error" size="sm">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description fontSize="sm">
                    {dateError}
                  </Alert.Description>
                </Alert.Content>
              </Alert.Root>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {/* Total Sessions */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4">
            <HStack spacing={3}>
              <Box
                p={2}
                bg={colorMode === "dark" ? "blue.900" : "blue.50"}
                borderRadius="md"
              >
                <LuCalendar
                  size={20}
                  color={colorMode === "dark" ? "#93c5fd" : "#3b82f6"}
                />
              </Box>
              <VStack align="start" spacing={0}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {stats?.totalSessions || 0}
                </Text>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Total Sessions
                </Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Average Attendance */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4">
            <HStack spacing={3}>
              <Box
                p={2}
                bg={colorMode === "dark" ? "green.900" : "green.50"}
                borderRadius="md"
              >
                <LuTrendingUp
                  size={20}
                  color={colorMode === "dark" ? "#86efac" : "#10b981"}
                />
              </Box>
              <VStack align="start" spacing={0}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {stats?.averageAttendance
                    ? `${Math.round(stats.averageAttendance)}%`
                    : "0%"}
                </Text>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Average Attendance
                </Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Total Students */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4">
            <HStack spacing={3}>
              <Box
                p={2}
                bg={colorMode === "dark" ? "purple.900" : "purple.50"}
                borderRadius="md"
              >
                <LuUsers
                  size={20}
                  color={colorMode === "dark" ? "#c4b5fd" : "#8b5cf6"}
                />
              </Box>
              <VStack align="start" spacing={0}>
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {stats?.totalStudents ||
                    classData.currentEnrolledStudents ||
                    0}
                </Text>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Total Students
                </Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Attendance Rate Trend */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4">
            <HStack spacing={3}>
              <Box
                p={2}
                bg={colorMode === "dark" ? "orange.900" : "orange.50"}
                borderRadius="md"
              >
                <LuActivity
                  size={20}
                  color={colorMode === "dark" ? "#fdba74" : "#f97316"}
                />
              </Box>
              <VStack align="start" spacing={0}>
                <HStack spacing={1}>
                  <Text
                    fontSize="2xl"
                    fontWeight="bold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    {stats?.averageAttendance >= 80
                      ? "Good"
                      : stats?.averageAttendance >= 60
                      ? "Fair"
                      : "Poor"}
                  </Text>
                  {stats?.averageAttendance >= 70 ? (
                    <LuTrendingUp color="#10b981" size={16} />
                  ) : (
                    <LuTrendingDown color="#ef4444" size={16} />
                  )}
                </HStack>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Attendance Trend
                </Text>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Attendance Breakdown */}
      {stats &&
        (stats.presentCount > 0 ||
          stats.absentCount > 0 ||
          stats.lateCount > 0 ||
          stats.excusedCount > 0) && (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            shadow={colorMode === "dark" ? "lg" : "sm"}
          >
            <Card.Header
              p="4"
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Attendance Breakdown
              </Text>
            </Card.Header>
            <Card.Body p="4">
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">
                    {stats.presentCount || 0}
                  </Text>
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    Present
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="bold" color="red.500">
                    {stats.absentCount || 0}
                  </Text>
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    Absent
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                    {stats.lateCount || 0}
                  </Text>
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    Late
                  </Text>
                </VStack>
                <VStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                    {stats.excusedCount || 0}
                  </Text>
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    Excused
                  </Text>
                </VStack>
              </SimpleGrid>
            </Card.Body>
          </Card.Root>
        )}

      {/* Recent Attendance Records */}
      {recentRecords.length > 0 && (
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Header
            p="4"
            borderBottomWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <HStack justify="space-between" align="center" wrap="wrap" gap="2">
              <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Recent Sessions
              </Text>
              <HStack spacing="2" wrap="wrap">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Sort by:
                </Text>
                <HStack spacing="1">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() =>
                      setSortBy(sortBy === "newest" ? "oldest" : "newest")
                    }
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.700" : "gray.100",
                    }}
                  >
                    <HStack spacing="1">
                      {sortBy === "newest" ? (
                        <LuArrowDown size={12} />
                      ) : (
                        <LuArrowUp size={12} />
                      )}
                      <Text fontSize="xs">
                        {sortBy === "newest" ? "Newest" : "Oldest"}
                      </Text>
                    </HStack>
                  </Button>
                </HStack>
              </HStack>
            </HStack>
          </Card.Header>
          <Box bg={colorMode === "dark" ? "gray.800" : "white"}>
            <Table.Root variant="simple">
              <Table.Header bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                <Table.Row>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    fontWeight="semibold"
                    py="3"
                  >
                    Date
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    fontWeight="semibold"
                    py="3"
                    display={{ base: "none", md: "table-cell" }}
                  >
                    Time
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    fontWeight="semibold"
                    py="3"
                  >
                    Present
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    fontWeight="semibold"
                    py="3"
                  >
                    Total
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    fontWeight="semibold"
                    py="3"
                  >
                    Status
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedRecentRecords.map((record) => (
                  <Table.Row
                    key={record._id}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.600" : "gray.50",
                    }}
                  >
                    <Table.Cell py="3">
                      <Text
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        fontWeight="medium"
                      >
                        {formatDate(record.sessionDate)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell
                      py="3"
                      display={{ base: "none", md: "table-cell" }}
                    >
                      <Text
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        {formatTime(record.sessionTime)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell py="3">
                      <Text
                        color={colorMode === "dark" ? "green.400" : "green.600"}
                        fontWeight="medium"
                      >
                        {record.presentCount || 0}
                      </Text>
                    </Table.Cell>
                    <Table.Cell py="3">
                      <Text
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                        fontWeight="medium"
                      >
                        {record.totalStudents || 0}
                      </Text>
                    </Table.Cell>
                    <Table.Cell py="3">
                      <Badge
                        colorPalette={getStatusColor(record.status)}
                        variant="subtle"
                      >
                        {getStatusText(record.status)}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Card.Root>
      )}

      {/* No Recent Records */}
      {recentRecords.length === 0 && (
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
          p={6}
        >
          <VStack spacing={4} align="center">
            <Box
              p={3}
              bg={colorMode === "dark" ? "gray.700" : "gray.100"}
              borderRadius="full"
            >
              <LuClipboardList
                size={24}
                color={colorMode === "dark" ? "#9ca3af" : "#6b7280"}
              />
            </Box>
            <VStack spacing={2} textAlign="center">
              <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                No Recent Sessions
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                Start marking attendance to see session records here.
              </Text>
            </VStack>
          </VStack>
        </Card.Root>
      )}
    </VStack>
  );
};

export default OverallAttendance;
