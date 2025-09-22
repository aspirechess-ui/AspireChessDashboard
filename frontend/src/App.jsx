import { BrowserRouter } from "react-router-dom";
import { Provider } from "./components/ui/provider";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <Provider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
