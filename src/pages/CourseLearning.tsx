import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { VideoPlayer } from "@/components/VideoPlayer";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Loader2,
  BookOpen,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  content: string;
  week_number: number;
  order_index: number;
  duration_minutes: number;
  video_url: string;
}

interface LessonProgress {
  lesson_id: string;
  completed: boolean;
}

const CourseLearningContent = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const { data: courseData } = await supabase
          .from("courses")
          .select("title")
          .eq("id", courseId)
          .single();

        if (courseData) {
          setCourseName(courseData.title);
        }

        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("week_number", { ascending: true })
          .order("order_index", { ascending: true });

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

        const { data: progressData } = await supabase
          .from("lesson_progress")
          .select("lesson_id, completed")
          .eq("user_id", user.id)
          .in(
            "lesson_id",
            lessonsData?.map((l) => l.id) || []
          );

        setLessonProgress(progressData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load course content",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user, toast]);

  const currentLesson = lessons[currentLessonIndex];
  const isLessonCompleted = (lessonId: string) =>
    lessonProgress.some((p) => p.lesson_id === lessonId && p.completed);

  const completedCount = lessons.filter((l) => isLessonCompleted(l.id)).length;
  const progressPercentage = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  const markLessonComplete = async (lessonId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.from("lesson_progress").upsert({
        user_id: user.id,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      setLessonProgress((prev) => {
        const existing = prev.find((p) => p.lesson_id === lessonId);
        if (existing) {
          return prev.map((p) =>
            p.lesson_id === lessonId ? { ...p, completed: true } : p
          );
        }
        return [...prev, { lesson_id: lessonId, completed: true }];
      });

      const newCompletedCount = completedCount + 1;
      const newProgress = Math.round((newCompletedCount / lessons.length) * 100);

      await supabase
        .from("enrollments")
        .update({ progress: newProgress })
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      toast({
        title: "Lesson completed!",
        description: "Great job! Keep up the good work.",
      });
    } catch (error) {
      console.error("Error marking lesson complete:", error);
    }
  };

  const goToNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-muted-foreground mb-4">
            No lessons available for this course
          </p>
          <Button onClick={() => navigate("/my-courses")}>
            Back to My Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col border-r">
        <div className="p-6 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/my-courses")}
            className="mb-4"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to My Courses
          </Button>
          <h2 className="font-semibold text-lg mb-2">{courseName}</h2>
          <ProgressBar value={progressPercentage} showLabel />
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {lessons.map((lesson, index) => (
              <button
                key={lesson.id}
                onClick={() => setCurrentLessonIndex(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  index === currentLessonIndex
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isLessonCompleted(lesson.id) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lesson.title}</p>
                    <p className="text-xs opacity-80">
                      Week {lesson.week_number} • {lesson.duration_minutes} min
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/my-courses")}
            className="mb-2"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <ProgressBar value={progressPercentage} showLabel size="sm" />
        </div>

        <ScrollArea className="flex-1">
          <div className="container max-w-5xl mx-auto p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
              <p className="text-muted-foreground">
                Week {currentLesson.week_number} • Lesson{" "}
                {currentLessonIndex + 1} of {lessons.length}
              </p>
            </div>

            {currentLesson.video_url && (
              <VideoPlayer
                videoUrl={currentLesson.video_url}
                title={currentLesson.title}
              />
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Lesson Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p>{currentLesson.content}</p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-4 pt-4">
              <Button
                variant="outline"
                onClick={goToPreviousLesson}
                disabled={currentLessonIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {!isLessonCompleted(currentLesson.id) && (
                <Button
                  onClick={() => markLessonComplete(currentLesson.id)}
                  variant="default"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Complete
                </Button>
              )}

              <Button
                onClick={goToNextLesson}
                disabled={currentLessonIndex === lessons.length - 1}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
};

const CourseLearning = () => {
  return (
    <ProtectedRoute>
      <CourseLearningContent />
    </ProtectedRoute>
  );
};

export default CourseLearning;
