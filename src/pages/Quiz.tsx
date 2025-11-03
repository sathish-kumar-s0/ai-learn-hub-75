import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, Award } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  passing_score: number;
  time_limit_minutes: number;
}

const QuizContent = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    totalPoints: number;
    passed: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("*")
          .eq("id", quizId)
          .single();

        if (quizError) throw quizError;
        setQuiz(quizData);

        const { data: questionsData, error: questionsError } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", quizId)
          .order("order_index", { ascending: true });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);
      } catch (error) {
        console.error("Error fetching quiz:", error);
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [quizId, toast]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user || !quiz) return;

    setSubmitting(true);
    try {
      let score = 0;
      const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

      questions.forEach((question) => {
        if (answers[question.id] === question.correct_answer) {
          score += question.points;
        }
      });

      const percentage = (score / totalPoints) * 100;
      const passed = percentage >= quiz.passing_score;

      const { error } = await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: quizId,
        score,
        total_points: totalPoints,
        answers: answers,
        passed,
      });

      if (error) throw error;

      setResult({ score, totalPoints, passed });

      toast({
        title: passed ? "Congratulations!" : "Quiz Completed",
        description: passed
          ? "You passed the quiz!"
          : "Keep practicing and try again.",
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">Quiz not found</p>
          <Button onClick={() => navigate("/my-courses")}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  if (result) {
    const percentage = (result.score / result.totalPoints) * 100;
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {result.passed ? (
                <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
              ) : (
                <div className="h-20 w-20 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-12 w-12 text-red-500" />
                </div>
              )}
            </div>
            <CardTitle className="text-3xl">
              {result.passed ? "Congratulations!" : "Quiz Completed"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {percentage.toFixed(0)}%
              </div>
              <p className="text-muted-foreground">
                You scored {result.score} out of {result.totalPoints} points
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Passing Score</span>
                <span className="font-medium">{quiz.passing_score}%</span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>

            {result.passed && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-green-700 dark:text-green-400">
                  You've passed this quiz!
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/my-courses")}
              >
                Back to Courses
              </Button>
              {!result.passed && (
                <Button
                  className="flex-1"
                  onClick={() => {
                    setResult(null);
                    setAnswers({});
                    setCurrentQuestionIndex(0);
                  }}
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardHeader>
            <div className="space-y-4">
              <div>
                <CardTitle className="text-2xl">{quiz.title}</CardTitle>
                <p className="text-muted-foreground mt-2">{quiz.description}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span>Passing Score: {quiz.passing_score}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {currentQuestion.question}
              </h3>
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={handleAnswerSelect}
              >
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <RadioGroupItem value={option} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>

              {currentQuestionIndex === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    Object.keys(answers).length !== questions.length
                  }
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
              ) : (
                <Button onClick={goToNextQuestion}>Next</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Quiz = () => {
  return (
    <ProtectedRoute>
      <QuizContent />
    </ProtectedRoute>
  );
};

export default Quiz;
