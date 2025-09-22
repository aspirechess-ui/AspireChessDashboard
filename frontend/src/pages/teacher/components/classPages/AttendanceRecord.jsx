import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  InputGroup,
  Spinner,
  Flex,
  Table,
  Badge,
  Menu,
  Portal,
  IconButton,
  useBreakpointValue,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";
import {
  LuPlus,
  LuSearch,
  LuCalendar,
  LuEye,
  LuPencil,
  LuCheck,
  LuTrash,
} from "react-icons/lu";
import { FaEllipsisV } from "react-icons/fa";
import { useColorMode } from "../../../../components/ui/color-mode";
import MarkAttendanceCard from "../MarkAttendanceCard.jsx";
import DeletePrompt from "../../../../components/DeletePrompt.jsx";

import attendanceService from "../../../../services/attendance.js";

const AttendanceRecordTable = ({ classId, classData }) => {
  const { colorMode } = useColorMode();

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [viewingAttendance, setViewingAttendance] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [sortBy, setSortBy] = useState("date"); // "date", "status", "students"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc", "desc"
  const [statusFilter, setStatusFilter] = useState("all"); // "all", "draft", "final"

  // Responsive breakpoints

  const showMobileCards = useBreakpointValue({ base: true, lg: false });

  // Fetch attendance records
  const fetchAttendanceRecords = useCallback(async () => {
    if (!classId) return;

    try {
      setLoading(true);
      const response = await attendanceService.getClassAttendance(classId, {
        limit: 50,
        page: 1,
      });

      if (response.success) {
        setAttendanceRecords(response.data.attendanceRecords || []);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      setAttendanceRecords([]);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [fetchAttendanceRecords]);

  const handleCreateAttendance = () => {
    console.log("Mark Attendance button clicked!");
    setShowMarkAttendance(true);
  };

  const handleAttendanceSaved = (newAttendanceData) => {
    console.log("Attendance saved:", newAttendanceData);
    setShowMarkAttendance(false);
    setEditingAttendance(null);
    setViewingAttendance(null);
    // Refresh the attendance records
    fetchAttendanceRecords();
  };

  const handleCancelAttendance = () => {
    setShowMarkAttendance(false);
    setEditingAttendance(null);
    setViewingAttendance(null);
  };

  const handleSubmitAttendance = async (recordId) => {
    try {
      const response = await attendanceService.submitAttendance(recordId);
      if (response.success) {
        // Refresh the attendance records
        fetchAttendanceRecords();
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
    }
  };

  const handleViewAttendance = (record) => {
    setViewingAttendance(record);
    setShowMarkAttendance(true);
  };

  const handleEditAttendance = (record) => {
    setEditingAttendance(record);
    setShowMarkAttendance(true);
  };

  const handleDeleteAttendance = (record) => {
    setSelectedRecord(record);
    setShowDeleteModal(true);
  };

  const confirmDeleteAttendance = async () => {
    if (!selectedRecord) return;

    setDeleteLoading(true);
    try {
      const response = await attendanceService.deleteAttendance(
        selectedRecord._id
      );
      if (response.success) {
        // Refresh the attendance records
        fetchAttendanceRecords();
        setShowDeleteModal(false);
        setSelectedRecord(null);
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
      alert("Failed to delete attendance record. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDeleteAttendance = () => {
    setShowDeleteModal(false);
    setSelectedRecord(null);
  };

  // Filter attendance records based on search term and status
  const filteredRecords = attendanceRecords.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    const sessionDate = new Date(record.sessionDate).toLocaleDateString();
    const sessionTime = record.sessionTime || "";

    const matchesSearch =
      sessionDate.includes(searchLower) ||
      sessionTime.toLowerCase().includes(searchLower);

    const matchesStatus =
      statusFilter === "all" || (record.status || "draft") === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort filtered records
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case "date":
        compareValue = new Date(a.sessionDate) - new Date(b.sessionDate);
        break;
      case "status":
        compareValue = (a.status || "draft").localeCompare(b.status || "draft");
        break;
      default:
        compareValue = new Date(a.sessionDate) - new Date(b.sessionDate);
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status color for badges
  const getStatusColor = (status) => {
    switch (status) {
      case "final":
        return "green";
      case "draft":
        return "yellow";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="400px">
        <VStack spacing="4">
          <Spinner size="xl" color="teal.500" />
          <Text>Loading attendance records...</Text>
        </VStack>
      </Box>
    );
  }

  // Show MarkAttendanceCard if in mark attendance mode
  if (showMarkAttendance) {
    console.log("Rendering MarkAttendanceCard with classData:", classData);

    // Test fallback to see if conditional rendering works
    if (!MarkAttendanceCard) {
      return (
        <Box p={4} bg="red.100" borderRadius="md">
          <Text>Error: MarkAttendanceCard component not found!</Text>
          <Button onClick={handleCancelAttendance} mt={2}>
            Go Back
          </Button>
        </Box>
      );
    }

    try {
      return (
        <MarkAttendanceCard
          classData={classData}
          onSave={handleAttendanceSaved}
          onCancel={handleCancelAttendance}
          editingRecord={editingAttendance}
          viewingRecord={viewingAttendance}
          mode={
            viewingAttendance ? "view" : editingAttendance ? "edit" : "create"
          }
        />
      );
    } catch (error) {
      console.error("Error rendering MarkAttendanceCard:", error);
      return (
        <Box p={4} bg="red.100" borderRadius="md">
          <Text>Error rendering MarkAttendanceCard: {error.message}</Text>
          <Button onClick={handleCancelAttendance} mt={2}>
            Go Back
          </Button>
        </Box>
      );
    }
  }

  console.log(
    "AttendanceRecord render - showMarkAttendance:",
    showMarkAttendance
  );

  return (
    <Box>
      <VStack spacing="6" align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap="4">
          <Box>
            <Heading
              size="md"
              mb="2"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Attendance Records
            </Heading>
            <Text
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              fontSize="sm"
            >
              View and manage attendance records for this class
            </Text>
          </Box>
          <Button
            colorPalette="teal"
            leftIcon={<LuPlus />}
            onClick={handleCreateAttendance}
            size="sm"
          >
            Mark Attendance
          </Button>
        </Flex>

        {/* Search and Sort */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Card.Body p="4">
            <VStack spacing="4" align="stretch">
              <InputGroup startElement={<LuSearch />}>
                <Input
                  placeholder="Search by date or time..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  color={colorMode === "dark" ? "white" : "gray.900"}
                />
              </InputGroup>

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
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      // Reset order/filter when sort type changes
                      if (e.target.value === "status") {
                        setStatusFilter("all");
                      } else {
                        setSortOrder("desc");
                      }
                    }}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      border: `1px solid ${
                        colorMode === "dark" ? "#4a5568" : "#e2e8f0"
                      }`,
                      backgroundColor:
                        colorMode === "dark" ? "#2d3748" : "white",
                      color: colorMode === "dark" ? "white" : "#1a202c",
                      fontSize: "14px",
                    }}
                  >
                    <option value="date">Date</option>
                    <option value="status">Status</option>
                  </select>
                </HStack>

                <HStack spacing="2">
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.300" : "gray.600"}
                    minW="max-content"
                  >
                    {sortBy === "status" ? "Filter:" : "Order:"}
                  </Text>
                  {sortBy === "status" ? (
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: `1px solid ${
                          colorMode === "dark" ? "#4a5568" : "#e2e8f0"
                        }`,
                        backgroundColor:
                          colorMode === "dark" ? "#2d3748" : "white",
                        color: colorMode === "dark" ? "white" : "#1a202c",
                        fontSize: "14px",
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="draft">Draft Only</option>
                      <option value="final">Final Only</option>
                    </select>
                  ) : (
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "6px",
                        border: `1px solid ${
                          colorMode === "dark" ? "#4a5568" : "#e2e8f0"
                        }`,
                        backgroundColor:
                          colorMode === "dark" ? "#2d3748" : "white",
                        color: colorMode === "dark" ? "white" : "#1a202c",
                        fontSize: "14px",
                      }}
                    >
                      <option value="desc">Newest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  )}
                </HStack>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Attendance Records */}
        {sortedRecords.length > 0 ? (
          showMobileCards ? (
            // Mobile Card View
            <VStack spacing="4" align="stretch">
              {sortedRecords.map((record) => (
                <Card.Root
                  key={record._id}
                  bg={colorMode === "dark" ? "gray.800" : "white"}
                  borderWidth="1px"
                  borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                  _hover={{
                    borderColor: colorMode === "dark" ? "gray.600" : "gray.300",
                    shadow: "md",
                  }}
                >
                  <Card.Body p="4">
                    <VStack spacing="3" align="stretch">
                      {/* Header with Date and Actions */}
                      <Flex justify="space-between" align="center">
                        <VStack align="start" spacing="1">
                          <Text
                            fontWeight="bold"
                            fontSize="lg"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {formatDate(record.sessionDate)}
                          </Text>
                          <Text
                            fontSize="sm"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                          >
                            {record.sessionTime}
                          </Text>
                        </VStack>
                        <Menu.Root>
                          <Menu.Trigger asChild>
                            <IconButton
                              variant="ghost"
                              size="sm"
                              aria-label="More options"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                              _hover={{
                                color: "teal.500",
                                bg:
                                  colorMode === "dark"
                                    ? "gray.700"
                                    : "gray.100",
                              }}
                            >
                              <FaEllipsisV />
                            </IconButton>
                          </Menu.Trigger>
                          <Portal>
                            <Menu.Positioner>
                              <Menu.Content
                                bg={colorMode === "dark" ? "gray.700" : "white"}
                                borderColor={
                                  colorMode === "dark" ? "gray.600" : "gray.200"
                                }
                                shadow={colorMode === "dark" ? "lg" : "md"}
                              >
                                <Menu.Item
                                  value="view"
                                  onClick={() => handleViewAttendance(record)}
                                  color={
                                    colorMode === "dark"
                                      ? "gray.100"
                                      : "gray.900"
                                  }
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.100",
                                  }}
                                >
                                  <HStack>
                                    <LuEye />
                                    <Text>View</Text>
                                  </HStack>
                                </Menu.Item>
                                {record.status !== "final" && (
                                  <Menu.Item
                                    value="edit"
                                    onClick={() => handleEditAttendance(record)}
                                    color={
                                      colorMode === "dark"
                                        ? "gray.100"
                                        : "gray.900"
                                    }
                                    _hover={{
                                      bg:
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.100",
                                    }}
                                  >
                                    <HStack>
                                      <LuPencil />
                                      <Text>Edit</Text>
                                    </HStack>
                                  </Menu.Item>
                                )}
                                {record.status === "draft" && (
                                  <>
                                    <Menu.Item
                                      value="submit"
                                      onClick={() =>
                                        handleSubmitAttendance(record._id)
                                      }
                                      color={
                                        colorMode === "dark"
                                          ? "gray.100"
                                          : "gray.900"
                                      }
                                      _hover={{
                                        bg:
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.100",
                                      }}
                                    >
                                      <HStack>
                                        <LuCheck />
                                        <Text>Submit Attendance</Text>
                                      </HStack>
                                    </Menu.Item>
                                  </>
                                )}
                                <Menu.Item
                                  value="delete"
                                  onClick={() => handleDeleteAttendance(record)}
                                  color="red.400"
                                  _hover={{
                                    bg:
                                      colorMode === "dark"
                                        ? "red.900"
                                        : "red.50",
                                    color: "red.500",
                                  }}
                                >
                                  <HStack>
                                    <LuTrash />
                                    <Text>Delete</Text>
                                  </HStack>
                                </Menu.Item>
                              </Menu.Content>
                            </Menu.Positioner>
                          </Portal>
                        </Menu.Root>
                      </Flex>

                      {/* Stats Grid */}
                      <SimpleGrid columns={2} gap="3">
                        <Box
                          p="3"
                          bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                          borderRadius="md"
                        >
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                            mb="1"
                          >
                            Total Students
                          </Text>
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color={
                              colorMode === "dark" ? "gray.100" : "gray.900"
                            }
                          >
                            {record.totalStudents || 0}
                          </Text>
                        </Box>
                        <Box
                          p="3"
                          bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                          borderRadius="md"
                        >
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                            mb="1"
                          >
                            Status
                          </Text>
                          <Badge
                            colorPalette={getStatusColor(record.status)}
                            size="sm"
                          >
                            {record.status || "draft"}
                          </Badge>
                        </Box>
                      </SimpleGrid>

                      {/* Attendance Stats */}
                      <HStack justify="space-between">
                        <VStack align="center" spacing="1">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                          >
                            Present
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="green.400"
                          >
                            {record.presentCount || 0}
                          </Text>
                        </VStack>
                        <VStack align="center" spacing="1">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                          >
                            Absent
                          </Text>
                          <Text fontSize="xl" fontWeight="bold" color="red.400">
                            {record.absentCount || 0}
                          </Text>
                        </VStack>
                        <VStack align="center" spacing="1">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                          >
                            Late
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="orange.400"
                          >
                            {record.lateCount || 0}
                          </Text>
                        </VStack>
                        <VStack align="center" spacing="1">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                          >
                            Excused
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="blue.400"
                          >
                            {record.excusedCount || 0}
                          </Text>
                        </VStack>
                      </HStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          ) : (
            // Desktop Table View
            <Card.Root
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <Card.Body p="0">
                <Box overflowX="auto">
                  <Table.Root variant="line" size="sm">
                    <Table.Header>
                      <Table.Row
                        bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                      >
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.100" : "gray.700"}
                          fontWeight="semibold"
                        >
                          Date
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.100" : "gray.700"}
                          fontWeight="semibold"
                        >
                          Session Time
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.100" : "gray.700"}
                          fontWeight="semibold"
                        >
                          Students
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.100" : "gray.700"}
                          fontWeight="semibold"
                        >
                          Present
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.100" : "gray.700"}
                          fontWeight="semibold"
                        >
                          Absent
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.100" : "gray.700"}
                          fontWeight="semibold"
                        >
                          Status
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          color={colorMode === "dark" ? "gray.100" : "gray.700"}
                          fontWeight="semibold"
                        >
                          Actions
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {sortedRecords.map((record, index) => (
                        <Table.Row
                          key={record._id}
                          bg={
                            index % 2 === 0
                              ? colorMode === "dark"
                                ? "gray.800"
                                : "white"
                              : colorMode === "dark"
                              ? "gray.700"
                              : "gray.50"
                          }
                          _hover={{
                            bg: colorMode === "dark" ? "gray.600" : "gray.100",
                          }}
                        >
                          <Table.Cell>
                            <Text
                              fontWeight="medium"
                              color={
                                colorMode === "dark" ? "gray.100" : "gray.900"
                              }
                            >
                              {formatDate(record.sessionDate)}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.300" : "gray.600"
                              }
                            >
                              {record.sessionTime}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text
                              color={
                                colorMode === "dark" ? "gray.200" : "gray.800"
                              }
                            >
                              {record.totalStudents || 0}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color="green.400" fontWeight="medium">
                              {record.presentCount || 0}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color="red.400" fontWeight="medium">
                              {record.absentCount || 0}
                            </Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              colorPalette={getStatusColor(record.status)}
                              size="sm"
                            >
                              {record.status || "draft"}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell>
                            <Menu.Root>
                              <Menu.Trigger asChild>
                                <IconButton
                                  variant="ghost"
                                  size="sm"
                                  aria-label="More options"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.400"
                                      : "gray.600"
                                  }
                                  _hover={{
                                    color: "teal.500",
                                    bg:
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "gray.100",
                                  }}
                                >
                                  <FaEllipsisV />
                                </IconButton>
                              </Menu.Trigger>
                              <Portal>
                                <Menu.Positioner>
                                  <Menu.Content
                                    bg={
                                      colorMode === "dark"
                                        ? "gray.700"
                                        : "white"
                                    }
                                    borderColor={
                                      colorMode === "dark"
                                        ? "gray.600"
                                        : "gray.200"
                                    }
                                    shadow={colorMode === "dark" ? "lg" : "md"}
                                  >
                                    <Menu.Item
                                      value="view"
                                      onClick={() =>
                                        handleViewAttendance(record)
                                      }
                                      color={
                                        colorMode === "dark"
                                          ? "gray.100"
                                          : "gray.900"
                                      }
                                      _hover={{
                                        bg:
                                          colorMode === "dark"
                                            ? "gray.600"
                                            : "gray.100",
                                      }}
                                    >
                                      <HStack>
                                        <LuEye />
                                        <Text>View</Text>
                                      </HStack>
                                    </Menu.Item>
                                    {record.status !== "final" && (
                                      <Menu.Item
                                        value="edit"
                                        onClick={() =>
                                          handleEditAttendance(record)
                                        }
                                        color={
                                          colorMode === "dark"
                                            ? "gray.100"
                                            : "gray.900"
                                        }
                                        _hover={{
                                          bg:
                                            colorMode === "dark"
                                              ? "gray.600"
                                              : "gray.100",
                                        }}
                                      >
                                        <HStack>
                                          <LuPencil />
                                          <Text>Edit</Text>
                                        </HStack>
                                      </Menu.Item>
                                    )}
                                    {record.status === "draft" && (
                                      <>
                                        <Menu.Item
                                          value="submit"
                                          onClick={() =>
                                            handleSubmitAttendance(record._id)
                                          }
                                          color={
                                            colorMode === "dark"
                                              ? "gray.100"
                                              : "gray.900"
                                          }
                                          _hover={{
                                            bg:
                                              colorMode === "dark"
                                                ? "gray.600"
                                                : "gray.100",
                                          }}
                                        >
                                          <HStack>
                                            <LuCheck />
                                            <Text>Submit Attendance</Text>
                                          </HStack>
                                        </Menu.Item>
                                      </>
                                    )}
                                    <Menu.Item
                                      value="delete"
                                      onClick={() =>
                                        handleDeleteAttendance(record)
                                      }
                                      color="red.400"
                                      _hover={{
                                        bg:
                                          colorMode === "dark"
                                            ? "red.900"
                                            : "red.50",
                                        color: "red.500",
                                      }}
                                    >
                                      <HStack>
                                        <LuTrash />
                                        <Text>Delete</Text>
                                      </HStack>
                                    </Menu.Item>
                                  </Menu.Content>
                                </Menu.Positioner>
                              </Portal>
                            </Menu.Root>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              </Card.Body>
            </Card.Root>
          )
        ) : (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p="8" textAlign="center">
              <Box display="flex" justifyContent="center" mb="4">
                <LuCalendar
                  size="48"
                  color={colorMode === "dark" ? "#4A5568" : "#A0AEC0"}
                />
              </Box>
              <Text
                fontSize="lg"
                fontWeight="medium"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
              >
                No Attendance Records Yet!
              </Text>
              <Text
                mt="2"
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.500"}
              >
                Start marking attendance for this class to track student
                participation.
              </Text>
              <Button
                mt="4"
                colorPalette="teal"
                leftIcon={<LuPlus />}
                onClick={handleCreateAttendance}
              >
                Mark Your First Attendance
              </Button>
            </Card.Body>
          </Card.Root>
        )}

        {/* Delete Confirmation Modal */}
        <DeletePrompt
          isOpen={showDeleteModal}
          onClose={cancelDeleteAttendance}
          onConfirm={confirmDeleteAttendance}
          title="Delete Attendance Record"
          description="Are you sure you want to delete this attendance record? This will permanently remove all attendance data for this session."
          itemName={
            selectedRecord
              ? `Attendance for ${formatDate(selectedRecord.sessionDate)}`
              : ""
          }
          isLoading={deleteLoading}
          confirmText="Delete Attendance"
        />
      </VStack>
    </Box>
  );
};

export default AttendanceRecordTable;
