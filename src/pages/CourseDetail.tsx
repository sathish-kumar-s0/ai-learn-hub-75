import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import CourseLearning from "@/components/CourseLearning";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Star, BookOpen, CheckCircle2, PlayCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  students_count: number;
  rating: number;
  price: string;
  lessons_count: number;
  image_url: string;
  instructor_name: string;
}

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setCourse(data);

        // Check if user is enrolled
        if (user) {
          const { data: enrollment } = await supabase
            .from("enrollments")
            .select("*")
            .eq("user_id", user.id)
            .eq("course_id", id)
            .maybeSingle();

          setIsEnrolled(!!enrollment);
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast({
          title: "Error",
          description: "Failed to load course",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user, toast]);

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    if (!course) return;

    setEnrolling(true);
    try {
      const { error } = await supabase
        .from("enrollments")
        .insert([{ user_id: user.id, course_id: course.id }]);

      if (error) throw error;

      setIsEnrolled(true);
      toast({
        title: "Success!",
        description: "You're now enrolled in this course",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Course not found</h1>
          <Button onClick={() => navigate("/courses")}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const whatYouLearn = [
    `${course.title} fundamentals and advanced concepts`,
    "Hands-on practical exercises and projects",
    "Industry best practices and techniques",
    "Real-world applications and case studies",
    "Building portfolio-ready projects"
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary">{course.level}</Badge>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-semibold">{Number(course.rating).toFixed(1)}</span>
                  <span className="text-muted-foreground">({course.students_count} students)</span>
                </div>
              </div>

              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {course.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8">
                {course.description}
              </p>

              <div className="flex items-center gap-6 mb-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <span>{course.lessons_count} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.students_count.toLocaleString()} students</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isEnrolled ? (
                  <Button variant="secondary" size="xl" disabled>
                    Already Enrolled
                  </Button>
                ) : (
                  <Button variant="hero" size="xl" className="gap-2" onClick={handleEnroll} disabled={enrolling}>
                    {enrolling ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <PlayCircle className="h-5 w-5" />
                        Enroll Now
                      </>
                    )}
                  </Button>
                )}
                <span className="text-3xl font-bold text-accent">{course.price}</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <img 
                  src={course.image_url} 
                  alt={course.title}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isEnrolled && user ? (
            <CourseLearning courseId={course.id} userId={user.id} />
          ) : (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="instructor">Instructor</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">What You'll Learn</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                      {whatYouLearn.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="instructor">
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-6 text-foreground">Your Instructor</h2>
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
                        {course.instructor_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 text-foreground">{course.instructor_name}</h3>
                        <p className="text-muted-foreground mb-4">
                          Expert instructor with years of experience in AI and Machine Learning. 
                          Passionate about making complex topics accessible to everyone.
                        </p>
                        <div className="flex gap-4 text-sm">
                          <div>
                            <span className="font-bold text-foreground">15</span>
                            <span className="text-muted-foreground ml-1">Courses</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground">25,000+</span>
                            <span className="text-muted-foreground ml-1">Students</span>
                          </div>
                          <div>
                            <span className="font-bold text-foreground">4.9</span>
                            <span className="text-muted-foreground ml-1">Rating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
