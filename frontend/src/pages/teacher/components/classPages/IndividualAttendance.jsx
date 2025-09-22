import React, { useState, useEffect, useCallback } from "react";
import {
  VStack,
  HStack,
  Text,
  Card,
  Avatar,
  SimpleGrid,
  Box,
  Badge,
  Spinner,
  Center,
  Button,
  InputGroup,
  Input,
  IconButton,
  Flex,
  Table,
} from "@chakra-ui/react";
import { LuSearch, LuUser, LuCalendar, LuArrowLeft } from "react-icons/lu";
import { MdApps, MdList } from "react-icons/md";
import { useColorMode } from "../../../../components/ui/color-mode";
import { Tooltip } from "../../../../components/ui/tooltip";
import attendanceService from "../../../../services/attendance.js";
import StudentIndividualAttendanceCard from "../StudentIndividualAttendanceCard.jsx";

const IndividualAttendance = ({ classData }) => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendanceStats, setStudentAttendanceStats] = useState({});
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "card" or "list"
  const [sortBy, setSortBy] = useState("name"); // "name", "attendance", "sessions"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc", "desc"
  const [enableDateFilter, setEnableDateFilter] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dateError, setDateError] = useState("");

  // Get current month's first and last dates
  const getCurrentMonthDates = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    return {
      firstDate: formatDate(firstDay),
      lastDate: formatDate(lastDay),
    };
  };

  // Initialize date filter with current month
  useEffect(() => {
    if (enableDateFilter && !fromDate && !toDate) {
      const { firstDate, lastDate } = getCurrentMonthDates();
      setFromDate(firstDate);
      setToDate(lastDate);
    }
  }, [enableDateFilter, fromDate, toDate]);

  // Calculate individual student attendance statistics
  const calculateStudentStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all attendance records for the class
      const response = await attendanceService.getClassAttendance(
        classData._id
      );

      if (response.success && response.data.attendanceRecords) {
        const attendanceRecords = response.data.attendanceRecords;
        const stats = {};

        // Initialize stats for all enrolled students
        classData.enrolledStudents?.forEach((student) => {
          stats[student._id] = {
            totalSessions: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            excusedCount: 0,
            attendancePercentage: 0,
          };
        });

        // Filter records by date range if enabled and specified
        let filteredRecords = attendanceRecords;
        if (enableDateFilter && (fromDate || toDate)) {
          filteredRecords = attendanceRecords.filter((record) => {
            const recordDate = new Date(record.sessionDate);
            let includeRecord = true;

            // If fromDate is specified, check if record is on or after that date
            if (fromDate) {
              const fromDateTime = new Date(fromDate);
              includeRecord = includeRecord && recordDate >= fromDateTime;
            }

            // If toDate is specified, check if record is on or before that date
            if (toDate) {
              const toDateTime = new Date(toDate);
              // Set time to end of day for toDate to include the full day
              toDateTime.setHours(23, 59, 59, 999);
              includeRecord = includeRecord && recordDate <= toDateTime;
            }

            return includeRecord;
          });
        }

        // Calculate stats from filtered attendance records
        filteredRecords.forEach((record) => {
          record.attendanceRecords?.forEach((attendance) => {
            // Handle both cases: when studentId is an object or a string
            const studentId = attendance.studentId?._id || attendance.studentId;
            if (stats[studentId]) {
              stats[studentId].totalSessions++;

              switch (attendance.status) {
                case "present":
                  stats[studentId].presentCount++;
                  break;
                case "absent":
                  stats[studentId].absentCount++;
                  break;
                case "late":
                  stats[studentId].lateCount++;
                  break;
                case "excused":
                  stats[studentId].excusedCount++;
                  break;
              }
            }
          });
        });

        // Calculate attendance percentages
        Object.keys(stats).forEach((studentId) => {
          const studentStats = stats[studentId];
          if (studentStats.totalSessions > 0) {
            studentStats.attendancePercentage = Math.round(
              ((studentStats.presentCount + studentStats.lateCount) /
                studentStats.totalSessions) *
                100
            );
          }
        });

        setStudentAttendanceStats(stats);
        setStudents(classData.enrolledStudents || []);
      } else {
        // No attendance records yet
        setStudents(classData.enrolledStudents || []);
        const emptyStats = {};
        classData.enrolledStudents?.forEach((student) => {
          emptyStats[student._id] = {
            totalSessions: 0,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            excusedCount: 0,
            attendancePercentage: 0,
          };
        });
        setStudentAttendanceStats(emptyStats);
      }
    } catch (error) {
      console.error("Error calculating student stats:", error);
      setError("Failed to load student attendance data");
      setStudents(classData.enrolledStudents || []);
    } finally {
      setLoading(false);
    }
  }, [
    classData._id,
    classData.enrolledStudents,
    enableDateFilter,
    fromDate,
    toDate,
  ]);

  // Validate date range
  const validateDateRange = (from, to) => {
    if (from && to) {
      const fromDateTime = new Date(from);
      const toDateTime = new Date(to);
      if (fromDateTime > toDateTime) {
        setDateError("From date cannot be greater than To date");
        return false;
      }
    }
    setDateError("");
    return true;
  };

  // Handle date changes
  const handleFromDateChange = (value) => {
    setFromDate(value);
    validateDateRange(value, toDate);
  };

  const handleToDateChange = (value) => {
    setToDate(value);
    validateDateRange(fromDate, value);
  };

  useEffect(() => {
    if (classData?._id && classData.enrolledStudents) {
      calculateStudentStats();
    }
  }, [classData, calculateStudentStats]);

  // Filter students based on search term
  const filteredStudents = students.filter((student) => {
    const fullName = student.userDetails
      ? `${student.userDetails.firstName} ${student.userDetails.lastName}`.toLowerCase()
      : "";
    const email = student.email.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return fullName.includes(searchLower) || email.includes(searchLower);
  });

  // Sort filtered students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let compareValue = 0;
    const aStats = studentAttendanceStats[a._id] || {
      attendancePercentage: 0,
      totalSessions: 0,
    };
    const bStats = studentAttendanceStats[b._id] || {
      attendancePercentage: 0,
      totalSessions: 0,
    };

    switch (sortBy) {
      case "name": {
        const aName = a.userDetails
          ? `${a.userDetails.firstName} ${a.userDetails.lastName}`.toLowerCase()
          : a.email.toLowerCase();
        const bName = b.userDetails
          ? `${b.userDetails.firstName} ${b.userDetails.lastName}`.toLowerCase()
          : b.email.toLowerCase();
        compareValue = aName.localeCompare(bName);
        break;
      }
      case "attendance":
        compareValue =
          aStats.attendancePercentage - bStats.attendancePercentage;
        break;
      case "sessions":
        compareValue = aStats.totalSessions - bStats.totalSessions;
        break;
      default:
        compareValue = 0;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  const getAttendanceColor = (percentage) => {
    if (percentage >= 90) return "green";
    if (percentage >= 75) return "blue";
    if (percentage >= 60) return "orange";
    return "red";
  };

  const getAttendanceLabel = (percentage) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 75) return "Good";
    if (percentage >= 60) return "Fair";
    return "Poor";
  };

  if (loading) {
    return (
      <Center h="300px">
        <VStack spacing={4}>
          <Spinner size="lg" color="#0d9488" />
          <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
            Loading student attendance data...
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

  // Show individual student attendance detail
  if (selectedStudent) {
    return (
      <VStack align="stretch" spacing={6}>
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setSelectedStudent(null)}
          alignSelf="flex-start"
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          _hover={{ color: "#0d9488" }}
        >
          <HStack spacing="2">
            <LuArrowLeft color="#0d9488" size="16" />
            <Text>Back to Student List</Text>
          </HStack>
        </Button>

        {/* Student Individual Attendance Card */}
        <StudentIndividualAttendanceCard
          student={selectedStudent}
          classData={classData}
          onBack={() => setSelectedStudent(null)}
        />
      </VStack>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      {/* Header */}
      <HStack justify="space-between" align="start">
        <VStack align="start" spacing={1}>
          <Text
            fontSize="lg"
            fontWeight="semibold"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Individual Student Attendance
          </Text>
          <Text
            fontSize="sm"
            color={colorMode === "dark" ? "gray.400" : "gray.600"}
          >
            View detailed attendance records for each student
          </Text>
        </VStack>
      </HStack>

      {/* Search Bar, Sort Options, and View Toggle */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        shadow={colorMode === "dark" ? "lg" : "sm"}
      >
        <Card.Body p="4">
          <VStack spacing="4" align="stretch">
            <Flex gap="4" align="center">
              <InputGroup flex="1" startElement={<LuSearch />}>
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  _placeholder={{
                    color: colorMode === "dark" ? "gray.400" : "gray.500",
                  }}
                />
              </InputGroup>

              {/* View Toggle */}
              <HStack spacing="1" flexShrink="0">
                <Tooltip content="Card View">
                  <IconButton
                    size="sm"
                    variant={viewMode === "card" ? "solid" : "outline"}
                    colorPalette="teal"
                    onClick={() => setViewMode("card")}
                    color={
                      viewMode === "card"
                        ? "white"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "gray.600"
                    }
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  >
                    <MdApps />
                  </IconButton>
                </Tooltip>
                <Tooltip content="List View">
                  <IconButton
                    size="sm"
                    variant={viewMode === "list" ? "solid" : "outline"}
                    colorPalette="teal"
                    onClick={() => setViewMode("list")}
                    color={
                      viewMode === "list"
                        ? "white"
                        : colorMode === "dark"
                        ? "gray.300"
                        : "gray.600"
                    }
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  >
                    <MdList />
                  </IconButton>
                </Tooltip>
              </HStack>
            </Flex>

            {/* Sort Options */}
            <HStack spacing="4" wrap="wrap">
              <HStack spacing="2">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  minW="max-content"
                >
                  Sort by:
                </Text>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: `1px solid ${
                      colorMode === "dark" ? "#4a5568" : "#e2e8f0"
                    }`,
                    backgroundColor: colorMode === "dark" ? "#2d3748" : "white",
                    color: colorMode === "dark" ? "white" : "#1a202c",
                    fontSize: "14px",
                  }}
                >
                  <option value="name">Name</option>
                  <option value="attendance">Attendance %</option>
                  <option value="sessions">Total Sessions</option>
                </select>
              </HStack>

              <HStack spacing="2">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  minW="max-content"
                >
                  Order:
                </Text>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: `1px solid ${
                      colorMode === "dark" ? "#4a5568" : "#e2e8f0"
                    }`,
                    backgroundColor: colorMode === "dark" ? "#2d3748" : "white",
                    color: colorMode === "dark" ? "white" : "#1a202c",
                    fontSize: "14px",
                  }}
                >
                  <option value="asc">
                    {sortBy === "name"
                      ? "A to Z"
                      : sortBy === "attendance"
                      ? "Low to High"
                      : "Fewest First"}
                  </option>
                  <option value="desc">
                    {sortBy === "name"
                      ? "Z to A"
                      : sortBy === "attendance"
                      ? "High to Low"
                      : "Most First"}
                  </option>
                </select>
              </HStack>
            </HStack>

            {/* Date Filter Toggle */}
            <HStack spacing="4" wrap="wrap">
              <HStack spacing="2">
                <input
                  type="checkbox"
                  checked={enableDateFilter}
                  onChange={(e) => {
                    const isEnabled = e.target.checked;
                    setEnableDateFilter(isEnabled);
                    if (isEnabled) {
                      // Set current month dates when enabling
                      const { firstDate, lastDate } = getCurrentMonthDates();
                      setFromDate(firstDate);
                      setToDate(lastDate);
                    } else {
                      // Clear dates when disabling
                      setFromDate("");
                      setToDate("");
                      setDateError("");
                    }
                  }}
                  style={{
                    marginRight: "8px",
                    transform: "scale(1.2)",
                  }}
                />
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                  fontWeight="medium"
                >
                  Filter by Date Range
                </Text>
              </HStack>
            </HStack>

            {/* Date Range Inputs - Show only when enabled */}
            {enableDateFilter && (
              <VStack spacing="3" align="stretch">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.500"}
                  fontStyle="italic"
                >
                  Filter student attendance data by date range. You can use
                  either "From" date (to show data from that date onwards) or
                  "To" date (to show data up to that date) or both. Statistics
                  will be calculated only for sessions within the selected
                  period.
                </Text>
                <HStack spacing="4" wrap="wrap">
                  <HStack spacing="2">
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      minW="max-content"
                    >
                      From:
                    </Text>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => handleFromDateChange(e.target.value)}
                      size="sm"
                      maxW="150px"
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.300"
                      }
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      _hover={{
                        borderColor:
                          colorMode === "dark" ? "gray.500" : "gray.400",
                      }}
                      _focus={{
                        borderColor: "#0d9488",
                        boxShadow: "0 0 0 1px #0d9488",
                      }}
                    />
                  </HStack>

                  <HStack spacing="2">
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      minW="max-content"
                    >
                      To:
                    </Text>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => handleToDateChange(e.target.value)}
                      size="sm"
                      maxW="150px"
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.300"
                      }
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      _hover={{
                        borderColor:
                          colorMode === "dark" ? "gray.500" : "gray.400",
                      }}
                      _focus={{
                        borderColor: "#0d9488",
                        boxShadow: "0 0 0 1px #0d9488",
                      }}
                    />
                  </HStack>

                  <Button
                    size="sm"
                    colorPalette="teal"
                    onClick={() => {
                      const { firstDate, lastDate } = getCurrentMonthDates();
                      setFromDate(firstDate);
                      setToDate(lastDate);
                      setDateError("");
                    }}
                    variant="outline"
                  >
                    Reset to Current Month
                  </Button>
                </HStack>

                {/* Date Error Message */}
                {dateError && (
                  <Box
                    bg={colorMode === "dark" ? "red.900" : "red.50"}
                    borderColor={colorMode === "dark" ? "red.700" : "red.200"}
                    borderWidth="1px"
                    borderRadius="md"
                    p="3"
                  >
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "red.200" : "red.800"}
                      fontWeight="medium"
                    >
                      ⚠️ Invalid Date Range
                    </Text>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "red.300" : "red.600"}
                    >
                      {dateError}
                    </Text>
                  </Box>
                )}
              </VStack>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Students Display */}
      {sortedStudents.length > 0 ? (
        viewMode === "card" ? (
          /* Card View */
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {sortedStudents.map((student) => {
              const stats = studentAttendanceStats[student._id] || {
                totalSessions: 0,
                presentCount: 0,
                absentCount: 0,
                lateCount: 0,
                excusedCount: 0,
                attendancePercentage: 0,
              };

              return (
                <Card.Root
                  key={student._id}
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  borderWidth="1px"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                  shadow={colorMode === "dark" ? "lg" : "sm"}
                  cursor="pointer"
                  _hover={{
                    transform: "translateY(-2px)",
                    shadow: colorMode === "dark" ? "xl" : "md",
                    borderColor: "#0d9488",
                  }}
                  transition="all 0.2s"
                  onClick={() => setSelectedStudent(student)}
                >
                  <Card.Body p="4">
                    <VStack spacing={4} align="stretch">
                      {/* Student Info */}
                      <HStack spacing={3}>
                        <Avatar.Root size="md">
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
                              ? `${
                                  student.userDetails.firstName?.charAt(0) || ""
                                }${
                                  student.userDetails.lastName?.charAt(0) || ""
                                }`
                              : student.email?.charAt(0).toUpperCase()}
                          </Avatar.Fallback>
                        </Avatar.Root>
                        <VStack align="start" spacing={0} flex="1" minW="0">
                          <Text
                            fontWeight="semibold"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            isTruncated
                          >
                            {student.userDetails
                              ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                              : "Name not set"}
                          </Text>
                          <Text
                            fontSize="sm"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                            isTruncated
                          >
                            {student.email}
                          </Text>
                        </VStack>
                      </HStack>

                      {/* Attendance Stats */}
                      <VStack spacing={3} align="stretch">
                        {/* Attendance Percentage */}
                        <HStack justify="space-between">
                          <Text
                            fontSize="sm"
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.600"
                            }
                          >
                            Attendance Rate
                          </Text>
                          <Badge
                            colorPalette={getAttendanceColor(
                              stats.attendancePercentage
                            )}
                            variant="subtle"
                          >
                            {stats.attendancePercentage}%
                          </Badge>
                        </HStack>

                        {/* Sessions Count */}
                        <HStack justify="space-between">
                          <HStack spacing={1}>
                            <LuCalendar size={14} />
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.600"
                              }
                            >
                              Sessions
                            </Text>
                          </HStack>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {stats.totalSessions}
                          </Text>
                        </HStack>

                        {/* Quick Stats */}
                        <SimpleGrid columns={2} spacing={2}>
                          <VStack spacing={1}>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="green.500"
                            >
                              {stats.presentCount}
                            </Text>
                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                            >
                              Present
                            </Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Text
                              fontSize="lg"
                              fontWeight="bold"
                              color="red.500"
                            >
                              {stats.absentCount}
                            </Text>
                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                            >
                              Absent
                            </Text>
                          </VStack>
                        </SimpleGrid>

                        {/* Performance Label */}
                        <Box textAlign="center">
                          <Badge
                            colorPalette={getAttendanceColor(
                              stats.attendancePercentage
                            )}
                            variant="outline"
                            size="sm"
                          >
                            {getAttendanceLabel(stats.attendancePercentage)}
                          </Badge>
                        </Box>
                      </VStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </SimpleGrid>
        ) : (
          /* List View */
          <Box>
            {/* Desktop Table View */}
            <Box display={{ base: "none", lg: "block" }}>
              <Card.Root
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                shadow={colorMode === "dark" ? "lg" : "sm"}
              >
                <Box bg={colorMode === "dark" ? "gray.800" : "white"}>
                  <Table.Root variant="simple">
                    <Table.Header
                      bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    >
                      <Table.Row>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                          fontWeight="semibold"
                          py="3"
                        >
                          Student
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                          fontWeight="semibold"
                          py="3"
                        >
                          Email
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                          fontWeight="semibold"
                          py="3"
                        >
                          Attendance
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                          fontWeight="semibold"
                          py="3"
                        >
                          Sessions
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                          fontWeight="semibold"
                          py="3"
                        >
                          Present/Absent
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.200" : "gray.700"}
                          fontWeight="semibold"
                          py="3"
                        >
                          Performance
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortedStudents.map((student) => {
                        const stats = studentAttendanceStats[student._id] || {
                          totalSessions: 0,
                          presentCount: 0,
                          absentCount: 0,
                          lateCount: 0,
                          excusedCount: 0,
                          attendancePercentage: 0,
                        };

                        return (
                          <Table.Row
                            key={student._id}
                            cursor="pointer"
                            bg={colorMode === "dark" ? "gray.800" : "white"}
                            _hover={{
                              bg: colorMode === "dark" ? "gray.600" : "gray.50",
                            }}
                            onClick={() => setSelectedStudent(student)}
                          >
                            <Table.Cell py="3">
                              <HStack spacing={3}>
                                <Avatar.Root size="sm">
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
                                      ? `${
                                          student.userDetails.firstName?.charAt(
                                            0
                                          ) || ""
                                        }${
                                          student.userDetails.lastName?.charAt(
                                            0
                                          ) || ""
                                        }`
                                      : student.email?.charAt(0).toUpperCase()}
                                  </Avatar.Fallback>
                                </Avatar.Root>
                                <VStack align="start" spacing={0}>
                                  <Text
                                    fontWeight="medium"
                                    color={
                                      colorMode === "dark"
                                        ? "white"
                                        : "gray.900"
                                    }
                                    fontSize="sm"
                                  >
                                    {student.userDetails
                                      ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                      : "Name not set"}
                                  </Text>
                                </VStack>
                              </HStack>
                            </Table.Cell>
                            <Table.Cell>
                              <Text
                                fontSize="sm"
                                color={
                                  colorMode === "dark" ? "gray.300" : "gray.600"
                                }
                              >
                                {student.email}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge
                                colorPalette={getAttendanceColor(
                                  stats.attendancePercentage
                                )}
                                variant="subtle"
                                size="sm"
                              >
                                {stats.attendancePercentage}%
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <Text
                                fontSize="sm"
                                color={
                                  colorMode === "dark" ? "gray.300" : "gray.600"
                                }
                              >
                                {stats.totalSessions}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <HStack spacing={2}>
                                <Text
                                  fontSize="sm"
                                  color="green.500"
                                  fontWeight="medium"
                                >
                                  {stats.presentCount}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.400"
                                      : "gray.500"
                                  }
                                >
                                  /
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color="red.500"
                                  fontWeight="medium"
                                >
                                  {stats.absentCount}
                                </Text>
                              </HStack>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge
                                colorPalette={getAttendanceColor(
                                  stats.attendancePercentage
                                )}
                                variant="outline"
                                size="sm"
                              >
                                {getAttendanceLabel(stats.attendancePercentage)}
                              </Badge>
                            </Table.Cell>
                          </Table.Row>
                        );
                      })}
                    </Table.Body>
                  </Table.Root>
                </Box>
              </Card.Root>
            </Box>

            {/* Mobile Card View */}
            <VStack spacing="3" display={{ base: "flex", lg: "none" }}>
              {sortedStudents.map((student) => {
                const stats = studentAttendanceStats[student._id] || {
                  totalSessions: 0,
                  presentCount: 0,
                  absentCount: 0,
                  lateCount: 0,
                  excusedCount: 0,
                  attendancePercentage: 0,
                };

                return (
                  <Card.Root
                    key={student._id}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    borderWidth="1px"
                    borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                    shadow={colorMode === "dark" ? "lg" : "sm"}
                    cursor="pointer"
                    _hover={{
                      borderColor: "#0d9488",
                      shadow: colorMode === "dark" ? "xl" : "md",
                    }}
                    transition="all 0.2s"
                    onClick={() => setSelectedStudent(student)}
                    w="full"
                  >
                    <Card.Body p="4">
                      <VStack spacing="3" align="stretch">
                        {/* Student Header */}
                        <HStack spacing={3}>
                          <Avatar.Root size="md">
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
                                ? `${
                                    student.userDetails.firstName?.charAt(0) ||
                                    ""
                                  }${
                                    student.userDetails.lastName?.charAt(0) ||
                                    ""
                                  }`
                                : student.email?.charAt(0).toUpperCase()}
                            </Avatar.Fallback>
                          </Avatar.Root>
                          <VStack align="start" spacing={0} flex="1" minW="0">
                            <Text
                              fontWeight="semibold"
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                              isTruncated
                            >
                              {student.userDetails
                                ? `${student.userDetails.firstName} ${student.userDetails.lastName}`
                                : "Name not set"}
                            </Text>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                              isTruncated
                            >
                              {student.email}
                            </Text>
                          </VStack>
                          <Badge
                            colorPalette={getAttendanceColor(
                              stats.attendancePercentage
                            )}
                            variant="subtle"
                            size="sm"
                          >
                            {stats.attendancePercentage}%
                          </Badge>
                        </HStack>

                        {/* Stats Row */}
                        <SimpleGrid columns={3} spacing={3} textAlign="center">
                          <VStack spacing={1}>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                            >
                              Sessions
                            </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="semibold"
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                            >
                              {stats.totalSessions}
                            </Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                            >
                              Present
                            </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="semibold"
                              color="green.500"
                            >
                              {stats.presentCount}
                            </Text>
                          </VStack>
                          <VStack spacing={1}>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                            >
                              Absent
                            </Text>
                            <Text
                              fontSize="lg"
                              fontWeight="semibold"
                              color="red.500"
                            >
                              {stats.absentCount}
                            </Text>
                          </VStack>
                        </SimpleGrid>

                        {/* Performance Badge */}
                        <Box textAlign="center">
                          <Badge
                            colorPalette={getAttendanceColor(
                              stats.attendancePercentage
                            )}
                            variant="outline"
                            size="sm"
                          >
                            {getAttendanceLabel(stats.attendancePercentage)}
                          </Badge>
                        </Box>
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                );
              })}
            </VStack>
          </Box>
        )
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
              <LuUser
                size={24}
                color={colorMode === "dark" ? "#9ca3af" : "#6b7280"}
              />
            </Box>
            <VStack spacing={2} textAlign="center">
              <Text
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                {students.length === 0
                  ? "No Students Enrolled"
                  : "No Students Found"}
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                {students.length === 0
                  ? "Add students to this class to view their attendance records."
                  : "Try adjusting your search terms."}
              </Text>
            </VStack>
          </VStack>
        </Card.Root>
      )}
    </VStack>
  );
};

export default IndividualAttendance;
