import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"
import Operations from "./pages/Operations";
import AddOperation from "./pages/AddOperation";
import EditOperation from "./pages/EditOperation";
import OperationDetails from "./pages/OperationDetails.jsx";
import Analyses from "./pages/Analyses.jsx";
import Reports from "./pages/Reports";
import Predictions from "./pages/Predictions";

function App(){
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={"/login"} replace /> } />
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations"
            element={
                <ProtectedRoute>
                    <Operations />
                </ProtectedRoute>
            }
          />
          <Route
              path="/operations/new"
              element={
                <ProtectedRoute>
                    <AddOperation />
                </ProtectedRoute>
              }
          />
        <Route
          path="/operations/:id/edit"
          element={
            <ProtectedRoute>
                <EditOperation />
            </ProtectedRoute>
          }
        />
        <Route
            path="/operations/:id"
            element={
                <ProtectedRoute>
                    <OperationDetails />
                </ProtectedRoute>
            }
        />
        <Route
            path="/analyses"
            element={
                <ProtectedRoute>
                    <Analyses />
                </ProtectedRoute>
        }
        />
        <Route
            path="/reports"
            element={
                <ProtectedRoute>
                    <Reports />
                </ProtectedRoute>
        }
        />
        <Route
            path="/predictions"
            element={
                <ProtectedRoute>
                    <Predictions />
                </ProtectedRoute>
            }
        />

        </Routes>
      </BrowserRouter>
  )
}

export default App;