import { IconButton } from "@chakra-ui/react";
import { LuSun, LuMoon } from "react-icons/lu";
import { useColorMode } from "./ui/color-mode";

const ThemeToggle = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      onClick={toggleColorMode}
      variant="ghost"
      size="lg"
      color="#0d9488"
      _hover={{
        bg:
          colorMode === "light"
            ? "rgba(13, 148, 136, 0.1)"
            : "rgba(13, 148, 136, 0.2)",
        transform: "scale(1.1)",
      }}
      transition="all 0.2s"
      aria-label="Toggle theme"
    >
      {colorMode === "light" ? <LuMoon size={20} /> : <LuSun size={20} />}
    </IconButton>
  );
};

export default ThemeToggle;
