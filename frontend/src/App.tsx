import AppRouter from "./routes/AppRouter";

import AuthInitializer from "./app/AuthInitializer";

import { Toaster } from "react-hot-toast";

function App() {

  return (

    <>

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
            color: "#333",
          },
        }}
      />

      <AuthInitializer />

      <AppRouter />

    </>
  );
}

export default App;