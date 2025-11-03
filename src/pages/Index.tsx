import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Code, Rocket, Users, Award, Zap, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-banner.jpg";

const Index = () => {
  // Main landing page component
  const features = [
    {
      icon: Brain,
      title: "Expert-Led Courses",
      description: "Learn from industry professionals with real-world AI experience"
    },
    {
      icon: Code,
      title: "Hands-On Projects",
      description: "Build practical AI applications and strengthen your portfolio"
    },
    {
      icon: Rocket,
      title: "Career Support",
      description: "Get guidance to land your dream job in AI and ML"
    },
    {
      icon: Zap,
      title: "Latest Technologies",
      description: "Stay updated with cutting-edge AI tools and frameworks"
    }
  ];

  const stats = [
    { label: "Active Students", value: "10,000+" },
    { label: "Expert Instructors", value: "50+" },
    { label: "Course Hours", value: "500+" },
    { label: "Success Rate", value: "95%" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background" />
        <div className="absolute inset-0 opacity-30">
          <img src={heroImage} alt="AI Neural Network" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              <Zap className="h-4 w-4 mr-2 inline" />
              Join 10,000+ students learning AI
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Master{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI & Machine Learning
              </span>
              {" "}with Expert-Led Courses
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Transform your career with comprehensive courses in Python, Machine Learning, Deep Learning, and more
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/courses">
                <Button variant="hero" size="xl" className="gap-2 group">
                  Explore Courses
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="glass" size="xl">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Why Choose AI Learn Hub?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to become an AI expert in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-xl hover:border-accent/50 transition-all duration-300 border-border/50">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Award className="h-16 w-16 mx-auto mb-6 text-accent" />
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Start Your AI Journey Today
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Join thousands of students already learning and building amazing AI projects
            </p>
            <Link to="/courses">
              <Button variant="hero" size="xl" className="gap-2">
                Browse All Courses
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-sm py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 AI Learn Hub. All rights reserved.
            </p>
            <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-accent transition-colors">
              Admin Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
