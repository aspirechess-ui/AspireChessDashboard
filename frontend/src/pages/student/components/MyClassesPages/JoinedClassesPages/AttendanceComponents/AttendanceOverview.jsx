import React from "react";
import {
  Box,
  VStack,
  HStack,
  Grid,
  Text,
  Badge,
  Card,
  Stat,
  ProgressCircle,
  AbsoluteCenter,
  Flex,
} from "@chakra-ui/react";
import {
  LuCheck,
  LuCircleX,
  LuClock,
  LuCalendarDays,
  LuTrendingUp,
  LuInfo,
} from "react-icons/lu";
import { useColorMode } from "../../../../../../components/ui/color-mode";

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  description,
  loading,
}) => {
  const { colorMode } = useColorMode();

  return (
    <Card.Root
      bg={colorMode === "dark" ? "gray.800" : "white"}
      borderWidth="1px"
      borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      shadow={colorMode === "dark" ? "xl" : "sm"}
      transition="all 0.2s"
      _hover={{
        borderColor: colorMode === "dark" ? "gray.600" : "gray.300",
        transform: "translateY(-2px)",
        shadow: colorMode === "dark" ? "2xl" : "lg",
      }}
    >
      <Card.Body p={{ base: 4, md: 5 }}>
        <VStack spacing={3} align="center">
          <Flex
            direction={{ base: "column", sm: "row" }}
            spacing={3}
            align="center"
            w="full"
            justify="center"
            gap={{ base: 2, sm: 3 }}
          >
            <Box
              p={2}
              rounded="lg"
              bg={`${color}.100`}
              color={`${color}.600`}
              _dark={{
                bg: `${color}.900`,
                color: `${color}.300`,
              }}
              order={{ base: 1, sm: 0 }}
            >
              {Icon && <Icon size={20} />}
            </Box>
            <VStack
              spacing={1}
              align={{ base: "center", sm: "start" }}
              flex={1}
            >
              <Text
                fontSize="sm"
                fontWeight="medium"
                color={colorMode === "dark" ? "gray.300" : "gray.600"}
                textAlign={{ base: "center", sm: "left" }}
              >
                {label}
              </Text>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={colorMode === "dark" ? "white" : "gray.900"}
                opacity={loading ? 0.5 : 1}
                transition="opacity 0.2s"
                textAlign={{ base: "center", sm: "left" }}
              >
                {loading ? "..." : value}
              </Text>
            </VStack>
          </Flex>
          {description && (
            <Text
              fontSize="xs"
              color={colorMode === "dark" ? "gray.400" : "gray.500"}
              textAlign="center"
            >
              {description}
            </Text>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

const AttendanceOverview = ({ stats, loading, dateFilter }) => {
  const { colorMode } = useColorMode();

  // Calculate attendance percentage with safe fallback
  const attendancePercentage =
    stats?.totalSessions > 0
      ? Math.round((stats.presentCount / stats.totalSessions) * 100)
      : 0;

  // Get attendance status based on percentage
  const getAttendanceStatus = (percentage) => {
    if (percentage >= 90) return { color: "green", status: "Excellent" };
    if (percentage >= 80) return { color: "blue", status: "Good" };
    if (percentage >= 70) return { color: "yellow", status: "Average" };
    return { color: "red", status: "Poor" };
  };

  const attendanceStatus = getAttendanceStatus(attendancePercentage);

  // Calculate improvement trend (mock for now - could be enhanced with historical data)
  const improvementTrend =
    stats?.totalSessions > 0
      ? (stats.presentCount > stats.absentCount ? "+" : "-") +
        Math.abs(stats.presentCount - stats.absentCount)
      : 0;

  // Get filter description
  const getFilterDescription = () => {
    if (dateFilter.preset === "all") return "All time";
    if (dateFilter.preset === "week") return "Last 7 days";
    if (dateFilter.preset === "month") return "Last 30 days";
    if (dateFilter.preset === "custom") {
      const start = dateFilter.startDate
        ? new Date(dateFilter.startDate).toLocaleDateString()
        : "";
      const end = dateFilter.endDate
        ? new Date(dateFilter.endDate).toLocaleDateString()
        : "";
      return `${start} - ${end}`;
    }
    return "";
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Period Info */}
      <Flex
        justify="space-between"
        align={{ base: "start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap={{ base: 2, md: 0 }}
      >
        <Text
          fontSize="sm"
          color={colorMode === "dark" ? "gray.400" : "gray.600"}
        >
          Showing attendance for: {getFilterDescription()}
        </Text>
        <Badge
          colorPalette={attendanceStatus.color}
          variant="subtle"
          fontSize="xs"
          alignSelf={{ base: "flex-start", md: "auto" }}
        >
          {attendanceStatus.status}
        </Badge>
      </Flex>

      {/* Main Stats Grid */}
      <Grid
        templateColumns={{
          base: "1fr",
          sm: "repeat(2, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={{ base: 3, md: 4 }}
      >
        <StatCard
          icon={LuCalendarDays}
          label="Total Sessions"
          value={stats?.totalSessions || 0}
          color="blue"
          description="Classes conducted"
          loading={loading}
        />
        <StatCard
          icon={LuCheck}
          label="Present"
          value={stats?.presentCount || 0}
          color="green"
          description="Attended sessions"
          loading={loading}
        />
        <StatCard
          icon={LuCircleX}
          label="Absent"
          value={stats?.absentCount || 0}
          color="red"
          description="Missed sessions"
          loading={loading}
        />
        <StatCard
          icon={LuClock}
          label="Late"
          value={stats?.lateCount || 0}
          color="yellow"
          description="Late arrivals"
          loading={loading}
        />
      </Grid>

      {/* Detailed Stats */}
      <Grid
        templateColumns={{
          base: "1fr",
          md: "repeat(2, 1fr)",
          lg: "repeat(3, 1fr)",
        }}
        gap={{ base: 4, md: 6 }}
      >
        {/* Attendance Percentage */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "xl" : "sm"}
        >
          <Card.Body p={{ base: 4, md: 6 }}>
            <VStack spacing={4} align="center">
              <Text
                fontSize="md"
                fontWeight="semibold"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Attendance Rate
              </Text>
              <ProgressCircle.Root value={attendancePercentage} size="xl">
                <ProgressCircle.Circle>
                  <ProgressCircle.Track
                    stroke={colorMode === "dark" ? "gray.700" : "gray.200"}
                  />
                  <ProgressCircle.Range
                    stroke={
                      attendanceStatus.color === "green"
                        ? "#10B981"
                        : attendanceStatus.color === "blue"
                        ? "#3B82F6"
                        : attendanceStatus.color === "yellow"
                        ? "#F59E0B"
                        : "#EF4444"
                    }
                    strokeLinecap="round"
                  />
                </ProgressCircle.Circle>
                <AbsoluteCenter>
                  <ProgressCircle.ValueText
                    fontSize="lg"
                    fontWeight="bold"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    {loading ? "..." : `${attendancePercentage}%`}
                  </ProgressCircle.ValueText>
                </AbsoluteCenter>
              </ProgressCircle.Root>
              <Badge
                colorPalette={attendanceStatus.color}
                variant="subtle"
                fontSize="sm"
                px={3}
                py={1}
                rounded="full"
              >
                {attendanceStatus.status}
              </Badge>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Excused Absences */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "xl" : "sm"}
        >
          <Card.Body p={{ base: 4, md: 6 }}>
            <VStack spacing={4} align="center">
              <HStack spacing={2} align="center">
                <LuInfo size={20} color="#8B5CF6" />
                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Excused Absences
                </Text>
              </HStack>
              <Text
                fontSize="3xl"
                fontWeight="bold"
                color="#8B5CF6"
                opacity={loading ? 0.5 : 1}
                transition="opacity 0.2s"
              >
                {loading ? "..." : stats?.excusedCount || 0}
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                textAlign="center"
              >
                Valid reasons for absence
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Performance Insight */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "xl" : "sm"}
        >
          <Card.Body p={{ base: 4, md: 6 }}>
            <VStack spacing={4} align="center">
              <HStack spacing={2} align="center">
                <LuTrendingUp size={20} color="#10B981" />
                <Text
                  fontSize="md"
                  fontWeight="semibold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Trend
                </Text>
              </HStack>
              <Text
                fontSize="2xl"
                fontWeight="bold"
                color={
                  stats?.presentCount > stats?.absentCount
                    ? "#10B981"
                    : "#EF4444"
                }
                opacity={loading ? 0.5 : 1}
                transition="opacity 0.2s"
              >
                {loading ? "..." : improvementTrend}
              </Text>
              <Text
                fontSize="sm"
                color={colorMode === "dark" ? "gray.400" : "gray.600"}
                textAlign="center"
              >
                {stats?.presentCount > stats?.absentCount
                  ? "Improving"
                  : "Needs attention"}
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>
    </VStack>
  );
};

export default AttendanceOverview;
