import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  Badge,
  Alert,
  Spinner,
  Center,
  Avatar,
  Container,
  IconButton,
} from "@chakra-ui/react";
import {
  FaArrowLeft,
  FaExternalLinkAlt,
  FaSyncAlt,
} from "react-icons/fa";
import { LuRefreshCw } from "react-icons/lu";
import { useColorMode } from "../../../components/ui/color-mode";
import { useParams, useNavigate } from "react-router-dom";
import lichessService from "../../../services/lichess";
import lichessAutoSyncService from "../../../services/lichessAutoSync";
import ViewUserCard from "../../../components/ViewUserCard";
import LichessStat from "../../common/LichessStat";

const LichessIndividualStatPage = () => {
  const { colorMode } = useColorMode();
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [studentData, setStudentData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);



  // Fetch student data
  const fetchStudentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // First, try auto sync if needed (teacher view)
      try {
        const autoSyncResponse = await lichessAutoSyncService.autoSyncTeacher(username);
        if (autoSyncResponse.success && autoSyncResponse.synced) {
          console.log('Auto sync completed for teacher view');
        }
      } catch (autoSyncError) {
        console.error('Auto sync failed:', autoSyncError);
        // Don't fail the whole request if auto sync fails
      }

      const response = await lichessService.getStudentStats(username);
      if (response.success) {
        setStudentData(response.data.stats); // Use unified stats structure
        setLastSyncAt(response.data.stats?.lastSyncAt || null);
      } else {
        throw new Error(response.message || "Failed to fetch student data");
      }
      
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError(error.message || "Failed to load student data");
      setStudentData(null);
      setLastSyncAt(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setSyncing(false);
    }
  }, [username]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudentData();
  };

  // Handle sync data
  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccessMessage("");
      
      console.log('🔄 Starting manual sync for username:', username);

      // For teacher view, use manual sync to force sync regardless of time
      const response = await lichessAutoSyncService.manualSyncTeacher(username);
      
      console.log('✅ Received response from manual sync:', response);
      console.log('Response type:', typeof response);
      console.log('Response properties:', Object.keys(response || {}));
      
      // Check if response exists and has expected structure
      if (response && response.success) {
        console.log('✅ Manual sync completed successfully for student');
        // Refresh student data after sync
        await fetchStudentData();
        setSuccessMessage("Lichess data synced successfully!");
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        // Handle case where response exists but success is false
        const errorMessage = response?.message || "Failed to sync data - unknown error";
        console.error('❌ Sync failed with response:', response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Error syncing data:", error);
      console.error('Error type:', typeof error);
      console.error('Error properties:', Object.keys(error || {}));
      
      // Better error handling
      let errorMessage = "Failed to sync data";
      if (error.response) {
        // API returned an error response
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        console.error('API error response:', error.response.data);
      } else if (error.message) {
        // Error has a message
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (username) {
      fetchStudentData();
    }
  }, [username, fetchStudentData]);

  const handleBackClick = () => {
    navigate("/teacher/lichess?tab=students");
  };

  const handleViewLichessProfile = () => {
    if (studentData?.lichessUsername) {
      window.open(`https://lichess.org/@/${studentData.lichessUsername}`, '_blank');
    }
  };

  const handleViewUserProfile = () => {
    setShowUserModal(true);
  };

  // Format last sync time
  const formatLastSync = (dateString) => {
    if (!dateString) return "Never synced";
    const now = new Date();
    const syncDate = new Date(dateString);
    const diffInHours = Math.floor((now - syncDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return syncDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && !refreshing) {
    return (
      <Container maxW="7xl" py="6">
        <Center h="50vh">
          <VStack spacing={4}>
            <Spinner size="xl" color="teal.500" />
            <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
              Loading student data...
            </Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="7xl" py="6">
        <VStack spacing="6" align="stretch">
          {/* Header with Back Button */}
          <HStack spacing="4">
            <IconButton
              onClick={handleBackClick}
              variant="outline"
              size="sm"
              colorPalette="teal"
            >
              <FaArrowLeft />
            </IconButton>
            <Heading size={{ base: "md", md: "lg" }}>
              Student Statistics
            </Heading>
          </HStack>

          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error Loading Student Data</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
          
          <Button
            leftIcon={<FaSyncAlt />}
            onClick={handleRefresh}
            colorPalette="teal"
            variant="outline"
            size="sm"
            alignSelf="start"
          >
            Try Again
          </Button>
        </VStack>
      </Container>
    );
  }

  if (!studentData) {
    return (
      <Container maxW="7xl" py="6">
        <Center h="50vh">
          <VStack spacing={3}>
            <Text color={colorMode === "dark" ? "gray.300" : "gray.600"}>
              No student data available
            </Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <>
    <Container maxW="7xl" py={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 4, md: 6 }} align="stretch">
        {/* Alerts */}
        {error && (
          <Alert.Root 
            status="error" 
            size="sm"
            bg={colorMode === "dark" ? "red.900" : "red.50"}
            borderColor={colorMode === "dark" ? "red.700" : "red.200"}
          >
            <Alert.Indicator color={colorMode === "dark" ? "red.300" : "red.500"} />
            <Alert.Description 
              fontSize="sm"
              color={colorMode === "dark" ? "red.200" : "red.700"}
            >
              {error}
            </Alert.Description>
          </Alert.Root>
        )}
        
        {successMessage && (
          <Alert.Root 
            status="success" 
            size="sm"
            bg={colorMode === "dark" ? "green.900" : "green.50"}
            borderColor={colorMode === "dark" ? "green.700" : "green.200"}
          >
            <Alert.Indicator color={colorMode === "dark" ? "green.300" : "green.500"} />
            <Alert.Description 
              fontSize="sm"
              color={colorMode === "dark" ? "green.200" : "green.700"}
            >
              {successMessage}
            </Alert.Description>
          </Alert.Root>
        )}

        {/* Header */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderWidth="1px"
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          shadow={colorMode === "dark" ? "lg" : "sm"}
        >
          <Card.Body p={{ base: 4, md: 6 }}>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" align="start" flexWrap="wrap" gap="4">
                {/* Back Button and Title */}
                <HStack spacing="4" minW={{ base: "full", md: "auto" }}>
                  <IconButton
                    onClick={handleBackClick}
                    variant="outline"
                    size="sm"
                    colorPalette="teal"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                  >
                    <FaArrowLeft />
                  </IconButton>
                  <VStack align="start" spacing={1} flex="1">
                    <Heading
                      size={{ base: "md", md: "lg" }}
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      Student Statistics
                    </Heading>
                    <Text
                      fontSize="sm"
                      color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    >
                      Detailed Lichess performance analysis
                    </Text>
                  </VStack>
                </HStack>

                {/* Action Buttons */}
                <HStack spacing="2" flexShrink="0" w={{ base: "full", md: "auto" }}>
                  <Button
                    leftIcon={<LuRefreshCw />}
                    onClick={handleSync}
                    loading={syncing}
                    loadingText="Syncing..."
                    size={{ base: "sm", md: "sm" }}
                    variant="outline"
                    colorPalette="teal"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    flex={{ base: 1, md: "none" }}
                  >
                    Sync Data
                  </Button>
                  <Button
                    leftIcon={<FaExternalLinkAlt />}
                    onClick={handleViewLichessProfile}
                    size={{ base: "sm", md: "sm" }}
                    colorPalette="blue"
                    variant="outline"
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    flex={{ base: 1, md: "none" }}
                  >
                    View Profile
                  </Button>
                </HStack>
              </HStack>

              {/* Last Sync Info */}
              {lastSyncAt && (
                <HStack justify="space-between" align="center" w="full">
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    Last sync: {formatLastSync(lastSyncAt)}
                  </Text>
                </HStack>
              )}

              {/* Student Info - Clickable */}
              <Box
                onClick={handleViewUserProfile}
                cursor="pointer"
                p="2"
                borderRadius="md"
                transition="all 0.2s"
                _hover={{
                  bg: colorMode === "dark" ? "gray.700" : "gray.50",
                  transform: "translateY(-1px)",
                  shadow: "md"
                }}
              >
                <HStack spacing="4" align="center" flexWrap="wrap">
                  <Avatar.Root size={{ base: "md", md: "lg" }}>
                    {studentData.profileImageUrl ? (
                      <Avatar.Image src={studentData.profileImageUrl} alt={studentData.userName || studentData.lichessUsername} />
                    ) : (
                      <Avatar.Fallback>
                        {studentData.userName ? 
                          studentData.userName.split(' ').map(n => n[0]).join('') : 
                          studentData.lichessUsername.slice(0, 2).toUpperCase()
                        }
                      </Avatar.Fallback>
                    )}
                  </Avatar.Root>
                  <VStack align="start" spacing={1} flex="1" minW="0">
                    <Text
                      fontWeight="bold"
                      fontSize={{ base: "lg", md: "xl" }}
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      isTruncated
                    >
                      {studentData.userName || 'Unknown Student'}
                    </Text>
                    <Badge colorPalette="teal" variant="subtle" size="sm">
                      @{studentData.lichessUsername}
                    </Badge>
                    {studentData.userEmail && (
                      <Text
                        fontSize="sm"
                        color={colorMode === "dark" ? "gray.400" : "gray.600"}
                        isTruncated
                      >
                        {studentData.userEmail}
                      </Text>
                    )}
                    <Text
                      fontSize="xs"
                      color="gray.400"
                      fontStyle="italic"
                      display={{ base: "block", md: "none" }}
                    >
                      Tap to view profile
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* LichessStat Component */}
        <LichessStat 
          studentData={studentData}
          loading={refreshing}
          isTeacherView={true}
        />
      </VStack>
    </Container>

    {/* ViewUserCard Modal */}
    {showUserModal && (
      <ViewUserCard
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={{
          _id: studentData._id,
          email: studentData.userEmail,
          role: studentData.role || 'student',
          createdAt: studentData.createdAt,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          userDetails: {
            ...studentData.userDetails,
            firstName: studentData.firstName || studentData.userDetails?.firstName,
            lastName: studentData.lastName || studentData.userDetails?.lastName,
            profileImageUrl: studentData.profileImageUrl || studentData.userDetails?.profileImageUrl,
            assignedBatch: studentData.userDetails?.assignedBatch,
            batchName: studentData.userDetails?.batchName
          },
          assignedBatch: studentData.userDetails?.batchName || "Not assigned",
          batchName: studentData.userDetails?.batchName,
          profileImageUrl: studentData.profileImageUrl
        }}
      />
    )}
    </>
  );
};

export default LichessIndividualStatPage;
