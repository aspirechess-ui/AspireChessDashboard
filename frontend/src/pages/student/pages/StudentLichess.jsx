import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Input,
  Spinner,
  Alert,
  Card,
  Badge,
} from "@chakra-ui/react";
import { useColorMode } from "../../../components/ui/color-mode";
import { Field } from "../../../components/ui/field";
import {
  LuCheck,
  LuExternalLink,
  LuRefreshCw,
  LuPlus,
} from "react-icons/lu";
import { SiLichess } from "react-icons/si";
import lichessService from "../../../services/lichess";
import lichessAutoSyncService from "../../../services/lichessAutoSync";
import LichessStat from "../../common/LichessStat";

const StudentLichess = () => {
  const { colorMode } = useColorMode();
  const [isConnected, setIsConnected] = useState(false);
  const [lichessUsername, setLichessUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [connectLoading, setConnectLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Account data
  const [accountData, setAccountData] = useState(null);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const autoSyncAttempted = useRef(false);

  useEffect(() => {
    fetchAccountData();
  }, []);

  // Auto sync after connection status is determined
  useEffect(() => {
    const performAutoSync = async () => {
      if (isConnected && lichessUsername && !loading && !autoSyncAttempted.current) {
        autoSyncAttempted.current = true;
        try {
          console.log('Attempting auto sync for student...');
          const autoSyncResponse = await lichessAutoSyncService.autoSyncStudent();
          if (autoSyncResponse.success && autoSyncResponse.synced) {
            console.log('Auto sync completed, refreshing data...');
            // Refresh account data after auto sync
            await fetchAccountData();
          } else {
            console.log('Auto sync not needed or failed:', autoSyncResponse.message);
          }
        } catch (error) {
          console.error('Auto sync failed:', error);
          // Don't show error to user as this is background sync
        }
      }
    };
    
    performAutoSync();
  }, [isConnected, lichessUsername, loading]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await lichessService.getAccount();
      
      if (response.data && response.data.isConnected) {
        setIsConnected(true);
        setLichessUsername(response.data.lichessUsername);
        setAccountData(response.data.stats); // Use unified stats structure
        setLastSyncAt(response.data.lastSyncAt);
      } else {
        setIsConnected(false);
        setLichessUsername("");
        setAccountData(null);
        setLastSyncAt(null);
      }
    } catch (err) {
      console.error("Error fetching Lichess account:", err);
      // Only show error if it's not about missing account
      if (err.message && 
          !err.message.includes("No Lichess account") && 
          !err.message.includes("not connected") &&
          !err.message.includes("404")) {
        setError(err.message);
      }
      // Set disconnected state for account-related errors
      setIsConnected(false);
      setLichessUsername("");
      setAccountData(null);
      setLastSyncAt(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!newUsername.trim()) return;
    
    try {
      setConnectLoading(true);
      setError(null);
      setSuccessMessage("");
      
      const response = await lichessService.connectAccount(newUsername);
      
      setIsConnected(true);
      setLichessUsername(response.data.lichessUsername);
      setAccountData(response.data.stats); // Use unified stats structure
      setLastSyncAt(response.data.lastSyncAt);
      setNewUsername("");
      setSuccessMessage("Lichess account connected successfully!");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Failed to connect Lichess account:', err);
      setError(err.message);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccessMessage("");
      
      const response = await lichessService.syncData();
      setAccountData(response.data.stats); // Use unified stats structure
      setLastSyncAt(response.data.lastSyncAt);
      setSuccessMessage("Lichess data synced successfully!");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Failed to sync Lichess data:', err);
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatLastSync = (dateString) => {
    if (!dateString) return "Never synced";
    const now = new Date();
    const syncDate = new Date(dateString);
    const diffInHours = Math.floor((now - syncDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <Box 
        p={{ base: "4", md: "6" }}
        w="full"
        minH="100vh"
        bg={colorMode === "dark" ? "gray.900" : "gray.50"}
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <VStack spacing="4">
          <Spinner size="xl" color="teal.500" />
          <Text color={colorMode === "dark" ? "white" : "gray.900"}>
            Loading Lichess data...
          </Text>
        </VStack>
      </Box>
    );
  }

  // Show error and success alerts
  const alertSection = (
    <>
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
    </>
  );

  if (!isConnected) {
    return (
      <Box 
        p={{ base: "4", md: "6" }}
        w="full"
        minH="100vh"
        bg={colorMode === "dark" ? "gray.900" : "gray.50"}
      >
        <VStack spacing="6" align="stretch">
          <Box>
            <Heading 
              size="lg" 
              mb="2"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              My Lichess Progress
            </Heading>
            <Text
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              fontSize="md"
            >
              Connect your Lichess account to track your chess progress and improvement.
            </Text>
          </Box>

          {alertSection}

          <Card.Root
            bg={colorMode === "dark" ? "gray.800" : "white"}
            borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
            borderWidth="1px"
            shadow={colorMode === "dark" ? "lg" : "sm"}
            w="full"
          >
            <Card.Body p={{ base: "6", md: "8" }}>
              <VStack spacing={{ base: "4", md: "6" }} align="stretch">
                <VStack spacing="4" align="center">
                  <Box
                    p="4"
                    bg={colorMode === "dark" ? "teal.200" : "teal.100"}
                    color={colorMode === "dark" ? "teal.800" : "teal.600"}
                    borderRadius="full"
                  >
                    <SiLichess size="32" />
                  </Box>
                  <VStack spacing="2" textAlign="center">
                    <Text 
                      fontWeight="semibold" 
                      fontSize={{ base: "lg", md: "xl" }}
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      Connect Your Lichess Account
                    </Text>
                    <Text
                      fontSize={{ base: "sm", md: "md" }}
                      color={colorMode === "dark" ? "gray.300" : "gray.600"}
                      maxW={{ base: "full", md: "md" }}
                    >
                      Link your Lichess account to view detailed statistics, track your progress, and share your chess journey with your teachers.
                    </Text>
                  </VStack>
                </VStack>

                <Box w="full">
                  <Field label="Lichess Username">
                    <Input
                      placeholder="Enter your Lichess username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      size={{ base: "md", md: "lg" }}
                      bg={colorMode === "dark" ? "gray.700" : "white"}
                      borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      _placeholder={{
                        color: colorMode === "dark" ? "gray.400" : "gray.500"
                      }}
                      _focus={{
                        borderColor: colorMode === "dark" ? "teal.400" : "teal.500",
                        boxShadow: `0 0 0 1px ${colorMode === "dark" ? "teal.400" : "teal.500"}`
                      }}
                    />
                  </Field>
                </Box>

                <Button
                  colorPalette="teal"
                  size={{ base: "md", md: "lg" }}
                  leftIcon={<LuPlus />}
                  onClick={handleConnect}
                  loading={connectLoading}
                  loadingText="Connecting..."
                  disabled={!newUsername.trim()}
                  bg={colorMode === "dark" ? "teal.600" : "teal.500"}
                  color="white"
                  _hover={{
                    bg: colorMode === "dark" ? "teal.500" : "teal.600"
                  }}
                  w="full"
                >
                  Connect Account
                </Button>

                <Alert.Root 
                  status="info" 
                  size="sm"
                  bg={colorMode === "dark" ? "blue.900" : "blue.50"}
                  borderColor={colorMode === "dark" ? "blue.700" : "blue.200"}
                >
                  <Alert.Indicator color={colorMode === "dark" ? "blue.300" : "blue.500"} />
                  <Alert.Description 
                    fontSize="xs"
                    color={colorMode === "dark" ? "blue.200" : "blue.700"}
                  >
                    Make sure your Lichess profile is public for data synchronization to work properly.
                  </Alert.Description>
                </Alert.Root>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    );
  }

  return (
    <Box 
      p={{ base: "4", md: "6" }}
      w="full"
      minH="100vh"
      bg={colorMode === "dark" ? "gray.900" : "gray.50"}
    >
      <VStack spacing="6" align="stretch">
        {/* Header */}
        <VStack spacing={{ base: "3", md: "4" }} align="stretch">
          <Box>
            <Heading 
              size={{ base: "md", md: "lg" }}
              mb="2"
              color={colorMode === "dark" ? "white" : "gray.900"}
            >
              My Lichess Progress
            </Heading>
            <Text
              color={colorMode === "dark" ? "gray.300" : "gray.600"}
              fontSize={{ base: "sm", md: "md" }}
            >
              Track your chess performance and improvement over time.
            </Text>
          </Box>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<LuRefreshCw />}
            onClick={handleSync}
            loading={syncing}
            loadingText="Syncing..."
            color={colorMode === "dark" ? "white" : "gray.700"}
            borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
            _hover={{
              bg: colorMode === "dark" ? "gray.700" : "gray.50"
            }}
            alignSelf={{ base: "stretch", sm: "flex-start" }}
          >
            Sync Data
          </Button>
        </VStack>

        {alertSection}

        {/* Connected Account Info */}
        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          borderWidth="1px"
          shadow={colorMode === "dark" ? "lg" : "sm"}
          w="full"
        >
          <Card.Body p={{ base: "4", md: "6" }}>
            <VStack 
              spacing={{ base: "3", md: "4" }}
              align="stretch"
            >
              <HStack spacing="4" align="center">
                <Box
                  p="3"
                  bg={colorMode === "dark" ? "teal.200" : "teal.100"}
                  color={colorMode === "dark" ? "teal.800" : "teal.600"}
                  borderRadius="md"
                  flexShrink="0"
                >
                  <SiLichess size="20" />
                </Box>
                <VStack align="start" spacing="1" flex="1">
                  <HStack spacing="2" wrap="wrap">
                    <Text 
                      fontWeight="semibold"
                      fontSize={{ base: "md", md: "lg" }}
                      color={colorMode === "dark" ? "white" : "gray.900"}
                    >
                      @{lichessUsername}
                    </Text>
                    <Badge 
                      colorPalette="green" 
                      size="sm"
                      bg={colorMode === "dark" ? "green.200" : "green.100"}
                      color={colorMode === "dark" ? "green.800" : "green.700"}
                    >
                      <LuCheck size="12" />
                      Connected
                    </Badge>
                  </HStack>
                  <Text
                    fontSize="sm"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                  >
                    Last sync: {formatLastSync(lastSyncAt)}
                  </Text>
                </VStack>
              </HStack>
              
              <Button
                size="sm"
                variant="outline"
                leftIcon={<LuExternalLink />}
                onClick={() => window.open(`https://lichess.org/@/${lichessUsername}`, '_blank')}
                color={colorMode === "dark" ? "white" : "gray.700"}
                borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                _hover={{
                  bg: colorMode === "dark" ? "gray.700" : "gray.50"
                }}
                w={{ base: "full", sm: "auto" }}
                alignSelf={{ base: "stretch", sm: "flex-start" }}
              >
                View Profile
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Lichess Statistics */}
        <LichessStat 
          accountData={accountData}
          loading={loading || syncing}
          isTeacherView={false}
        />
      </VStack>
    </Box>
  );
};

export default StudentLichess;
