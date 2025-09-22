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
import { Tooltip } from "../../../components/ui/tooltip";
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
import { useColorMode } from "../../../components/ui/color-mode";
import announcementService from "../../../services/announcements.js";
import ViewAnnouncementCard from "../../common/ViewAnnouncementCard";

const StudentAnnouncements = () => {
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
    type: "all",
    status: "all", // all, read, unread
    sortBy: "newest",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [announcements, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getAnnouncements();

      if (response.success) {
        setAnnouncements(response.data);
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

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter(
        (announcement) => announcement.type === filters.type
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

  const getTypeColor = (type) => {
    switch (type) {
      case "academy":
        return "purple";
      case "batch":
        return "blue";
      case "class":
        return "green";
      default:
        return "gray";
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

  const getTargetInfo = (announcement) => {
    if (announcement.type === "academy") {
      return "Academy Wide";
    }
    if (announcement.type === "batch" && announcement.targetBatch) {
      return `Batch: ${announcement.targetBatch.batchName}`;
    }
    if (announcement.type === "class" && announcement.targetClass) {
      return `Class: ${announcement.targetClass.className}`;
    }
    return "Unknown Target";
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
    <Box p={{ base: "4", md: "6" }}>
      <VStack spacing="6" align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="start" mb="4">
            <VStack align="start" spacing="1">
              <HStack>
                <LuBell color="#0d9488" size="24" />
                <Text
                  fontSize="2xl"
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Announcements
                </Text>
              </HStack>
              <Text color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                Stay updated with academy, batch, and class announcements
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
          <Card.Body>
            <VStack spacing="4" align="stretch">
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
                      borderColor={
                        colorMode === "dark" ? "gray.600" : "gray.200"
                      }
                      color={colorMode === "dark" ? "white" : "gray.900"}
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
                <HStack spacing="4" wrap="wrap">
                  {/* Type Filter */}
                  <Box
                    minW={{ base: "full", sm: "130px" }}
                    flex={{ base: "1", sm: "0" }}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb="2"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Type
                    </Text>
                    <Select.Root
                      value={[filters.type]}
                      onValueChange={(details) =>
                        handleFilterChange("type", details.value[0])
                      }
                      collection={createListCollection({
                        items: [
                          { value: "all", label: "All Types" },
                          { value: "academy", label: "Academy" },
                          { value: "batch", label: "Batch" },
                          { value: "class", label: "Class" },
                        ],
                      })}
                    >
                      <Select.Control>
                        <Select.Trigger
                          bg={colorMode === "dark" ? "gray.700" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.200"
                          }
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _hover={{
                            borderColor:
                              colorMode === "dark" ? "gray.500" : "gray.300",
                          }}
                          _focus={{
                            borderColor: "teal.500",
                            boxShadow: "0 0 0 1px teal.500",
                          }}
                        >
                          <Select.ValueText />
                          <Select.Indicator />
                        </Select.Trigger>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content
                            bg={colorMode === "dark" ? "gray.700" : "white"}
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.200"
                            }
                            shadow="lg"
                          >
                            <Select.Item
                              item={{ value: "all", label: "All Types" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                All Types
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                            <Select.Item
                              item={{ value: "academy", label: "Academy" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Academy
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                            <Select.Item
                              item={{ value: "batch", label: "Batch" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Batch
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                            <Select.Item
                              item={{ value: "class", label: "Class" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Class
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Box>

                  {/* Status Filter */}
                  <Box
                    minW={{ base: "full", sm: "130px" }}
                    flex={{ base: "1", sm: "0" }}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb="2"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Status
                    </Text>
                    <Select.Root
                      value={[filters.status]}
                      onValueChange={(details) =>
                        handleFilterChange("status", details.value[0])
                      }
                      collection={createListCollection({
                        items: [
                          { value: "all", label: "All Status" },
                          { value: "unread", label: "Unread" },
                          { value: "read", label: "Read" },
                        ],
                      })}
                    >
                      <Select.Control>
                        <Select.Trigger
                          bg={colorMode === "dark" ? "gray.700" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.200"
                          }
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _hover={{
                            borderColor:
                              colorMode === "dark" ? "gray.500" : "gray.300",
                          }}
                          _focus={{
                            borderColor: "teal.500",
                            boxShadow: "0 0 0 1px teal.500",
                          }}
                        >
                          <Select.ValueText />
                          <Select.Indicator />
                        </Select.Trigger>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content
                            bg={colorMode === "dark" ? "gray.700" : "white"}
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.200"
                            }
                            shadow="lg"
                          >
                            <Select.Item
                              item={{ value: "all", label: "All Status" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                All Status
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                            <Select.Item
                              item={{ value: "unread", label: "Unread" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Unread
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                            <Select.Item
                              item={{ value: "read", label: "Read" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Read
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Box>

                  {/* Sort By */}
                  <Box
                    minW={{ base: "full", sm: "130px" }}
                    flex={{ base: "1", sm: "0" }}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      mb="2"
                      color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    >
                      Sort By
                    </Text>
                    <Select.Root
                      value={[filters.sortBy]}
                      onValueChange={(details) =>
                        handleFilterChange("sortBy", details.value[0])
                      }
                      collection={createListCollection({
                        items: [
                          { value: "newest", label: "Newest First" },
                          { value: "oldest", label: "Oldest First" },
                          { value: "title", label: "Title A-Z" },
                        ],
                      })}
                    >
                      <Select.Control>
                        <Select.Trigger
                          bg={colorMode === "dark" ? "gray.700" : "white"}
                          borderColor={
                            colorMode === "dark" ? "gray.600" : "gray.200"
                          }
                          color={colorMode === "dark" ? "white" : "gray.900"}
                          _hover={{
                            borderColor:
                              colorMode === "dark" ? "gray.500" : "gray.300",
                          }}
                          _focus={{
                            borderColor: "teal.500",
                            boxShadow: "0 0 0 1px teal.500",
                          }}
                        >
                          <Select.ValueText />
                          <Select.Indicator />
                        </Select.Trigger>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content
                            bg={colorMode === "dark" ? "gray.700" : "white"}
                            borderColor={
                              colorMode === "dark" ? "gray.600" : "gray.200"
                            }
                            shadow="lg"
                          >
                            <Select.Item
                              item={{ value: "newest", label: "Newest First" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Newest First
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                            <Select.Item
                              item={{ value: "oldest", label: "Oldest First" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Oldest First
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                            <Select.Item
                              item={{ value: "title", label: "Title A-Z" }}
                              _hover={{
                                bg:
                                  colorMode === "dark"
                                    ? "gray.600"
                                    : "gray.100",
                              }}
                            >
                              <Select.ItemText
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                Title A-Z
                              </Select.ItemText>
                              <Select.ItemIndicator />
                            </Select.Item>
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  </Box>
                </HStack>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Announcements List */}
        {loading ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            py="12"
          >
            <VStack spacing="4">
              <Spinner size="lg" color="teal.500" />
              <Text>Loading announcements...</Text>
            </VStack>
          </Box>
        ) : filteredAnnouncements.length === 0 ? (
          <Card.Root>
            <Card.Body>
              <VStack spacing="4" py="8">
                <LuBellOff
                  size="48"
                  color={colorMode === "dark" ? "#718096" : "#A0AEC0"}
                />
                <VStack spacing="2">
                  <Text
                    fontSize="lg"
                    fontWeight="medium"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                  >
                    No announcements found
                  </Text>
                  <Text
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    textAlign="center"
                  >
                    {announcements.length === 0
                      ? "No announcements available at the moment"
                      : "Try adjusting your search or filter criteria"}
                  </Text>
                </VStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        ) : (
          <Box
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderRadius="md"
            border="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            overflow="hidden"
          >
            <Table.Root
              variant="outline"
              bg={colorMode === "dark" ? "gray.800" : "white"}
              size={{ base: "sm", md: "md" }}
            >
              <Table.Header>
                <Table.Row
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  h={{ base: "8", md: "10" }}
                >
                  <Table.ColumnHeader
                    w={{ base: "40%", md: "25%" }}
                    fontSize={{ base: "xs", md: "sm" }}
                    p={{ base: "2", md: "3" }}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Title
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    w="20%"
                    fontSize={{ base: "xs", md: "sm" }}
                    p={{ base: "2", md: "3" }}
                    display={{ base: "none", md: "table-cell" }}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Type
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    w="20%"
                    fontSize={{ base: "xs", md: "sm" }}
                    p={{ base: "2", md: "3" }}
                    display={{ base: "none", md: "table-cell" }}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Created
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    w={{ base: "20%", md: "15%" }}
                    fontSize={{ base: "xs", md: "sm" }}
                    p={{ base: "2", md: "3" }}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Target
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    w={{ base: "15%", md: "10%" }}
                    fontSize={{ base: "xs", md: "sm" }}
                    p={{ base: "2", md: "3" }}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Status
                  </Table.ColumnHeader>
                  <Table.ColumnHeader
                    w={{ base: "25%", md: "10%" }}
                    fontSize={{ base: "xs", md: "sm" }}
                    p={{ base: "2", md: "3" }}
                    color={colorMode === "dark" ? "white" : "gray.900"}
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
                        ? "gray.850"
                        : "white"
                    }
                    borderLeft={isUnread(announcement) ? "4px solid" : "none"}
                    borderLeftColor={
                      colorMode === "dark" ? "orange.400" : "orange.500"
                    }
                    h={{ base: "12", md: "14" }}
                    _hover={{
                      bg: isUnread(announcement)
                        ? colorMode === "dark"
                          ? "orange.800"
                          : "orange.100"
                        : colorMode === "dark"
                        ? "gray.700"
                        : "gray.50",
                    }}
                    cursor="pointer"
                    onClick={() => handleAnnouncementClick(announcement)}
                  >
                    <Table.Cell p={{ base: "2", md: "3" }}>
                      <VStack align="start" spacing="1">
                        <HStack spacing="2" align="center">
                          <Text
                            fontSize={{ base: "xs", md: "sm" }}
                            fontWeight={
                              isUnread(announcement) ? "bold" : "semibold"
                            }
                            color={colorMode === "dark" ? "white" : "gray.900"}
                            noOfLines={1}
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
                          fontSize={{ base: "xs", md: "xs" }}
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                          noOfLines={{ base: 1, md: 2 }}
                          display={{ base: "block", md: "block" }}
                        >
                          {truncateContent(announcement.content, 60)}
                        </Text>
                        {/* Mobile-only type and date */}
                        <HStack
                          spacing="2"
                          display={{ base: "flex", md: "none" }}
                          wrap="wrap"
                        >
                          <Badge
                            colorPalette={getTypeColor(announcement.type)}
                            size="xs"
                          >
                            {announcement.type}
                          </Badge>
                          <HStack spacing="1">
                            <LuCalendar
                              size="10"
                              color={
                                colorMode === "dark" ? "#A0AEC0" : "#718096"
                              }
                            />
                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                            >
                              {formatDate(announcement.createdAt)}
                            </Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </Table.Cell>
                    <Table.Cell
                      p={{ base: "2", md: "3" }}
                      display={{ base: "none", md: "table-cell" }}
                    >
                      <Badge
                        colorPalette={getTypeColor(announcement.type)}
                        size="sm"
                      >
                        {announcement.type}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell
                      p={{ base: "2", md: "3" }}
                      display={{ base: "none", md: "table-cell" }}
                    >
                      <HStack spacing="1">
                        <LuCalendar
                          size="14"
                          color={colorMode === "dark" ? "#A0AEC0" : "#718096"}
                        />
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          {formatDate(announcement.createdAt)}
                        </Text>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell p={{ base: "2", md: "3" }}>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        noOfLines={1}
                      >
                        {getTargetInfo(announcement)}
                      </Text>
                    </Table.Cell>
                    <Table.Cell p={{ base: "2", md: "3" }}>
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
                              display={{ base: "none", md: "block" }}
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
                            <Text
                              fontSize="xs"
                              color="green.500"
                              display={{ base: "none", md: "block" }}
                            >
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
          </Box>
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

export default StudentAnnouncements;
