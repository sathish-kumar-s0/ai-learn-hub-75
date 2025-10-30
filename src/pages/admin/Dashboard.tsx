import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import CoursesManagement from "@/components/admin/CoursesManagement";
import UsersManagement from "@/components/admin/UsersManagement";

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!roleLoading && !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, authLoading, roleLoading, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) return;

      try {
        const [coursesRes, enrollmentsRes, usersRes] = await Promise.all([
          supabase.from("courses").select("*", { count: "exact" }),
          supabase.from("enrollments").select("*", { count: "exact" }),
          supabase.from("profiles").select("*", { count: "exact" }),
        ]);

        setStats({
          totalUsers: usersRes.count || 0,
          totalCourses: coursesRes.count || 0,
          totalEnrollments: enrollmentsRes.count || 0,
          revenue: 0, // Placeholder - would calculate from payments
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage your learning platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">Registered students</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalCourses}</div>
              <p className="text-xs text-muted-foreground mt-1">Published courses</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enrollments
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground mt-1">Active enrollments</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${stats.revenue}</div>
              <p className="text-xs text-muted-foreground mt-1">Total earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <Tabs defaultValue="courses" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>

              <TabsContent value="courses" className="mt-6">
                <CoursesManagement />
              </TabsContent>

              <TabsContent value="users" className="mt-6">
                <UsersManagement />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
