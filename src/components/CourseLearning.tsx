import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, Download, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  content: string | null;
  week_number: number;
  order_index: number;
  duration_minutes: number | null;
  video_url: string | null;
  file_urls: string[] | null;
}

interface CourseLearningProps {
  courseId: string;
  userId: string;
}

const CourseLearning = ({ courseId, userId }: CourseLearningProps) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const { data, error } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("week_number", { ascending: true })
          .order("order_index", { ascending: true });

        if (error) throw error;
        setLessons(data as Lesson[]);
        if (data && data.length > 0) {
          setCurrentLesson(data[0] as Lesson);
        }
      } catch (error) {
        console.error("Error fetching lessons:", error);
        toast({
          title: "Error",
          description: "Failed to load lessons",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [courseId, toast]);

  const groupedLessons = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.week_number]) {
      acc[lesson.week_number] = [];
    }
    acc[lesson.week_number].push(lesson);
    return acc;
  }, {} as Record<number, Lesson[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12">
          <p className="text-muted-foreground">No lessons available yet. Check back soon!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Lesson Content - Main Area */}
      <div className="lg:col-span-2 space-y-6">
        {currentLesson && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      Week {currentLesson.week_number}
                    </Badge>
                    <CardTitle className="text-3xl">{currentLesson.title}</CardTitle>
                  </div>
                  {currentLesson.duration_minutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{currentLesson.duration_minutes} min</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentLesson.video_url && (
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      src={currentLesson.video_url}
                      className="absolute top-0 left-0 w-full h-full rounded-lg border border-border"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}

                {currentLesson.content && (
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground">{currentLesson.content}</p>
                  </div>
                )}

                {currentLesson.file_urls && currentLesson.file_urls.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5 text-accent" />
                      Course Materials
                    </h3>
                    <div className="space-y-2">
                      {currentLesson.file_urls.map((fileUrl, index) => (
                        <a
                          key={index}
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                        >
                          <span className="text-sm font-medium">
                            {fileUrl.split('/').pop() || `File ${index + 1}`}
                          </span>
                          <Download className="h-4 w-4 text-accent" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Curriculum Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="text-xl">Course Curriculum</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {Object.entries(groupedLessons).map(([week, weekLessons]) => (
                <AccordionItem key={week} value={`week-${week}`} className="border-b-0">
                  <AccordionTrigger className="px-6 hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Week {week}</span>
                      <Badge variant="secondary">{weekLessons.length} lessons</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 space-y-2">
                    {weekLessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => setCurrentLesson(lesson)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          currentLesson?.id === lesson.id
                            ? "bg-accent/10 border-2 border-accent"
                            : "border border-border hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {lesson.video_url ? (
                              <PlayCircle className="h-5 w-5 text-accent" />
                            ) : (
                              <FileText className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm leading-tight mb-1">
                              {lesson.title}
                            </p>
                            {lesson.duration_minutes && (
                              <p className="text-xs text-muted-foreground">
                                {lesson.duration_minutes} min
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseLearning;
