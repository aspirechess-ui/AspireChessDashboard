import { Box, Button, Text, VStack, Flex } from "@chakra-ui/react";
import { LuArrowLeft, LuCrown } from "react-icons/lu";
import { Link as RouterLink } from "react-router-dom";
import ChessBackground from "../../components/ChessBackground";
import ThemeToggle from "../../components/ThemeToggle";
import { useColorMode } from "../../components/ui/color-mode";

const NotFound = () => {
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
      >
        <VStack gap={8} textAlign="center" maxW="md" px={6}>
          {/* Chess Crown Icon */}
          <LuCrown size={80} color="#0d9488" />

          {/* 404 Text */}
          <VStack gap={4}>
            <Text
              fontSize={{ base: "6xl", md: "8xl" }}
              fontWeight="bold"
              color="#0d9488"
              lineHeight="none"
            >
              404
            </Text>
            <Text
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              color={isDark ? "white" : "black"}
            >
              Page Not Found
            </Text>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color={isDark ? "gray.300" : "gray.600"}
              maxW="sm"
            >
              The page you're looking for doesn't exist. It might have been
              moved, deleted, or you entered the wrong URL.
            </Text>
          </VStack>

          {/* Back to Home Button */}
          <Button
            as={RouterLink}
            to="/login"
            size="lg"
            bg="#0d9488"
            color="white"
            borderRadius="lg"
            _hover={{
              bg: "#0f766e",
              transform: "translateY(-1px)",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            transition="all 0.2s"
            leftIcon={<LuArrowLeft size={20} />}
          >
            Back to Login
          </Button>
        </VStack>
      </Flex>
    </Box>
  );
};

export default NotFound;
