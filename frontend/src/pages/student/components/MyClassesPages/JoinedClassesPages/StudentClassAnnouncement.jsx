import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  Card,
  Badge,
  Alert,
  Spinner,
  IconButton,
  Separator,
  Button,
  Tabs,
  Select,
  Portal,
  createListCollection,
  Table,
  NativeSelect,
} from "@chakra-ui/react";
import { Tooltip } from "../../../../../components/ui/tooltip";
import {
  LuSearch,
  LuMegaphone,
  LuGraduationCap,
  LuBookOpen,
  LuCalendar,
  LuEye,
  LuX,
  LuBell,
  LuBellOff,
  LuCheck,
  LuFilter,
} from "react-icons/lu";
import { useColorMode } from "../../../../../components/ui/color-mode";
import announcementService from "../../../../../services/announcements.js";
import ViewAnnouncementCard from "../../../../common/ViewAnnouncementCard";

const StudentClassAnnouncement = ({ classData }) => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [alert, setAlert] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [markingAsRead, setMarkingAsRead] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    status: "all", // all, read, unread
    sortBy: "newest",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [classData]);

  useEffect(() => {
    applyFilters();
  }, [announcements, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAnnouncements();

      if (response.success) {
        // Filter announcements to show only class announcements for this specific class
        const classAnnouncements = response.data.filter(
          (announcement) =>
            announcement.type === "class" &&
            announcement.targetClass &&
            announcement.targetClass._id === classData?._id
        );
        setAnnouncements(classAnnouncements);
      } else {
        setAlert({
          type: "error",
          title: "Error",
          description: "Failed to fetch announcements",
        });
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setAlert({
        type: "error",
        title: "Error",
        description: "Failed to fetch announcements",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...announcements];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchLower) ||
          announcement.content.toLowerCase().includes(searchLower)
      );
    }

    // Status filter (read/unread) - use the isUnread function
    if (filters.status !== "all") {
      if (filters.status === "unread") {
        filtered = filtered.filter((announcement) => isUnread(announcement));
      } else if (filters.status === "read") {
        filtered = filtered.filter((announcement) => !isUnread(announcement));
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredAnnouncements(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const markAsRead = async (announcementId) => {
    try {
      setMarkingAsRead(true);

      // Get user ID from localStorage
      let currentUserId;
      try {
        const userString = localStorage.getItem("user");
        const user = userString ? JSON.parse(userString) : null;
        currentUserId = user ? user._id || user.id : null; // Try both _id and id
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        return;
      }

      if (!currentUserId) {
        console.error("No user ID found, cannot mark as read");
        return;
      }

      // Update local state immediately
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement._id === announcementId
            ? {
                ...announcement,
                readBy: [
                  ...(announcement.readBy || []),
                  { userId: currentUserId, readAt: new Date() },
                ],
              }
            : announcement
        )
      );

      // Make API call
      const response = await announcementService.markAsRead(announcementId);

      if (!response.success) {
        // Revert on failure
        setAnnouncements((prev) =>
          prev.map((announcement) =>
            announcement._id === announcementId
              ? {
                  ...announcement,
                  readBy: (announcement.readBy || []).filter(
                    (read) => read.userId !== currentUserId
                  ),
                }
              : announcement
          )
        );

        setAlert({
          type: "error",
          title: "Error",
          description: "Failed to mark announcement as read",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      setAlert({
        type: "error",
        title: "Error",
        description: "Failed to mark announcement as read",
      });
      setTimeout(() => setAlert(null), 3000);
    } finally {
      setMarkingAsRead(false);
    }
  };

  const handleAnnouncementClick = async (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetailsModal(true);

    // Mark as read if not already read
    if (isUnread(announcement)) {
      await markAsRead(announcement._id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUnread = (announcement) => {
    // Get user ID from localStorage
    let currentUserId;
    try {
      const userString = localStorage.getItem("user");

      if (userString) {
        const user = JSON.parse(userString);
        currentUserId = user._id || user.id; // Try both _id and id
      } else {
        return true;
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return true;
    }

    if (
      !currentUserId ||
      !announcement.readBy ||
      !Array.isArray(announcement.readBy)
    ) {
      return true;
    }

    // Simple check: is current user ID in the readBy array?
    const isRead = announcement.readBy.some(
      (read) =>
        read &&
        read.userId &&
        read.userId.toString() === currentUserId.toString()
    );

    return !isRead;
  };

  const truncateContent = (content, wordLimit = 60) => {
    const words = content.split(" ");
    if (words.length <= wordLimit) return content;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  return (
    <Box>
      <VStack spacing="6" align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb="4">
            <VStack align="start" spacing="1">
              <HStack>
                <LuBookOpen color="#0d9488" size="20" />
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Class Announcements
                </Text>
              </HStack>
              <Text
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                fontSize="sm"
              >
                Announcements for {classData?.className || "this class"}
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Alert */}
        {alert && (
          <Alert.Root status={alert.type}>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{alert.title}</Alert.Title>
              {alert.description && (
                <Alert.Description>{alert.description}</Alert.Description>
              )}
            </Alert.Content>
          </Alert.Root>
        )}

        {/* Filters */}
        <Card.Root bg={colorMode === "dark" ? "gray.800" : "white"}>
          <Card.Body p={{ base: "3", md: "4" }}>
            <VStack spacing="4" align="stretch">
              {/* Search */}
              <Box w="full">
                <InputGroup startElement={<LuSearch />}>
                  <Input
                    placeholder="Search announcements..."
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    size={{ base: "sm", md: "md" }}
                    _placeholder={{
                      color: colorMode === "dark" ? "gray.400" : "gray.500",
                    }}
                    _focus={{
                      borderColor: "teal.500",
                      boxShadow: "0 0 0 1px teal.500",
                    }}
                    _hover={{
                      borderColor:
                        colorMode === "dark" ? "gray.500" : "gray.300",
                    }}
                  />
                </InputGroup>
              </Box>

              {/* Filter Row */}
              <HStack spacing={{ base: "2", md: "4" }} wrap="wrap">
                {/* Status Filter */}
                <Box flex="1" minW={{ base: "140px", sm: "150px" }}>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    mb="1"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    display={{ base: "none", sm: "block" }}
                  >
                    Status
                  </Text>
                  <NativeSelect.Root
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    size="sm"
                  >
                    <NativeSelect.Field
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      fontSize={{ base: "sm", md: "md" }}
                      _hover={{
                        borderColor:
                          colorMode === "dark" ? "gray.500" : "gray.300",
                      }}
                      _focus={{
                        borderColor: "teal.500",
                        boxShadow: "0 0 0 1px teal.500",
                      }}
                      css={{
                        "& option": {
                          backgroundColor:
                            colorMode === "dark" ? "#374151" : "white",
                          color: colorMode === "dark" ? "white" : "#1f2937",
                        },
                      }}
                    >
                      <option value="all">All Status</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator
                      color={colorMode === "dark" ? "gray.300" : "gray.500"}
                    />
                  </NativeSelect.Root>
                </Box>

                {/* Sort By */}
                <Box flex="1" minW={{ base: "140px", sm: "150px" }}>
                  <Text
                    fontSize="xs"
                    fontWeight="medium"
                    mb="1"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    display={{ base: "none", sm: "block" }}
                  >
                    Sort By
                  </Text>
                  <NativeSelect.Root
                    value={filters.sortBy}
                    onChange={(e) =>
                      handleFilterChange("sortBy", e.target.value)
                    }
                    size="sm"
                  >
                    <NativeSelect.Field
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      fontSize={{ base: "sm", md: "md" }}
                      _hover={{
                        borderColor:
                          colorMode === "dark" ? "gray.500" : "gray.300",
                      }}
                      _focus={{
                        borderColor: "teal.500",
                        boxShadow: "0 0 0 1px teal.500",
                      }}
                      css={{
                        "& option": {
                          backgroundColor:
                            colorMode === "dark" ? "#374151" : "white",
                          color: colorMode === "dark" ? "white" : "#1f2937",
                        },
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="title">Title A-Z</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator
                      color={colorMode === "dark" ? "gray.300" : "gray.500"}
                    />
                  </NativeSelect.Root>
                </Box>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Announcements List */}
        {loading ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            py={{ base: "8", md: "12" }}
          >
            <VStack spacing="4">
              <Spinner size={{ base: "md", md: "lg" }} color="teal.500" />
              <Text fontSize={{ base: "sm", md: "md" }}>
                Loading announcements...
              </Text>
            </VStack>
          </Box>
        ) : filteredAnnouncements.length === 0 ? (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Body p={{ base: "4", md: "6" }}>
              <VStack
                spacing={{ base: "3", md: "4" }}
                py={{ base: "4", md: "8" }}
              >
                <Box fontSize={{ base: "32px", md: "48px" }}>
                  <LuBellOff
                    color={colorMode === "dark" ? "#718096" : "#A0AEC0"}
                  />
                </Box>
                <VStack spacing="2">
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="medium"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    textAlign="center"
                  >
                    No announcements found
                  </Text>
                  <Text
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    textAlign="center"
                    fontSize={{ base: "sm", md: "md" }}
                    px={{ base: "2", md: "0" }}
                  >
                    {announcements.length === 0
                      ? "No announcements available for this class"
                      : "Try adjusting your search or filter criteria"}
                  </Text>
                </VStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        ) : (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            shadow={colorMode === "dark" ? "lg" : "sm"}
          >
            <Table.Root size={{ base: "sm", md: "md" }}>
              <Table.Header
                bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                display={{ base: "none", md: "table-header-group" }}
              >
                <Table.Row bg={colorMode === "dark" ? "gray.700" : "gray.50"}>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  >
                    Announcement
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    display={{ base: "none", lg: "table-cell" }}
                  >
                    Posted
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    display={{ base: "none", sm: "table-cell" }}
                  >
                    Status
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    color={colorMode === "dark" ? "gray.200" : "gray.700"}
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  >
                    Actions
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredAnnouncements.map((announcement) => (
                  <Table.Row
                    key={announcement._id}
                    bg={
                      isUnread(announcement)
                        ? colorMode === "dark"
                          ? "orange.900"
                          : "orange.50"
                        : colorMode === "dark"
                        ? "gray.800"
                        : "white"
                    }
                    borderLeft={isUnread(announcement) ? "4px solid" : "none"}
                    borderLeftColor={
                      colorMode === "dark" ? "orange.400" : "orange.500"
                    }
                    _hover={{
                      bg: isUnread(announcement)
                        ? colorMode === "dark"
                          ? "orange.800"
                          : "orange.100"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "gray.50",
                      cursor: "pointer",
                    }}
                    onClick={() => handleAnnouncementClick(announcement)}
                    borderBottom="1px solid"
                    borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                  >
                    <Table.Cell p={{ base: "2", md: "3" }}>
                      <VStack
                        align="start"
                        spacing={{ base: "1", md: "1" }}
                        w="full"
                      >
                        <HStack spacing="2" w="full" align="start">
                          <Box
                            color={
                              colorMode === "dark" ? "green.300" : "green.500"
                            }
                            flexShrink="0"
                            mt="1"
                          >
                            <LuBookOpen />
                          </Box>
                          <VStack align="start" spacing="1" flex="1" minW="0">
                            <HStack spacing="2" align="center">
                              <Text
                                fontWeight={
                                  isUnread(announcement) ? "bold" : "semibold"
                                }
                                fontSize={{ base: "xs", md: "sm" }}
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                                lineHeight="tight"
                                noOfLines={2}
                              >
                                {announcement.title}
                              </Text>
                              {isUnread(announcement) && (
                                <Badge colorPalette="orange" size="xs">
                                  NEW
                                </Badge>
                              )}
                            </HStack>
                            <Text
                              fontSize={{ base: "2xs", md: "xs" }}
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                              lineHeight="tight"
                              noOfLines={1}
                            >
                              {truncateContent(announcement.content, 60)}
                            </Text>

                            {/* Mobile-only compact info */}
                            <HStack
                              spacing="2"
                              display={{ base: "flex", md: "none" }}
                              wrap="wrap"
                              mt="1"
                            >
                              <Text
                                fontSize="2xs"
                                color={
                                  colorMode === "dark" ? "gray.500" : "gray.500"
                                }
                              >
                                {
                                  formatDate(announcement.createdAt).split(
                                    ","
                                  )[0]
                                }
                              </Text>
                              <HStack spacing="1">
                                {isUnread(announcement) ? (
                                  <>
                                    <Box
                                      w="6px"
                                      h="6px"
                                      bg="red.500"
                                      borderRadius="full"
                                    />
                                    <Text
                                      fontSize="2xs"
                                      color="red.500"
                                      fontWeight="bold"
                                    >
                                      Unread
                                    </Text>
                                  </>
                                ) : (
                                  <>
                                    <Box
                                      w="6px"
                                      h="6px"
                                      bg="green.500"
                                      borderRadius="full"
                                    />
                                    <Text fontSize="2xs" color="green.500">
                                      Read
                                    </Text>
                                  </>
                                )}
                              </HStack>
                            </HStack>

                            {/* Mobile creator info */}
                            <Text
                              fontSize="2xs"
                              color={
                                colorMode === "dark" ? "gray.500" : "gray.500"
                              }
                              display={{ base: "block", lg: "none" }}
                              lineHeight="tight"
                            >
                              By{" "}
                              {announcement.createdBy?.userDetails?.firstName}{" "}
                              {announcement.createdBy?.userDetails?.lastName ||
                                announcement.createdBy?.email ||
                                "Unknown"}{" "}
                              • {announcement.createdBy?.role || "Staff"}
                            </Text>
                          </VStack>
                        </HStack>
                      </VStack>
                    </Table.Cell>

                    <Table.Cell
                      display={{ base: "none", lg: "table-cell" }}
                      p={{ base: "2", md: "3" }}
                    >
                      <VStack align="start" spacing="0">
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.700"}
                        >
                          {formatDate(announcement.createdAt)}
                        </Text>
                        <HStack spacing="1">
                          <Text
                            fontSize="xs"
                            color={
                              colorMode === "dark" ? "gray.400" : "gray.600"
                            }
                          >
                            By {announcement.createdBy?.userDetails?.firstName}{" "}
                            {announcement.createdBy?.userDetails?.lastName ||
                              announcement.createdBy?.email ||
                              "Unknown"}
                          </Text>
                          <Badge
                            colorPalette={
                              announcement.createdBy?.role === "admin"
                                ? "red"
                                : "blue"
                            }
                            variant="outline"
                            size="xs"
                          >
                            {announcement.createdBy?.role || "Staff"}
                          </Badge>
                        </HStack>
                      </VStack>
                    </Table.Cell>

                    <Table.Cell
                      display={{ base: "none", sm: "table-cell" }}
                      p={{ base: "2", md: "3" }}
                    >
                      <HStack spacing="1" justify="center">
                        {isUnread(announcement) ? (
                          <>
                            <Box
                              w="8px"
                              h="8px"
                              bg="red.500"
                              borderRadius="full"
                            />
                            <Text
                              fontSize="xs"
                              color="red.500"
                              fontWeight="bold"
                            >
                              Unread
                            </Text>
                          </>
                        ) : (
                          <>
                            <Box
                              w="8px"
                              h="8px"
                              bg="green.500"
                              borderRadius="full"
                            />
                            <Text fontSize="xs" color="green.500">
                              Read
                            </Text>
                          </>
                        )}
                      </HStack>
                    </Table.Cell>

                    <Table.Cell p={{ base: "2", md: "3" }}>
                      <HStack spacing="1" justify="center">
                        <Tooltip content="View Details" showArrow>
                          <IconButton
                            variant="ghost"
                            size="xs"
                            colorPalette="teal"
                            color={
                              colorMode === "dark" ? "teal.300" : "teal.600"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnnouncementClick(announcement);
                            }}
                          >
                            <LuEye />
                          </IconButton>
                        </Tooltip>
                        {isUnread(announcement) && (
                          <Tooltip content="Mark as Read" showArrow>
                            <IconButton
                              variant="ghost"
                              size="xs"
                              colorPalette="green"
                              color={
                                colorMode === "dark" ? "green.300" : "green.600"
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(announcement._id);
                              }}
                              loading={markingAsRead}
                            >
                              <LuCheck />
                            </IconButton>
                          </Tooltip>
                        )}
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Root>
        )}
      </VStack>

      {/* Announcement Details Modal */}
      <ViewAnnouncementCard
        announcement={selectedAnnouncement}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        userRole="student"
      />
    </Box>
  );
};

export default StudentClassAnnouncement;
