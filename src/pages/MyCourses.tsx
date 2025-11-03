import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
import { CourseCard } from "@/components/CourseCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface EnrolledCourse {
  id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  courses: {
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
  };
}

const MyCoursesContent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("enrollments")
          .select(
            `
            id,
            course_id,
            progress,
            enrolled_at,
            courses (
              id,
              title,
              description,
              level,
              duration,
              price,
              lessons_count,
              image_url,
              instructor_name,
              rating,
              students_count
            )
          `
          )
          .eq("user_id", user.id)
          .order("enrolled_at", { ascending: false });

        if (error) throw error;
        setEnrolledCourses(data || []);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [user, navigate]);

  const inProgressCourses = enrolledCourses.filter(
    (e) => e.progress > 0 && e.progress < 100
  );
  const notStartedCourses = enrolledCourses.filter((e) => e.progress === 0);
  const completedCourses = enrolledCourses.filter((e) => e.progress === 100);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Courses</h1>
            <p className="text-muted-foreground">
              Continue your learning journey
            </p>
          </div>

          {enrolledCourses.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground mb-4">
                You haven't enrolled in any courses yet
              </p>
              <a
                href="/courses"
                className="text-primary hover:underline font-medium"
              >
                Browse available courses
              </a>
            </div>
          ) : (
            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">
                  All Courses ({enrolledCourses.length})
                </TabsTrigger>
                <TabsTrigger value="in-progress">
                  In Progress ({inProgressCourses.length})
                </TabsTrigger>
                <TabsTrigger value="not-started">
                  Not Started ({notStartedCourses.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedCourses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {enrolledCourses.map((enrollment) => (
                    <CourseCard
                      key={enrollment.id}
                      id={enrollment.courses.id}
                      title={enrollment.courses.title}
                      description={enrollment.courses.description}
                      level={enrollment.courses.level}
                      duration={enrollment.courses.duration}
                      price={enrollment.courses.price}
                      imageUrl={enrollment.courses.image_url}
                      instructorName={enrollment.courses.instructor_name}
                      rating={Number(enrollment.courses.rating)}
                      studentsCount={enrollment.courses.students_count}
                      lessonsCount={enrollment.courses.lessons_count}
                      enrolled={true}
                      progress={enrollment.progress}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="in-progress" className="space-y-6">
                {inProgressCourses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No courses in progress
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inProgressCourses.map((enrollment) => (
                      <CourseCard
                        key={enrollment.id}
                        id={enrollment.courses.id}
                        title={enrollment.courses.title}
                        description={enrollment.courses.description}
                        level={enrollment.courses.level}
                        duration={enrollment.courses.duration}
                        price={enrollment.courses.price}
                        imageUrl={enrollment.courses.image_url}
                        instructorName={enrollment.courses.instructor_name}
                        rating={Number(enrollment.courses.rating)}
                        studentsCount={enrollment.courses.students_count}
                        lessonsCount={enrollment.courses.lessons_count}
                        enrolled={true}
                        progress={enrollment.progress}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="not-started" className="space-y-6">
                {notStartedCourses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No courses waiting to be started
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notStartedCourses.map((enrollment) => (
                      <CourseCard
                        key={enrollment.id}
                        id={enrollment.courses.id}
                        title={enrollment.courses.title}
                        description={enrollment.courses.description}
                        level={enrollment.courses.level}
                        duration={enrollment.courses.duration}
                        price={enrollment.courses.price}
                        imageUrl={enrollment.courses.image_url}
                        instructorName={enrollment.courses.instructor_name}
                        rating={Number(enrollment.courses.rating)}
                        studentsCount={enrollment.courses.students_count}
                        lessonsCount={enrollment.courses.lessons_count}
                        enrolled={true}
                        progress={enrollment.progress}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                {completedCourses.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No completed courses yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedCourses.map((enrollment) => (
                      <CourseCard
                        key={enrollment.id}
                        id={enrollment.courses.id}
                        title={enrollment.courses.title}
                        description={enrollment.courses.description}
                        level={enrollment.courses.level}
                        duration={enrollment.courses.duration}
                        price={enrollment.courses.price}
                        imageUrl={enrollment.courses.image_url}
                        instructorName={enrollment.courses.instructor_name}
                        rating={Number(enrollment.courses.rating)}
                        studentsCount={enrollment.courses.students_count}
                        lessonsCount={enrollment.courses.lessons_count}
                        enrolled={true}
                        progress={enrollment.progress}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>
    </div>
  );
};

const MyCourses = () => {
  return (
    <ProtectedRoute>
      <MyCoursesContent />
    </ProtectedRoute>
  );
};

export default MyCourses;
