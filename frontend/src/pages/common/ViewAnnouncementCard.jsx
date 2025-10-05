import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Separator,
  Button,
  Card,
  Avatar,
  Spinner,
  Alert,
  Collapsible,
  Input,
  InputGroup,
  NativeSelect,
  Portal,
  Dialog,
} from "@chakra-ui/react";
import { normalizeImageUrl } from "../../utils/imageUrl";
import {
  LuX,
  LuMegaphone,
  LuGraduationCap,
  LuBookOpen,
  LuCalendar,
  LuUser,
  LuUsers,
  LuEye,
  LuChevronDown,
  LuChevronUp,
  LuCheck,
  LuClock,
  LuSearch,
  LuTrash2,
} from "react-icons/lu";
import { useColorMode } from "../../components/ui/color-mode";
import announcementService from "../../services/announcements.js";

const ViewAnnouncementCard = ({
  announcement,
  isOpen,
  onClose,
  userRole = "student", // "student", "teacher", "admin"
  onDelete, // New prop for delete functionality
}) => {
  const { colorMode } = useColorMode();
  const [readStatus, setReadStatus] = useState([]);
  const [filteredReadStatus, setFilteredReadStatus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReadersList, setShowReadersList] = useState(false);
  const [readersSearch, setReadersSearch] = useState("");
  const [readersSort, setReadersSort] = useState("name"); // "name", "date", "role"
  const [showFullContent, setShowFullContent] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!onDelete || !announcement) return;

    if (
      window.confirm(
        "Are you sure you want to delete this announcement? This action cannot be undone."
      )
    ) {
      try {
        setDeleting(true);
        await onDelete(announcement._id);
        onClose(); // Close the modal after successful deletion
      } catch (error) {
        console.error("Error deleting announcement:", error);
        // Handle error if needed
      } finally {
        setDeleting(false);
      }
    }
  };

  const fetchReadStatus = async () => {
    try {
      setLoading(true);
      const response = await announcementService.getReadStatus(
        announcement._id
      );
      setReadStatus(response.data || []);
    } catch (error) {
      console.error("Error fetching read status:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      isOpen &&
      announcement &&
      (userRole === "teacher" || userRole === "admin")
    ) {
      fetchReadStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, announcement, userRole]);

  // Filter and sort read status
  useEffect(() => {
    let filtered = [...readStatus];

    // Apply search filter
    if (readersSearch) {
      const searchLower = readersSearch.toLowerCase();
      filtered = filtered.filter(
        (reader) =>
          reader.name?.toLowerCase().includes(searchLower) ||
          reader.role?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (readersSort) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "date":
          return new Date(b.readAt) - new Date(a.readAt);
        case "role":
          return (a.role || "").localeCompare(b.role || "");
        default:
          return 0;
      }
    });

    setFilteredReadStatus(filtered);
  }, [readStatus, readersSearch, readersSort]);

  const getTypeIcon = (type) => {
    switch (type) {
      case "academy":
        return <LuMegaphone />;
      case "batch":
        return <LuGraduationCap />;
      case "class":
        return <LuBookOpen />;
      default:
        return <LuMegaphone />;
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

  const getTargetText = (announcement) => {
    if (announcement.type === "academy") return "Academy Wide";
    if (announcement.type === "batch" && announcement.targetBatch) {
      return `Batch: ${announcement.targetBatch.batchName || "Unknown"}`;
    }
    if (announcement.type === "class" && announcement.targetClass) {
      return `Class: ${announcement.targetClass.className || "Unknown"}`;
    }
    return "Unknown Target";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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

  const shouldShowReadMore = (content, wordLimit = 60) => {
    const words = content.split(" ");
    return words.length > wordLimit;
  };

  if (!isOpen || !announcement) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            maxW={{ base: "95vw", md: "600px" }}
            maxH={{ base: "90vh", md: "85vh" }}
            mx="4"
            overflow="hidden"
          >
            <Dialog.Header
              pb={{ base: "3", md: "4" }}
              borderBottomWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            >
              <HStack
                justify="space-between"
                align="flex-start"
                spacing={{ base: "2", md: "3" }}
              >
                <HStack spacing={{ base: "2", md: "3" }} flex="1" minW="0">
                  <Box
                    p={{ base: "1.5", md: "2" }}
                    rounded="lg"
                    bg={`${getTypeColor(announcement.type)}.100`}
                    color={`${getTypeColor(announcement.type)}.600`}
                    _dark={{
                      bg: `${getTypeColor(announcement.type)}.900`,
                      color: `${getTypeColor(announcement.type)}.300`,
                    }}
                    flexShrink="0"
                  >
                    {getTypeIcon(announcement.type)}
                  </Box>
                  <VStack align="flex-start" spacing="1" flex="1" minW="0">
                    <Text
                      fontSize={{ base: "md", md: "lg" }}
                      fontWeight="bold"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      lineHeight="shorter"
                      noOfLines={{ base: 2, md: 1 }}
                    >
                      {announcement.title}
                    </Text>
                    <HStack spacing="2" flexWrap="wrap">
                      <Badge
                        variant="subtle"
                        colorPalette={getTypeColor(announcement.type)}
                        fontSize={{ base: "2xs", md: "xs" }}
                        size={{ base: "xs", md: "sm" }}
                      >
                        {announcement.type}
                      </Badge>
                      <Text
                        fontSize={{ base: "2xs", md: "xs" }}
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        noOfLines={1}
                      >
                        {formatDate(announcement.createdAt)}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
                <HStack spacing="2">
                  <Dialog.CloseTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      flexShrink="0"
                    >
                      <LuX />
                    </Button>
                  </Dialog.CloseTrigger>
                </HStack>
              </HStack>
            </Dialog.Header>

            {/* Delete Button Section - Only for teachers and admins */}
            {(userRole === "teacher" || userRole === "admin") && onDelete && (
              <Box
                px={{ base: "4", md: "6" }}
                py={{ base: "3", md: "4" }}
                borderBottomWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                bg={colorMode === "dark" ? "gray.750" : "gray.25"}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={deleting}
                  colorScheme="red"
                  bg={colorMode === "dark" ? "red.900" : "red.50"}
                  borderColor={colorMode === "dark" ? "red.700" : "red.200"}
                  color={colorMode === "dark" ? "red.300" : "red.600"}
                  _hover={{
                    bg: colorMode === "dark" ? "red.800" : "red.100",
                    borderColor: colorMode === "dark" ? "red.600" : "red.300",
                    color: colorMode === "dark" ? "red.200" : "red.700",
                  }}
                  _active={{
                    bg: colorMode === "dark" ? "red.700" : "red.200",
                  }}
                  leftIcon={<LuTrash2 />}
                >
                  Delete Announcement
                </Button>
              </Box>
            )}

            <Dialog.Body
              py={{ base: "4", md: "6" }}
              overflowY="auto"
              css={{
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: colorMode === "dark" ? "#374151" : "#f1f5f9",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: colorMode === "dark" ? "#6b7280" : "#cbd5e1",
                  borderRadius: "3px",
                },
              }}
            >
              <VStack spacing={{ base: "4", md: "6" }} align="stretch">
                {/* Content Section */}
                <Box>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    mb={{ base: "2", md: "3" }}
                  >
                    Content
                  </Text>
                  <Box
                    p={{ base: "3", md: "4" }}
                    rounded="lg"
                    bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                    border="1px solid"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.200"}
                  >
                    <Text
                      color={colorMode === "dark" ? "gray.100" : "gray.800"}
                      lineHeight="relaxed"
                      whiteSpace="pre-wrap"
                      fontSize={{ base: "sm", md: "md" }}
                    >
                      {showFullContent
                        ? announcement.content
                        : truncateContent(announcement.content, 60)}
                    </Text>
                    {shouldShowReadMore(announcement.content, 60) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        mt="2"
                        onClick={() => setShowFullContent(!showFullContent)}
                        color={colorMode === "dark" ? "teal.300" : "teal.600"}
                        p="0"
                        h="auto"
                        minH="auto"
                        fontSize={{ base: "xs", md: "sm" }}
                      >
                        {showFullContent ? "Show less" : "Read more"}
                      </Button>
                    )}
                  </Box>
                </Box>

                <Separator />

                {/* Details Section */}
                <Box>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="semibold"
                    color={colorMode === "dark" ? "gray.300" : "gray.700"}
                    mb={{ base: "2", md: "3" }}
                  >
                    Details
                  </Text>
                  <VStack spacing={{ base: "2", md: "3" }} align="stretch">
                    <HStack justify="space-between" align="start">
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        flexShrink="0"
                      >
                        Posted by:
                      </Text>
                      <VStack align="end" spacing="0" flex="1" minW="0">
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          fontWeight="medium"
                          color={colorMode === "dark" ? "gray.200" : "gray.800"}
                          textAlign="right"
                          noOfLines={1}
                        >
                          {announcement.createdBy?.userDetails?.firstName}{" "}
                          {announcement.createdBy?.userDetails?.lastName ||
                            announcement.createdBy?.email ||
                            "Academy Staff"}
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
                      </VStack>
                    </HStack>
                    <HStack justify="space-between" align="start">
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        flexShrink="0"
                      >
                        Target audience:
                      </Text>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        fontWeight="medium"
                        color={colorMode === "dark" ? "gray.200" : "gray.800"}
                        textAlign="right"
                        noOfLines={2}
                        flex="1"
                        minW="0"
                      >
                        {getTargetText(announcement)}
                      </Text>
                    </HStack>
                    {userRole === "student" && (
                      <HStack justify="space-between" align="center">
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        >
                          Status:
                        </Text>
                        <Badge
                          variant="subtle"
                          colorPalette="green"
                          fontSize="xs"
                          size="xs"
                        >
                          <HStack spacing={1}>
                            <LuCheck size={10} />
                            <Text>Read</Text>
                          </HStack>
                        </Badge>
                      </HStack>
                    )}
                  </VStack>
                </Box>

                {/* Read Status Section (Teacher/Admin only) */}
                {(userRole === "teacher" || userRole === "admin") && (
                  <>
                    <Separator />
                    <Box>
                      <Collapsible.Root open={showReadersList}>
                        <Collapsible.Trigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReadersList(!showReadersList)}
                            leftIcon={
                              showReadersList ? (
                                <LuChevronUp />
                              ) : (
                                <LuChevronDown />
                              )
                            }
                            color={colorMode === "dark" ? "white" : "gray.700"}
                            _hover={{
                              bg:
                                colorMode === "dark" ? "gray.600" : "gray.100",
                            }}
                            justifyContent="flex-start"
                            w="100%"
                            p={{ base: "2", md: "3" }}
                            rounded="md"
                            bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                          >
                            <HStack spacing={2}>
                              <LuEye />
                              <Text
                                fontSize={{ base: "xs", md: "sm" }}
                                fontWeight="semibold"
                              >
                                Read Status ({readStatus.length} readers)
                              </Text>
                            </HStack>
                          </Button>
                        </Collapsible.Trigger>

                        <Collapsible.Content>
                          <Box mt={{ base: "2", md: "3" }}>
                            {loading ? (
                              <HStack justify="center" p="4">
                                <Spinner size="sm" />
                                <Text
                                  fontSize={{ base: "xs", md: "sm" }}
                                  color={
                                    colorMode === "dark"
                                      ? "gray.400"
                                      : "gray.600"
                                  }
                                >
                                  Loading read status...
                                </Text>
                              </HStack>
                            ) : readStatus.length > 0 ? (
                              <VStack
                                spacing={{ base: "2", md: "3" }}
                                align="stretch"
                              >
                                {/* Search and Sort Controls */}
                                <VStack spacing="2" align="stretch">
                                  <InputGroup
                                    endElement={
                                      <LuSearch
                                        color={
                                          colorMode === "dark"
                                            ? "#9CA3AF"
                                            : "#6B7280"
                                        }
                                      />
                                    }
                                  >
                                    <Input
                                      placeholder="Search readers..."
                                      value={readersSearch}
                                      onChange={(e) =>
                                        setReadersSearch(e.target.value)
                                      }
                                      size="sm"
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.700"
                                          : "gray.50"
                                      }
                                      borderColor={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.300"
                                      }
                                      color={
                                        colorMode === "dark"
                                          ? "white"
                                          : "gray.900"
                                      }
                                      fontSize={{ base: "sm", md: "md" }}
                                      _placeholder={{
                                        color:
                                          colorMode === "dark"
                                            ? "gray.400"
                                            : "gray.500",
                                      }}
                                    />
                                  </InputGroup>

                                  <NativeSelect.Root size="sm">
                                    <NativeSelect.Field
                                      value={readersSort}
                                      onChange={(e) =>
                                        setReadersSort(e.target.value)
                                      }
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.700"
                                          : "gray.50"
                                      }
                                      borderColor={
                                        colorMode === "dark"
                                          ? "gray.600"
                                          : "gray.300"
                                      }
                                      color={
                                        colorMode === "dark"
                                          ? "white"
                                          : "gray.900"
                                      }
                                      fontSize={{ base: "sm", md: "md" }}
                                      css={{
                                        "& option": {
                                          backgroundColor:
                                            colorMode === "dark"
                                              ? "#374151"
                                              : "white",
                                          color:
                                            colorMode === "dark"
                                              ? "white"
                                              : "#1f2937",
                                        },
                                      }}
                                    >
                                      <option value="name">Sort by Name</option>
                                      <option value="date">
                                        Sort by Read Date
                                      </option>
                                      <option value="role">Sort by Role</option>
                                    </NativeSelect.Field>
                                    <NativeSelect.Indicator
                                      color={
                                        colorMode === "dark"
                                          ? "gray.300"
                                          : "gray.500"
                                      }
                                    />
                                  </NativeSelect.Root>
                                </VStack>

                                {/* Readers List */}
                                <VStack
                                  spacing="2"
                                  align="stretch"
                                  maxH={{ base: "200px", md: "300px" }}
                                  overflowY="auto"
                                  css={{
                                    "&::-webkit-scrollbar": {
                                      width: "6px",
                                    },
                                    "&::-webkit-scrollbar-track": {
                                      background:
                                        colorMode === "dark"
                                          ? "#374151"
                                          : "#f1f5f9",
                                    },
                                    "&::-webkit-scrollbar-thumb": {
                                      background:
                                        colorMode === "dark"
                                          ? "#6b7280"
                                          : "#cbd5e1",
                                      borderRadius: "3px",
                                    },
                                  }}
                                >
                                  {filteredReadStatus.map((reader) => (
                                    <HStack
                                      key={reader._id}
                                      p={{ base: "2", md: "3" }}
                                      rounded="md"
                                      bg={
                                        colorMode === "dark"
                                          ? "gray.700"
                                          : "gray.100"
                                      }
                                      justify="space-between"
                                      align="start"
                                    >
                                      <HStack
                                        spacing={{ base: "2", md: "3" }}
                                        flex="1"
                                        minW="0"
                                      >
                                        <Avatar.Root
                                          size={{ base: "xs", md: "sm" }}
                                        >
                                          {reader.profileImage && (
                                            <Avatar.Image
                                              src={normalizeImageUrl(reader.profileImage)}
                                              alt={reader.name}
                                            />
                                          )}
                                          <Avatar.Fallback name={reader.name}>
                                            {reader.name
                                              ?.charAt(0)
                                              ?.toUpperCase() || "U"}
                                          </Avatar.Fallback>
                                        </Avatar.Root>
                                        <VStack
                                          align="flex-start"
                                          spacing={0}
                                          flex="1"
                                          minW="0"
                                        >
                                          <Text
                                            fontSize={{ base: "xs", md: "sm" }}
                                            fontWeight="medium"
                                            color={
                                              colorMode === "dark"
                                                ? "white"
                                                : "gray.900"
                                            }
                                            noOfLines={1}
                                          >
                                            {reader.name}
                                          </Text>
                                          <Text
                                            fontSize={{ base: "2xs", md: "xs" }}
                                            color={
                                              colorMode === "dark"
                                                ? "gray.400"
                                                : "gray.600"
                                            }
                                          >
                                            {reader.role}
                                          </Text>
                                        </VStack>
                                      </HStack>
                                      <VStack
                                        align="flex-end"
                                        spacing={0}
                                        flexShrink="0"
                                      >
                                        <Badge
                                          variant="subtle"
                                          colorPalette="green"
                                          fontSize="2xs"
                                          size="xs"
                                        >
                                          Read
                                        </Badge>
                                        <Text
                                          fontSize="2xs"
                                          color={
                                            colorMode === "dark"
                                              ? "gray.400"
                                              : "gray.600"
                                          }
                                          textAlign="right"
                                        >
                                          {
                                            formatDate(reader.readAt).split(
                                              ","
                                            )[0]
                                          }
                                        </Text>
                                      </VStack>
                                    </HStack>
                                  ))}
                                </VStack>
                              </VStack>
                            ) : (
                              <Text
                                fontSize={{ base: "xs", md: "sm" }}
                                color={
                                  colorMode === "dark" ? "gray.400" : "gray.600"
                                }
                                textAlign="center"
                                p="4"
                              >
                                {filteredReadStatus.length === 0 &&
                                readersSearch
                                  ? "No readers match your search"
                                  : "No one has read this announcement yet"}
                              </Text>
                            )}
                          </Box>
                        </Collapsible.Content>
                      </Collapsible.Root>
                    </Box>
                  </>
                )}
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ViewAnnouncementCard;
