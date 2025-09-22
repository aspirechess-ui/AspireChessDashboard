import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  Table,
  Button,
  Input,
  Heading,
  useBreakpointValue,
  IconButton,
  Flex,
  NativeSelect,
  InputGroup,
} from "@chakra-ui/react";
import {
  LuSearch,
  LuFilter,
  LuCalendar,
  LuClock,
  LuUser,
  LuFileText,
  LuX,
  LuChevronDown,
} from "react-icons/lu";
import { useColorMode } from "../../../../../../components/ui/color-mode";

const AttendanceRecords = ({ attendanceData, loading }) => {
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [visibleCount, setVisibleCount] = useState(10); // Show 10 records initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const LOAD_MORE_COUNT = 10; // Load 10 more records each time

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "present":
        return "green";
      case "absent":
        return "red";
      case "late":
        return "yellow";
      case "excused":
        return "purple";
      default:
        return "gray";
    }
  };

  // Status display mapping
  const getStatusDisplay = (status) => {
    switch (status) {
      case "present":
        return "Present";
      case "absent":
        return "Absent";
      case "late":
        return "Late";
      case "excused":
        return "Excused";
      default:
        return status || "Unknown";
    }
  };

  // Filter and sort attendance data
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...(attendanceData || [])];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((record) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          (record.classId?.className || "")
            .toLowerCase()
            .includes(searchLower) ||
          (record.notes || "").toLowerCase().includes(searchLower) ||
          getStatusDisplay(record.status).toLowerCase().includes(searchLower) ||
          new Date(record.sessionDate).toLocaleDateString().includes(searchTerm)
        );
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((record) => record.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.sessionDate) - new Date(a.sessionDate);
        case "date-asc":
          return new Date(a.sessionDate) - new Date(b.sessionDate);
        case "status":
          return a.status.localeCompare(b.status);
        case "session":
          return (a.classId?.className || "").localeCompare(
            b.classId?.className || ""
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [attendanceData, searchTerm, statusFilter, sortBy]);

  // Get visible records based on pagination
  const visibleRecords = filteredAndSortedData.slice(0, visibleCount);
  const hasMoreRecords = visibleCount < filteredAndSortedData.length;

  // Handle load more
  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
    setIsLoadingMore(false);
  };

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm, statusFilter, sortBy]);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";

    // Check if it's already in range format (e.g., "10:00 AM - 01:00 PM")
    if (timeString.includes(" - ")) {
      return timeString;
    }

    try {
      // Handle both HH:MM and HH:MM:SS formats
      const timeParts = timeString.split(":");
      let hours = parseInt(timeParts[0]);
      let minutes = parseInt(timeParts[1]);

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'

      return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("date-desc");
  };

  const hasFilters =
    searchTerm || statusFilter !== "all" || sortBy !== "date-desc";

  if (loading) {
    return (
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      >
        <Card.Header>
          <Heading size="md">Attendance Records</Heading>
        </Card.Header>
        <Card.Body>
          <Text color={colorMode === "dark" ? "gray.400" : "gray.600"}>
            Loading attendance records...
          </Text>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Card.Root
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      shadow={colorMode === "dark" ? "xl" : "sm"}
    >
      <Card.Header p={{ base: 4, md: 6 }}>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" align="start">
            <VStack align="start" spacing={1}>
              <Heading
                size="md"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Attendance Records
              </Heading>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                Detailed view of your class attendance
              </Text>
            </VStack>
            {hasFilters && (
              <Button
                size="sm"
                variant="ghost"
                colorPalette="gray"
                leftIcon={<LuX />}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </HStack>

          {/* Filters */}
          <Flex
            direction={{ base: "column", md: "row" }}
            gap={4}
            align={{ base: "stretch", md: "center" }}
          >
            {/* Search */}
            <Box flex={1} minW={{ base: "full", md: "200px" }}>
              <InputGroup startElement={<LuSearch size={16} />}>
                <Input
                  placeholder="Search sessions, notes, or dates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
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

            <HStack
              spacing={{ base: 2, md: 3 }}
              flex={{ base: "1", md: "auto" }}
              w={{ base: "full", md: "auto" }}
            >
              {/* Status Filter */}
              <Box
                minW={{ base: "0", md: "150px" }}
                flex={{ base: 1, md: "none" }}
              >
                <Text
                  fontSize="xs"
                  mb={1}
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  display={{ base: "none", md: "block" }}
                >
                  Status Filter
                </Text>
                <NativeSelect.Root
                  size="sm"
                  value={statusFilter}
                  colorPalette="teal"
                  variant="outline"
                >
                  <NativeSelect.Field
                    onChange={(e) => setStatusFilter(e.target.value)}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.400",
                    }}
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="excused">Excused</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator>
                    <LuChevronDown />
                  </NativeSelect.Indicator>
                </NativeSelect.Root>
              </Box>

              {/* Sort By */}
              <Box
                minW={{ base: "0", md: "150px" }}
                flex={{ base: 1, md: "none" }}
              >
                <Text
                  fontSize="xs"
                  mb={1}
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  display={{ base: "none", md: "block" }}
                >
                  Sort By
                </Text>
                <NativeSelect.Root
                  size="sm"
                  value={sortBy}
                  colorPalette="teal"
                  variant="outline"
                >
                  <NativeSelect.Field
                    onChange={(e) => setSortBy(e.target.value)}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    _focus={{
                      borderColor: "#0d9488",
                      boxShadow: "0 0 0 1px #0d9488",
                    }}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.400",
                    }}
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="status">By Status</option>
                    <option value="session">By Session</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator>
                    <LuChevronDown />
                  </NativeSelect.Indicator>
                </NativeSelect.Root>
              </Box>
            </HStack>
          </Flex>
        </VStack>
      </Card.Header>

      <Card.Body p={{ base: 4, md: 6 }} pt={0}>
        {filteredAndSortedData.length === 0 ? (
          <Box py={8} textAlign="center">
            <VStack spacing={3}>
              <Box
                p={3}
                bg={colorMode === "dark" ? "gray.700" : "gray.100"}
                borderRadius="full"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
              >
                <LuFileText
                  size={32}
                  color={colorMode === "dark" ? "#9CA3AF" : "#6B7280"}
                />
              </Box>
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                {attendanceData?.length === 0
                  ? "No Attendance Records"
                  : "No Matching Records"}
              </Text>
              <Text
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                textAlign="center"
                maxW="400px"
                mx="auto"
              >
                {attendanceData?.length === 0
                  ? "No attendance has been recorded for this class yet."
                  : "Try adjusting your search or filter criteria to find records."}
              </Text>
              {hasFilters && attendanceData?.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="teal"
                  onClick={clearFilters}
                  borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  _hover={{
                    bg: colorMode === "dark" ? "gray.700" : "gray.100",
                    borderColor: "#0d9488",
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </VStack>
          </Box>
        ) : (
          <Box overflowX="auto">
            {isMobile ? (
              // Mobile: Card layout
              <VStack spacing={4} align="stretch">
                {visibleRecords.map((record, index) => (
                  <Card.Root
                    key={record._id || index}
                    variant="outline"
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    shadow={colorMode === "dark" ? "md" : "sm"}
                    _hover={{
                      shadow: colorMode === "dark" ? "lg" : "md",
                      transform: "translateY(-1px)",
                    }}
                    transition="all 0.2s"
                  >
                    <Card.Body p={4}>
                      <VStack spacing={3} align="stretch">
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing={1}>
                            <Text
                              fontSize="md"
                              fontWeight="semibold"
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                            >
                              {record.classId?.className || "Class Session"}
                            </Text>
                            <HStack spacing={2}>
                              <LuCalendar
                                size={14}
                                color={
                                  colorMode === "dark" ? "#9CA3AF" : "#6B7280"
                                }
                              />
                              <Text
                                fontSize="sm"
                                color={
                                  colorMode === "dark" ? "gray.300" : "gray.600"
                                }
                              >
                                {formatDate(record.sessionDate)}
                              </Text>
                            </HStack>
                          </VStack>
                          <Badge
                            colorPalette={getStatusColor(record.status)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {getStatusDisplay(record.status)}
                          </Badge>
                        </HStack>

                        {record.sessionTime && (
                          <HStack spacing={4}>
                            <HStack spacing={1}>
                              <LuClock
                                size={14}
                                color={
                                  colorMode === "dark" ? "#9CA3AF" : "#6B7280"
                                }
                              />
                              <Text
                                fontSize="sm"
                                color={
                                  colorMode === "dark" ? "gray.300" : "gray.600"
                                }
                              >
                                {formatTime(record.sessionTime)}
                              </Text>
                            </HStack>
                          </HStack>
                        )}

                        {record.notes && (
                          <Text
                            fontSize="sm"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                            fontStyle="italic"
                          >
                            "{record.notes}"
                          </Text>
                        )}
                      </VStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </VStack>
            ) : (
              // Desktop: Table layout
              <Box
                overflowX="auto"
                bg={colorMode === "dark" ? "gray.750" : "white"}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
              >
                <Table.Root variant="simple" size="sm">
                  <Table.Header
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  >
                    <Table.Row>
                      <Table.ColumnHeader
                        color={colorMode === "dark" ? "gray.200" : "gray.700"}
                        fontWeight="semibold"
                        fontSize="sm"
                      >
                        Date
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        color={colorMode === "dark" ? "gray.200" : "gray.700"}
                        fontWeight="semibold"
                        fontSize="sm"
                      >
                        Session
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        color={colorMode === "dark" ? "gray.200" : "gray.700"}
                        fontWeight="semibold"
                        fontSize="sm"
                      >
                        Status
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        color={colorMode === "dark" ? "gray.200" : "gray.700"}
                        fontWeight="semibold"
                        fontSize="sm"
                      >
                        Session Time
                      </Table.ColumnHeader>
                      <Table.ColumnHeader
                        color={colorMode === "dark" ? "gray.200" : "gray.700"}
                        fontWeight="semibold"
                        fontSize="sm"
                      >
                        Notes
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {visibleRecords.map((record, index) => (
                      <Table.Row
                        key={record._id || index}
                        _hover={{
                          bg: colorMode === "dark" ? "gray.700" : "gray.50",
                        }}
                        transition="background-color 0.2s"
                      >
                        <Table.Cell>
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                          >
                            {formatDate(record.sessionDate)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            fontSize="sm"
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            fontWeight="medium"
                          >
                            {record.classId?.className || "Class Session"}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge
                            colorPalette={getStatusColor(record.status)}
                            variant="subtle"
                            fontSize="xs"
                          >
                            {getStatusDisplay(record.status)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            fontSize="sm"
                            color={
                              colorMode === "dark" ? "gray.300" : "gray.600"
                            }
                            fontWeight="medium"
                          >
                            {record.sessionTime
                              ? formatTime(record.sessionTime)
                              : "-"}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text
                            fontSize="sm"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                            maxWidth="200px"
                            isTruncated
                            title={record.notes}
                          >
                            {record.notes || "-"}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            )}
          </Box>
        )}

        {/* Load More Button */}
        {hasMoreRecords && filteredAndSortedData.length > 0 && (
          <Box textAlign="center" mt={6}>
            <Button
              onClick={handleLoadMore}
              isLoading={isLoadingMore}
              loadingText="Loading more..."
              variant="outline"
              colorPalette="teal"
              size="md"
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
              px={6}
              py={2}
            >
              Load More Records ({filteredAndSortedData.length - visibleCount}{" "}
              remaining)
            </Button>
          </Box>
        )}

        {/* Results summary */}
        {visibleRecords.length > 0 && (
          <HStack
            justify="space-between"
            align="center"
            mt={4}
            pt={4}
            borderTopWidth="1px"
            borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
            flexDirection={{ base: "column", md: "row" }}
            spacing={{ base: 2, md: 0 }}
          >
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
              textAlign={{ base: "center", md: "left" }}
            >
              Showing {visibleRecords.length} of {filteredAndSortedData.length}{" "}
              records
              {filteredAndSortedData.length !== attendanceData?.length &&
                ` (filtered from ${attendanceData?.length || 0} total)`}
            </Text>
            {hasFilters && (
              <Text
                fontSize="xs"
                color={colorMode === "dark" ? "gray.500" : "gray.500"}
                textAlign={{ base: "center", md: "right" }}
              >
                Filtered results
              </Text>
            )}
          </HStack>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default AttendanceRecords;
