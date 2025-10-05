import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  Button,
  Avatar,
} from "@chakra-ui/react";
import {
  LuMegaphone,
  LuGraduationCap,
  LuBookOpen,
  LuEye,
  LuClock,
  LuCalendar,
} from "react-icons/lu";
import { useColorMode } from "../../components/ui/color-mode";
import { normalizeImageUrl } from "../../utils/imageUrl";

const AnnouncementListItem = ({
  announcement,
  onView,
  userRole = "student",
  showReadCount = false,
}) => {
  const { colorMode } = useColorMode();

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
    if (announcement.type === "academy") return "All Academy Members";
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
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card.Root
      variant="outline"
      cursor="pointer"
      onClick={() => onView(announcement)}
      transition="all 0.2s"
      _hover={{
        shadow: "lg",
        transform: "translateY(-1px)",
        borderColor: colorMode === "dark" ? "gray.500" : "gray.300",
      }}
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
    >
      <Card.Body p={{ base: 4, md: 6 }}>
        <VStack spacing={4} align="stretch">
          {/* Header */}
          <HStack spacing={3} align="flex-start">
            <Box
              p={2}
              rounded="lg"
              bg={`${getTypeColor(announcement.type)}.100`}
              color={`${getTypeColor(announcement.type)}.600`}
              _dark={{
                bg: `${getTypeColor(announcement.type)}.900`,
                color: `${getTypeColor(announcement.type)}.300`,
              }}
              flexShrink={0}
            >
              {getTypeIcon(announcement.type)}
            </Box>
            <VStack align="flex-start" spacing={1} flex="1" minW={0}>
              <Text
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="bold"
                color={colorMode === "dark" ? "white" : "gray.900"}
                lineHeight="shorter"
                noOfLines={2}
              >
                {announcement.title}
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                <Badge
                  variant="subtle"
                  colorScheme={getTypeColor(announcement.type)}
                  fontSize="xs"
                >
                  {announcement.type}
                </Badge>
                <HStack spacing={1}>
                  <LuCalendar size={12} />
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    {formatDate(announcement.createdAt)}
                  </Text>
                </HStack>
                <Text
                  fontSize="xs"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  {formatTime(announcement.createdAt)}
                </Text>
              </HStack>
            </VStack>
          </HStack>

          {/* Content Preview */}
          <Box>
            <Text
              fontSize="sm"
              color={colorMode === "dark" ? "gray.300" : "gray.700"}
              lineHeight="relaxed"
              noOfLines={2}
            >
              {announcement.content}
            </Text>
          </Box>

          {/* Footer */}
          <HStack
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={2}
          >
            <VStack align="flex-start" spacing={1} flex="1" minW={0}>
              <Text
                fontSize="xs"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
              >
                {getTargetText(announcement)}
              </Text>
              <HStack spacing={2}>
                <HStack spacing={1}>
                  <Avatar
                    size="xs"
                    name={announcement.createdBy?.name || "Unknown"}
                    src={normalizeImageUrl(announcement.createdBy?.profileImage)}
                  />
                  <Text
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    By {announcement.createdBy?.name || "Unknown"}
                  </Text>
                </HStack>
              </HStack>
            </VStack>

            <HStack spacing={2} flexShrink={0}>
              {showReadCount &&
                (userRole === "teacher" || userRole === "admin") && (
                  <HStack spacing={1}>
                    <LuEye size={14} />
                    <Text
                      fontSize="xs"
                      color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    >
                      {announcement.readCount || 0} read
                    </Text>
                  </HStack>
                )}

              {userRole === "student" && (
                <Badge
                  variant="subtle"
                  colorScheme="green"
                  fontSize="xs"
                  px={2}
                  py={1}
                >
                  Read
                </Badge>
              )}

              <Button
                size="sm"
                variant="ghost"
                rightIcon={<LuEye />}
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
                fontSize="xs"
                h="auto"
                px={3}
                py={1}
              >
                View
              </Button>
            </HStack>
          </HStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export default AnnouncementListItem;
