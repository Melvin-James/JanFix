import AppRouter from "./routes/AppRouter";

import AuthInitializer from "./app/AuthInitializer";

function App() {

  return (

    <>

      <AuthInitializer />

      <AppRouter />

    </>
  );
}

export default App;