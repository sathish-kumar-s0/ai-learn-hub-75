import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, Star, BookOpen, CheckCircle2, PlayCircle } from "lucide-react";

const CourseDetail = () => {
  const { id } = useParams();

  const course = {
    title: "Python for AI & Machine Learning",
    description: "Master Python fundamentals and advanced concepts essential for AI development. This comprehensive course covers everything from basic syntax to advanced libraries like NumPy, Pandas, and Scikit-learn.",
    level: "Beginner",
    duration: "8 weeks",
    students: 2341,
    rating: 4.8,
    reviews: 486,
    price: "Free",
    lessons: 42,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&q=80",
    instructor: "Dr. Sarah Chen",
    whatYouLearn: [
      "Python fundamentals and advanced programming concepts",
      "Data manipulation with NumPy and Pandas",
      "Machine Learning basics with Scikit-learn",
      "Data visualization with Matplotlib and Seaborn",
      "Building real-world AI projects"
    ],
    curriculum: [
      {
        week: 1,
        title: "Python Fundamentals",
        lessons: ["Variables and Data Types", "Control Flow", "Functions", "Object-Oriented Programming"]
      },
      {
        week: 2,
        title: "NumPy & Data Processing",
        lessons: ["Arrays and Matrices", "Mathematical Operations", "Broadcasting", "Advanced Indexing"]
      },
      {
        week: 3,
        title: "Pandas for Data Analysis",
        lessons: ["DataFrames", "Data Cleaning", "Aggregation", "Time Series"]
      }
    ]
  };

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
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-muted-foreground">({course.reviews} reviews)</span>
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
                  <span>{course.lessons} lessons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.students.toLocaleString()} students</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="hero" size="xl" className="gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Start Learning
                </Button>
                <span className="text-3xl font-bold text-accent">{course.price}</span>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border/50">
                <img 
                  src={course.image} 
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
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
              <TabsTrigger value="instructor">Instructor</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">What You'll Learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.whatYouLearn.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="curriculum" className="space-y-6">
              {course.curriculum.map((section, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="secondary">Week {section.week}</Badge>
                      <h3 className="text-xl font-bold text-foreground">{section.title}</h3>
                    </div>
                    <div className="space-y-3">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div key={lessonIndex} className="flex items-center gap-3 text-muted-foreground">
                          <PlayCircle className="h-5 w-5 text-accent" />
                          <span>{lesson}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="instructor">
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-6 text-foreground">Your Instructor</h2>
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
                      SC
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 text-foreground">{course.instructor}</h3>
                      <p className="text-muted-foreground mb-4">
                        AI Research Scientist with 10+ years of experience in Machine Learning and Deep Learning. 
                        Published researcher and educator passionate about making AI accessible to everyone.
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
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
