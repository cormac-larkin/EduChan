import axios from "axios";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../authentication/AuthProvider";

function QuizAttemptsPage() {
    const { user } = useContext(AuthContext);

  const fetchQuizAttempts = async () => {
    try {
      const response = axios.get(
        `http://localhost:5000/users/${user.id}/quizzes/attempts`,
        { withCredentials: true }
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchQuizAttempts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div>QuizAttemptsPage</div>;
}

export default QuizAttemptsPage;
