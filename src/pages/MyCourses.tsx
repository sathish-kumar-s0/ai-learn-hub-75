import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Loader2 } from "lucide-react";

interface EnrolledCourse {
  id: string;
  progress: number;
  courses: {
    id: string;
    title: string;
    description: string;
    level: string;
    image_url: string;
    lessons_count: number;
  };
}

const MyCourses = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("enrollments")
          .select(`
            *,
            courses (*)
          `)
          .eq("user_id", user.id);

        if (error) throw error;
        setEnrollments(data as unknown as EnrolledCourse[]);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            My Courses
          </h1>

          {enrollments.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="pt-6 text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">No courses yet</h3>
                <p className="text-muted-foreground mb-6">Start learning by enrolling in a course</p>
                <Link to="/courses">
                  <Button variant="hero">Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="group hover:shadow-xl transition-all border-border/50">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={enrollment.courses.image_url} 
                      alt={enrollment.courses.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary">{enrollment.courses.level}</Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl">{enrollment.courses.title}</CardTitle>
                    <CardDescription>{enrollment.courses.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-accent">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {enrollment.courses.lessons_count} lessons
                      </p>
                    </div>
                  </CardContent>

                  <CardFooter>
                    <Link to={`/course/${enrollment.courses.id}`} className="w-full">
                      <Button variant="hero" className="w-full">
                        Continue Learning
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MyCourses;
