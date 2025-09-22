import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { ColorModeProvider } from "./color-mode";
import { Toaster } from "@chakra-ui/react";
import { toaster } from "./toast";

export function Provider(props) {
  return (
    <ChakraProvider value={defaultSystem}>
      <ColorModeProvider {...props} />
      <Toaster toaster={toaster} />
    </ChakraProvider>
  );
}
