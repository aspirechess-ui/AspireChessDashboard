import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Card,
  Alert,
  Badge,
  Input,
  Separator,
  SimpleGrid,
} from "@chakra-ui/react";
import { useColorMode } from "../../../components/ui/color-mode";
import { Field } from "../../../components/ui/field";
import {
  LuCheck,
  LuX,
  LuExternalLink,
  LuRefreshCw,
  LuPlus,
} from "react-icons/lu";
import { SiLichess } from "react-icons/si";
import lichessService from "../../../services/lichess";
import lichessAutoSyncService from "../../../services/lichessAutoSync";

const LichessSettings = () => {
  const { colorMode } = useColorMode();
  const [isConnected, setIsConnected] = useState(false);
  const [lichessUsername, setLichessUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [connectLoading, setConnectLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  
  // Account data
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [syncStatus, setSyncStatus] = useState("success");
  const autoSyncAttempted = useRef(false);

  useEffect(() => {
    const initializeData = async () => {
      await fetchAccountData();
      
      // Attempt auto sync (once per day) - but only after we know connection status
    };
    
    initializeData();
  }, []);

  // Auto sync after connection status is known
  useEffect(() => {
    const performAutoSync = async () => {
      if (isConnected && lichessUsername && !autoSyncAttempted.current) {
        autoSyncAttempted.current = true;
        try {
          console.log('Attempting auto sync for student in settings...');
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
  }, [isConnected, lichessUsername]);

  const fetchAccountData = async () => {
    try {
      setError(null);
      
      const response = await lichessService.getAccount();
      
      if (response.data.isConnected) {
        setIsConnected(true);
        setLichessUsername(response.data.lichessUsername);
        setLastSyncAt(response.data.lastSyncAt);
        setSyncStatus(response.data.syncStatus || "success");
      } else {
        setIsConnected(false);
        setLichessUsername("");
      }
    } catch (err) {
      console.error("Error fetching Lichess account:", err);
      setError(err.message);
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
      setLastSyncAt(new Date().toISOString());
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

  const handleDisconnect = async () => {
    try {
      setError(null);
      setSuccessMessage("");
      
      await lichessService.disconnectAccount();
      
      setIsConnected(false);
      setLichessUsername("");
      setLastSyncAt(null);
      setSuccessMessage("Lichess account disconnected successfully!");
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error('Failed to disconnect Lichess account:', err);
      setError(err.message);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);
      setSuccessMessage("");
      
      const response = await lichessService.syncData();
      setLastSyncAt(response.data.lastSyncAt);
      setSyncStatus("success");
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
    const now = new Date();
    const syncDate = new Date(dateString);
    const diffInHours = Math.floor((now - syncDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return formatDate(dateString);
  };

  const getSyncStatusText = () => {
    if (syncing) return "Syncing data...";
    if (syncStatus === "error") return "Sync failed - please try again";
    if (syncStatus === "pending") return "Sync pending...";
    return "Connected and synced";
  };

  if (!isConnected) {
    return (
      <VStack spacing="6" align="stretch" maxW="full" overflow="hidden">
        <Box textAlign="center">
          <Heading 
            size="lg" 
            mb="2"
            color={colorMode === "dark" ? "white" : "gray.900"}
          >
            Lichess Integration
          </Heading>
          <Text
            color={colorMode === "dark" ? "gray.300" : "gray.600"}
            fontSize="sm"
          >
            Connect your Lichess account to track your chess progress and share it with your teachers.
          </Text>
        </Box>

        {/* Error Alert */}
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

        {/* Success Alert */}
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

        <Card.Root
          bg={colorMode === "dark" ? "gray.800" : "white"}
          borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
          borderWidth="1px"
        >
          <Card.Body p={{ base: "4", md: "6" }}>
            <VStack spacing="5">
              <Box textAlign="center">
                <Box
                  mx="auto"
                  p="3"
                  bg={colorMode === "dark" ? "teal.200" : "teal.100"}
                  color={colorMode === "dark" ? "teal.800" : "teal.600"}
                  borderRadius="full"
                  w="fit-content"
                  mb="4"
                >
                  <SiLichess size="24" />
                </Box>
                <Text 
                  fontWeight="semibold" 
                  mb="2"
                  fontSize="lg"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Connect Your Lichess Account
                </Text>
                <Text
                  fontSize="sm"
                  color={colorMode === "dark" ? "gray.300" : "gray.600"}
                >
                  Your teachers will be able to view your chess progress and provide better guidance.
                </Text>
              </Box>

              <Box w="100%">
                <Field label="Lichess Username">
                  <Input
                    placeholder="Enter your Lichess username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    bg={colorMode === "dark" ? "gray.700" : "white"}
                    borderColor={colorMode === "dark" ? "gray.600" : "gray.300"}
                    color={colorMode === "dark" ? "white" : "gray.900"}
                    size="md"
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
                w="100%"
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
                  Make sure your Lichess profile is public for data synchronization to work.
                </Alert.Description>
              </Alert.Root>
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    );
  }

  return (
    <VStack spacing="6" align="stretch" maxW="full" overflow="hidden">
      <Box>
        <Heading 
          size="lg" 
          mb="2"
          color={colorMode === "dark" ? "white" : "gray.900"}
        >
          Lichess Integration
        </Heading>
        <Text
          color={colorMode === "dark" ? "gray.300" : "gray.600"}
          fontSize="sm"
        >
          Connect and manage your Lichess account integration.
        </Text>
      </Box>

      {/* Error Alert */}
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

      {/* Success Alert */}
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

      {/* Connected Account Info */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        borderWidth="1px"
      >
        <Card.Body p={{ base: "4", md: "6" }}>
          <VStack spacing="4" align="stretch">
            {/* Mobile Layout */}
            <VStack spacing="4" align="stretch" display={{ base: "flex", md: "none" }}>
              <HStack spacing="3" align="start" width="full">
                <Box
                  p="2"
                  bg={colorMode === "dark" ? "teal.200" : "teal.100"}
                  color={colorMode === "dark" ? "teal.800" : "teal.600"}
                  borderRadius="md"
                  flexShrink="0"
                >
                  <SiLichess size="18" />
                </Box>
                <VStack align="start" spacing="1" flex="1" minW="0">
                  <HStack flexWrap="wrap" gap="2" width="full">
                    <Text 
                      fontWeight="semibold"
                      fontSize="md"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      noOfLines={1}
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
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    noOfLines={1}
                  >
                    {getSyncStatusText()}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack spacing="2" width="full">
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
                  flex="1"
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  leftIcon={<LuX />}
                  onClick={handleDisconnect}
                  color={colorMode === "dark" ? "red.300" : "red.600"}
                  borderColor={colorMode === "dark" ? "red.600" : "red.300"}
                  _hover={{
                    bg: colorMode === "dark" ? "red.900" : "red.50"
                  }}
                  flex="1"
                >
                  Disconnect
                </Button>
              </HStack>
            </VStack>

            {/* Desktop Layout */}
            <HStack 
              justify="space-between" 
              align="center"
              spacing="4"
              width="full"
              display={{ base: "none", md: "flex" }}
            >
              <HStack spacing="3" align="start" flex="1">
                <Box
                  p="2"
                  bg={colorMode === "dark" ? "teal.200" : "teal.100"}
                  color={colorMode === "dark" ? "teal.800" : "teal.600"}
                  borderRadius="md"
                  flexShrink="0"
                >
                  <SiLichess size="18" />
                </Box>
                <VStack align="start" spacing="1" flex="1" minW="0">
                  <HStack flexWrap="wrap" gap="2" width="full">
                    <Text 
                      fontWeight="semibold"
                      fontSize="md"
                      color={colorMode === "dark" ? "white" : "gray.900"}
                      noOfLines={1}
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
                    fontSize="xs"
                    color={colorMode === "dark" ? "gray.400" : "gray.600"}
                    noOfLines={1}
                  >
                    {getSyncStatusText()}
                  </Text>
                </VStack>
              </HStack>
              
              <HStack spacing="2" flexShrink="0">
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
                  minW="80px"
                  maxW="120px"
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  leftIcon={<LuX />}
                  onClick={handleDisconnect}
                  color={colorMode === "dark" ? "red.300" : "red.600"}
                  borderColor={colorMode === "dark" ? "red.600" : "red.300"}
                  _hover={{
                    bg: colorMode === "dark" ? "red.900" : "red.50"
                  }}
                  minW="100px"
                  maxW="140px"
                >
                  Disconnect
                </Button>
              </HStack>
            </HStack>

            
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Sync Settings */}
      <Card.Root
        bg={colorMode === "dark" ? "gray.800" : "white"}
        borderColor={colorMode === "dark" ? "gray.700" : "gray.200"}
        borderWidth="1px"
      >
        <Card.Body p={{ base: "4", md: "6" }}>
          <VStack spacing="4" align="stretch">
            <HStack spacing="3">
              <Box color={colorMode === "dark" ? "teal.300" : "teal.600"}>
                <LuRefreshCw size="18" />
              </Box>
              <Text 
                fontWeight="semibold"
                fontSize="md"
                color={colorMode === "dark" ? "white" : "gray.900"}
              >
                Data Synchronization
              </Text>
            </HStack>

            {/* Mobile Layout */}
            <VStack spacing="4" align="stretch" display={{ base: "flex", md: "none" }}>
              <VStack align="center" spacing="1" width="full">
                <Text 
                  fontSize="sm"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Last Sync
                </Text>
                <Text
                  fontSize="xs"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  {lastSyncAt ? formatLastSync(lastSyncAt) : "Never synced"}
                </Text>
              </VStack>
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
                width="full"
              >
                Sync Now
              </Button>
            </VStack>

            {/* Desktop Layout */}
            <HStack 
              justify="space-between" 
              align="center"
              display={{ base: "none", md: "flex" }}
            >
              <VStack align="start" spacing="1" flex="1">
                <Text 
                  fontSize="sm"
                  color={colorMode === "dark" ? "white" : "gray.900"}
                >
                  Last Sync
                </Text>
                <Text
                  fontSize="xs"
                  color={colorMode === "dark" ? "gray.400" : "gray.600"}
                >
                  {lastSyncAt ? formatLastSync(lastSyncAt) : "Never synced"}
                </Text>
              </VStack>
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
                minW="120px"
                maxW="160px"
                flexShrink="0"
              >
                Sync Now
              </Button>
            </HStack>


          </VStack>
        </Card.Body>
      </Card.Root>


    </VStack>
  );
};

export default LichessSettings;