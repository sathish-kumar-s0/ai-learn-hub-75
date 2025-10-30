import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Star, BookOpen } from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Python for AI & Machine Learning",
    description: "Master Python fundamentals and advanced concepts for AI development",
    level: "Beginner",
    duration: "8 weeks",
    students: 2341,
    rating: 4.8,
    price: "Free",
    lessons: 42,
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80"
  },
  {
    id: 2,
    title: "Machine Learning Fundamentals",
    description: "Learn core ML algorithms, supervised and unsupervised learning",
    level: "Intermediate",
    duration: "10 weeks",
    students: 1876,
    rating: 4.9,
    price: "$99",
    lessons: 56,
    image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80"
  },
  {
    id: 3,
    title: "Deep Learning with Neural Networks",
    description: "Build and train neural networks with TensorFlow and PyTorch",
    level: "Advanced",
    duration: "12 weeks",
    students: 1543,
    rating: 4.7,
    price: "$149",
    lessons: 68,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
  },
  {
    id: 4,
    title: "Natural Language Processing",
    description: "Process and analyze text data with modern NLP techniques",
    level: "Advanced",
    duration: "10 weeks",
    students: 987,
    rating: 4.8,
    price: "$149",
    lessons: 52,
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80"
  },
  {
    id: 5,
    title: "Computer Vision & Image Recognition",
    description: "Build powerful image recognition and computer vision systems",
    level: "Advanced",
    duration: "11 weeks",
    students: 1234,
    rating: 4.9,
    price: "$149",
    lessons: 64,
    image: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80"
  },
  {
    id: 6,
    title: "AI Ethics & Responsible AI",
    description: "Understand the ethical implications and best practices in AI",
    level: "Beginner",
    duration: "4 weeks",
    students: 892,
    rating: 4.6,
    price: "Free",
    lessons: 24,
    image: "https://images.unsplash.com/photo-1649859394731-b09eea89570d?w=800&q=80"
  }
];

const Courses = () => {
  const [filter, setFilter] = useState("All");
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map(course => (
              <Card key={course.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-border/50">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={course.image} 
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
                      <span>{course.lessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span>{course.rating}</span>
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
        </div>
      </section>
    </div>
  );
};

export default Courses;
