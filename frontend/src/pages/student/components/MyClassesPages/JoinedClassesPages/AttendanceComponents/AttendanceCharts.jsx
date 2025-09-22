import React, { useMemo } from "react";
import {
  Box,
  VStack,
  HStack,
  Grid,
  Text,
  Card,
  Heading,
  Badge,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useColorMode } from "../../../../../../components/ui/color-mode";

const AttendanceCharts = ({ attendanceData, stats, loading }) => {
  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Prepare data for line chart (attendance trend over time)
  const attendanceTrendData = useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) return [];

    // Sort by date and create trend data
    const sortedData = [...attendanceData]
      .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))
      .slice(-20); // Show last 20 sessions for better visualization

    return sortedData.map((record, index) => {
      const date = new Date(record.sessionDate);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      // Calculate cumulative attendance percentage up to this point
      const recordsUpToNow = sortedData.slice(0, index + 1);
      const presentCount = recordsUpToNow.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length;
      const attendanceRate = (presentCount / recordsUpToNow.length) * 100;

      return {
        date: formattedDate,
        attendanceRate: Math.round(attendanceRate),
        status: record.status,
        sessionName: record.classId?.className || "Class Session",
      };
    });
  }, [attendanceData]);

  // Prepare data for pie chart (status distribution)
  const statusDistributionData = useMemo(() => {
    if (!stats) return [];

    const data = [
      {
        name: "Present",
        value: stats.presentCount || 0,
        color: "#10B981", // green
      },
      {
        name: "Absent",
        value: stats.absentCount || 0,
        color: "#EF4444", // red
      },
      {
        name: "Late",
        value: stats.lateCount || 0,
        color: "#F59E0B", // yellow
      },
      {
        name: "Excused",
        value: stats.excusedCount || 0,
        color: "#8B5CF6", // purple
      },
    ].filter((item) => item.value > 0); // Only show categories with data

    return data;
  }, [stats]);

  // Chart colors for dark/light mode
  const chartColors = {
    line: colorMode === "dark" ? "#14B8A6" : "#0d9488",
    grid: colorMode === "dark" ? "#374151" : "#E5E7EB",
    text: colorMode === "dark" ? "#D1D5DB" : "#6B7280",
  };

  if (loading) {
    return (
      <Grid templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }} gap={6}>
        <Card.Root>
          <Card.Header>
            <Heading size="md">Attendance Trend</Heading>
          </Card.Header>
          <Card.Body>
            <Box
              h="300px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                Loading chart data...
              </Text>
            </Box>
          </Card.Body>
        </Card.Root>
        <Card.Root>
          <Card.Header>
            <Heading size="md">Status Distribution</Heading>
          </Card.Header>
          <Card.Body>
            <Box
              h="300px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color={colorMode === "dark" ? "gray.400" : "gray.600"}>
                Loading chart data...
              </Text>
            </Box>
          </Card.Body>
        </Card.Root>
      </Grid>
    );
  }

  if (!attendanceData || attendanceData.length === 0) {
    return (
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderWidth="1px"
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
      >
        <Card.Body p={8}>
          <VStack spacing={4}>
            <Text
              fontSize="lg"
              fontWeight="semibold"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              No Attendance Data
            </Text>
            <Text
              color={colorMode === "dark" ? "gray.400" : "gray.600"}
              textAlign="center"
            >
              No attendance records found for the selected period. Charts will
              appear once you have attendance data.
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Charts Grid */}
      <Grid
        templateColumns={{ base: "1fr", lg: "repeat(2, 1fr)" }}
        gap={{ base: 4, md: 6 }}
      >
        {/* Attendance Trend Line Chart */}
        {attendanceTrendData.length > 0 && (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Header p={{ base: 4, md: 6 }}>
              <VStack align="start" spacing={1}>
                <Heading
                  size="md"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Attendance Trend
                </Heading>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Your attendance percentage over time
                </Text>
              </VStack>
            </Card.Header>
            <Card.Body p={{ base: 4, md: 6 }} pt={0}>
              <Box h={{ base: "250px", md: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartColors.grid}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: chartColors.text }}
                      axisLine={{ stroke: chartColors.grid }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12, fill: chartColors.text }}
                      axisLine={{ stroke: chartColors.grid }}
                      label={{
                        value: "Attendance %",
                        angle: -90,
                        position: "insideLeft",
                        style: {
                          textAnchor: "middle",
                          fill: colorMode === "dark" ? "#D1D5DB" : "#6B7280",
                          fontSize: "12px",
                        },
                      }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <Box
                              bg={colorMode === "dark" ? "gray.700" : "white"}
                              p={3}
                              rounded="md"
                              shadow="lg"
                              border="1px"
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                            >
                              <VStack spacing={1} align="start">
                                <Text
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color={
                                    colorMode === "dark" ? "white" : "gray.900"
                                  }
                                >
                                  {data.sessionName}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                >
                                  Date: {label}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                >
                                  Status:{" "}
                                  <Badge
                                    colorPalette={
                                      data.status === "present"
                                        ? "green"
                                        : data.status === "late"
                                        ? "yellow"
                                        : "red"
                                    }
                                    variant="subtle"
                                    fontSize="xs"
                                  >
                                    {data.status}
                                  </Badge>
                                </Text>
                                <Text
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color={
                                    colorMode === "dark" ? "white" : "gray.900"
                                  }
                                >
                                  Attendance Rate: {payload[0].value}%
                                </Text>
                              </VStack>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="attendanceRate"
                      stroke={chartColors.line}
                      strokeWidth={3}
                      dot={{ fill: chartColors.line, strokeWidth: 2, r: 4 }}
                      activeDot={{
                        r: 6,
                        stroke: chartColors.line,
                        strokeWidth: 2,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Card.Body>
          </Card.Root>
        )}

        {/* Status Distribution Pie Chart */}
        {statusDistributionData.length > 0 && (
          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderWidth="1px"
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          >
            <Card.Header p={{ base: 4, md: 6 }}>
              <VStack align="start" spacing={1}>
                <Heading
                  size="md"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Status Distribution
                </Heading>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Breakdown of your attendance status
                </Text>
              </VStack>
            </Card.Header>
            <Card.Body p={{ base: 4, md: 6 }} pt={0}>
              <Box h={{ base: "250px", md: "300px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 40 : 60}
                      outerRadius={isMobile ? 80 : 100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const percentage =
                            stats.totalSessions > 0
                              ? (
                                  (data.value / stats.totalSessions) *
                                  100
                                ).toFixed(1)
                              : 0;
                          return (
                            <Box
                              bg={colorMode === "dark" ? "gray.700" : "white"}
                              p={3}
                              rounded="md"
                              shadow="lg"
                              border="1px"
                              borderColor={
                                colorMode === "dark" ? "gray.600" : "gray.200"
                              }
                            >
                              <VStack spacing={1} align="start">
                                <Text
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  color={
                                    colorMode === "dark" ? "white" : "gray.900"
                                  }
                                >
                                  {data.name}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                >
                                  Count: {data.value}
                                </Text>
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                >
                                  Percentage: {percentage}%
                                </Text>
                              </VStack>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    {!isMobile && (
                      <Legend
                        wrapperStyle={{
                          paddingTop: "20px",
                          fontSize: "14px",
                          color: chartColors.text,
                        }}
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {/* Custom Legend for Mobile */}
              {isMobile && (
                <VStack spacing={2} mt={4}>
                  {statusDistributionData.map((item, index) => (
                    <HStack key={index} justify="space-between" w="full">
                      <HStack spacing={2}>
                        <Box w={3} h={3} rounded="full" bg={item.color} />
                        <Text fontSize="sm">{item.name}</Text>
                      </HStack>
                      <Text fontSize="sm" fontWeight="semibold">
                        {item.value}
                      </Text>
                    </HStack>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        )}
      </Grid>

      {/* Summary Stats */}
      {attendanceTrendData.length > 0 && (
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        >
          <Card.Header>
            <Heading
              size="md"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              Quick Insights
            </Heading>
          </Card.Header>
          <Card.Body>
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={4}
            >
              <VStack spacing={1} align="start">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Current Streak
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {/* Calculate current streak - simplified version */}
                  {attendanceData
                    .slice()
                    .reverse()
                    .reduce((streak, record, index) => {
                      if (
                        record.status === "present" ||
                        record.status === "late"
                      ) {
                        return index === 0 ? 1 : streak + 1;
                      }
                      return index === 0 ? 0 : streak;
                    }, 0)}{" "}
                  classes
                </Text>
              </VStack>
              <VStack spacing={1} align="start">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Best Performance
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  {/* Calculate the month with best attendance percentage */}
                  {(() => {
                    if (!attendanceData || attendanceData.length === 0)
                      return "No data";

                    // Group attendance by month
                    const monthlyStats = {};
                    attendanceData.forEach((record) => {
                      const date = new Date(record.sessionDate);
                      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                      const monthName = date.toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      });

                      if (!monthlyStats[monthKey]) {
                        monthlyStats[monthKey] = {
                          name: monthName,
                          total: 0,
                          present: 0,
                        };
                      }

                      monthlyStats[monthKey].total++;
                      if (
                        record.status === "present" ||
                        record.status === "late"
                      ) {
                        monthlyStats[monthKey].present++;
                      }
                    });

                    // Find month with best percentage
                    let bestMonth = { name: "No data", percentage: 0 };
                    Object.values(monthlyStats).forEach((month) => {
                      const percentage = (month.present / month.total) * 100;
                      if (percentage > bestMonth.percentage) {
                        bestMonth = { name: month.name, percentage };
                      }
                    });

                    return bestMonth.name;
                  })()}
                </Text>
              </VStack>
              <VStack spacing={1} align="start">
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  Improvement
                </Text>
                <Text
                  fontSize="lg"
                  fontWeight="bold"
                  color={
                    stats?.presentCount > stats?.absentCount
                      ? "#10B981"
                      : "#EF4444"
                  }
                >
                  {stats?.presentCount > stats?.absentCount
                    ? "↗ Improving"
                    : "↘ Declining"}
                </Text>
              </VStack>
            </Grid>
          </Card.Body>
        </Card.Root>
      )}
    </VStack>
  );
};

export default AttendanceCharts;
