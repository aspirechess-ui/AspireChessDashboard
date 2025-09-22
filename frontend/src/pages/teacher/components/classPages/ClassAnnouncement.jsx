import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  InputGroup,
  Alert,
  Spinner,
  NativeSelect,
  Card,
  Badge,
  IconButton,
  Separator,
  Table,
} from "@chakra-ui/react";
import {
  LuPlus,
  LuSearch,
  LuFilter,
  LuX,
  LuMegaphone,
  LuGraduationCap,
  LuBookOpen,
  LuEye,
  LuCalendar,
  LuUsers,
} from "react-icons/lu";
import { useColorMode } from "../../../../components/ui/color-mode";
import CreateAnnouncement from "../../../common/CreateAnnouncement";
import ViewAnnouncementCard from "../../../common/ViewAnnouncementCard";
import announcementService from "../../../../services/announcements.js";

const ClassAnnouncement = ({ classData }) => {
  const { colorMode } = useColorMode();
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [alert, setAlert] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    sortBy: "newest",
  });

  useEffect(() => {
    if (classData && classData._id) {
      fetchAnnouncements();
    }
  }, [classData]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleCreateSuccess = (newAnnouncement) => {
    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setAlert({
      type: "success",
      title: "Success",
      description: "Announcement created successfully",
    });
    setTimeout(() => setAlert(null), 3000);
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

  const truncateContent = (content, wordLimit = 60) => {
    const words = content.split(" ");
    if (words.length <= wordLimit) return content;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      const response = await announcementService.deleteAnnouncement(
        announcementId
      );

      if (response.success) {
        // Remove the announcement from the state
        setAnnouncements((prev) =>
          prev.filter((announcement) => announcement._id !== announcementId)
        );

        // Close the modal
        setShowDetailsModal(false);
        setSelectedAnnouncement(null);

        // Show success message
        setAlert({
          type: "success",
          title: "Success",
          description: "Announcement deleted successfully",
        });
        setTimeout(() => setAlert(null), 3000);
      } else {
        setAlert({
          type: "error",
          title: "Error",
          description: response.message || "Failed to delete announcement",
        });
        setTimeout(() => setAlert(null), 3000);
      }
    } catch (error) {
      console.error("Error deleting announcement:", error);
      setAlert({
        type: "error",
        title: "Error",
        description: "Failed to delete announcement",
      });
      setTimeout(() => setAlert(null), 3000);
    }
  };

  return (
    <Box>
      <VStack spacing={{ base: "4", md: "6" }} align="stretch">
        {/* Header */}
        <Box>
          <HStack
            justify="space-between"
            align="start"
            mb={{ base: "3", md: "4" }}
            wrap="wrap"
            gap="3"
          >
            <VStack align="start" spacing="1" flex="1" minW="0">
              <HStack spacing="2" wrap="wrap">
                <LuBookOpen color="#0d9488" size="20" />
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                  lineHeight="shorter"
                >
                  Class Announcements
                </Text>
              </HStack>
              <Text
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                fontSize={{ base: "sm", md: "md" }}
              >
                Announcements for {classData?.className || "this class"}
              </Text>
            </VStack>
            <Button
              bg="#0d9488"
              color="white"
              _hover={{ bg: "#0f766e" }}
              onClick={() => setShowCreateModal(true)}
              size={{ base: "sm", md: "md" }}
              flexShrink="0"
            >
              <LuPlus />
              <Text display={{ base: "none", sm: "inline" }}>
                New Announcement
              </Text>
              <Text display={{ base: "inline", sm: "none" }}>New</Text>
            </Button>
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
            <VStack spacing={{ base: "3", md: "4" }} align="stretch">
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
                  <LuBookOpen
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
                      ? "Create your first class announcement to get started"
                      : "Try adjusting your search or filter criteria"}
                  </Text>
                </VStack>
                {announcements.length === 0 && (
                  <Button
                    bg="#0d9488"
                    color="white"
                    _hover={{ bg: "#0f766e" }}
                    onClick={() => setShowCreateModal(true)}
                    size={{ base: "sm", md: "md" }}
                  >
                    <LuPlus />
                    <Text display={{ base: "none", sm: "inline" }}>
                      Create First Announcement
                    </Text>
                    <Text display={{ base: "inline", sm: "none" }}>Create</Text>
                  </Button>
                )}
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
                    Reads
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredAnnouncements.map((announcement) => (
                  <Table.Row
                    key={announcement._id}
                    bg={colorMode === "dark" ? "gray.800" : "white"}
                    _hover={{
                      bg: colorMode === "dark" ? "gray.700" : "gray.50",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setSelectedAnnouncement(announcement);
                      setShowDetailsModal(true);
                    }}
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
                            <Text
                              fontWeight="semibold"
                              fontSize={{ base: "xs", md: "sm" }}
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                              lineHeight="tight"
                              noOfLines={2}
                            >
                              {announcement.title}
                            </Text>
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
                                <LuEye
                                  size="10"
                                  color={
                                    colorMode === "dark" ? "#9CA3AF" : "#6B7280"
                                  }
                                />
                                <Text
                                  fontSize="2xs"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.400"
                                      : "gray.600"
                                  }
                                >
                                  {announcement.readBy?.length || 0}
                                </Text>
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
                      <HStack spacing="1">
                        <LuEye
                          size="14"
                          color={colorMode === "dark" ? "#9CA3AF" : "#6B7280"}
                        />
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          {announcement.readBy?.length || 0}
                        </Text>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Root>
        )}
      </VStack>

      {/* Create Announcement Modal - with class preset */}
      <CreateAnnouncement
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        presetType="class"
        presetClass={classData?._id}
        presetBatch={classData?.linkedBatch?._id}
        contextTitle={`Create Announcement for ${
          classData?.className || "Class"
        }`}
      />

      {/* Announcement Details Modal */}
      <ViewAnnouncementCard
        announcement={selectedAnnouncement}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onDelete={handleDeleteAnnouncement}
        userRole="teacher"
      />
    </Box>
  );
};

export default ClassAnnouncement;
