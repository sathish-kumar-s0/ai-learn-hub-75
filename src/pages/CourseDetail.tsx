import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  Users,
  Star,
  BookOpen,
  Loader2,
  CheckCircle2,
  PlayCircle,
  Award,
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  price: string;
  lessons_count: number;
  image_url: string;
  instructor_name: string;
  rating: number;
  students_count: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  week_number: number;
  order_index: number;
  duration_minutes: number;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("*")
          .eq("id", id)
          .single();

        if (courseError) throw courseError;
        setCourse(courseData);

        const { data: lessonsData, error: lessonsError } = await supabase
          .from("lessons")
          .select("*")
          .eq("course_id", id)
          .order("week_number", { ascending: true })
          .order("order_index", { ascending: true });

        if (lessonsError) throw lessonsError;
        setLessons(lessonsData || []);

        if (user) {
          const { data: enrollmentData } = await supabase
            .from("enrollments")
            .select("*")
            .eq("user_id", user.id)
            .eq("course_id", id)
            .single();

          setIsEnrolled(!!enrollmentData);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error",
          description: "Failed to load course details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, user, toast]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setEnrolling(true);
    try {
      const { error } = await supabase.from("enrollments").insert({
        user_id: user.id,
        course_id: id,
        progress: 0,
      });

      if (error) throw error;

      setIsEnrolled(true);
      toast({
        title: "Success!",
        description: "You've successfully enrolled in this course",
      });
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        title: "Error",
        description: "Failed to enroll in course",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const groupedLessons = lessons.reduce((acc, lesson) => {
    const week = `Week ${lesson.week_number}`;
    if (!acc[week]) {
      acc[week] = [];
    }
    acc[week].push(lesson);
    return acc;
  }, {} as Record<string, Lesson[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Course not found</h1>
          <Link to="/courses">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{course.level}</Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{course.rating}</span>
                  <span className="text-muted-foreground">
                    ({course.students_count.toLocaleString()} students)
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold">{course.title}</h1>
              <p className="text-xl text-muted-foreground">{course.description}</p>

              <div className="flex items-center gap-2 text-muted-foreground">
                <span>Created by</span>
                <span className="font-medium text-foreground">
                  {course.instructor_name}
                </span>
              </div>

              <div className="flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <span>{course.lessons_count} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>{course.students_count.toLocaleString()} enrolled</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Certificate included</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={course.image_url}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="text-3xl font-bold text-primary">
                    {course.price}
                  </div>
                  {isEnrolled ? (
                    <Link to={`/my-courses`}>
                      <Button className="w-full" size="lg">
                        <PlayCircle className="mr-2 h-5 w-5" />
                        Continue Learning
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleEnroll}
                      disabled={enrolling}
                    >
                      {enrolling ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          Enroll Now
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="curriculum" className="space-y-6">
            <TabsList>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="curriculum" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Curriculum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(groupedLessons).map(([week, weekLessons]) => (
                    <div key={week} className="space-y-3">
                      <h3 className="text-lg font-semibold">{week}</h3>
                      <div className="space-y-2">
                        {weekLessons.map((lesson, index) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{lesson.title}</p>
                                {lesson.duration_minutes && (
                                  <p className="text-sm text-muted-foreground">
                                    {lesson.duration_minutes} minutes
                                  </p>
                                )}
                              </div>
                            </div>
                            {isEnrolled ? (
                              <PlayCircle className="h-5 w-5 text-primary" />
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                Preview
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                      {week !== Object.keys(groupedLessons).slice(-1)[0] && (
                        <Separator className="my-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About This Course</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <p>{course.description}</p>
                  <h3>What you'll learn</h3>
                  <ul>
                    <li>Master the fundamentals and advanced concepts</li>
                    <li>Build real-world projects from scratch</li>
                    <li>Understand best practices and industry standards</li>
                    <li>Gain hands-on experience with modern tools</li>
                  </ul>
                  <h3>Requirements</h3>
                  <ul>
                    <li>Basic computer skills</li>
                    <li>Enthusiasm to learn</li>
                    <li>No prior experience required</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
