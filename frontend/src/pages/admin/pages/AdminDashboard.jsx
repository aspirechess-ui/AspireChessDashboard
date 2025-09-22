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
} from "@chakra-ui/react";
import {
  LuUsers,
  LuGraduationCap,
  LuBookOpen,
  LuUserCheck,
  LuTrendingUp,
  LuCalendar,
} from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import { adminService } from "../../../services/api";

const AdminDashboard = () => {
  const { colorMode } = useColorMode();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalBatches: 0,
    totalClasses: 0,
    activeClasses: 0,
    recentSignups: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await adminService.getDashboardStats();

      if (response.success) {
        setStats(response.stats);
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard stats:", err);
      // Set empty stats when API fails
      setStats({
        totalStudents: 0,
        totalTeachers: 0,
        totalBatches: 0,
        totalClasses: 0,
        activeClasses: 0,
        recentSignups: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: LuUsers,
      color: "blue",
      change: "+12%",
    },
    {
      label: "Total Teachers",
      value: stats.totalTeachers,
      icon: LuUserCheck,
      color: "green",
      change: "+2",
    },
    {
      label: "Total Batches",
      value: stats.totalBatches,
      icon: LuGraduationCap,
      color: "purple",
      change: "+1",
    },
    {
      label: "Total Classes",
      value: stats.totalClasses,
      icon: LuBookOpen,
      color: "orange",
      change: "+5",
    },
    {
      label: "Active Classes",
      value: stats.activeClasses,
      icon: LuCalendar,
      color: "teal",
      change: "85%",
    },
    {
      label: "Recent Signups",
      value: stats.recentSignups,
      icon: LuTrendingUp,
      color: "pink",
      change: "This month",
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
            Admin Dashboard
          </Heading>
          <Text
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
            fontSize="md"
          >
            Welcome back! Here's an overview of your chess academy.
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
                        {stat.value.toLocaleString()}
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

        {/* Quick Actions & Recent Activity */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="6">
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
              <VStack spacing="3" align="stretch">
                <Box
                  p="4"
                  rounded="md"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: colorMode === "dark" ? "gray.600" : "gray.100",
                    transform: "translateY(-1px)",
                  }}
                >
                  <HStack>
                    <LuUsers
                      size="20"
                      color={colorMode === "dark" ? "#0d9488" : "#0d9488"}
                    />
                    <Text
                      fontWeight="medium"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      Create New User
                    </Text>
                  </HStack>
                </Box>
                <Box
                  p="4"
                  rounded="md"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: colorMode === "dark" ? "gray.600" : "gray.100",
                    transform: "translateY(-1px)",
                  }}
                >
                  <HStack>
                    <LuGraduationCap
                      size="20"
                      color={colorMode === "dark" ? "#0d9488" : "#0d9488"}
                    />
                    <Text
                      fontWeight="medium"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      Create New Batch
                    </Text>
                  </HStack>
                </Box>
                <Box
                  p="4"
                  rounded="md"
                  bg={colorMode === "dark" ? "gray.700" : "gray.50"}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    bg: colorMode === "dark" ? "gray.600" : "gray.100",
                    transform: "translateY(-1px)",
                  }}
                >
                  <HStack>
                    <LuBookOpen
                      size="20"
                      color={colorMode === "dark" ? "#0d9488" : "#0d9488"}
                    />
                    <Text
                      fontWeight="medium"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      View All Classes
                    </Text>
                  </HStack>
                </Box>
              </VStack>
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
                <HStack>
                  <Box
                    w="2"
                    h="2"
                    rounded="full"
                    bg="green.500"
                    flexShrink="0"
                  />
                  <VStack align="start" spacing="0" flex="1">
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      New student registered
                    </Text>
                    <Text
                      fontSize="xs"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    >
                      2 minutes ago
                    </Text>
                  </VStack>
                </HStack>
                <HStack>
                  <Box
                    w="2"
                    h="2"
                    rounded="full"
                    bg="blue.500"
                    flexShrink="0"
                  />
                  <VStack align="start" spacing="0" flex="1">
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      Teacher created new class
                    </Text>
                    <Text
                      fontSize="xs"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    >
                      1 hour ago
                    </Text>
                  </VStack>
                </HStack>
                <HStack>
                  <Box
                    w="2"
                    h="2"
                    rounded="full"
                    bg="purple.500"
                    flexShrink="0"
                  />
                  <VStack align="start" spacing="0" flex="1">
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      New batch created
                    </Text>
                    <Text
                      fontSize="xs"
                      color={colorMode === "dark" ? "gray.400" : "gray.500"}
                    >
                      3 hours ago
                    </Text>
                  </VStack>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>
      </VStack>
    </Box>
  );
};

export default AdminDashboard;
