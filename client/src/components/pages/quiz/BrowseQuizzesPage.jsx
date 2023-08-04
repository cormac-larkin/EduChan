import { Stack, Typography, Divider, Paper, Grid } from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import paperStyles from "../../../styles/paperStyles";
import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../authentication/AuthProvider";
import QuizCard from "../../UI/QuizCard";
import axios from "axios";

function BrowseQuizzesPage() {

    const { user } = useContext(AuthContext);
    const [quizzes, setQuizzes] = useState([]);
  
    const fetchQuizzes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/users/${user.id}/quizzes`,
          { withCredentials: true }
        );
        setQuizzes(response.data);
        console.log(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    useEffect(() => {
        fetchQuizzes();
    }, [])

  return (
    <Stack>
      <Stack p="1rem" direction="row">
        <Stack justifyContent="center">
          <QuizIcon />
        </Stack>
        <Typography component="h1" variant="h5" align="left" pl="0.5rem">
          <b>My Quizzes</b>
        </Typography>
      </Stack>
      <Divider />

      <Paper sx={paperStyles}>
      <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 4, sm: 8, md: 12 }}
            pt="1rem"
          >
            {quizzes.map((quiz, index) => (
              <Grid
                item
                xs={2}
                sm={4}
                md={4}
                key={index}
                display={"flex"}
                justifyContent={"center"}
              >
                <QuizCard quiz={quiz}/>
              </Grid>
            ))}
          </Grid>
      </Paper>
    </Stack>
  );
}

export default BrowseQuizzesPage;
