import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  Text,
  VStack,
  HStack,
  Heading,
  Badge,
  SimpleGrid,
  Spinner,
  Alert,
  Button,
  Tabs,
  Progress,
} from "@chakra-ui/react";
import {
  LuBookOpen,
  LuUsers,
  LuCalendar,
  LuClock,
  LuArrowUp,
  LuCheck,
  LuBell,
  LuPlus,
  LuEye,
  LuActivity,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import { Link } from "react-router-dom";

const TeacherDashboard = () => {
  const { colorMode } = useColorMode();
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    todayClasses: 0,
    pendingRequests: 0,
    attendanceRate: 0,
    activeAnnouncements: 0,
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock data - replace with actual API calls
      setStats({
        totalClasses: 8,
        totalStudents: 45,
        todayClasses: 3,
        pendingRequests: 2,
        attendanceRate: 87,
        activeAnnouncements: 5,
      });

      setTodaySchedule([
        {
          id: 1,
          className: "Beginner Chess Basics",
          time: "09:00 AM - 10:00 AM",
          students: 12,
          batchName: "2025-2026 Beginners",
          status: "upcoming",
        },
        {
          id: 2,
          className: "Advanced Tactics",
          time: "02:00 PM - 03:30 PM",
          students: 8,
          batchName: "2025-2026 Advanced",
          status: "upcoming",
        },
        {
          id: 3,
          className: "Chess Endgames",
          time: "04:00 PM - 05:00 PM",
          students: 15,
          batchName: "2025-2026 Intermediate",
          status: "upcoming",
        },
      ]);

      setRecentActivity([
        {
          id: 1,
          type: "attendance",
          message: "Marked attendance for Beginner Chess Basics",
          time: "2 hours ago",
          icon: LuCheck,
          color: "green",
        },
        {
          id: 2,
          type: "request",
          message: "New join request for Advanced Tactics",
          time: "4 hours ago",
          icon: LuUsers,
          color: "blue",
        },
        {
          id: 3,
          type: "announcement",
          message: "Posted announcement for Chess Endgames",
          time: "1 day ago",
          icon: LuBell,
          color: "purple",
        },
      ]);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "My Classes",
      value: stats.totalClasses,
      icon: LuBookOpen,
      color: "blue",
      change: "Active",
    },
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: LuUsers,
      color: "green",
      change: "Enrolled",
    },
    {
      label: "Today's Classes",
      value: stats.todayClasses,
      icon: LuCalendar,
      color: "purple",
      change: "Scheduled",
    },
    {
      label: "Pending Requests",
      value: stats.pendingRequests,
      icon: LuCheck,
      color: "orange",
      change: "To Review",
    },
    {
      label: "Attendance Rate",
      value: `${stats.attendanceRate}%`,
      icon: LuArrowUp,
      color: "teal",
      change: "This month",
    },
    {
      label: "Announcements",
      value: stats.activeAnnouncements,
      icon: LuBell,
      color: "pink",
      change: "Active",
    },
  ];

  const quickActions = [
    {
      label: "Create New Class",
      icon: LuPlus,
      path: "/teacher/classes",
      color: "teal",
      description: "Set up a new chess class",
    },
    {
      label: "Mark Attendance",
      icon: LuCheck,
      path: "/teacher/attendance",
      color: "blue",
      description: "Record student attendance",
    },
    {
      label: "Create Announcement",
      icon: LuBell,
      path: "/teacher/announcements",
      color: "purple",
      description: "Post class or batch announcements",
    },
    {
      label: "View All Classes",
      icon: LuEye,
      path: "/teacher/classes",
      color: "green",
      description: "Manage your classes",
    },
  ];

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" h="50vh">
        <VStack spacing="4">
          <Spinner size="xl" color="teal.500" />
          <Text>Loading dashboard...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      p={{ base: "4", md: "6" }}
      maxW="full"
      minH="100vh"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgGradient:
          colorMode === "dark"
            ? "radial(circle at 20% 50%, rgba(13, 148, 136, 0.08) 0%, transparent 50%), radial(circle at 80% 20%, rgba(13, 148, 136, 0.04) 0%, transparent 50%)"
            : "radial(circle at 20% 50%, rgba(13, 148, 136, 0.05) 0%, transparent 50%), radial(circle at 80% 20%, rgba(13, 148, 136, 0.03) 0%, transparent 50%)",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <VStack spacing="6" align="stretch" position="relative" zIndex={1}>
        {/* Header */}
        <Box>
          <Heading
            size="lg"
            mb="2"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Teacher Dashboard
          </Heading>
          <Text
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
            fontSize="md"
          >
            Welcome back! Manage your classes and track student progress.
          </Text>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert.Root
            status="warning"
            rounded="md"
            bg={colorMode === "dark" ? "orange.900" : "orange.50"}
            borderColor={colorMode === "dark" ? "orange.700" : "orange.200"}
          >
            <Alert.Indicator />
            <Alert.Title
              color={colorMode === "dark" ? "orange.200" : "orange.800"}
              fontSize="sm"
            >
              Unable to fetch live data. Please check your connection and try
              again.
            </Alert.Title>
          </Alert.Root>
        )}

        {/* Statistics Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap="6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card.Root
                key={index}
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                shadow={colorMode === "dark" ? "xl" : "sm"}
                _hover={{
                  shadow: colorMode === "dark" ? "2xl" : "md",
                  transform: "translateY(-2px)",
                  transition: "all 0.2s",
                  borderColor: colorMode === "dark" ? "gray.600" : "gray.300",
                }}
              >
                <Card.Body p="6">
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing="2">
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        fontWeight="medium"
                      >
                        {stat.label}
                      </Text>
                      <Text
                        fontSize="3xl"
                        fontWeight="bold"
                        lineHeight="1"
                        color={colorMode === "dark" ? "white" : "gray.900"}
                      >
                        {typeof stat.value === "number"
                          ? stat.value.toLocaleString()
                          : stat.value}
                      </Text>
                      <Badge
                        colorPalette={stat.color}
                        variant="subtle"
                        fontSize="xs"
                      >
                        {stat.change}
                      </Badge>
                    </VStack>
                    <Box
                      p="3"
                      rounded="lg"
                      bg={
                        colorMode === "dark"
                          ? `${stat.color}.900`
                          : `${stat.color}.50`
                      }
                      color={
                        colorMode === "dark"
                          ? `${stat.color}.300`
                          : `${stat.color}.600`
                      }
                    >
                      <Icon size="24" />
                    </Box>
                  </HStack>
                </Card.Body>
              </Card.Root>
            );
          })}
        </SimpleGrid>

        {/* Tabbed Content */}
        <Tabs.Root defaultValue="schedule" variant="enclosed">
          <Tabs.List
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            rounded="lg"
            p="1"
          >
            <Tabs.Trigger
              value="schedule"
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              _selected={{
                color: colorMode === "dark" ? "white" : "gray.900",
                bg: colorMode === "dark" ? "gray.700" : "gray.100",
              }}
            >
              <LuCalendar size="16" />
              Today's Schedule
            </Tabs.Trigger>
            <Tabs.Trigger
              value="actions"
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              _selected={{
                color: colorMode === "dark" ? "white" : "gray.900",
                bg: colorMode === "dark" ? "gray.700" : "gray.100",
              }}
            >
              <LuClock size="16" />
              Quick Actions
            </Tabs.Trigger>
            <Tabs.Trigger
              value="performance"
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              _selected={{
                color: colorMode === "dark" ? "white" : "gray.900",
                bg: colorMode === "dark" ? "gray.700" : "gray.100",
              }}
            >
              <LuActivity size="16" />
              Performance Overview
            </Tabs.Trigger>
          </Tabs.List>

          {/* Today's Schedule Tab */}
          <Tabs.Content value="schedule">
            <Card.Root
              bg={colorMode === "dark" ? "gray.800" : "white"}
              borderWidth="1px"
              borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
              shadow={colorMode === "dark" ? "xl" : "sm"}
            >
              <Card.Header p="6" pb="0">
                <HStack justify="space-between">
                  <Heading
                    size="md"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Today's Classes
                  </Heading>
                  <Badge colorPalette="teal" variant="subtle">
                    {todaySchedule.length} classes
                  </Badge>
                </HStack>
              </Card.Header>
              <Card.Body p="6">
                {todaySchedule.length === 0 ? (
                  <Box textAlign="center" py="8">
                    <LuCalendar
                      size="48"
                      color={colorMode === "dark" ? "#4a5568" : "#a0aec0"}
                      style={{ margin: "0 auto 16px" }}
                    />
                    <Text
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                      fontSize="lg"
                    >
                      No classes scheduled for today
                    </Text>
                  </Box>
                ) : (
                  <VStack spacing="4" align="stretch">
                    {todaySchedule.map((classItem) => (
                      <Box
                        key={classItem.id}
                        p="4"
                        rounded="lg"
                        bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                        borderLeft="4px"
                        borderColor="teal.500"
                        _hover={{
                          bg: colorMode === "dark" ? "gray.600" : "gray.100",
                          transform: "translateY(-1px)",
                          transition: "all 0.2s",
                        }}
                      >
                        <HStack justify="space-between" align="start">
                          <VStack align="start" spacing="2" flex="1">
                            <HStack>
                              <Text
                                fontWeight="bold"
                                fontSize="lg"
                                color={
                                  colorMode === "dark" ? "white" : "gray.900"
                                }
                              >
                                {classItem.className}
                              </Text>
                              <Badge
                                colorPalette="blue"
                                variant="subtle"
                                fontSize="xs"
                              >
                                {classItem.batchName}
                              </Badge>
                            </HStack>
                            <HStack spacing="4">
                              <HStack>
                                <LuClock size="16" />
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                >
                                  {classItem.time}
                                </Text>
                              </HStack>
                              <HStack>
                                <LuUsers size="16" />
                                <Text
                                  fontSize="sm"
                                  color={
                                    colorMode === "dark"
                                      ? "gray.300"
                                      : "gray.600"
                                  }
                                >
                                  {classItem.students} students
                                </Text>
                              </HStack>
                            </HStack>
                          </VStack>
                          <VStack spacing="2">
                            <Button
                              size="sm"
                              colorPalette="teal"
                              variant="outline"
                              as={Link}
                              to={`/teacher/classes/${classItem.id}`}
                            >
                              View Class
                            </Button>
                            <Button
                              size="sm"
                              colorPalette="blue"
                              variant="solid"
                              as={Link}
                              to={`/teacher/attendance/${classItem.id}`}
                            >
                              Mark Attendance
                            </Button>
                          </VStack>
                        </HStack>
                      </Box>
                    ))}
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>
          </Tabs.Content>

          {/* Quick Actions Tab */}
          <Tabs.Content value="actions">
            <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap="6">
              {/* Quick Actions */}
              <Card.Root
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                shadow={colorMode === "dark" ? "xl" : "sm"}
              >
                <Card.Header p="6" pb="0">
                  <Heading
                    size="md"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Quick Actions
                  </Heading>
                </Card.Header>
                <Card.Body p="6">
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon;
                      return (
                        <Button
                          key={index}
                          as={Link}
                          to={action.path}
                          variant="outline"
                          colorPalette={action.color}
                          h="auto"
                          p="4"
                          justify="flex-start"
                          _hover={{
                            transform: "translateY(-2px)",
                            shadow: "md",
                          }}
                        >
                          <VStack align="start" spacing="2" w="full">
                            <HStack>
                              <Icon size="20" />
                              <Text fontWeight="semibold">{action.label}</Text>
                            </HStack>
                            <Text
                              fontSize="sm"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.600"
                              }
                              textAlign="left"
                            >
                              {action.description}
                            </Text>
                          </VStack>
                        </Button>
                      );
                    })}
                  </SimpleGrid>
                </Card.Body>
              </Card.Root>

              {/* Recent Activity */}
              <Card.Root
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                shadow={colorMode === "dark" ? "xl" : "sm"}
              >
                <Card.Header p="6" pb="0">
                  <Heading
                    size="md"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Recent Activity
                  </Heading>
                </Card.Header>
                <Card.Body p="6">
                  <VStack spacing="4" align="stretch">
                    {recentActivity.map((activity) => {
                      const Icon = activity.icon;
                      return (
                        <HStack key={activity.id} spacing="3">
                          <Box
                            p="2"
                            rounded="full"
                            bg={
                              colorMode === "dark"
                                ? `${activity.color}.900`
                                : `${activity.color}.50`
                            }
                            color={
                              colorMode === "dark"
                                ? `${activity.color}.300`
                                : `${activity.color}.600`
                            }
                            flexShrink="0"
                          >
                            <Icon size="16" />
                          </Box>
                          <VStack align="start" spacing="0" flex="1">
                            <Text
                              fontSize="sm"
                              fontWeight="medium"
                              color={
                                colorMode === "dark" ? "white" : "gray.900"
                              }
                            >
                              {activity.message}
                            </Text>
                            <Text
                              fontSize="xs"
                              color={
                                colorMode === "dark" ? "gray.400" : "gray.500"
                              }
                            >
                              {activity.time}
                            </Text>
                          </VStack>
                        </HStack>
                      );
                    })}
                  </VStack>
                </Card.Body>
              </Card.Root>
            </Grid>
          </Tabs.Content>

          {/* Performance Overview Tab */}
          <Tabs.Content value="performance">
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="6">
              {/* Class Performance */}
              <Card.Root
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                shadow={colorMode === "dark" ? "xl" : "sm"}
              >
                <Card.Header p="6" pb="0">
                  <Heading
                    size="md"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Class Performance
                  </Heading>
                </Card.Header>
                <Card.Body p="6">
                  <VStack spacing="4" align="stretch">
                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                        >
                          Overall Attendance Rate
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          87%
                        </Text>
                      </HStack>
                      <Progress.Root
                        value={87}
                        colorPalette="teal"
                        size="sm"
                        rounded="full"
                      >
                        <Progress.Track
                          bg={colorMode === "dark" ? "gray.700" : "gray.200"}
                        >
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>

                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                        >
                          Student Engagement
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          92%
                        </Text>
                      </HStack>
                      <Progress.Root
                        value={92}
                        colorPalette="green"
                        size="sm"
                        rounded="full"
                      >
                        <Progress.Track
                          bg={colorMode === "dark" ? "gray.700" : "gray.200"}
                        >
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>

                    <Box>
                      <HStack justify="space-between" mb="2">
                        <Text
                          fontSize="sm"
                          color={colorMode === "dark" ? "gray.300" : "gray.600"}
                        >
                          Class Completion Rate
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color={colorMode === "dark" ? "white" : "gray.900"}
                        >
                          78%
                        </Text>
                      </HStack>
                      <Progress.Root
                        value={78}
                        colorPalette="blue"
                        size="sm"
                        rounded="full"
                      >
                        <Progress.Track
                          bg={colorMode === "dark" ? "gray.700" : "gray.200"}
                        >
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                  </VStack>
                </Card.Body>
              </Card.Root>

              {/* Student Progress Summary */}
              <Card.Root
                bg={colorMode === "dark" ? "gray.800" : "white"}
                borderWidth="1px"
                borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
                shadow={colorMode === "dark" ? "xl" : "sm"}
              >
                <Card.Header p="6" pb="0">
                  <Heading
                    size="md"
                    color={colorMode === "dark" ? "white" : "gray.900"}
                  >
                    Student Progress Summary
                  </Heading>
                </Card.Header>
                <Card.Body p="6">
                  <VStack spacing="4" align="stretch">
                    <HStack justify="space-between">
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        Total Students
                      </Text>
                      <Text
                        fontSize="lg"
                        fontWeight="bold"
                        color={colorMode === "dark" ? "white" : "gray.900"}
                      >
                        45
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        Active This Week
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="green.500">
                        42
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        Pending Requests
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="orange.500">
                        2
                      </Text>
                    </HStack>
                    <HStack justify="space-between">
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      >
                        Average Rating Improvement
                      </Text>
                      <Text fontSize="lg" fontWeight="bold" color="teal.500">
                        +125
                      </Text>
                    </HStack>
                  </VStack>
                </Card.Body>
              </Card.Root>
            </Grid>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
};

export default TeacherDashboard;
