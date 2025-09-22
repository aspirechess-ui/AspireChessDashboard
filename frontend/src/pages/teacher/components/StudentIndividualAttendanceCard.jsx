import React, { useState, useEffect, useCallback } from "react";
import {
  VStack,
  HStack,
  Text,
  Card,
  Avatar,
  Table,
  Badge,
  Button,
  InputGroup,
  Input,
  SimpleGrid,
  Box,
  Spinner,
  Center,
  Select,
  Portal,
  createListCollection,
} from "@chakra-ui/react";
import {
  LuCalendar,
  LuFilter,
  LuDownload,
  LuArrowUpDown,
  LuChevronDown,
  LuChevronUp,
  LuCalendarDays,
  LuTarget,
  LuTrendingUp,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import attendanceService from "../../../services/attendance.js";

// Component for truncated notes with read more functionality
const TruncatedNote = ({ note, colorMode, maxLength = 50 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!note || note.trim() === "") {
    return (
      <Text
        color={colorMode === "dark" ? "gray.300" : "gray.600"}
        fontSize="sm"
      >
        -
      </Text>
    );
  }

  const shouldTruncate = note.length > maxLength;
  const displayText = isExpanded ? note : note.slice(0, maxLength);

  return (
    <VStack align="start" spacing={1}>
      <Text
        color={colorMode === "dark" ? "gray.300" : "gray.600"}
        fontSize="sm"
        wordBreak="break-word"
      >
        {displayText}
        {shouldTruncate && !isExpanded && "..."}
      </Text>
      {shouldTruncate && (
        <Button
          size="xs"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          color="#0d9488"
          _hover={{ bg: colorMode === "dark" ? "gray.700" : "gray.50" }}
          leftIcon={
            isExpanded ? <LuChevronUp size={12} /> : <LuChevronDown size={12} />
          }
        >
          {isExpanded ? "Show Less" : "Read More"}
        </Button>
      )}
    </VStack>
  );
};

const StudentIndividualAttendanceCard = ({ student, classData }) => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState(["all"]);
  const [sortBy, setSortBy] = useState(["date-desc"]);
  const [stats, setStats] = useState({
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    excusedCount: 0,
    attendancePercentage: 0,
  });
  const [error, setError] = useState(null);

  // Create collections for Select components
  const statusCollection = createListCollection({
    items: [
      { label: "All Statuses", value: "all" },
      { label: "Present", value: "present" },
      { label: "Absent", value: "absent" },
      { label: "Late", value: "late" },
      { label: "Excused", value: "excused" },
    ],
  });

  const sortCollection = createListCollection({
    items: [
      { label: "Date (Newest First)", value: "date-desc" },
      { label: "Date (Oldest First)", value: "date-asc" },
    ],
  });

  // Fetch student's attendance records
  const fetchStudentAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all attendance records for the class
      const response = await attendanceService.getClassAttendance(
        classData._id
      );

      if (response.success && response.data.attendanceRecords) {
        const allRecords = response.data.attendanceRecords;
        const studentRecords = [];

        console.log("All attendance records:", allRecords);
        console.log("Looking for student:", student._id);
        console.log("Student object:", student);

        // Extract records for this specific student
        allRecords.forEach((sessionRecord, sessionIndex) => {
          console.log(`Session ${sessionIndex}:`, sessionRecord);
          console.log(
            `Session ${sessionIndex} attendance records:`,
            sessionRecord.attendanceRecords
          );

          const studentAttendance = sessionRecord.attendanceRecords?.find(
            (record) => {
              // Handle both cases: when studentId is an object or a string
              const recordStudentId = record.studentId?._id || record.studentId;
              console.log(`Comparing ${recordStudentId} with ${student._id}`);
              return recordStudentId === student._id;
            }
          );

          console.log(
            `Student attendance found for session ${sessionIndex}:`,
            studentAttendance
          );

          if (studentAttendance) {
            studentRecords.push({
              sessionId: sessionRecord._id,
              sessionDate: sessionRecord.sessionDate,
              sessionTime: sessionRecord.sessionTime,
              status: studentAttendance.status,
              notes: studentAttendance.notes || "",
              markedAt: studentAttendance.markedAt,
            });
          }
        });

        console.log("Final student records:", studentRecords);

        // Sort by date (newest first by default)
        studentRecords.sort(
          (a, b) => new Date(b.sessionDate) - new Date(a.sessionDate)
        );

        setAttendanceRecords(studentRecords);
        setFilteredRecords(studentRecords);

        // Stats will be calculated by the useEffect that watches filteredRecords
      } else {
        setAttendanceRecords([]);
        setFilteredRecords([]);
      }
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      setError("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  }, [classData._id, student]);

  useEffect(() => {
    fetchStudentAttendance();
  }, [fetchStudentAttendance]);

  // Filter and sort records
  useEffect(() => {
    console.log("Filter effect triggered:", {
      attendanceRecords: attendanceRecords.length,
      startDate,
      endDate,
      statusFilter,
      sortBy,
    });

    let filtered = [...attendanceRecords];

    // Apply date filters
    if (startDate) {
      filtered = filtered.filter(
        (record) => new Date(record.sessionDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      filtered = filtered.filter(
        (record) => new Date(record.sessionDate) <= new Date(endDate)
      );
    }

    // Apply status filter
    if (statusFilter[0] && statusFilter[0] !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter[0]);
    }

    console.log("Before sorting:", filtered.length, "records");

    // Apply sorting
    const sortValue = sortBy[0] || "date-desc";
    console.log("Sorting with value:", sortValue);
    
    filtered.sort((a, b) => {
      switch (sortValue) {
        case "date-asc":
          return new Date(a.sessionDate) - new Date(b.sessionDate);
        case "date-desc":
          return new Date(b.sessionDate) - new Date(a.sessionDate);
        case "status-asc":
          return a.status.localeCompare(b.status);
        case "status-desc":
          return b.status.localeCompare(a.status);
        default:
          return new Date(b.sessionDate) - new Date(a.sessionDate);
      }
    });

    console.log("After sorting:", filtered.length, "records");
    console.log(
      "First few records:",
      filtered
        .slice(0, 3)
        .map((r) => ({ date: r.sessionDate, status: r.status }))
    );

    setFilteredRecords(filtered);
  }, [attendanceRecords, startDate, endDate, statusFilter, sortBy]);

  // Update stats based on filtered records
  useEffect(() => {
    console.log("Updating stats for filtered records:", filteredRecords.length);
    
    const totalSessions = filteredRecords.length;
    const presentCount = filteredRecords.filter(
      (r) => r.status === "present"
    ).length;
    const absentCount = filteredRecords.filter(
      (r) => r.status === "absent"
    ).length;
    const lateCount = filteredRecords.filter(
      (r) => r.status === "late"
    ).length;
    const excusedCount = filteredRecords.filter(
      (r) => r.status === "excused"
    ).length;
    const attendancePercentage =
      totalSessions > 0
        ? Math.round(((presentCount + lateCount) / totalSessions) * 100)
        : 0;

    setStats({
      totalSessions,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage,
    });
  }, [filteredRecords]);

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
      default:
        return "gray";
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDateSort = () => {
    const currentSort = sortBy[0] || "date-desc";
    const newSort = currentSort === "date-desc" ? "date-asc" : "date-desc";
    setSortBy([newSort]);
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setStatusFilter(["all"]);
    setSortBy(["date-desc"]);
  };

  if (loading) {
    return (
      <Center h="300px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#0d9488" />
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            Loading attendance records...
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
      {/* Student Header */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
      >
        <Card.Body p="6">
          <HStack spacing={4} align="start">
            <Avatar.Root size="lg">
              {student.userDetails?.profileImageUrl && (
                <Avatar.Image
                  src={student.userDetails.profileImageUrl}
                  alt={
                    student.userDetails
                      ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                      : student.email
                  }
                />
              )}
              <Avatar.Fallback
                name={
                  student.userDetails
                    ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                    : student.email
                }
              >
                {student.userDetails
                  ? `${student.userDetails.firstName?.charAt(0) || ""}${
                      student.userDetails.lastName?.charAt(0) || ""
                    }`
                  : student.email?.charAt(0).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
            <VStack align="start" spacing={1} flex="1">
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                {student.userDetails
                  ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                  : "Name not set"}
              </Text>
              <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
                {student.email}
              </Text>
              <Badge
                colorPalette={
                  stats.attendancePercentage >= 75
                    ? "green"
                    : stats.attendancePercentage >= 60
                    ? "orange"
                    : "red"
                }
                variant="subtle"
              >
                {stats.attendancePercentage}% Attendance
              </Badge>
            </VStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Statistics Cards */}
      <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4" textAlign="center">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              {stats.totalSessions}
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Total Sessions
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {stats.presentCount}
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Present
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              {stats.absentCount}
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Absent
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="orange.500">
              {stats.lateCount}
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Late
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p="4" textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {stats.excusedCount}
            </Text>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
            >
              Excused
            </Text>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      {/* Enhanced Filters & Sorting */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
      >
        <Card.Body p="4">
          <VStack spacing={6}>
            <HStack justify="space-between" w="full">
              <HStack spacing={2}>
                <Box
                  p={2}
                  bg={colorMode === "dark" ? "teal.900" : "teal.50"}
                  borderRadius="md"
                  color={colorMode === "dark" ? "teal.300" : "teal.600"}
                >
                  <LuFilter size={16} />
                </Box>
                <Text
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  fontSize="md"
                >
                  Filters & Sorting
                </Text>
              </HStack>
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                color="#0d9488"
                _hover={{
                  bg: colorMode === "dark" ? "teal.900" : "teal.50",
                }}
              >
                Clear All
              </Button>
            </HStack>

            {/* Date Range Filters */}
            <VStack spacing={4} w="full">
              <HStack w="full" justify="space-between">
                <HStack spacing={2}>
                  <LuCalendarDays size={16} color="#0d9488" />
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Date Range
                  </Text>
                </HStack>
              </HStack>
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="full">
                <VStack align="start" spacing={2}>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    From Date
                  </Text>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    size="sm"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                  />
                </VStack>

                <VStack align="start" spacing={2}>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    To Date
                  </Text>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    size="sm"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                  />
                </VStack>
              </SimpleGrid>
            </VStack>

            {/* Status and Sort Filters */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
              {/* Status Filter */}
              <VStack align="start" spacing={3}>
                <HStack spacing={2}>
                  <LuTarget size={16} color="#0d9488" />
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Filter by Status
                  </Text>
                </HStack>
                <Box w="full">
                  <Select.Root
                    collection={statusCollection}
                    value={statusFilter}
                    onValueChange={(details) => {
                      console.log("Status filter changed:", details.value);
                      setStatusFilter(details.value);
                    }}
                    size="sm"
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        bg={colorMode === "dark" ? "gray.700" : "white"}
                        borderColor={
                          colorMode === "dark" ? "gray.600" : "gray.300"
                        }
                        _focus={{
                          borderColor: "#0d9488",
                          boxShadow: "0 0 0 1px #0d9488",
                        }}
                        _hover={{
                          borderColor:
                            colorMode === "dark" ? "gray.500" : "gray.400",
                        }}
                      >
                        <Select.ValueText placeholder="All Statuses" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.200"
                          }
                          shadow="lg"
                        >
                          {statusCollection.items.map((item) => (
                            <Select.Item
                              key={item.value}
                              item={item}
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                              _hover={{
                                bg:
                                  colorMode === "dark" ? "gray.700" : "gray.50",
                              }}
                            >
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Box>
              </VStack>

              {/* Sort By */}
              <VStack align="start" spacing={3}>
                <HStack spacing={2}>
                  <LuTrendingUp size={16} color="#0d9488" />
                  <Text
                    fontSize="sm"
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    Sort By
                  </Text>
                </HStack>
                <Box w="full">
                  <Select.Root
                    collection={sortCollection}
                    value={sortBy}
                    onValueChange={(details) => {
                      console.log("Sort changed:", details.value);
                      setSortBy(details.value);
                    }}
                    size="sm"
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger
                        color={colorMode === "dark" ? "white" : "gray.900"}
                        bg={colorMode === "dark" ? "gray.700" : "white"}
                        borderColor={
                          colorMode === "dark" ? "gray.600" : "gray.300"
                        }
                        _focus={{
                          borderColor: "#0d9488",
                          boxShadow: "0 0 0 1px #0d9488",
                        }}
                        _hover={{
                          borderColor:
                            colorMode === "dark" ? "gray.500" : "gray.400",
                        }}
                      >
                        <Select.ValueText placeholder="Select sorting option" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content
                          bg={colorMode === "dark" ? "gray.800" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.200"
                          }
                          shadow="lg"
                        >
                          {sortCollection.items.map((item) => (
                            <Select.Item
                              key={item.value}
                              item={item}
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                              _hover={{
                                bg:
                                  colorMode === "dark" ? "gray.700" : "gray.50",
                              }}
                            >
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Box>
              </VStack>
            </SimpleGrid>

            {/* Filter Summary */}
            {(startDate ||
              endDate ||
              (statusFilter[0] && statusFilter[0] !== "all") ||
              (sortBy[0] && sortBy[0] !== "date-desc")) && (
              <Box
                w="full"
                p={3}
                bg={colorMode === "dark" ? "blue.900" : "blue.50"}
                borderRadius="md"
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "blue.700" : "blue.200"}
              >
                <HStack justify="space-between" align="center">
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "blue.200" : "blue.800"}
                    fontWeight="medium"
                  >
                    Active Filters: {filteredRecords.length} of{" "}
                    {attendanceRecords.length} records
                  </Text>
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={clearFilters}
                    color={colorMode === "dark" ? "blue.200" : "blue.600"}
                    _hover={{
                      bg: colorMode === "dark" ? "blue.800" : "blue.100",
                    }}
                  >
                    Reset
                  </Button>
                </HStack>
              </Box>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Attendance Records Table */}
      {filteredRecords.length > 0 ? (
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
            <HStack justify="space-between">
              <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Attendance Records ({filteredRecords.length})
              </Text>
              {/* <Button
                size="sm"
                variant="outline"
                leftIcon={<LuDownload />}
                color={colorMode === "dark" ? "gray.300" : "gray.700"}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
              >
                Export
              </Button> */}
            </HStack>
          </Card.Header>
          <Box bg={colorMode === "dark" ? "gray.800" : "white"}>
            <Table.Root variant="simple">
              <Table.Header bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                <Table.Row>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    cursor="pointer"
                    _hover={{
                      bg: colorMode === "dark" ? "gray.600" : "gray.100",
                    }}
                    onClick={handleDateSort}
                  >
                    <HStack spacing={1}>
                      <LuCalendar size={14} />
                      <Text>Date</Text>
                      {(sortBy[0] || "date-desc") === "date-desc" ? (
                        <LuChevronDown size={12} />
                      ) : (
                        <LuChevronUp size={12} />
                      )}
                    </HStack>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    display={{ base: "none", md: "table-cell" }}
                  >
                    Time
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                  >
                    Status
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    display={{ base: "none", lg: "table-cell" }}
                  >
                    Notes
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredRecords.map((record, index) => (
                  <Table.Row
                    key={`${record.sessionId}-${index}`}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.600" : "gray.50",
                    }}
                  >
                    <Table.Cell>
                      <VStack align="start" spacing={1}>
                        <Text
                          fontWeight="medium"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          {formatDate(record.sessionDate)}
                        </Text>
                        {/* Mobile-only info */}
                        <VStack
                          align="start"
                          spacing={1}
                          display={{ base: "flex", md: "none" }}
                          fontSize="xs"
                          color={colorMode === "dark" ? "gray.400" : "gray.500"}
                        >
                          <Text>Time: {formatTime(record.sessionTime)}</Text>
                          {record.notes && record.notes.trim() !== "" && (
                            <Box maxW="200px">
                              <Text fontWeight="medium" mb={1}>
                                Notes:
                              </Text>
                              <TruncatedNote
                                note={record.notes}
                                colorMode={colorMode}
                                maxLength={30}
                              />
                            </Box>
                          )}
                        </VStack>
                      </VStack>
                    </Table.Cell>
                    <Table.Cell display={{ base: "none", md: "table-cell" }}>
                      <Text
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        {formatTime(record.sessionTime)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge
                        colorPalette={getStatusColor(record.status)}
                        variant="subtle"
                      >
                        {getStatusText(record.status)}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell display={{ base: "none", lg: "table-cell" }}>
                      <TruncatedNote
                        note={record.notes}
                        colorMode={colorMode}
                        maxLength={50}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Box>
        </Card.Root>
      ) : (
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
              <LuCalendar
                size={24}
                color={colorMode === "dark" ? "#9ca3af" : "#6b7280"}
              />
            </Box>
            <VStack spacing={2} textAlign="center">
              <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                No Records Found
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                {attendanceRecords.length === 0
                  ? "No attendance has been recorded for this student yet."
                  : "No records match your current filters. Try adjusting the date range or status filter."}
              </Text>
            </VStack>
          </VStack>
        </Card.Root>
      )}
    </VStack>
  );
};

export default StudentIndividualAttendanceCard;
