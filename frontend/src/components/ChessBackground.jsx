import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useColorMode } from "./ui/color-mode";

const ChessBackground = () => {
  const { colorMode } = useColorMode();

  // Chess pieces in Unicode
  const chessPieces = [
    "♔",
    "♕",
    "♖",
    "♗",
    "♘",
    "♙",
    "♚",
    "♛",
    "♜",
    "♝",
    "♞",
    "♟",
  ];

  const isDark = colorMode === "dark";

  return (
    <Box
      position="absolute"
      top="0"
      left="0"
      right="0"
      bottom="0"
      overflow="hidden"
      pointerEvents="none"
      zIndex="0"
    >
      {/* Subtle chessboard pattern */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        opacity={isDark ? "0.05" : "0.03"}
        backgroundImage={`
          linear-gradient(45deg, ${
            isDark ? "#0d9488" : "#000"
          } 25%, transparent 25%),
          linear-gradient(-45deg, ${
            isDark ? "#0d9488" : "#000"
          } 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, ${
            isDark ? "#0d9488" : "#000"
          } 75%),
          linear-gradient(-45deg, transparent 75%, ${
            isDark ? "#0d9488" : "#000"
          } 75%)
        `}
        backgroundSize="80px 80px"
        backgroundPosition="0 0, 0 40px, 40px -40px, -40px 0px"
      />

      {/* Floating chess pieces as mascots */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            fontSize: `${1.5 + Math.random() * 1}rem`,
            color: isDark ? "rgba(13, 148, 136, 0.1)" : "rgba(0, 0, 0, 0.08)",
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            zIndex: 1,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 10, -5, 0],
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 3,
          }}
        >
          {chessPieces[i % chessPieces.length]}
        </motion.div>
      ))}

      {/* Animated chess knight path */}
      <Box
        position="absolute"
        top="15%"
        right="8%"
        opacity={isDark ? "0.06" : "0.04"}
      >
        <svg width="250" height="250" viewBox="0 0 250 250">
          <motion.path
            d="M50,50 L100,30 L150,50 L170,100 L150,150 L100,170 L50,150 L30,100 Z"
            stroke={isDark ? "#0d9488" : "#000"}
            strokeWidth="2"
            fill="none"
            strokeDasharray="8,8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </svg>
      </Box>

      {/* Additional decorative elements */}
      <Box
        position="absolute"
        bottom="10%"
        left="5%"
        opacity={isDark ? "0.04" : "0.02"}
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle
              cx="75"
              cy="75"
              r="60"
              stroke={isDark ? "#0d9488" : "#000"}
              strokeWidth="1"
              fill="none"
              strokeDasharray="4,4"
            />
          </svg>
        </motion.div>
      </Box>
    </Box>
  );
};

export default ChessBackground;
