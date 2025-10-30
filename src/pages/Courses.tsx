import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Star, BookOpen, Loader2 } from "lucide-react";

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
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCourses(data || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const filteredCourses = filter === "All" 
    ? courses 
    : courses.filter(course => course.level === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Explore Our Courses
            </h1>
            <p className="text-xl text-muted-foreground">
              Learn AI and Machine Learning from industry experts with hands-on projects and real-world applications
            </p>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Filter by level:</span>
            <div className="flex gap-2">
              {levels.map(level => (
                <Button
                  key={level}
                  variant={filter === level ? "hero" : "glass"}
                  size="sm"
                  onClick={() => setFilter(level)}
                  className="transition-all"
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map(course => (
                <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-border/50">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={course.image_url} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                        {course.level}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <CardTitle className="text-xl group-hover:text-accent transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.lessons_count} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{course.students_count.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span>{Number(course.rating).toFixed(1)}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex items-center justify-between border-t border-border/50 pt-6">
                    <span className="text-2xl font-bold text-accent">{course.price}</span>
                    <Link to={`/course/${course.id}`}>
                      <Button variant="hero" size="sm">
                        View Course
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

export default Courses;
