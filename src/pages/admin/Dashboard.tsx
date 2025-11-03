import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  activeStudents: number;
}

const AdminDashboardContent = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeStudents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("courses").select("*", { count: "exact", head: true }),
          supabase.from("enrollments").select("*", { count: "exact" }),
        ]);

        const activeStudents = new Set(
          enrollmentsRes.data?.map((e) => e.user_id) || []
        ).size;

        setStats({
          totalUsers: usersRes.count || 0,
          totalCourses: coursesRes.count || 0,
          totalEnrollments: enrollmentsRes.count || 0,
          activeStudents,
        });

        const enrollmentsByMonth = enrollmentsRes.data?.reduce((acc, enrollment) => {
          const month = new Date(enrollment.enrolled_at).toLocaleDateString("en-US", {
            month: "short",
          });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const chartData = Object.entries(enrollmentsByMonth || {}).map(
          ([month, count]) => ({
            month,
            enrollments: count,
          })
        );

        setEnrollmentData(chartData);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your learning platform
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            description="Registered users"
            icon={Users}
          />
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses}
            description="Published courses"
            icon={BookOpen}
          />
          <StatsCard
            title="Total Enrollments"
            value={stats.totalEnrollments}
            description="Course enrollments"
            icon={GraduationCap}
          />
          <StatsCard
            title="Active Students"
            value={stats.activeStudents}
            description="Students with enrollments"
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Trends</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="enrollments"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No enrollment data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enrollments by Month</CardTitle>
            </CardHeader>
            <CardContent>
              {enrollmentData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={enrollmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="enrollments" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  No enrollment data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

const AdminDashboard = () => {
  return (
    <ProtectedRoute requireAdmin redirectTo="/admin/login">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
};

export default AdminDashboard;
