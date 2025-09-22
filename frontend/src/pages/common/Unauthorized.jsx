import { Box, Button, Text, VStack, Flex } from "@chakra-ui/react";
import { LuShield, LuArrowLeft } from "react-icons/lu";
import { Link as RouterLink } from "react-router-dom";
import ChessBackground from "../../components/ChessBackground";
import ThemeToggle from "../../components/ThemeToggle";
import { useColorMode } from "../../components/ui/color-mode";

const Unauthorized = () => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Box
      minH="100vh"
      bg={isDark ? "#000" : "#fff"}
      position="relative"
      color={isDark ? "#fff" : "#000"}
    >
      <ChessBackground />

      {/* Theme Toggle */}
      <Box
        position="absolute"
        top={{ base: 3, md: 4 }}
        right={{ base: 3, md: 4 }}
        zIndex="10"
      >
        <ThemeToggle />
      </Box>

      <Flex
        minH="100vh"
        align="center"
        justify="center"
        w="full"
        position="relative"
        zIndex="2"
        px={{ base: 4, md: 0 }}
      >
        <VStack gap={{ base: 6, md: 8 }} textAlign="center" maxW="md">
          {/* Shield Icon */}
          <Box
            p={6}
            borderRadius="full"
            bg={isDark ? "red.900" : "red.50"}
            color={isDark ? "red.200" : "red.600"}
          >
            <LuShield size={48} />
          </Box>

          {/* Error Message */}
          <VStack gap={{ base: 3, md: 4 }}>
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              color={isDark ? "white" : "black"}
            >
              Unauthorized Access
            </Text>
            <Text
              color={isDark ? "gray.300" : "gray.600"}
              fontSize={{ base: "md", md: "lg" }}
              px={{ base: 2, md: 0 }}
            >
              You don't have permission to access this page. Please contact your
              administrator if you believe this is an error.
            </Text>
          </VStack>

          {/* Action Button */}
          <Button
            as={RouterLink}
            to="/login"
            size={{ base: "md", md: "lg" }}
            bg="#0d9488"
            color="white"
            _hover={{ bg: "#0f766e" }}
            leftIcon={<LuArrowLeft size={20} />}
            w="full"
            maxW="xs"
          >
            Go to Login
          </Button>
        </VStack>
      </Flex>
    </Box>
  );
};

export default Unauthorized;
